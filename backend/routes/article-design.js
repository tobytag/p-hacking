import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM article_design');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { article_id, primary_method, data_type, is_empirical, replication_available, legal_constraints } = req.body;
    try {
        let result = await pool.query(
            'INSERT INTO article_design (article_id, primary_method, data_type, is_empirical, replication_available, legal_constraints) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (article_id) DO NOTHING RETURNING *',
            [article_id, primary_method, data_type, is_empirical !== false, replication_available || false, legal_constraints || false]
        );

        // If record already exists, fetch it
        if (result.rows.length === 0) {
            result = await pool.query('SELECT * FROM article_design WHERE article_id = $1', [article_id]);
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:article_id', async (req, res) => {
    const { primary_method, data_type, is_empirical, replication_available, legal_constraints } = req.body;
    try {
        const result = await pool.query(
            'UPDATE article_design SET primary_method = $1, data_type = $2, is_empirical = $3, replication_available = $4, legal_constraints = $5 WHERE article_id = $6 RETURNING *',
            [primary_method, data_type, is_empirical, replication_available, legal_constraints, req.params.article_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:article_id', async (req, res) => {
    try {
        await pool.query('DELETE FROM article_design WHERE article_id = $1', [req.params.article_id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
