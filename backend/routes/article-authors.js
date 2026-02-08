import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM article_authors ORDER BY article_id, author_order');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { article_id, author_id, author_order } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO article_authors (article_id, author_id, author_order) VALUES ($1, $2, $3) ON CONFLICT (article_id, author_id) DO NOTHING RETURNING *',
            [article_id, author_id, author_order || 1]
        );
        // If no rows returned, it was a duplicate (conflict)
        if (result.rows.length === 0) {
            return res.status(200).json({ message: 'Link already exists' });
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:article_id/:author_id', async (req, res) => {
    try {
        await pool.query('DELETE FROM article_authors WHERE article_id = $1 AND author_id = $2',
            [req.params.article_id, req.params.author_id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
