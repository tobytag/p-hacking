import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM authors ORDER BY full_name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { id, full_name, gender, phd_year, current_institution_id } = req.body;
    try {
        let result = await pool.query(
            'INSERT INTO authors (id, full_name, gender, phd_year, current_institution_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING RETURNING *',
            [id, full_name, gender || 'U', phd_year, current_institution_id]
        );

        // If author already exists, return the existing one
        if (result.rows.length === 0) {
            result = await pool.query('SELECT * FROM authors WHERE id = $1', [id]);
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { full_name, gender, phd_year, current_institution_id } = req.body;
    try {
        const result = await pool.query(
            'UPDATE authors SET full_name = $1, gender = $2, phd_year = $3, current_institution_id = $4 WHERE id = $5 RETURNING *',
            [full_name, gender, phd_year, current_institution_id, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM authors WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
