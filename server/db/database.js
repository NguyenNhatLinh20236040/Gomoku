// =============================================
// database.js — Kết nối & khởi tạo SQLite
// =============================================
// Sử dụng better-sqlite3 (đồng bộ, nhanh).
// Tự động chạy schema.sql khi khởi động.

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'gomoku.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

// Tạo/mở database
const db = new Database(DB_PATH);

// Bật WAL mode cho performance
db.pragma('journal_mode = WAL');
// Bật foreign keys
db.pragma('foreign_keys = ON');

// Chạy schema migration
const schema = readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

console.log('✅ SQLite database initialized:', DB_PATH);

export default db;
