const pool = require('../config/db');

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      price       DECIMAL(10,2) NOT NULL,
      stock       INTEGER DEFAULT 0,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    )
  `);
};

const findAll = async () => (await pool.query('SELECT * FROM products ORDER BY id')).rows;
const findById = async (id) => (await pool.query('SELECT * FROM products WHERE id = $1', [id])).rows[0];
const create = async ({ name, description, price, stock }) => (await pool.query(
  'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
  [name, description, price, stock]
)).rows[0];
const update = async (id, { name, description, price, stock }) => (await pool.query(
  'UPDATE products SET name=$1, description=$2, price=$3, stock=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
  [name, description, price, stock, id]
)).rows[0];
const remove = async (id) => (await pool.query('DELETE FROM products WHERE id=$1 RETURNING *', [id])).rows[0];

module.exports = { createTable, findAll, findById, create, update, remove };
