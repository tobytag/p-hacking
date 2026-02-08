import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use a global variable to cache the pool instance across serverless invocations
let pool;

if (!pool) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        // Optimize for serverless:
        max: 20, // Max clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}

// Test connection
pool.on('connect', () => {
    console.log('✓ Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

export default pool;
