
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Construct __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from parent directory (api/)
dotenv.config({ path: join(__dirname, '../.env') });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const fixAuthors = async () => {
    const client = await pool.connect();
    try {
        console.log('Connected to database...');

        // 1. Fetch all authors
        const { rows: authors } = await client.query('SELECT * FROM authors');
        console.log(`Found ${authors.length} authors.`);

        let fixedCount = 0;
        let errorCount = 0;

        for (const author of authors) {
            const correctSlug = slugify(author.full_name);

            // If current ID is NOT the correct slug
            if (author.id !== correctSlug) {
                console.log(`Checking author: "${author.full_name}" (ID: ${author.id}) -> Should be: ${correctSlug}`);

                // If the ID looks like it has an appended Article ID (e.g., > 30 chars or just != slug)
                // Actually, just enforce slugify.

                try {
                    await client.query('BEGIN');

                    // Check if target correctSlug already exists
                    const { rows: existingTarget } = await client.query('SELECT * FROM authors WHERE id = $1', [correctSlug]);

                    if (existingTarget.length > 0) {
                        console.log(`  Target slug ${correctSlug} already exists. Merging...`);

                        // Update article_authors to point to new ID
                        await client.query(`
                            UPDATE article_authors 
                            SET author_id = $1 
                            WHERE author_id = $2
                            ON CONFLICT DO NOTHING
                        `, [correctSlug, author.id]);

                        // Delete old author
                        await client.query('DELETE FROM authors WHERE id = $1', [author.id]);

                    } else {
                        console.log(`  Renaming ID from ${author.id} to ${correctSlug}...`);

                        // Create new author with correct ID
                        await client.query(`
                            INSERT INTO authors (id, full_name, gender, phd_year, current_institution_id)
                            VALUES ($1, $2, $3, $4, $5)
                        `, [correctSlug, author.full_name, author.gender, author.phd_year, author.current_institution_id]);

                        // Update links
                        await client.query(`
                            UPDATE article_authors 
                            SET author_id = $1 
                            WHERE author_id = $2
                        `, [correctSlug, author.id]);

                        // Delete old
                        await client.query('DELETE FROM authors WHERE id = $1', [author.id]);
                    }

                    await client.query('COMMIT');
                    fixedCount++;
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.error(`  Failed to fix ${author.id}:`, err);
                    errorCount++;
                }
            }
        }

        console.log(`\nFixed ${fixedCount} authors.`);
        console.log(`Errors: ${errorCount}`);

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        client.release();
        pool.end();
    }
};

fixAuthors();
