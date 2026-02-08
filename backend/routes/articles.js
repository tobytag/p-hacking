import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all articles
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY publication_year DESC NULLS LAST');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching articles:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET single article
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching article:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST new article
router.post('/', async (req, res) => {
    const { id, title, publication_year, doi, url, abstract, journal_id, discipline_id } = req.body;
    try {
        let result = await pool.query(
            `INSERT INTO articles (id, title, publication_year, doi, url, abstract, journal_id, discipline_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING RETURNING *`,
            [id, title, publication_year, doi, url, abstract, journal_id, discipline_id]
        );

        // If article already exists, return the existing one with a message
        if (result.rows.length === 0) {
            result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
            return res.status(200).json({ ...result.rows[0], message: 'Article already exists' });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating article:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update article
router.put('/:id', async (req, res) => {
    const { title, publication_year, doi, url, abstract, journal_id, discipline_id } = req.body;
    try {
        const result = await pool.query(
            `UPDATE articles 
       SET title = $1, publication_year = $2, doi = $3, url = $4, abstract = $5, journal_id = $6, discipline_id = $7
       WHERE id = $8 RETURNING *`,
            [title, publication_year, doi, url, abstract, journal_id, discipline_id, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating article:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE article
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article deleted successfully' });
    } catch (err) {
        console.error('Error deleting article:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
