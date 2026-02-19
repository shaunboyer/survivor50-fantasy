const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "survivor50-secret-change-me";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "survivor50admin";

// ── DATABASE SETUP ─────────────────────────────────────────────────────────
const db = new Database(process.env.DB_PATH || "./survivor50.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    picks TEXT DEFAULT '[]',
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    cast_id INTEGER NOT NULL,
    event_id TEXT NOT NULL,
    episode INTEGER NOT NULL,
    note TEXT DEFAULT '',
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('draft_open', '0');
`);

// ── MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: "Admin only" });
  next();
}

// ── AUTH ROUTES ────────────────────────────────────────────────────────────
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const key = username.trim().toLowerCase();
  if (!/^[a-z0-9_-]{2,20}$/.test(key)) {
    return res.status(400).json({ error: "Username must be 2–20 chars, letters/numbers/hyphens only" });
  }

  const existing = db.prepare("SELECT username FROM users WHERE username = ?").get(key);
  if (existing) return res.status(409).json({ error: "Username already taken" });

  const isAdmin = password === ADMIN_PASSWORD ? 1 : 0;
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)").run(key, hash, isAdmin);

  const token = jwt.sign({ username: key, isAdmin: !!isAdmin }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, username: key, isAdmin: !!isAdmin });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const key = (username || "").trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(key);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = jwt.sign({ username: key, isAdmin: !!user.is_admin }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, username: key, isAdmin: !!user.is_admin, picks: JSON.parse(user.picks) });
});

// ── DRAFT ROUTES ───────────────────────────────────────────────────────────
app.get("/api/draft-status", auth, (req, res) => {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'draft_open'").get();
  res.json({ draftOpen: row?.value === "1" });
});

app.post("/api/picks", auth, (req, res) => {
  const { picks } = req.body;
  const draftOpen = db.prepare("SELECT value FROM settings WHERE key = 'draft_open'").get()?.value === "1";
  if (!draftOpen) return res.status(403).json({ error: "Draft is closed" });
  if (!Array.isArray(picks) || picks.length !== 8) return res.status(400).json({ error: "Must select exactly 8 players" });
  db.prepare("UPDATE users SET picks = ? WHERE username = ?").run(JSON.stringify(picks), req.user.username);
  res.json({ ok: true });
});

// ── LEADERBOARD / SCORES ───────────────────────────────────────────────────
app.get("/api/state", auth, (req, res) => {
  const draftOpen = db.prepare("SELECT value FROM settings WHERE key = 'draft_open'").get()?.value === "1";
  const users = db.prepare("SELECT username, is_admin, picks FROM users").all().map(u => ({
    username: u.username,
    isAdmin: !!u.is_admin,
    picks: JSON.parse(u.picks),
  }));
  const events = db.prepare("SELECT * FROM events ORDER BY created_at ASC").all().map(e => ({
    id: e.id,
    castId: e.cast_id,
    eventId: e.event_id,
    episode: e.episode,
    note: e.note,
  }));
  res.json({ draftOpen, users, events });
});

// ── ADMIN ROUTES ───────────────────────────────────────────────────────────
app.post("/api/admin/draft", auth, adminOnly, (req, res) => {
  const { open } = req.body;
  db.prepare("UPDATE settings SET value = ? WHERE key = 'draft_open'").run(open ? "1" : "0");
  res.json({ draftOpen: open });
});

app.post("/api/admin/events", auth, adminOnly, (req, res) => {
  const { castId, eventId, episode, note } = req.body;
  if (!castId || !eventId || !episode) return res.status(400).json({ error: "Missing fields" });
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  db.prepare("INSERT INTO events (id, cast_id, event_id, episode, note) VALUES (?, ?, ?, ?, ?)").run(id, castId, eventId, episode, note || "");
  res.json({ ok: true, id });
});

app.delete("/api/admin/events/:id", auth, adminOnly, (req, res) => {
  db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ── CATCH-ALL → React ──────────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.listen(PORT, () => console.log(`Survivor50 running on port ${PORT}`));
