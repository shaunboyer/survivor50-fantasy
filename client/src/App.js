import { useState, useEffect, useCallback } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const CAST = [
  { id: 1,  name: "Jenna Lewis-Dougherty",        seasons: "S1, S8",          img: "jenna-lewis-dougherty" },
  { id: 2,  name: "Colby Donaldson",               seasons: "S2, S8, S20",     img: "colby-donaldson" },
  { id: 3,  name: "Stephenie LaGrossa Kendrick",   seasons: "S10, S11, S20",   img: "stephenie-lagrossa-kendrick" },
  { id: 4,  name: "Cirie Fields",                  seasons: "S12, S16, S20, S34", img: "cirie-fields" },
  { id: 5,  name: "Oscar \"Ozzy\" Lusth",          seasons: "S13, S16, S23, S34", img: "ozzy-lusth" },
  { id: 6,  name: "Benjamin \"Coach\" Wade",       seasons: "S18, S20, S23",   img: "coach-wade" },
  { id: 7,  name: "Aubry Bracco",                  seasons: "S32, S34, S38",   img: "aubry-bracco" },
  { id: 8,  name: "Chrissy Hofbeck",               seasons: "S35",             img: "chrissy-hofbeck" },
  { id: 9,  name: "Christian Hubicki",             seasons: "S37",             img: "christian-hubicki" },
  { id: 10, name: "Angelina Keeley",               seasons: "S37",             img: "angelina-keeley" },
  { id: 11, name: "Mike White",                    seasons: "S37",             img: "mike-white" },
  { id: 12, name: "Rick Devens",                   seasons: "S38",             img: "rick-devens" },
  { id: 13, name: "Tiffany Ervin",                 seasons: "S46",             img: "tiffany-ervin" },
  { id: 14, name: "Dianelys \"Dee\" Valladares",   seasons: "S45 Winner",      img: "dee-valladares" },
  { id: 15, name: "Emily Flippen",                 seasons: "S45",             img: "emily-flippen" },
  { id: 16, name: "Quintavius \"Q\" Burdette",     seasons: "S46",             img: "q-burdette" },
  { id: 17, name: "Charlie Davis",                 seasons: "S46",             img: "charlie-davis" },
  { id: 18, name: "Jonathan Young",                seasons: "S42",             img: "jonathan-young" },
  { id: 19, name: "Kyle Fraser",                   seasons: "S48 Winner",      img: "kyle-fraser" },
  { id: 20, name: "Joe Hunter",                    seasons: "S48",             img: "joe-hunter" },
  { id: 21, name: "Kamilla Karthigesu",            seasons: "S48",             img: "kamilla-karthigesu" },
  { id: 22, name: "Rizo Velovic",                  seasons: "S49",             img: "rizo-velovic" },
  { id: 23, name: "Savannah Louie",                seasons: "S49 Winner",      img: "savannah-louie" },
  { id: 24, name: "Genevieve Mushaluk",            seasons: "S47",             img: "genevieve-mushaluk" },
];

const SCORING_EVENTS = [
  { id: "wins_individual_immunity", label: "Wins Individual Immunity",      pts: 5,  icon: "🏆" },
  { id: "wins_reward",              label: "Wins Individual Reward",        pts: 3,  icon: "🎁" },
  { id: "wins_tribal_immunity",     label: "Wins Team Challenge",           pts: 2,  icon: "⚔️" },
  { id: "finds_idol",               label: "Finds Hidden Immunity Idol",    pts: 5,  icon: "🗿" },
  { id: "plays_idol_successfully",  label: "Plays Idol Successfully",       pts: 7,  icon: "✨" },
  { id: "plays_idol_unnecessarily", label: "Plays Idol (No Votes Against)", pts: -5, icon: "💸" },
  { id: "makes_jury",               label: "Makes the Jury",                pts: 5,  icon: "⚖️" },
  { id: "makes_ftc",                label: "Makes Final Tribal Council",    pts: 10, icon: "🌴" },
  { id: "wins_game",                label: "Wins Sole Survivor",            pts: 20, icon: "👑" },
];

// ── API HELPERS ────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem("s50_token"); }
function setToken(t) { localStorage.setItem("s50_token", t); }
function clearToken() { localStorage.removeItem("s50_token"); }

