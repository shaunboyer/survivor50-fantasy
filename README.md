# 🔥 Survivor 50 Fantasy League

A full-stack fantasy league app for Survivor 50: In the Hands of the Fans.

---

## 🚀 Deploy to Railway (Recommended — Free)

### Step 1 — Create a GitHub repo

1. Go to [github.com](https://github.com) and sign in (create a free account if needed)
2. Click **New repository** → name it `survivor50-fantasy` → click **Create repository**
3. On your computer, open Terminal (Mac) or Command Prompt (Windows) in the project folder and run:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/survivor50-fantasy.git
git push -u origin main
```

### Step 2 — Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `survivor50-fantasy` repo
4. Railway will auto-detect the Node.js app and start building

### Step 3 — Set Environment Variables

In Railway, click your project → **Variables** tab → add these:

| Variable | Value |
|---|---|
| `JWT_SECRET` | any long random string (e.g. `xK9mP2qR7vL4nW8`) |
| `ADMIN_PASSWORD` | your chosen admin password |
| `DB_PATH` | `/app/survivor50.db` |

> ⚠️ **Important**: Change `ADMIN_PASSWORD` from the default `survivor50admin` to something only you know!

### Step 4 — Get your URL

Railway will give you a public URL like `https://survivor50-fantasy-production.up.railway.app`.
Share this with your league members!

---

## 🏃 Run Locally (for testing)

```bash
# Install root dependencies
npm install

# Install and build client
cd client && npm install && npm run build && cd ..

# Start the server
npm start
```

Then open http://localhost:3001

---

## 👤 How Accounts Work

- **Admin**: Register with any username + the `ADMIN_PASSWORD` you set → gets the ⚙ Admin tab
- **Players**: Register with any username + any other password → regular player account
- Tokens are stored in localStorage so players stay logged in across visits

---

## 📋 Admin Workflow (Episode Night)

1. Open the **⚙ Admin** tab
2. Go to **Log Events**
3. As things happen during the episode, select the castaway → select the event → click LOG EVENT
4. Scores update instantly for everyone across the leaderboard
5. If you make a mistake, go to **Event History** and click ✕ to delete it

---

## 🌴 Cast List

All 24 returning players are pre-loaded. You can edit `client/src/App.js` to update the cast if CBS makes any changes before the season airs.

---

## 🔧 Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (via better-sqlite3) — stored as a single file, no setup needed
- **Frontend**: React
- **Auth**: JWT tokens + bcrypt password hashing
- **Hosting**: Railway
