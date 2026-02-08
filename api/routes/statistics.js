import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM statistics ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const {
        article_id, test_name, location_in_text, coeff_reported, se_reported,
        p_value_reported, stars_reported, is_just_significant, distance_to_threshold
    } = req.body;

    try {
        // If this is a placeholder record (null test_name), check if one already exists
        if (test_name === null || test_name === 'Pending Input') {
            const existing = await pool.query(
                'SELECT * FROM statistics WHERE article_id = $1 LIMIT 1',
                [article_id]
            );

            // If ANY statistics record exists for this article, don't create another placeholder
            if (existing.rows.length > 0) {
                return res.status(200).json({ ...existing.rows[0], message: 'Statistics record already exists' });
            }
        }

        // Insert the new record
        const result = await pool.query(
            `INSERT INTO statistics (article_id, test_name, location_in_text, coeff_reported, se_reported, 
       p_value_reported, stars_reported, is_just_significant, distance_to_threshold)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [article_id, test_name, location_in_text, coeff_reported, se_reported,
                p_value_reported, stars_reported, is_just_significant || false, distance_to_threshold]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const {
        test_name, location_in_text, coeff_reported, se_reported,
        p_value_reported, stars_reported, is_just_significant, distance_to_threshold
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE statistics SET test_name = $1, location_in_text = $2, coeff_reported = $3, 
       se_reported = $4, p_value_reported = $5, stars_reported = $6, 
       is_just_significant = $7, distance_to_threshold = $8
       WHERE id = $9 RETURNING *`,
            [test_name, location_in_text, coeff_reported, se_reported,
                p_value_reported, stars_reported, is_just_significant, distance_to_threshold, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM statistics WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
