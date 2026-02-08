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

const verifyEntityIDs = async () => {
    const client = await pool.connect();
    try {
        console.log('🔍 Verifying Entity ID Consistency...\n');

        // Check Authors
        const { rows: authors } = await client.query('SELECT id, full_name FROM authors LIMIT 10');
        console.log('📝 Sample Authors:');
        let authorMismatches = 0;
        for (const author of authors) {
            const expectedId = slugify(author.full_name);
            const match = author.id === expectedId ? '✅' : '❌';
            if (author.id !== expectedId) {
                authorMismatches++;
                console.log(`  ${match} ID: ${author.id} | Expected: ${expectedId} | Name: ${author.full_name}`);
            }
        }
        if (authorMismatches === 0) {
            console.log('  ✅ All sampled authors have correct IDs');
        }

        // Check Journals
        const { rows: journals } = await client.query('SELECT id, name FROM journals LIMIT 10');
        console.log('\n📚 Sample Journals:');
        let journalMismatches = 0;
        for (const journal of journals) {
            const expectedId = slugify(journal.name.substring(0, 30));
            const match = journal.id === expectedId ? '✅' : '❌';
            if (journal.id !== expectedId) {
                journalMismatches++;
                console.log(`  ${match} ID: ${journal.id} | Expected: ${expectedId} | Name: ${journal.name}`);
            }
        }
        if (journalMismatches === 0) {
            console.log('  ✅ All sampled journals have correct IDs');
        }

        // Check Articles (just verify they exist and have IDs)
        const { rows: articles } = await client.query('SELECT id, title FROM articles LIMIT 5');
        console.log('\n📄 Sample Articles:');
        for (const article of articles) {
            console.log(`  ✅ ID: ${article.id} | Title: ${article.title.substring(0, 50)}...`);
        }

        // Check for orphaned article-author links
        const { rows: orphanedLinks } = await client.query(`
            SELECT aa.article_id, aa.author_id 
            FROM article_authors aa
            LEFT JOIN authors a ON aa.author_id = a.id
            WHERE a.id IS NULL
            LIMIT 5
        `);

        console.log('\n🔗 Orphaned Article-Author Links:');
        if (orphanedLinks.length === 0) {
            console.log('  ✅ No orphaned links found');
        } else {
            console.log(`  ❌ Found ${orphanedLinks.length} orphaned links:`);
            orphanedLinks.forEach(link => {
                console.log(`     Article: ${link.article_id} → Missing Author: ${link.author_id}`);
            });
        }

        console.log('\n✅ Verification Complete!');

    } catch (err) {
        console.error('❌ Error during verification:', err);
    } finally {
        client.release();
        pool.end();
    }
};

verifyEntityIDs();
