import { useState, useEffect, useCallback } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const CAST = [
  { id: 1,  name: "Jenna Lewis-Dougherty",        seasons: "S1, S8",             img: "jenna-lewis-dougherty",        tribe: "cila" },
  { id: 2,  name: "Colby Donaldson",               seasons: "S2, S8, S20",        img: "colby-donaldson",              tribe: "kalo" },
  { id: 3,  name: "Stephenie LaGrossa Kendrick",   seasons: "S10, S11, S20",      img: "stephenie-lagrossa-kendrick",  tribe: "vatu" },
  { id: 4,  name: "Cirie Fields",                  seasons: "S12, S16, S20, S34", img: "cirie-fields",                 tribe: "cila" },
  { id: 5,  name: "Oscar \"Ozzy\" Lusth",          seasons: "S13, S16, S23, S34", img: "ozzy-lusth",                   tribe: "vatu" },
  { id: 6,  name: "Benjamin \"Coach\" Wade",       seasons: "S18, S20, S23",      img: "coach-wade",                   tribe: "kalo" },
  { id: 7,  name: "Aubry Bracco",                  seasons: "S32, S34, S38",      img: "aubry-bracco",                 tribe: "kalo" },
  { id: 8,  name: "Chrissy Hofbeck",               seasons: "S35",                img: "chrissy-hofbeck",              tribe: "kalo" },
  { id: 9,  name: "Christian Hubicki",             seasons: "S37",                img: "christian-hubicki",            tribe: "vatu" },
  { id: 10, name: "Angelina Keeley",               seasons: "S37",                img: "angelina-keeley",              tribe: "vatu" },
  { id: 11, name: "Mike White",                    seasons: "S37",                img: "mike-white",                   tribe: "vatu" },
  { id: 12, name: "Rick Devens",                   seasons: "S38",                img: "rick-devens",                  tribe: "cila" },
  { id: 13, name: "Tiffany Ervin",                 seasons: "S46",                img: "tiffany-ervin",                tribe: "kalo" },
  { id: 14, name: "Dianelys \"Dee\" Valladares",   seasons: "S45 Winner",         img: "dee-valladares",               tribe: "cila" },
  { id: 15, name: "Emily Flippen",                 seasons: "S45",                img: "emily-flippen",                tribe: "vatu" },
  { id: 16, name: "Quintavius \"Q\" Burdette",     seasons: "S46",                img: "q-burdette",                   tribe: "vatu" },
  { id: 17, name: "Charlie Davis",                 seasons: "S46",                img: "charlie-davis",                tribe: "cila" },
  { id: 18, name: "Jonathan Young",                seasons: "S42",                img: "jonathan-young",               tribe: "cila" },
  { id: 19, name: "Kyle Fraser",                   seasons: "S48 Winner",         img: "kyle-fraser",                  tribe: "vatu" },
  { id: 20, name: "Joe Hunter",                    seasons: "S48",                img: "joe-hunter",                   tribe: "kalo" },
  { id: 21, name: "Kamilla Karthigesu",            seasons: "S48",                img: "kamilla-karthigesu",           tribe: "cila" },
  { id: 22, name: "Rizo Velovic",                  seasons: "S49",                img: "rizo-velovic",                 tribe: "cila" },
  { id: 23, name: "Savannah Louie",                seasons: "S49 Winner",         img: "savannah-louie",               tribe: "cila" },
  { id: 24, name: "Genevieve Mushaluk",            seasons: "S47",                img: "genevieve-mushaluk",           tribe: "kalo" },
];

const TRIBE_COLORS = {
  cila: "#e8650a",
  kalo: "#2ec4c4",
  vatu: "#d44fc4",
};

