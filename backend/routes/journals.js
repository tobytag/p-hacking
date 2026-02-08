import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM journals ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { id, name, issn, impact_factor, policy_year_data, policy_year_open_access } = req.body;
    try {
        let result = await pool.query(
            'INSERT INTO journals (id, name, issn, impact_factor, policy_year_data, policy_year_open_access) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING RETURNING *',
            [id, name, issn, impact_factor, policy_year_data, policy_year_open_access]
        );

        // If journal already exists, return the existing one
        if (result.rows.length === 0) {
            result = await pool.query('SELECT * FROM journals WHERE id = $1', [id]);
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { name, issn, impact_factor, policy_year_data, policy_year_open_access } = req.body;
    try {
        const result = await pool.query(
            'UPDATE journals SET name = $1, issn = $2, impact_factor = $3, policy_year_data = $4, policy_year_open_access = $5 WHERE id = $6 RETURNING *',
            [name, issn, impact_factor, policy_year_data, policy_year_open_access, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM journals WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
