import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM funding_agencies ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { id, name, is_corporate_conflict } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO funding_agencies (id, name, is_corporate_conflict) VALUES ($1, $2, $3) RETURNING *',
            [id, name, is_corporate_conflict || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { name, is_corporate_conflict } = req.body;
    try {
        const result = await pool.query(
            'UPDATE funding_agencies SET name = $1, is_corporate_conflict = $2 WHERE id = $3 RETURNING *',
            [name, is_corporate_conflict, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM funding_agencies WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