const SCORING_EVENTS = [
  { id: "voted_off",                label: "Voted Off",                     pts: 0, icon: "💀" },
  { id: "wins_journey",             label: "Wins Journey",                  pts: 2, icon: "⚔️" },
  { id: "loses_journey",            label: "Loses Journey",                 pts: -2, icon: "⚔️" },
  { id: "wins_tribal_immunity",     label: "Team Challenge (1st)",          pts: 2,  icon: "🏆" },
  { id: "second_tribal_immunity",   label: "Team Challenge (2nd)",          pts: 1, icon: "🏆" },
  { id: "wins_individual_immunity", label: "Wins Individual Immunity",      pts: 5,  icon: "🏆" },
  { id: "wins_reward",              label: "Wins Individual Reward",        pts: 3,  icon: "🎁" },
  { id: "finds_idol",               label: "Finds Hidden Immunity Idol",    pts: 5,  icon: "🗿" },
  { id: "earns_advantage",          label: "Earns Advantage",               pts: 2,  icon: "🃏" },
  { id: "plays_idol_successfully",  label: "Plays Idol Successfully",       pts: 7,  icon: "✨" },
  { id: "shot_in_dark_success",     label: "Plays Shot in the Dark Successfully", pts: 7,  icon: "🎲" },
  { id: "shot_in_dark_wasted",      label: "Wasted Shot in the Dark",       pts: -2, icon: "🎲" },
  { id: "plays_idol_unnecessarily", label: "Plays Idol Unnescessarily",     pts: -3, icon: "💸" },
  { id: "voted_out_with_idol",      label: "Voted Out With Idol",           pts: -5, icon: "💸" },
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
  if (!state) return { castScores: {}, teamScores: {}, eliminated: {} };
  const castScores = {};
  const eliminated = {};
  for (const ev of state.events) {
    if (ev.eventId === "voted_off") eliminated[ev.castId] = true;
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
    return { castScores, teamScores, eliminated };
}

function getEpisodeMVP(state) {
  if (!state || !state.events || state.events.length === 0) return null;
  const maxEpisode = Math.max(...state.events.map(e => e.episode));
  const epEvents = state.events.filter(e => e.episode === maxEpisode);
  const epScores = {};
  for (const ev of epEvents) {
    const def = SCORING_EVENTS.find(s => s.id === ev.eventId);
    if (def && def.pts > 0) epScores[ev.castId] = (epScores[ev.castId] || 0) + def.pts;
  }
  const entries = Object.entries(epScores);
  if (entries.length === 0) return null;
  const [topCastId, topPts] = entries.sort((a, b) => b[1] - a[1])[0];
  const castaway = CAST.find(c => c.id === parseInt(topCastId));
  const drafters = (state.users || [])
    .filter(u => (u.picks || []).includes(parseInt(topCastId)))
    .map(u => u.username);
  return { castaway, pts: topPts, episode: maxEpisode, drafters };
}

function Headshot({ img, size = 44, eliminated = false, tribe }) {
  const tribeColor = TRIBE_COLORS[tribe] || "rgba(245,158,11,.3)";
  const borderColor = eliminated ? "rgba(255,255,255,.15)" : tribeColor;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${borderColor}`, background: "#1e1710", position: "relative", boxShadow: eliminated ? "none" : `0 0 8px ${tribeColor}55` }}>
      <img
        src={`/images/${img}.webp`}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: eliminated ? "grayscale(100%) brightness(0.4)" : "none" }}
        onError={e => { e.target.style.display = "none"; }}
      />
      {eliminated && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35 }}>💀</div>
      )}
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
      item: "REPLICA SNAKE & BALL PUZZLE",
      img: "/images/survivorpuzzle.webp",
      color: "#fbbf24",
      shadow: "rgba(251,191,36,.2)",
      border: "rgba(251,191,36,.4)",
      winner: sorted[0],
    },
    {
      place: "2nd Place",
      medal: "🥈",
      item: "SURVIVOR BUFF OF YOUR CHOICE",
      img: "/images/survivorbuff.png",
      color: "#94a3b8",
      shadow: "rgba(148,163,184,.2)",
      border: "rgba(148,163,184,.4)",
      winner: sorted[1],
    },
    {
      place: "3rd Place",
      medal: "🥉",
      item: "20 LB BAG OF RICE",
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

function ResetRequestPage({ go }) {
  const [uname, setUname] = useState("");
  const [msg,   setMsg]   = useState("");
  const [err,   setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!uname) return setErr("Enter your username.");
    setLoading(true);
    try {
      await api("POST", "/reset-request", { username: uname });
      setMsg("✅ Reset request sent! The admin will set a temporary password for you shortly.");
      setErr("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.ctr}>
      <div style={{ ...S.card, minWidth: 290, maxWidth: 370, width: "100%" }}>
        <div style={{ fontSize: 22, letterSpacing: 5, color: C.al, textAlign: "center", marginBottom: 5 }}>RESET PASSWORD</div>
        <div style={{ fontSize: 13, color: C.mu, textAlign: "center", marginBottom: 22 }}>
          Enter your username and the admin will set a temporary password for you.
        </div>
        {msg ? (
          <div style={{ color: "#4ade80", fontSize: 13, textAlign: "center", marginBottom: 16 }}>{msg}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <input style={S.inp} placeholder="Username" value={uname} onChange={e => setUname(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} disabled={loading} />
            {err && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{err}</div>}
            <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} onClick={submit} disabled={loading}>
              {loading ? "..." : "REQUEST RESET"}
            </button>
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: C.mu }}>
          <button style={S.lnk} onClick={() => go("login")}>← Back to sign in</button>
        </div>
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
        <Nav me={me} page={page} go={setPage} logout={doLogout} isAdmin={isAdmin} draftOpen={state?.draftOpen} />

        {!me && page === "reset" && <ResetRequestPage go={setPage} />}
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

        {me && page === "home"        && <HomePage me={me} state={state} scores={scores} go={setPage} eliminated={scores.eliminated} />}
        {me && page === "draft"       && <DraftPage me={me} state={state} setMe={setMe} fetchState={fetchState} />}
        {me && page === "leaderboard" && <LeaderboardPage me={me} state={state} scores={scores} />}
        {me && page === "scoring"     && <ScoringPage state={state} scores={scores} eliminated={scores.eliminated} />}
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
function Nav({ me, page, go, logout, isAdmin, draftOpen }) {
  const items = me ? [
    { id: "home", label: "Home" },
    ...(draftOpen ? [{ id: "draft", label: "My Team" }] : []),
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
{!isReg && (
  <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: C.mu }}>
    <button style={S.lnk} onClick={() => { setErr(""); go("reset"); }}>
      Forgot password?
    </button>
  </div>
)}
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
function HomePage({ me, state, scores, go, eliminated }) {
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
                const draftCount = (state?.users || []).filter(u => (u.picks || []).includes(cid)).length;
                return (
                  <div key={`${cid}-${Math.random()}`} style={{ background: eliminated?.[cid] ? "rgba(255,255,255,.03)" : "rgba(245,158,11,.05)", border: `1px solid ${eliminated?.[cid] ? "rgba(255,255,255,.1)" : C.bd}`, borderRadius: 4, padding: "10px 12px", opacity: eliminated?.[cid] ? 0.5 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
<Headshot img={c?.img} size={44} eliminated={!!eliminated?.[cid]} tribe={c?.tribe} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c?.name}</div>
                        <div style={{ fontSize: 11, color: C.mu }}>{c?.seasons}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 16, color: C.al, fontWeight: 700 }}>{p >= 0 ? `+${p}` : p} pts</div>
                      <div style={{ fontSize: 11, color: C.mu }}>{draftCount} drafted</div>
                    </div>
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
<Headshot img={c.img} size={88} tribe={c.tribe} />
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
                    {user?.playingForMoney && <span style={{ fontSize: 10, marginLeft: 8, background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.4)", color: "#4ade80", borderRadius: 3, padding: "1px 6px", letterSpacing: 1 }}>💰 MONEY</span>}
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

// ── PERFORMANCE CHART ──────────────────────────────────────────────────────
function PerformanceChart({ state, eliminated }) {
  const [view, setView] = useState("chart");
  const TOTAL_EPS = 13;
  const W = 900, H = 420;
  const ML = 45, MR = 115, MT = 15, MB = 35;
  const chartW = W - ML - MR;
  const chartH = H - MT - MB;

  const CHART_COLORS = [
    "#ff6b6b","#ffa94d","#ffd43b","#a9e34b","#69db7c","#38d9a9",
    "#4dabf7","#748ffc","#da77f2","#f783ac","#ff8c00","#ffe066",
    "#63e6be","#a5d8ff","#bac8ff","#eebefa","#fcc2d7","#c0eb75",
    "#ffec99","#b2f2bb","#ff99a0","#fa5252","#99ccff","#d0bfff",
  ];

  const epPts = {};
  for (const ev of (state?.events || [])) {
    const def = SCORING_EVENTS.find(s => s.id === ev.eventId);
    if (!def) continue;
    if (!epPts[ev.castId]) epPts[ev.castId] = {};
    epPts[ev.castId][ev.episode] = (epPts[ev.castId][ev.episode] || 0) + def.pts;
  }

  const allEps = (state?.events || []).map(e => e.episode);
  const maxEp = allEps.length > 0 ? Math.max(...allEps) : 0;

  const elimEps = {};
  for (const ev of (state?.events || [])) {
    if (ev.eventId === "voted_off") elimEps[ev.castId] = ev.episode;
  }

  const series = CAST.map((c, i) => {
    const color = CHART_COLORS[i % CHART_COLORS.length];
    const elimEp = elimEps[c.id];
    const isElim = !!eliminated?.[c.id];
    let cumulative = 0;
    const pts = [];
    for (let ep = 1; ep <= TOTAL_EPS; ep++) {
      if (ep > maxEp || (elimEp && ep > elimEp)) {
        pts.push(null);
      } else {
        cumulative += (epPts[c.id]?.[ep] || 0);
        pts.push(cumulative);
      }
    }
    let lastEp = 0, lastVal = 0;
    for (let ep = TOTAL_EPS; ep >= 1; ep--) {
      if (pts[ep - 1] !== null) { lastEp = ep; lastVal = pts[ep - 1]; break; }
    }
    return { cast: c, pts, color, isElim, lastEp, lastVal };
  });

  const allVals = series.flatMap(s => s.pts.filter(p => p !== null));
  const minY = Math.min(0, ...(allVals.length ? allVals : [0]));
  const maxY = Math.max(5, ...(allVals.length ? allVals : [5]));

  const xScale = ep => ML + ((ep - 1) / (TOTAL_EPS - 1)) * chartW;
  const yScale = val => MT + chartH - ((val - minY) / (maxY - minY)) * chartH;

  // Deconflict overlapping headshots — spread them horizontally when too close
  const adjustedPos = (() => {
    const R = 13;
    const MIN_DIST = R * 2 + 1;
    const byLastEp = {};
    series.filter(s => s.lastEp > 0).forEach(s => {
      if (!byLastEp[s.lastEp]) byLastEp[s.lastEp] = [];
      byLastEp[s.lastEp].push({ id: s.cast.id, x: xScale(s.lastEp), y: yScale(s.lastVal) });
    });
    const result = {};
    Object.entries(byLastEp).forEach(([epStr, group]) => {
      // Iteratively push overlapping items apart in x only
      for (let iter = 0; iter < 100; iter++) {
        let moved = false;
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const dx = group[j].x - group[i].x;
            const dy = group[j].y - group[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MIN_DIST) {
              const push = (MIN_DIST - dist) / 2 + 0.1;
              if (group[i].x <= group[j].x) {
                group[i].x -= push;
                group[j].x += push;
              } else {
                group[i].x += push;
                group[j].x -= push;
              }
              moved = true;
            }
          }
        }
        if (!moved) break;
      }
      group.forEach(p => {
        result[p.id] = { hx: p.x, hy: p.y };
      });
    });
    return result;
  })();

  // Per-episode points for the table view
  const tableRows = [...CAST].map(c => {
    let total = 0;
    const eps = Array.from({ length: TOTAL_EPS }, (_, i) => {
      const ep = i + 1;
      const pts = epPts[c.id]?.[ep] ?? null;
      if (pts !== null) total += pts;
      return pts;
    });
    return { cast: c, eps, total, isElim: !!eliminated?.[c.id] };
  }).sort((a, b) => b.total - a.total);

  return (
    <div style={{ ...S.card, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11, paddingBottom: 7, borderBottom: `1px solid ${C.bd}` }}>
        <span style={{ fontSize: 11, letterSpacing: 3, color: C.am, textTransform: "uppercase" }}>📈 CASTAWAY PERFORMANCE</span>
        <div style={{ display: "flex", gap: 5 }}>
          {[["chart", "Chart"], ["table", "Table"]].map(([id, label]) => (
            <button key={id} style={{ ...S.nb, fontSize: 11, padding: "3px 10px", ...(view === id ? S.nba : {}) }} onClick={() => setView(id)}>{label}</button>
          ))}
        </div>
      </div>

      {maxEp === 0 ? (
        <div style={{ textAlign: "center", color: C.mu, fontStyle: "italic", padding: "24px 0" }}>
          No events logged yet. The chart will populate after the first episode.
        </div>
      ) : view === "table" ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 10px", color: C.mu, fontSize: 10, letterSpacing: 2, fontWeight: 400, borderBottom: `1px solid ${C.bd}`, whiteSpace: "nowrap" }}>CASTAWAY</th>
                {Array.from({ length: TOTAL_EPS }, (_, i) => (
                  <th key={i + 1} style={{ textAlign: "center", padding: "6px 4px", color: i + 1 <= maxEp ? C.mu : "rgba(138,115,85,.3)", fontSize: 10, letterSpacing: 1, fontWeight: 400, borderBottom: `1px solid ${C.bd}`, minWidth: 36 }}>EP {i + 1}</th>
                ))}
                <th style={{ textAlign: "center", padding: "6px 10px", color: C.am, fontSize: 10, letterSpacing: 2, fontWeight: 700, borderBottom: `1px solid ${C.bd}`, whiteSpace: "nowrap" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={row.cast.id} style={{ opacity: row.isElim ? 0.45 : 1, background: ri % 2 === 0 ? "rgba(255,255,255,.01)" : "transparent" }}>
                  <td style={{ padding: "6px 10px", color: row.isElim ? C.mu : C.tx, fontWeight: 600, borderBottom: `1px solid rgba(245,158,11,.06)`, whiteSpace: "nowrap" }}>
                    {row.isElim && <span style={{ marginRight: 5, fontSize: 10 }}>💀</span>}{row.cast.name}
                  </td>
                  {row.eps.map((pts, epIdx) => {
                    const ep = epIdx + 1;
                    const isFuture = ep > maxEp;
                    const isPostElim = elimEps[row.cast.id] && ep > elimEps[row.cast.id];
                    const display = isFuture || isPostElim ? "—" : pts === null || pts === 0 ? "" : pts > 0 ? `+${pts}` : pts;
                    const color = pts > 0 ? "#4ade80" : pts < 0 ? "#f87171" : C.mu;
                    return (
                      <td key={ep} style={{ textAlign: "center", padding: "6px 4px", color: isFuture || isPostElim ? "rgba(138,115,85,.25)" : color, borderBottom: `1px solid rgba(245,158,11,.06)`, fontWeight: pts && !isFuture && !isPostElim ? 700 : 400 }}>
                        {display}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "center", padding: "6px 10px", color: row.total > 0 ? C.al : row.total < 0 ? "#f87171" : C.mu, fontWeight: 700, borderBottom: `1px solid rgba(245,158,11,.06)` }}>
                    {row.total > 0 ? `+${row.total}` : row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 560, display: "block" }}>
            <defs>
              {series.map(s => (
                <clipPath key={s.cast.id} id={`hc-${s.cast.id}`}>
                  <circle cx="0" cy="0" r="11" />
                </clipPath>
              ))}
            </defs>

            {/* Y grid + labels */}
            {Array.from({ length: 6 }, (_, i) => {
              const t = i / 5;
              const val = Math.round(minY + (maxY - minY) * t);
              const y = MT + chartH * (1 - t);
              return (
                <g key={i}>
                  <line x1={ML} y1={y} x2={ML + chartW} y2={y} stroke="rgba(245,158,11,.08)" strokeWidth={1} />
                  <text x={ML - 6} y={y + 4} textAnchor="end" fill="#8a7355" fontSize={10}>{val}</text>
                </g>
              );
            })}

            {/* X axis ticks + labels */}
            {Array.from({ length: TOTAL_EPS }, (_, i) => {
              const ep = i + 1;
              const x = xScale(ep);
              return (
                <g key={ep}>
                  <line x1={x} y1={MT} x2={x} y2={MT + chartH} stroke="rgba(245,158,11,.05)" strokeWidth={1} />
                  <text x={x} y={H - MB + 16} textAnchor="middle" fill={ep <= maxEp ? "#8a7355" : "rgba(138,115,85,.35)"} fontSize={10}>{ep}</text>
                </g>
              );
            })}

            {/* Axis borders */}
            <line x1={ML} y1={MT} x2={ML} y2={MT + chartH} stroke="rgba(245,158,11,.2)" strokeWidth={1} />
            <line x1={ML} y1={MT + chartH} x2={ML + chartW} y2={MT + chartH} stroke="rgba(245,158,11,.2)" strokeWidth={1} />

            {/* Axis label */}
            <text x={ML + chartW / 2} y={H - 2} textAnchor="middle" fill="#8a7355" fontSize={9} letterSpacing={2}>EPISODE</text>

            {/* Lines — draw eliminated under active */}
            {[...series].sort((a, b) => (b.isElim ? -1 : 1) - (a.isElim ? -1 : 1)).map(s => {
              const points = [];
              for (let ep = 1; ep <= TOTAL_EPS; ep++) {
                if (s.pts[ep - 1] !== null) points.push([xScale(ep), yScale(s.pts[ep - 1])]);
              }
              if (points.length === 0) return null;
              const lineColor = s.isElim ? "rgba(255,255,255,.18)" : s.color;
              const adj = adjustedPos[s.cast.id];
              const hx = adj?.hx ?? null;
              const hy = adj?.hy ?? null;
              return (
                <g key={s.cast.id}>
                  <polyline
                    points={points.map(([x, y]) => `${x},${y}`).join(" ")}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth={s.isElim ? 1 : 1.8}
                  />
                  {hx !== null && (
                    <g transform={`translate(${hx},${hy})`}>
                      <circle r={12} fill={s.isElim ? "rgba(40,40,40,.9)" : lineColor} />
                      <image
                        href={`/images/${s.cast.img}.webp`}
                        x={-11} y={-11} width={22} height={22}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#hc-${s.cast.id})`}
                        style={{ filter: s.isElim ? "grayscale(100%) brightness(0.4)" : "none" }}
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

// ── SCORING PAGE ─────────────────────────────────────────────────────────
function ScoringPage({ state, scores, eliminated }) {
  const [sel, setSel] = useState(null);
  const sorted = [...CAST].sort((a, b) => (scores.castScores[b.id] || 0) - (scores.castScores[a.id] || 0));
  const evts = sel ? (state?.events || []).filter(e => e.castId === sel) : [];

  return (
    <div style={S.wrap}>
      <div style={S.ph}><div style={S.pt}>CASTAWAY SCORES</div><div style={S.ps}>Click any castaway to see their event history.</div></div>

      {(() => {
        const mvp = getEpisodeMVP(state);
        if (!mvp || !mvp.castaway) return null;
        return (
          <div style={{ ...S.card, marginBottom: 20, borderColor: C.bb, background: "rgba(245,158,11,.08)" }}>
            <div style={S.cT}>⭐ Episode {mvp.episode} MVP</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Headshot img={mvp.castaway.img} size={56} tribe={mvp.castaway.tribe} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{mvp.castaway.name}</div>
                <div style={{ fontSize: 22, color: C.al, fontWeight: 700, marginBottom: 4 }}>+{mvp.pts} pts this episode</div>
                {mvp.drafters.length > 0
                  ? <div style={{ fontSize: 12, color: C.mu }}>Drafted by: {mvp.drafters.join(", ")}</div>
                  : <div style={{ fontSize: 12, color: C.mu }}>Not drafted by anyone</div>
                }
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 9, marginBottom: 20 }}>
        {sorted.map(c => {
          const pts = scores.castScores[c.id] || 0;
          const on = sel === c.id;
          return (
<div key={c.id} onClick={() => setSel(on ? null : c.id)} style={{ ...S.card, cursor: "pointer", padding: "10px 12px", border: on ? `1px solid ${C.am}` : eliminated?.[c.id] ? "1px solid rgba(255,255,255,.1)" : `1px solid ${C.bd}`, background: on ? "rgba(245,158,11,.1)" : eliminated?.[c.id] ? "rgba(255,255,255,.03)" : "linear-gradient(135deg,#161208,#1e1710)", opacity: eliminated?.[c.id] ? 0.5 : 1, transition: "all .15s" }}>  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
<Headshot img={c.img} size={80} eliminated={!!eliminated?.[c.id]} tribe={c.tribe} />
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c.name}</div>
      <div style={{ fontSize: 11, color: C.mu }}>{c.seasons}</div>
    </div>
  </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: pts > 0 ? C.al : pts < 0 ? "#f87171" : C.mu }}>{pts > 0 ? `+${pts}` : pts} pts</div>
      <div style={{ fontSize: 11, color: C.mu }}>{(state?.users || []).filter(u => (u.picks || []).includes(c.id)).length} drafted</div>
    </div>
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

      <PerformanceChart state={state} eliminated={eliminated} />

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

function ResetRequestsPanel({ fetchState, flash }) {
  const [requests, setRequests] = useState([]);
  const [tempPwds, setTempPwds] = useState({});
  const [loading,  setLoading]  = useState(true);

  async function load() {
    try {
      const data = await api("GET", "/admin/reset-requests");
      setRequests(data.requests);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function approve(id) {
    const temp = tempPwds[id];
    if (!temp) return flash("❌ Enter a temporary password first.");
    try {
      await api("POST", `/admin/reset-requests/${id}/approve`, { tempPassword: temp });
      flash(`✅ Password reset! Temp password: ${temp}`);
      load();
    } catch (e) { flash("❌ " + e.message); }
  }

  async function deny(id) {
    try {
      await api("POST", `/admin/reset-requests/${id}/deny`);
      flash("🗑 Request denied.");
      load();
    } catch (e) { flash("❌ " + e.message); }
  }

  if (loading) return <div style={{ color: C.mu, fontStyle: "italic" }}>Loading…</div>;

  return (
    <div style={S.card}>
      <div style={S.cT}>PENDING PASSWORD RESETS</div>
      {requests.length === 0 && <div style={{ color: C.mu, fontStyle: "italic" }}>No pending requests.</div>}
      {requests.map(r => (
        <div key={r.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.bd}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{r.username}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              style={{ ...S.inp, maxWidth: 180 }}
              placeholder="Set temp password…"
              value={tempPwds[r.id] || ""}
              onChange={e => setTempPwds(prev => ({ ...prev, [r.id]: e.target.value }))}
            />
            <button style={{ ...S.btn, padding: "7px 14px", fontSize: 11 }} onClick={() => approve(r.id)}>
              APPROVE
            </button>
            <button style={{ background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)", color: "#f87171", cursor: "pointer", borderRadius: 2, padding: "7px 14px", fontSize: 11 }} onClick={() => deny(r.id)}>
              DENY
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ADMIN PAGE ─────────────────────────────────────────────────────────────
function AdminPage({ state, fetchState, me }) {
  const [tab,       setTab]       = useState("log");
  const [logMode,   setLogMode]   = useState("individual"); // "individual" | "tribe"
  const [castSel,   setCastSel]   = useState(null);
  const [tribeSel,  setTribeSel]  = useState(null);
  const [evtSel,    setEvtSel]    = useState(null);
  const [episode,   setEpisode]   = useState(1);
  const [note,      setNote]      = useState("");
  const [q,         setQ]         = useState("");
  const [toast,     setToast]     = useState("");
  const [busy,      setBusy]      = useState(false);

  // Compute eliminated from events so we can filter tribe members
  const eliminated = {};
  for (const ev of (state?.events || [])) {
    if (ev.eventId === "voted_off") eliminated[ev.castId] = true;
  }

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

  async function logTribeEvent() {
    if (!tribeSel || !evtSel) return;
    const members = CAST.filter(c => c.tribe === tribeSel && !eliminated[c.id]);
    if (members.length === 0) return;
    setBusy(true);
    try {
      for (const c of members) {
        await api("POST", "/admin/events", { castId: c.id, eventId: evtSel, episode, note });
      }
      await fetchState();
      flash(`✅ Event logged for ${members.length} castaways!`);
      setNote("");
    } catch (e) { flash("❌ " + e.message); }
    finally { setBusy(false); }
  }

  async function toggleMoney(username, value) {
  try {
    await api("POST", "/admin/playing-for-money", { username, value });
    await fetchState();
    flash(`💰 ${username} ${value ? "marked" : "unmarked"} as playing for money.`);
  } catch (e) { flash("❌ " + e.message); }
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
{[["log", "Log Events"], ["draft", "Draft Control"], ["history", "Event History"], ["unique", "Uniqueness"], ["resets", "Password Resets"]].map(([id, label]) => (
          <button key={id} style={{ ...S.nb, ...(tab === id ? S.nba : {}) }} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {/* LOG EVENTS */}
      {tab === "log" && (
        <div>
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["individual", "👤 Individual"], ["tribe", "🏝 Tribe"]].map(([id, label]) => (
              <button key={id} style={{ ...S.nb, ...(logMode === id ? S.nba : {}) }} onClick={() => { setLogMode(id); setCastSel(null); setTribeSel(null); }}>{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>

            {/* Individual mode — castaway picker */}
            {logMode === "individual" && (
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
            )}

            {/* Tribe mode — tribe picker */}
            {logMode === "tribe" && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={S.lbl}>SELECT TRIBE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  {Object.entries(TRIBE_COLORS).map(([tribeId, color]) => {
                    const activeMembers = CAST.filter(c => c.tribe === tribeId && !eliminated[c.id]);
                    const sel = tribeSel === tribeId;
                    return (
                      <div key={tribeId} onClick={() => setTribeSel(tribeId)} style={{ border: `1px solid ${sel ? color : "rgba(255,255,255,.1)"}`, borderRadius: 4, padding: "10px 14px", cursor: "pointer", background: sel ? `${color}18` : "rgba(255,255,255,.02)", transition: "all .15s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: sel ? 8 : 0 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: sel ? color : C.tx, textTransform: "uppercase", letterSpacing: 2 }}>{tribeId}</span>
                          <span style={{ fontSize: 12, color: C.mu }}>{activeMembers.length} active</span>
                        </div>
                        {sel && (
                          <div style={{ fontSize: 12, color: C.mu, lineHeight: 1.7 }}>
                            {activeMembers.map(c => c.name).join(" · ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Event type picker — shared */}
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

          {/* Episode / note / submit */}
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
              {logMode === "individual" ? (
                <button style={{ ...S.btn, opacity: castSel && evtSel && !busy ? 1 : 0.35 }} onClick={logEvent} disabled={!castSel || !evtSel || busy}>
                  {busy ? "SAVING…" : "LOG EVENT"}
                </button>
              ) : (
                <button style={{ ...S.btn, opacity: tribeSel && evtSel && !busy ? 1 : 0.35 }} onClick={logTribeEvent} disabled={!tribeSel || !evtSel || busy}>
                  {busy ? "SAVING…" : "LOG FOR TRIBE"}
                </button>
              )}
            </div>

            {/* Preview */}
            {logMode === "individual" && castSel && evtSel && (
              <div style={{ marginTop: 11, fontSize: 13, color: C.tx, paddingTop: 11, borderTop: `1px solid ${C.bd}` }}>
                Will log: <strong style={{ color: C.al }}>{castObj?.name}</strong> — {evtObj?.icon} {evtObj?.label}{" "}
                (<span style={{ color: (evtObj?.pts || 0) >= 0 ? "#4ade80" : "#f87171" }}>{(evtObj?.pts || 0) > 0 ? `+${evtObj.pts}` : evtObj?.pts} pts</span>) · Episode {episode}
              </div>
            )}
            {logMode === "tribe" && tribeSel && evtSel && (() => {
              const members = CAST.filter(c => c.tribe === tribeSel && !eliminated[c.id]);
              return (
                <div style={{ marginTop: 11, fontSize: 13, color: C.tx, paddingTop: 11, borderTop: `1px solid ${C.bd}` }}>
                  Will log <strong style={{ color: C.al }}>{evtObj?.icon} {evtObj?.label}</strong>{" "}
                  (<span style={{ color: (evtObj?.pts || 0) >= 0 ? "#4ade80" : "#f87171" }}>{(evtObj?.pts || 0) > 0 ? `+${evtObj.pts}` : evtObj?.pts} pts</span>) for{" "}
                  <strong style={{ color: TRIBE_COLORS[tribeSel] }}>{members.length} {tribeSel} castaways</strong> · Episode {episode}
                </div>
              );
            })()}
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
{(state?.users || []).map(u => (
  <div key={u.username} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.bd}`, fontSize:14 }}>
    <span>{u.username}</span>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
<span style={{ color:(u.picks?.length||0) === 8 ? "#4ade80" : C.mu }}>
        {u.picks?.length||0}/8 {(u.picks?.length||0) === 8 ? "✓" : ""}
      </span>
      <button
        style={{ background: u.playingForMoney ? "rgba(74,222,128,.2)" : "rgba(255,255,255,.05)", border: `1px solid ${u.playingForMoney ? "rgba(74,222,128,.5)" : "rgba(255,255,255,.15)"}`, color: u.playingForMoney ? "#4ade80" : C.mu, cursor: "pointer", borderRadius: 2, padding: "2px 8px", fontSize: 11 }}
        onClick={() => toggleMoney(u.username, !u.playingForMoney)}
      >
        💰
      </button>
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

      {/* UNIQUENESS RANKING */}
      {tab === "unique" && (
        <div style={S.card}>
          <div style={S.cT}>MOST UNIQUE TEAMS</div>
          <div style={{ fontSize: 13, color: C.mu, marginBottom: 16 }}>
            Each castaway's "draft count" is summed across a player's 8 picks. Lower score = more unique team.
          </div>
          {(() => {
            const users = (state?.users || []).filter(u => u.username !== me?.username && (u.picks || []).length === 8);
            if (users.length === 0) return <div style={{ color: C.mu, fontStyle: "italic" }}>No completed teams yet.</div>;

            const ranked = users.map(u => {
              const uniquenessScore = (u.picks || []).reduce((sum, cid) => {
                const count = (state?.users || []).filter(x => (x.picks || []).includes(cid)).length;
                return sum + count;
              }, 0);
              return { username: u.username, picks: u.picks, uniquenessScore };
            }).sort((a, b) => a.uniquenessScore - b.uniquenessScore);

            const medals = ["🥇", "🥈", "🥉"];

            return ranked.map((u, i) => (
              <div key={u.username} style={{ padding: "12px 0", borderBottom: `1px solid ${C.bd}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18, minWidth: 28 }}>{medals[i] || `${i + 1}.`}</span>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{u.username}</span>
                  </div>
                  <span style={{ fontSize: 13, color: C.mu }}>uniqueness score: <strong style={{ color: C.al }}>{u.uniquenessScore}</strong></span>
                </div>
                <div style={{ paddingLeft: 38, display: "flex", flexDirection: "column", gap: 3 }}>
                  {(u.picks || []).map(cid => {
                    const c = CAST.find(x => x.id === cid);
                    const count = (state?.users || []).filter(x => (x.picks || []).includes(cid)).length;
                    return (
                      <div key={cid} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.mu }}>
                        <span>{c?.name}</span>
                        <span style={{ color: count <= 2 ? "#4ade80" : count >= 6 ? "#f87171" : C.mu }}>
                          drafted by {count} {count === 1 ? "team" : "teams"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
)}

      {/* PASSWORD RESETS */}
      {tab === "resets" && (
        <ResetRequestsPanel fetchState={fetchState} flash={flash} />
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
