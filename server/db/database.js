// =============================================
// database.js — SQLite với sql.js (pure JavaScript)
// =============================================
// Dùng sql.js thay better-sqlite3 (không cần compile C++).
// Wrapper giữ nguyên API: prepare(), run(), get(), all(), exec(), pragma()
// nên các file routes KHÔNG cần sửa gì cả.

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'gomoku.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

// ── Khởi tạo sql.js ────────────────────────────────────────────────────────
const SQL = await initSqlJs();

// Load DB từ file nếu tồn tại, ngược lại tạo mới
let sqliteDb;
if (existsSync(DB_PATH)) {
  const fileBuffer = readFileSync(DB_PATH);
  sqliteDb = new SQL.Database(fileBuffer);
} else {
  sqliteDb = new SQL.Database();
}

// Hàm lưu DB ra disk (gọi sau mỗi write)
function persist() {
  const data = sqliteDb.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

// ── Wrapper Statement (giả lập better-sqlite3 Statement) ───────────────────
class Statement {
  constructor(db, sql) {
    this._db = db;
    this._sql = sql;
  }

  // Chạy lệnh INSERT/UPDATE/DELETE, trả về { lastInsertRowid, changes }
  run(...params) {
    this._db.run(this._sql, params);
    const lastInsertRowid = this._db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] ?? null;
    persist();
    return { lastInsertRowid, changes: this._db.getRowsModified() };
  }

  // Lấy 1 dòng (SELECT), trả về object hoặc undefined
  get(...params) {
    const result = this._db.exec(this._sql, params);
    if (!result.length || !result[0].values.length) return undefined;
    const { columns, values } = result[0];
    return Object.fromEntries(columns.map((col, i) => [col, values[0][i]]));
  }

  // Lấy nhiều dòng (SELECT), trả về array of objects
  all(...params) {
    const result = this._db.exec(this._sql, params);
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map(row => Object.fromEntries(columns.map((col, i) => [col, row[i]])));
  }
}

// ── Wrapper Database (giả lập better-sqlite3 Database) ────────────────────
const db = {
  // Tạo prepared statement
  prepare(sql) {
    return new Statement(sqliteDb, sql);
  },

  // Chạy nhiều câu SQL (schema init, v.v.)
  exec(sql) {
    sqliteDb.run(sql);
    persist();
  },

  // Giả lập pragma (WAL & foreign_keys)
  pragma(pragmaStr) {
    try { sqliteDb.run(`PRAGMA ${pragmaStr}`); } catch (_) { /* bỏ qua */ }
  },
};

// ── Khởi tạo schema ────────────────────────────────────────────────────────
const schema = readFileSync(SCHEMA_PATH, 'utf-8');
// Chạy từng câu lệnh để tránh lỗi multi-statement
schema.split(';').map(s => s.trim()).filter(Boolean).forEach(stmt => {
  try { sqliteDb.run(stmt); } catch (_) { /* bỏ qua */ }
});
persist();

console.log('✅ SQLite (sql.js) database initialized:', DB_PATH);

export default db;
