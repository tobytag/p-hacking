import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM article_metrics');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { article_id, citation_count, citation_velocity, altmetric_score } = req.body;
    try {
        let result = await pool.query(
            'INSERT INTO article_metrics (article_id, citation_count, citation_velocity, altmetric_score) VALUES ($1, $2, $3, $4) ON CONFLICT (article_id) DO NOTHING RETURNING *',
            [article_id, citation_count || 0, citation_velocity || 0, altmetric_score || 0]
        );

        // If record already exists, fetch it
        if (result.rows.length === 0) {
            result = await pool.query('SELECT * FROM article_metrics WHERE article_id = $1', [article_id]);
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:article_id', async (req, res) => {
    const { citation_count, citation_velocity, altmetric_score } = req.body;
    try {
        const result = await pool.query(
            'UPDATE article_metrics SET citation_count = $1, citation_velocity = $2, altmetric_score = $3 WHERE article_id = $4 RETURNING *',
            [citation_count, citation_velocity, altmetric_score, req.params.article_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:article_id', async (req, res) => {
    try {
        await pool.query('DELETE FROM article_metrics WHERE article_id = $1', [req.params.article_id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
