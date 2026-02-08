import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM institutions ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { id, name, country, shanghai_rank, is_private } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO institutions (id, name, country, shanghai_rank, is_private) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, name, country, shanghai_rank, is_private || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { name, country, shanghai_rank, is_private } = req.body;
    try {
        const result = await pool.query(
            'UPDATE institutions SET name = $1, country = $2, shanghai_rank = $3, is_private = $4 WHERE id = $5 RETURNING *',
            [name, country, shanghai_rank, is_private, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM institutions WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