async function api(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  const token = getToken();
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  if (body)  opts.body = JSON.stringify(body);
  const res = await fetch(`/api${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── SCORE ENGINE ───────────────────────────────────────────────────────────
function computeScores(state) {
  if (!state) return { castScores: {}, teamScores: {} };
  const castScores = {};
  for (const ev of state.events) {
    const def = SCORING_EVENTS.find(s => s.id === ev.eventId);
    if (def) castScores[ev.castId] = (castScores[ev.castId] || 0) + def.pts;
  }
  const teamScores = {};
  for (const user of state.users) {
    if (!user.picks || user.picks.length === 0) continue;
    let total = 0;
    const breakdown = {};
    for (const cid of (user.picks || [])) {
      const p = castScores[cid] || 0;
      total += p;
      breakdown[cid] = p;
    }
    teamScores[user.username] = { total, breakdown };
  }
  return { castScores, teamScores };
}

function Headshot({ img, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid rgba(245,158,11,.3)", background: "#1e1710" }}>
      <img
        src={`/images/${img}.webp`}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        onError={e => { e.target.style.display = "none"; }}
      />
    </div>
  );
}

// PRIZING
function PrizesPage({ scores }) {
  const sorted = Object.entries(scores.teamScores).sort((a, b) => b[1].total - a[1].total);
  const prizes = [
    {
      place: "1st Place",
      medal: "🥇",
      item: "Survivor Replica Snake & Ball Puzzle",
      img: "/images/survivorpuzzle.webp",
      color: "#fbbf24",
      shadow: "rgba(251,191,36,.2)",
      border: "rgba(251,191,36,.4)",
      winner: sorted[0],
    },
    {
      place: "2nd Place",
      medal: "🥈",
      item: "Survivor Buff",
      img: "/images/survivorbuff.png",
      color: "#94a3b8",
      shadow: "rgba(148,163,184,.2)",
      border: "rgba(148,163,184,.4)",
      winner: sorted[1],
    },
    {
      place: "3rd Place",
      medal: "🥉",
      item: "20 LB Bag of Rice",
      img: "/images/survivorrice.webp",
      color: "#b45309",
      shadow: "rgba(180,83,9,.2)",
      border: "rgba(180,83,9,.4)",
      winner: sorted[2],
    },
  ];

  return (
    <div style={S.wrap}>
      <div style={S.ph}>
        <div style={S.pt}>PRIZES</div>
        <div style={S.ps}>Current leaders shown based on live standings. May the best tribe win.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {prizes.map((p, i) => (
          <div key={i} style={{ background: "linear-gradient(135deg,#161208,#1e1710)", border: `1px solid ${p.border}`, borderRadius: 6, overflow: "hidden", boxShadow: `0 0 30px ${p.shadow}` }}>
            <div style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap" }}>

              {/* Prize image */}
              <div style={{ width: 200, minHeight: 200, flexShrink: 0, background: "rgba(0,0,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                <img
                  src={p.img}
                  alt={p.item}
                  style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.5))" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              </div>

              {/* Prize info */}
              <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>{p.medal}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: p.color, letterSpacing: 3, textTransform: "uppercase" }}>{p.place}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.tx, marginBottom: 20 }}>{p.item}</div>

                {/* Current leader */}
                <div style={{ borderTop: `1px solid ${p.border}`, paddingTop: 16 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: C.mu, textTransform: "uppercase", marginBottom: 8 }}>CURRENTLY WINNING THIS</div>
                  {p.winner ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#0c0a06" }}>
                          {p.winner[0].charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: C.al }}>{p.winner[0]}</span>
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 700, color: p.color }}>{p.winner[1].total} pts</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, color: C.mu, fontStyle: "italic" }}>No teams drafted yet.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: "14px 18px", background: "rgba(245,158,11,.05)", border: `1px solid ${C.bd}`, borderRadius: 4, fontSize: 13, color: C.mu, textAlign: "center" }}>
        🔥 Prizes are awarded at the end of the season based on final standings.
      </div>
    </div>
  );
}

// ── ROOT APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [me, setMe]         = useState(null);   // { username, isAdmin, picks }
  const [page, setPage]     = useState("login");
  const [state, setState]   = useState(null);   // server state
  const [loading, setLoading] = useState(true);

  // Poll server state every 15s when logged in
  const fetchState = useCallback(async () => {
    try {
      const s = await api("GET", "/state");
      setState(s);
      // sync my picks from server
      if (me) {
        const myUser = s.users.find(u => u.username === me.username);
        if (myUser) setMe(prev => ({ ...prev, picks: myUser.picks }));
      }
    } catch { /* token expired etc */ }
  }, [me]);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    // Validate token by fetching state
    api("GET", "/state").then(s => {
      setState(s);
      // Decode token payload
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const myUser = s.users.find(u => u.username === payload.username);
        setMe({ username: payload.username, isAdmin: payload.isAdmin, picks: myUser?.picks || [] });
        setPage("home");
      } catch { clearToken(); }
    }).catch(() => { clearToken(); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!me) return;
    fetchState();
    const interval = setInterval(fetchState, 15000);
    return () => clearInterval(interval);
  }, [me, fetchState]);

  // ── AUTH ──
  const [uname, setUname]   = useState("");
  const [pwd,   setPwd]     = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  async function doRegister() {
    if (!uname || !pwd) return setAuthErr("Fill in both fields.");
    setAuthLoading(true);
    try {
      const data = await api("POST", "/register", { username: uname, password: pwd });
      setToken(data.token);
      setMe({ username: data.username, isAdmin: data.isAdmin, picks: [] });
      await fetchState();
      setPage("home");
      setAuthErr("");
    } catch (e) {
      setAuthErr(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function doLogin() {
    if (!uname || !pwd) return setAuthErr("Fill in both fields.");
    setAuthLoading(true);
    try {
      const data = await api("POST", "/login", { username: uname, password: pwd });
      setToken(data.token);
      setMe({ username: data.username, isAdmin: data.isAdmin, picks: data.picks || [] });
      const s = await api("GET", "/state");
      setState(s);
      setPage("home");
      setAuthErr("");
    } catch (e) {
      setAuthErr(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function doLogout() {
    clearToken();
    setMe(null);
    setState(null);
    setPage("login");
    setUname(""); setPwd(""); setAuthErr("");
  }

  if (loading) return <Splash />;

  const scores = computeScores(state);
  const isAdmin = !!me?.isAdmin;

  return (
    <div style={S.root}>
      <Bg />
      <div style={S.shell}>
        <Nav me={me} page={page} go={setPage} logout={doLogout} isAdmin={isAdmin} />

        {!me && (
          <AuthPanel
            mode={page === "register" ? "register" : "login"}
            uname={uname} setUname={setUname}
            pwd={pwd} setPwd={setPwd}
            err={authErr} setErr={setAuthErr}
            loading={authLoading}
            onLogin={doLogin} onRegister={doRegister}
            go={setPage}
          />
        )}

        {me && page === "home"        && <HomePage me={me} state={state} scores={scores} go={setPage} />}
        {me && page === "draft"       && <DraftPage me={me} state={state} setMe={setMe} fetchState={fetchState} />}
        {me && page === "leaderboard" && <LeaderboardPage me={me} state={state} scores={scores} />}
        {me && page === "scoring"     && <ScoringPage state={state} scores={scores} />}
        {me && page === "prizes" && <PrizesPage scores={scores} />}
        {me && isAdmin && page === "admin" && <AdminPage state={state} fetchState={fetchState} me={me} />}
      </div>
    </div>
  );
}

// ── SPLASH ─────────────────────────────────────────────────────────────────
function Splash() {
  return (
    <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Bg />
      <div style={{ position: "relative", zIndex: 1, fontSize: 20, letterSpacing: 8, color: C.am }}>🔥 LOADING…</div>
    </div>
  );
}

// ── BACKGROUND ─────────────────────────────────────────────────────────────
function Bg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,#2a1804,#0c0a06 65%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(245,158,11,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,.03) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: -100, left: "10%", width: 300, height: 400, background: "radial-gradient(ellipse,rgba(245,120,20,.12),transparent 70%)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: -100, right: "10%", width: 300, height: 400, background: "radial-gradient(ellipse,rgba(245,120,20,.09),transparent 70%)", borderRadius: "50%" }} />
    </div>
  );
}

// ── NAV ────────────────────────────────────────────────────────────────────
function Nav({ me, page, go, logout, isAdmin }) {
  const items = me ? [
    { id: "home", label: "Home" },
    { id: "draft", label: "My Team" },
    { id: "leaderboard", label: "Standings" },
    { id: "scoring", label: "Scores" },
    { id: "prizes", label: "Prizes" },
    ...(isAdmin ? [{ id: "admin", label: "⚙ Admin" }] : []),
  ] : [];
  return (
    <header style={S.hdr}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 26 }}>🔥</span>
        <div>
          <div style={S.hT}>SURVIVOR 50</div>
          <div style={S.hS}>IN THE HANDS OF THE FANS — FANTASY LEAGUE</div>
        </div>
      </div>
      {me && (
        <nav style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {items.map(n => (
            <button key={n.id} style={{ ...S.nb, ...(page === n.id ? S.nba : {}) }} onClick={() => go(n.id)}>{n.label}</button>
          ))}
          <button style={S.no} onClick={logout}>Sign Out</button>
        </nav>
      )}
    </header>
  );
}

// ── AUTH PANEL ─────────────────────────────────────────────────────────────
function AuthPanel({ mode, uname, setUname, pwd, setPwd, err, setErr, loading, onLogin, onRegister, go }) {
  const isReg = mode === "register";
  const submit = isReg ? onRegister : onLogin;
  return (
    <div style={S.ctr}>
      <div style={{ ...S.card, minWidth: 290, maxWidth: 370, width: "100%" }}>
        <div style={{ fontSize: 22, letterSpacing: 5, color: C.al, textAlign: "center", marginBottom: 5 }}>
          {isReg ? "JOIN THE TRIBE" : "ENTER THE GAME"}
        </div>
        <div style={{ fontSize: 13, color: C.mu, textAlign: "center", marginBottom: 22 }}>
          {isReg ? "Create your fantasy account" : "Sign in to your account"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <input style={S.inp} placeholder="Username" value={uname} onChange={e => setUname(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} disabled={loading} />
          <input style={S.inp} placeholder="Password" type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} disabled={loading} />
          {err && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{err}</div>}
          <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} onClick={submit} disabled={loading}>
            {loading ? "..." : isReg ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: C.mu }}>
          {isReg ? "Already registered? " : "New player? "}
          <button style={S.lnk} onClick={() => { setErr(""); go(isReg ? "login" : "register"); }}>
            {isReg ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
// EPISODE COUNTDOWN
function EpisodeCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function getNext() {
      const now = new Date();
      // Next Wednesday at 8pm PST = 04:00 UTC Thursday
      const target = new Date();
      target.setUTCHours(4, 0, 0, 0);
      const day = target.getUTCDay();
      // Thursday in UTC = day 4
      const daysUntilThu = (4 - day + 7) % 7 || 7;
      target.setUTCDate(target.getUTCDate() + daysUntilThu);
      if (target <= now) target.setUTCDate(target.getUTCDate() + 7);

      const diff = target - now;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `${d}d ${h}h ${m}m ${s}s`;
    }

    setTimeLeft(getNext());
    const interval = setInterval(() => setTimeLeft(getNext()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ ...S.card, textAlign: "center", padding: "20px 16px", marginTop: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: C.mu, textTransform: "uppercase", marginBottom: 8 }}>NEXT EPISODE</div>
      <div style={{ fontSize: 13, color: C.mu, marginBottom: 10 }}>Wednesdays at 8pm PST on CBS</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: C.al, letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>{timeLeft}</div>
    </div>
  );
}


// ── HOME PAGE ──────────────────────────────────────────────────────────────
function HomePage({ me, state, scores, go }) {
  const picks = me.picks || [];
  const ts = scores.teamScores[me.username];
  const sorted = Object.entries(scores.teamScores).sort((a, b) => b[1].total - a[1].total);
  const rank = sorted.findIndex(([u]) => u === me.username) + 1;

  return (
    <div style={S.wrap}>
      <div style={{ fontSize: 19, marginBottom: 20 }}>
        Welcome back, <span style={{ color: C.al, fontStyle: "italic" }}>{me.username}</span>
        {me.isAdmin && <span style={{ fontSize: 11, color: C.am, marginLeft: 8, letterSpacing: 2 }}>ADMIN</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon="🏆" label="MY SCORE"  val={ts ? ts.total : "—"} />
        <StatCard icon="📊" label="MY RANK"   val={rank > 0 ? `${rank} / ${sorted.length}` : "—"} />
        <StatCard icon="🌴" label="DRAFTED"   val={`${picks.length} / 8`} />
        <StatCard icon="📋" label="DRAFT"     val={state?.draftOpen ? "OPEN" : "CLOSED"} color={state?.draftOpen ? "#4ade80" : "#f87171"} />
      </div>

      {picks.length < 8 && state?.draftOpen && (
        <div style={S.callout}>⚠️ You haven't drafted your team yet! <button style={S.lnk} onClick={() => go("draft")}>Draft Now →</button></div>
      )}

      {picks.length === 8 && ts && (
        <div style={S.card}>
          <div style={S.cT}>MY TRIBE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: 9 }}>
            {picks.map(cid => {
              const c = CAST.find(x => x.id === cid);
              const p = ts.breakdown[cid] ?? 0;
              return (
                <div key={`${cid}-${Math.random()}`} style={{ background: "rgba(245,158,11,.05)", border: `1px solid ${C.bd}`, borderRadius: 4, padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Headshot img={c?.img} size={44} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c?.name}</div>
                      <div style={{ fontSize: 11, color: C.mu }}>{c?.seasons}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: C.al, fontWeight: 700 }}>{p >= 0 ? `+${p}` : p} pts</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

            <EpisodeCountdown />

    </div>
  );
}

function StatCard({ icon, label, val, color }) {
  return (
    <div style={{ ...S.card, textAlign: "center", padding: "16px 8px" }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || C.al, marginBottom: 2 }}>{val}</div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: C.mu, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// ── DRAFT PAGE ─────────────────────────────────────────────────────────────
function DraftPage({ me, state, setMe, fetchState }) {
  const saved = me.picks || [];
  const [picks, setPicks]   = useState(saved);
  const [q, setQ]           = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");
  const locked = !state?.draftOpen;

  function toggle(cid) {
    if (locked) return;
    if (picks.includes(cid)) { setPicks(picks.filter(x => x !== cid)); return; }
    if (picks.length >= 8) return;
    setPicks([...picks, cid]);
  }

  async function submit() {
    if (picks.length !== 8) return;
    setSaving(true);
    try {
      await api("POST", "/picks", { picks });
      setMe(prev => ({ ...prev, picks }));
      await fetchState();
      setMsg("✅ Team saved!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  }

  const shown = CAST.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.seasons.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={S.wrap}>
      <div style={S.ph}><div style={S.pt}>DRAFT YOUR TRIBE</div><div style={S.ps}>Pick exactly 8 castaways. Duplicates allowed across teams.</div></div>

      {locked && <div style={{ ...S.callout, borderColor: "#f87171", color: "#f87171" }}>🔒 Draft is closed. Ask the admin to open it.</div>}
      {msg && <div style={{ ...S.callout, borderColor: msg.startsWith("✅") ? "#4ade80" : "#f87171", color: msg.startsWith("✅") ? "#4ade80" : "#f87171" }}>{msg}</div>}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: C.am, marginBottom: 5 }}>{picks.length} / 8 selected</div>
        <div style={{ height: 4, background: "rgba(255,255,255,.07)", borderRadius: 2, maxWidth: 260 }}>
          <div style={{ height: "100%", width: `${(picks.length / 8) * 100}%`, background: `linear-gradient(90deg,#b45309,${C.al})`, borderRadius: 2, transition: "width .3s" }} />
        </div>
      </div>

      <input style={{ ...S.inp, maxWidth: 250, marginBottom: 12 }} placeholder="Search castaways…" value={q} onChange={e => setQ(e.target.value)} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 9, marginBottom: 20 }}>
        {shown.map(c => {
          const sel = picks.includes(c.id);
          const full = picks.length >= 8 && !sel;
          return (
<div key={c.id} onClick={() => toggle(c.id)} style={{ ...S.card, cursor: locked || full ? "not-allowed" : "pointer", padding: "10px 12px", position: "relative", opacity: full ? 0.35 : 1, border: sel ? `1px solid ${C.am}` : `1px solid ${C.bd}`, background: sel ? "rgba(245,158,11,.12)" : "linear-gradient(135deg,#161208,#1e1710)", transition: "all .15s" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <Headshot img={c.img} size={88} />
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c.name}</div>
      <div style={{ fontSize: 11, color: C.mu }}>{c.seasons}</div>
    </div>
  </div>
  {sel && <div style={{ position: "absolute", top: 7, right: 9, color: C.al, fontWeight: 700 }}>✓</div>}
</div>
          );
        })}
      </div>

      {!locked && (
        <div style={{ textAlign: "center" }}>
          <button style={{ ...S.btn, opacity: picks.length === 8 && !saving ? 1 : 0.35 }} onClick={submit} disabled={picks.length !== 8 || saving}>
            {saving ? "SAVING…" : saved.length ? "UPDATE MY TEAM" : "SUBMIT MY TEAM"}
          </button>
          {picks.length !== 8 && <div style={{ fontSize: 12, color: C.mu, marginTop: 6 }}>Select exactly 8 to submit.</div>}
        </div>
      )}
    </div>
  );
}

