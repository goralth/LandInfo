// db.js - PostgreSQL connection using node-postgres

import pg from 'pg';
const { Pool } = pg;

// Adjust values to your setup:
const pool = new Pool({
  host: 'localhost',       // or your server IP
  port: 5432,              // default Postgres port
  user: 'your_pg_user',
  password: 'your_pg_password',
  database: 'your_pg_database',
});

// Helper for simple queries
export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}
