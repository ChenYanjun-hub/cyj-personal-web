/**
 * 留言板 · SQLite 存储（服务端专用 · better-sqlite3）
 * ---------------------------------------------------------------
 * 架构：阿里云 ECS + PM2 单实例、磁盘持久 → SQLite 文件最简、零外部依赖、100% 国内可达。
 * 路径：BOARD_DB_PATH（生产指向部署目录外的持久化路径）；dev 默认 web/data/board.db。
 * 连接：globalThis 缓存单连接，避免 dev HMR 反复打开。WAL 模式提升并发读写。
 *
 * 站长后台（邮箱+密码登录）可给便签设自定义位置（pos_x/pos_y/rot），全局生效；
 * 未设过位置的走前端默认时间序瀑布流。z_order 控制叠放（拖动置顶）。
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
  migrate(db);
  return db;
}

/** 增量迁移：给老库补上后台布局字段（SQLite 无 ADD COLUMN IF NOT EXISTS，故先探列） */
function migrate(db: Database.Database) {
  const cols = new Set(
    (db.prepare("PRAGMA table_info(messages)").all() as { name: string }[]).map(
      (c) => c.name
    )
  );
  if (!cols.has("pos_x")) db.exec("ALTER TABLE messages ADD COLUMN pos_x REAL");
  if (!cols.has("pos_y")) db.exec("ALTER TABLE messages ADD COLUMN pos_y REAL");
  if (!cols.has("rot")) db.exec("ALTER TABLE messages ADD COLUMN rot REAL");
  if (!cols.has("z_order")) {
    db.exec("ALTER TABLE messages ADD COLUMN z_order INTEGER");
    // 老数据 z_order 默认 = created_at，保证默认叠放顺序 = 时间序
    db.exec("UPDATE messages SET z_order = created_at WHERE z_order IS NULL");
  }
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
  /** 站长后台设置的自定义位置；null = 走默认瀑布流 */
  pos_x: number | null;
  pos_y: number | null;
  rot: number | null;
  z_order: number;
};

const SELECT_COLS =
  "id, name, body, created_at, pos_x, pos_y, rot, z_order";

/** 取可见留言，最新在前（默认时间序 = created_at DESC） */
export function listMessages(limit = 200): BoardMessage[] {
  return db()
    .prepare(
      `SELECT ${SELECT_COLS} FROM messages
       WHERE hidden = 0 ORDER BY created_at DESC, id DESC LIMIT ?`
    )
    .all(limit) as BoardMessage[];
}

/** 插入一条留言，返回完整记录（z_order 初始 = created_at） */
export function addMessage(input: {
  name: string;
  body: string;
  ipHash?: string;
}): BoardMessage {
  const now = Date.now();
  const info = db()
    .prepare(
      `INSERT INTO messages (name, body, created_at, ip_hash, z_order)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(input.name, input.body, now, input.ipHash ?? null, now);
  return {
    id: Number(info.lastInsertRowid),
    name: input.name,
    body: input.body,
    created_at: now,
    pos_x: null,
    pos_y: null,
    rot: null,
    z_order: now,
  };
}

/** 站长隐藏（软删除）一条留言 */
export function hideMessage(id: number): boolean {
  return db().prepare("UPDATE messages SET hidden = 1 WHERE id = ?").run(id)
    .changes > 0;
}

/** 站长后台：设置便签自定义位置 + 置顶（z_order 抬到当前最大 + 1） */
export function setNoteLayout(
  id: number,
  layout: { x: number; y: number; rot: number }
): boolean {
  const maxZ =
    (db().prepare("SELECT MAX(z_order) AS m FROM messages").get() as {
      m: number | null;
    }).m ?? 0;
  return (
    db()
      .prepare(
        `UPDATE messages SET pos_x = ?, pos_y = ?, rot = ?, z_order = ?
         WHERE id = ? AND hidden = 0`
      )
      .run(layout.x, layout.y, layout.rot, maxZ + 1, id).changes > 0
  );
}

/** 站长后台：把便签重置回默认瀑布流（清掉自定义位置） */
export function resetNoteLayout(id: number): boolean {
  return (
    db()
      .prepare(
        "UPDATE messages SET pos_x = NULL, pos_y = NULL, rot = NULL WHERE id = ?"
      )
      .run(id).changes > 0
  );
}
