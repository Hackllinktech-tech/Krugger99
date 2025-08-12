// config.js
// Database utility for Mafia Host (Node.js/Express version)

// Requires: npm install mysql2
const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Database credentials
const DB_SERVER = "sql8.freesqldatabase.com";
const DB_USERNAME = "sql8794565";
const DB_PASSWORD = "xpw1fvexwS";
const DB_NAME = "sql8794565";

// Helper function (similar to PHP's htmlspecialchars/trim/stripslashes)
function validate(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\\/g, '') // remove backslashes (stripslashes)
    .trim();
}

// Password hashing (mimics PHP hash_hmac('sha256', $password, 'iqbolshoh'))
function hashPassword(password) {
  return crypto.createHmac('sha256', password, 'iqbolshoh').digest('hex');
}

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: DB_SERVER,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  // Execute prepared statement with parameters
  async executeQuery(sql, params = []) {
    try {
      const [rows, fields] = await this.pool.execute(sql, params);
      return rows;
    } catch (err) {
      return `SQL/Execution error: ${err.message}`;
    }
  }

  // Validation utility
  validate(value) {
    return validate(value);
  }

  // SELECT
  async select(table, columns = "*", condition = "", params = []) {
    const cols = Array.isArray(columns) ? columns.join(", ") : columns;
    const sql = `SELECT ${cols} FROM \`${table}\`` + (condition ? ` WHERE ${condition}` : "");
    return await this.executeQuery(sql, params);
  }

  // INSERT
  async insert(table, data) {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT INTO \`${table}\` (${keys.join(", ")}) VALUES (${placeholders})`;
    const params = Object.values(data);
    try {
      const [insertResult] = await this.pool.execute(sql, params);
      return insertResult.insertId;
    } catch (err) {
      return `SQL/Execution error: ${err.message}`;
    }
  }

  // UPDATE
  async update(table, data, condition = "", params = []) {
    const set = Object.keys(data).map(k => `\`${k}\` = ?`).join(", ");
    const sql = `UPDATE \`${table}\` SET ${set}` + (condition ? ` WHERE ${condition}` : "");
    const allParams = [...Object.values(data), ...params];
    try {
      const [result] = await this.pool.execute(sql, allParams);
      return result.affectedRows;
    } catch (err) {
      return `SQL/Execution error: ${err.message}`;
    }
  }

  // DELETE
  async delete(table, condition = "", params = []) {
    const sql = `DELETE FROM \`${table}\`` + (condition ? ` WHERE ${condition}` : "");
    try {
      const [result] = await this.pool.execute(sql, params);
      return result.affectedRows;
    } catch (err) {
      return `SQL/Execution error: ${err.message}`;
    }
  }

  // Password hash
  hashPassword(password) {
    return hashPassword(password);
  }
}

module.exports = Database;
