import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import disciplinesRouter from './routes/disciplines.js';
import institutionsRouter from './routes/institutions.js';
import journalsRouter from './routes/journals.js';
import fundingAgenciesRouter from './routes/funding-agencies.js';
import authorsRouter from './routes/authors.js';
import articlesRouter from './routes/articles.js';
import articleDesignRouter from './routes/article-design.js';
import articleMetricsRouter from './routes/article-metrics.js';
import statisticsRouter from './routes/statistics.js';
import articleAuthorsRouter from './routes/article-authors.js';
import articleFundingRouter from './routes/article-funding.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

import pool from './db.js';

// Health check with DB status
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            message: 'API server is running on Vercel',
            db_status: 'connected',
            timestamp: result.rows[0].now
        });
    } catch (err) {
        console.error('Health check DB error:', err);
        res.status(500).json({
            status: 'error',
            message: 'API running but DB failed',
            db_error: err.message,
            env_check: {
                has_db_url: !!process.env.DATABASE_URL
            }
        });
    }
});

// Routes
app.use('/api/disciplines', disciplinesRouter);
app.use('/api/institutions', institutionsRouter);
app.use('/api/journals', journalsRouter);
app.use('/api/funding-agencies', fundingAgenciesRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/article-design', articleDesignRouter);
app.use('/api/article-metrics', articleMetricsRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/article-authors', articleAuthorsRouter);
app.use('/api/article-funding', articleFundingRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Export the Express app for Vercel
export default app;