// ── LEADERBOARD ────────────────────────────────────────────────────────────
function LeaderboardPage({ me, state, scores }) {
  const [exp, setExp] = useState(null);
  const sorted = Object.entries(scores.teamScores).sort((a, b) => b[1].total - a[1].total);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={S.wrap}>
      <div style={S.ph}><div style={S.pt}>STANDINGS</div><div style={S.ps}>Click any team to expand their roster and breakdown.</div></div>

      {sorted.length === 0 && <div style={{ color: C.mu, fontStyle: "italic" }}>No teams drafted yet. Check back after the draft opens!</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {sorted.map(([uname, { total, breakdown }], i) => {
          const user = state?.users?.find(u => u.username === uname);
          const isMe = uname === me.username;
          const isExp = exp === uname;
          return (
            <div key={uname} style={{ ...S.card, cursor: "pointer", padding: 0, border: isMe ? `1px solid ${C.am}` : `1px solid ${C.bd}` }} onClick={() => setExp(isExp ? null : uname)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20, minWidth: 28 }}>{medals[i] || `${i + 1}.`}</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>
                    {uname}
                    {isMe && <span style={{ color: C.am, fontSize: 11, marginLeft: 7 }}>(you)</span>}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 19, color: C.al, fontWeight: 700 }}>{total} pts</span>
                  <span style={{ color: C.mu, fontSize: 11 }}>{isExp ? "▲" : "▼"}</span>
                </div>
              </div>
          {isExp && (
                <div style={{ padding: "0 16px 12px", borderTop: `1px solid ${C.bd}` }}>
                  <div style={{ paddingTop: 9, display: "flex", flexDirection: "column", gap: 4 }}>
                    {state?.draftOpen && uname !== me.username ? (
                      <div style={{ color: C.mu, fontStyle: "italic", fontSize: 13 }}>
                        🔒 Picks hidden until the draft closes.
                      </div>
                    ) : (
                      <>
                        {(user?.picks || []).length === 0 && <div style={{ color: C.mu, fontStyle: "italic", fontSize: 13 }}>No picks yet.</div>}
                        {(user?.picks || []).map((cid, idx) => {
                          const c = CAST.find(x => x.id === cid);
                          const p = breakdown[cid] ?? 0;
                          return (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                              <span style={{ color: C.tx }}>{c?.name} <span style={{ color: C.mu, fontSize: 11 }}>({c?.seasons})</span></span>
                              <span style={{ color: p >= 0 ? "#4ade80" : "#f87171", fontWeight: 600 }}>{p >= 0 ? `+${p}` : p} pts</span>
                            </div>
                          );
                        })}
                        {(user?.picks || []).length > 0 && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.bd}`, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                            <span style={{ color: C.mu }}>TOTAL</span>
                            <span style={{ color: C.al }}>{total} pts</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SCORING PAGE ───────────────────────────────────────────────────────────
function ScoringPage({ state, scores }) {
  const [sel, setSel] = useState(null);
  const sorted = [...CAST].sort((a, b) => (scores.castScores[b.id] || 0) - (scores.castScores[a.id] || 0));
  const evts = sel ? (state?.events || []).filter(e => e.castId === sel) : [];

  return (
    <div style={S.wrap}>
      <div style={S.ph}><div style={S.pt}>CASTAWAY SCORES</div><div style={S.ps}>Click any castaway to see their event history.</div></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 9, marginBottom: 20 }}>
        {sorted.map(c => {
          const pts = scores.castScores[c.id] || 0;
          const on = sel === c.id;
          return (
<div key={c.id} onClick={() => setSel(on ? null : c.id)} style={{ ...S.card, cursor: "pointer", padding: "10px 12px", border: on ? `1px solid ${C.am}` : `1px solid ${C.bd}`, background: on ? "rgba(245,158,11,.1)" : "linear-gradient(135deg,#161208,#1e1710)", transition: "all .15s" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
    <Headshot img={c.img} size={80} />
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c.name}</div>
      <div style={{ fontSize: 11, color: C.mu }}>{c.seasons}</div>
    </div>
  </div>
  <div style={{ fontSize: 17, fontWeight: 700, color: pts > 0 ? C.al : pts < 0 ? "#f87171" : C.mu }}>{pts > 0 ? `+${pts}` : pts} pts</div>
</div>
          );
        })}
      </div>

      {sel && (
        <div style={{ ...S.card, marginBottom: 20 }}>
          <div style={S.cT}>{CAST.find(c => c.id === sel)?.name} — Event Log</div>
          {evts.length === 0
            ? <div style={{ color: C.mu, fontStyle: "italic" }}>No events logged yet.</div>
            : evts.map(ev => {
                const def = SCORING_EVENTS.find(s => s.id === ev.eventId);
                return (
                  <div key={ev.id} style={{ display: "flex", gap: 7, alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.bd}`, fontSize: 13, flexWrap: "wrap" }}>
                    <span>{def?.icon}</span>
                    <span style={{ flex: 1 }}>Ep {ev.episode} — {def?.label}{ev.note && <span style={{ color: C.mu, fontStyle: "italic" }}> ({ev.note})</span>}</span>
                    <span style={{ color: (def?.pts || 0) >= 0 ? "#4ade80" : "#f87171" }}>{(def?.pts || 0) > 0 ? `+${def.pts}` : def?.pts} pts</span>
                  </div>
                );
              })}
        </div>
      )}

      <div style={S.card}>
        <div style={S.cT}>SCORING REFERENCE</div>
        {SCORING_EVENTS.map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${C.bd}` }}>
            <span>{e.icon} {e.label}</span>
            <span style={{ color: e.pts >= 0 ? C.am : "#f87171", fontWeight: 700 }}>{e.pts > 0 ? `+${e.pts}` : e.pts} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ADMIN PAGE ─────────────────────────────────────────────────────────────
function AdminPage({ state, fetchState, me }) {
  const [tab,     setTab]     = useState("log");
  const [castSel, setCastSel] = useState(null);
  const [evtSel,  setEvtSel]  = useState(null);
  const [episode, setEpisode] = useState(1);
  const [note,    setNote]    = useState("");
  const [q,       setQ]       = useState("");
  const [toast,   setToast]   = useState("");
  const [busy,    setBusy]    = useState(false);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 2500); }

  async function logEvent() {
    if (!castSel || !evtSel) return;
    setBusy(true);
    try {
      await api("POST", "/admin/events", { castId: castSel, eventId: evtSel, episode, note });
      await fetchState();
      flash("✅ Event logged!");
      setNote("");
    } catch (e) { flash("❌ " + e.message); }
    finally { setBusy(false); }
  }

  async function deleteEvent(id) {
    try {
      await api("DELETE", `/admin/events/${id}`);
      await fetchState();
      flash("🗑 Event deleted.");
    } catch (e) { flash("❌ " + e.message); }
  }

  async function toggleDraft() {
    try {
      await api("POST", "/admin/draft", { open: !state?.draftOpen });
      await fetchState();
      flash(state?.draftOpen ? "🔒 Draft closed." : "🟢 Draft opened!");
    } catch (e) { flash("❌ " + e.message); }
  }

  async function resetPicks(username) {
  try {
    await api("POST", "/admin/reset-picks", { username });
    await fetchState();
    flash(`🗑 ${username}'s team cleared.`);
  } catch (e) { flash("❌ " + e.message); }
}

