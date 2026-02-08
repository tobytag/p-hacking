import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM article_funding');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { article_id, agency_id, grant_number } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO article_funding (article_id, agency_id, grant_number) VALUES ($1, $2, $3) RETURNING *',
            [article_id, agency_id, grant_number]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:article_id/:agency_id', async (req, res) => {
    try {
        await pool.query('DELETE FROM article_funding WHERE article_id = $1 AND agency_id = $2',
            [req.params.article_id, req.params.agency_id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
