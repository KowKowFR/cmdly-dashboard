import Database from "better-sqlite3";

/**
 * Single SQLite connection, shared by better-auth (users/sessions) and the
 * job history (P6). Server-only. Path from CMDLY_DB_PATH (default ./cmdly.db).
 * WAL keeps reads non-blocking while a write is in flight.
 */
const dbPath = process.env.CMDLY_DB_PATH ?? "./cmdly.db";

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