async function deleteUser(username) {
  try {
    await api("DELETE", `/admin/users/${username}`);
    await fetchState();
    flash(`🗑 ${username} deleted.`);
  } catch (e) { flash("❌ " + e.message); }
}

  const shownCast = CAST.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
  const castObj = CAST.find(c => c.id === castSel);
  const evtObj  = SCORING_EVENTS.find(s => s.id === evtSel);

  return (
    <div style={S.wrap}>
      <div style={S.ph}><div style={S.pt}>⚙ ADMIN PANEL</div></div>

      {toast && <div style={{ position: "fixed", bottom: 22, right: 22, background: "#166534", border: "1px solid #4ade80", color: "#4ade80", padding: "10px 16px", borderRadius: 4, zIndex: 999, fontSize: 14 }}>{toast}</div>}

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["log", "Log Events"], ["draft", "Draft Control"], ["history", "Event History"]].map(([id, label]) => (
          <button key={id} style={{ ...S.nb, ...(tab === id ? S.nba : {}) }} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* LOG EVENTS */}
      {tab === "log" && (
        <div>
          <div style={{ fontSize: 13, color: C.mu, marginBottom: 12 }}>Select a castaway and event type, then click LOG EVENT.</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={S.lbl}>CASTAWAY</div>
              <input style={{ ...S.inp, marginBottom: 6 }} placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
              <div style={{ background: "#161208", border: `1px solid ${C.bd}`, borderRadius: 4, maxHeight: 300, overflowY: "auto" }}>
                {shownCast.map(c => (
                  <div key={c.id} onClick={() => setCastSel(c.id)} style={{ padding: "8px 12px", borderBottom: `1px solid rgba(245,158,11,.07)`, cursor: "pointer", fontSize: 13, background: castSel === c.id ? "rgba(245,158,11,.12)" : "transparent", color: castSel === c.id ? C.al : C.tx }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.mu }}>{c.seasons}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={S.lbl}>EVENT TYPE</div>
              <div style={{ background: "#161208", border: `1px solid ${C.bd}`, borderRadius: 4, overflow: "hidden" }}>
                {SCORING_EVENTS.map(e => (
                  <div key={e.id} onClick={() => setEvtSel(e.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: `1px solid rgba(245,158,11,.07)`, cursor: "pointer", fontSize: 13, background: evtSel === e.id ? "rgba(245,158,11,.12)" : "transparent", color: evtSel === e.id ? C.al : C.tx }}>
                    <span>{e.icon} {e.label}</span>
                    <span style={{ color: e.pts >= 0 ? "#4ade80" : "#f87171", fontWeight: 700, marginLeft: 6 }}>{e.pts > 0 ? `+${e.pts}` : e.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...S.card, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <div style={S.lbl}>EPISODE #</div>
                <input style={{ ...S.inp, width: 68 }} type="number" min={1} value={episode} onChange={e => setEpisode(Number(e.target.value))} />
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={S.lbl}>NOTE (optional)</div>
                <input style={S.inp} placeholder="e.g. played on Cirie" value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <button style={{ ...S.btn, opacity: castSel && evtSel && !busy ? 1 : 0.35 }} onClick={logEvent} disabled={!castSel || !evtSel || busy}>
                {busy ? "SAVING…" : "LOG EVENT"}
              </button>
            </div>
            {castSel && evtSel && (
              <div style={{ marginTop: 11, fontSize: 13, color: C.tx, paddingTop: 11, borderTop: `1px solid ${C.bd}` }}>
                Will log: <strong style={{ color: C.al }}>{castObj?.name}</strong> — {evtObj?.icon} {evtObj?.label}{" "}
                (<span style={{ color: (evtObj?.pts || 0) >= 0 ? "#4ade80" : "#f87171" }}>{(evtObj?.pts || 0) > 0 ? `+${evtObj.pts}` : evtObj?.pts} pts</span>) · Episode {episode}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAFT CONTROL */}
      {tab === "draft" && (
        <div>
          <div style={{ ...S.card, textAlign: "center", padding: 28, marginBottom: 18 }}>
            <div style={{ fontSize: 16, marginBottom: 12 }}>
              Draft is currently: <strong style={{ color: state?.draftOpen ? "#4ade80" : "#f87171" }}>{state?.draftOpen ? "OPEN" : "CLOSED"}</strong>
            </div>
            <button style={S.btn} onClick={toggleDraft}>{state?.draftOpen ? "CLOSE DRAFT" : "OPEN DRAFT"}</button>
          </div>
          <div style={S.card}>
            <div style={S.cT}>REGISTERED TEAMS</div>
            {(state?.users || []).filter(u => !u.isAdmin).length === 0 && (
              <div style={{ color: C.mu, fontStyle: "italic" }}>No participants yet.</div>
            )}
      {(state?.users || []).filter(u => u.username !== me?.username).map(u => (
  <div key={u.username} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.bd}`, fontSize:14 }}>
    <span>{u.username}</span>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ color:(u.picks?.length||0) === 8 ? "#4ade80" : C.mu }}>
        {u.picks?.length||0}/8 {(u.picks?.length||0) === 8 ? "✓" : ""}
      </span>
<button
  style={{ background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.3)", color:"#f87171", cursor:"pointer", borderRadius:2, padding:"2px 8px", fontSize:11 }}
  onClick={() => { if(window.confirm(`Clear ${u.username}'s team?`)) resetPicks(u.username); }}
>
  Clear
</button>
<button
  style={{ background:"rgba(248,113,113,.2)", border:"1px solid rgba(248,113,113,.5)", color:"#f87171", cursor:"pointer", borderRadius:2, padding:"2px 8px", fontSize:11 }}
  onClick={() => { if(window.confirm(`Permanently delete ${u.username}'s account?`)) deleteUser(u.username); }}
>
  Delete
</button>
    </div>
  </div>
))}
          </div>
        </div>
      )}

      {/* EVENT HISTORY */}
      {tab === "history" && (
        <div style={S.card}>
          <div style={S.cT}>FULL EVENT LOG</div>
          {(state?.events || []).length === 0 && <div style={{ color: C.mu, fontStyle: "italic" }}>No events yet.</div>}
          {[...(state?.events || [])].reverse().map(ev => {
            const c   = CAST.find(x => x.id === ev.castId);
            const def = SCORING_EVENTS.find(s => s.id === ev.eventId);
            return (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 0", borderBottom: `1px solid ${C.bd}`, fontSize: 13, flexWrap: "wrap" }}>
                <span>{def?.icon}</span>
                <span style={{ flex: 1 }}>
                  <strong>{c?.name}</strong> — Ep {ev.episode} — {def?.label}
                  {ev.note && <span style={{ color: C.mu, fontStyle: "italic" }}> ({ev.note})</span>}
                </span>
                <span style={{ color: (def?.pts || 0) >= 0 ? "#4ade80" : "#f87171", marginRight: 5 }}>
                  {(def?.pts || 0) > 0 ? `+${def.pts}` : def?.pts} pts
                </span>
                <button style={{ background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)", color: "#f87171", cursor: "pointer", borderRadius: 2, padding: "2px 7px", fontSize: 11 }} onClick={() => deleteEvent(ev.id)}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TOKENS & STYLES ────────────────────────────────────────────────────────
const C = { am: "#f59e0b", al: "#fbbf24", bd: "rgba(245,158,11,.2)", bb: "rgba(245,158,11,.5)", tx: "#e8d5a3", mu: "#8a7355" };
const S = {
  root:    { minHeight: "100vh", fontFamily: "'Georgia','Times New Roman',serif", color: C.tx, background: "#0c0a06", position: "relative" },
  shell:   { position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" },
  hdr:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 22px", borderBottom: `1px solid ${C.bd}`, background: "rgba(12,10,6,.9)", backdropFilter: "blur(8px)", flexWrap: "wrap", gap: 8, position: "sticky", top: 0, zIndex: 100 },
  hT:      { fontSize: 18, fontWeight: 700, color: C.al, letterSpacing: 4 },
  hS:      { fontSize: 9, color: C.mu, letterSpacing: 2, textTransform: "uppercase" },
  nb:      { background: "transparent", border: `1px solid ${C.bd}`, color: C.mu, padding: "5px 11px", cursor: "pointer", fontSize: 12, letterSpacing: 1, fontFamily: "'Georgia',serif", borderRadius: 2, transition: "all .2s" },
  nba:     { border: `1px solid ${C.bb}`, color: C.al, background: "rgba(245,158,11,.08)" },
  no:      { background: "transparent", border: "1px solid rgba(248,113,113,.3)", color: "#f87171", padding: "5px 11px", cursor: "pointer", fontSize: 12, letterSpacing: 1, fontFamily: "'Georgia',serif", borderRadius: 2 },
  ctr:     { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  card:    { background: "linear-gradient(135deg,#161208,#1e1710)", border: `1px solid ${C.bd}`, borderRadius: 4, padding: 20 },
  cT:      { fontSize: 11, letterSpacing: 3, color: C.am, marginBottom: 11, textTransform: "uppercase", borderBottom: `1px solid ${C.bd}`, paddingBottom: 7 },
  inp:     { background: "rgba(255,255,255,.04)", border: `1px solid ${C.bd}`, borderRadius: 2, padding: "8px 11px", color: C.tx, fontSize: 14, fontFamily: "'Georgia',serif", outline: "none", width: "100%", boxSizing: "border-box" },
  btn:     { background: `linear-gradient(135deg,#b45309,${C.am})`, border: "none", color: "#fff", padding: "9px 22px", cursor: "pointer", fontSize: 12, letterSpacing: 3, fontFamily: "'Georgia',serif", fontWeight: 700, textTransform: "uppercase", borderRadius: 2 },
  lnk:     { background: "none", border: "none", color: C.al, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit", textDecoration: "underline", padding: 0 },
  wrap:    { padding: "22px 26px", maxWidth: 1020, margin: "0 auto", width: "100%", boxSizing: "border-box" },
  ph:      { marginBottom: 20 },
  pt:      { fontSize: 21, letterSpacing: 5, color: C.al, textTransform: "uppercase", marginBottom: 3 },
  ps:      { fontSize: 13, color: C.mu, letterSpacing: 1 },
  callout: { border: `1px solid ${C.bb}`, background: "rgba(245,158,11,.06)", borderRadius: 4, padding: "10px 14px", marginBottom: 16, fontSize: 14, color: C.al },
  lbl:     { fontSize: 10, letterSpacing: 3, color: C.mu, textTransform: "uppercase", marginBottom: 5 },
};
