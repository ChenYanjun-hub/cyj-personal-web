/**
 * 留言板 · SQLite 存储（服务端专用 · better-sqlite3）
 * ---------------------------------------------------------------
 * 架构：阿里云 ECS + PM2 单实例、磁盘持久 → SQLite 文件最简、零外部依赖、100% 国内可达。
 * 路径：BOARD_DB_PATH（生产指向部署目录外的持久化路径）；dev 默认 web/data/board.db。
 * 连接：globalThis 缓存单连接，避免 dev HMR 反复打开。WAL 模式提升并发读写。
 *
 * 只在 API route（server）里 import；better-sqlite3 是 native 模块，不会进客户端包
 * （next.config 的 serverExternalPackages 已标外部）。
 */
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DB_PATH =
  process.env.BOARD_DB_PATH || path.join(process.cwd(), "data", "board.db");

const g = globalThis as unknown as { __boardDb?: Database.Database };

function open(): Database.Database {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      body       TEXT    NOT NULL,
      created_at INTEGER NOT NULL,
      hidden     INTEGER NOT NULL DEFAULT 0,
      ip_hash    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_messages_visible
      ON messages (hidden, created_at);
  `);
  return db;
}

function db(): Database.Database {
  if (!g.__boardDb) g.__boardDb = open();
  return g.__boardDb;
}

export type BoardMessage = {
  id: number;
  name: string;
  body: string;
  created_at: number;
};

/** 取可见留言，最新在前 */
export function listMessages(limit = 100): BoardMessage[] {
  return db()
    .prepare(
      `SELECT id, name, body, created_at FROM messages
       WHERE hidden = 0 ORDER BY created_at DESC, id DESC LIMIT ?`
    )
    .all(limit) as BoardMessage[];
}

/** 插入一条留言，返回完整记录 */
export function addMessage(input: {
  name: string;
  body: string;
  ipHash?: string;
}): BoardMessage {
  const now = Date.now();
  const info = db()
    .prepare(
      "INSERT INTO messages (name, body, created_at, ip_hash) VALUES (?, ?, ?, ?)"
    )
    .run(input.name, input.body, now, input.ipHash ?? null);
  return {
    id: Number(info.lastInsertRowid),
    name: input.name,
    body: input.body,
    created_at: now,
  };
}

/** 站长隐藏（软删除）一条留言 */
export function hideMessage(id: number): boolean {
  return db().prepare("UPDATE messages SET hidden = 1 WHERE id = ?").run(id)
    .changes > 0;
}
