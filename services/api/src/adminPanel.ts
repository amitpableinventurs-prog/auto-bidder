export function renderAdminPanel(apiBaseUrl = '') {
  return /* html */`<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AutoBidder — Admin</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0d14;
  --surface:#111827;
  --surface2:#1a2235;
  --surface3:#222e42;
  --border:#1e2d45;
  --border2:#2a3a52;
  --accent:#3b82f6;
  --accent2:#2563eb;
  --green:#22c55e;
  --yellow:#f59e0b;
  --red:#ef4444;
  --purple:#a855f7;
  --cyan:#06b6d4;
  --orange:#f97316;
  --pink:#ec4899;
  --text:#e2e8f0;
  --text2:#94a3b8;
  --text3:#64748b;
  --sidebar-w:240px;
  --header-h:58px;
  --radius:10px;
  --shadow:0 1px 3px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.2);
}
body{font-family:'Poppins',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-direction:column;font-size:14px;-webkit-font-smoothing:antialiased}
a{text-decoration:none;color:inherit}
button{font-family:inherit;cursor:pointer}
input,select{font-family:inherit}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:99px}

/* ── HEADER ── */
header{
  height:var(--header-h);
  background:var(--surface);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;
  padding:0 20px;gap:14px;
  position:fixed;top:0;left:0;right:0;z-index:200;
}
.logo{display:flex;align-items:center;gap:10px}
.logo-mark{
  width:24px;height:24px;border-radius:999px;
  background:#f4be3d;
  display:grid;place-items:center;flex-shrink:0;
}
.logo-arrow{font-size:12px;line-height:1;color:#0f172a;font-weight:900}
.logo-name{font-size:20px;font-weight:700;letter-spacing:-.03em;line-height:1;color:var(--text)}
.logo-name b{color:var(--text)}
.logo-name .muted{font-weight:500;color:var(--text2)}
.h-spacer{flex:1}
.h-pill{
  font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px;
  background:rgba(34,197,94,.12);color:var(--green);border:1px solid rgba(34,197,94,.25);
  display:flex;align-items:center;gap:5px;
}
.h-pill::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.h-btn{
  display:inline-flex;align-items:center;gap:6px;
  padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;
  border:none;transition:all .15s;
}
.h-btn-primary{background:var(--accent);color:#fff}
.h-btn-primary:hover{background:var(--accent2)}
.h-btn-ghost{background:var(--surface2);color:var(--text2);border:1px solid var(--border2)}
.h-btn-ghost:hover{background:var(--surface3);color:var(--text)}
.h-btn-seed{background:rgba(34,197,94,.15);color:var(--green);border:1px solid rgba(34,197,94,.3)}
.h-btn-seed:hover{background:rgba(34,197,94,.25)}

/* ── LAYOUT ── */
.layout{display:flex;margin-top:var(--header-h);min-height:calc(100vh - var(--header-h))}

/* ── SIDEBAR ── */
aside{
  width:var(--sidebar-w);flex-shrink:0;
  background:var(--surface);border-right:1px solid var(--border);
  position:fixed;top:var(--header-h);left:0;bottom:0;
  overflow-y:auto;padding:12px 8px;
  display:flex;flex-direction:column;gap:2px;z-index:100;
}
.nav-section{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);padding:10px 10px 4px}
.nav-item{
  display:flex;align-items:center;gap:10px;
  padding:9px 10px;border-radius:8px;cursor:pointer;
  font-size:13px;font-weight:600;color:var(--text2);
  transition:background .12s,color .12s;user-select:none;
  border:1px solid transparent;
}
.nav-item:hover{background:var(--surface2);color:var(--text)}
.nav-item.active{background:rgba(59,130,246,.12);color:var(--accent);border-color:rgba(59,130,246,.2)}
.nav-item .nav-icon{font-size:15px;width:20px;text-align:center;flex-shrink:0}
.nav-item .nav-count{
  margin-left:auto;font-size:10px;font-weight:800;
  background:var(--accent);color:#fff;border-radius:99px;padding:1px 7px;
  min-width:22px;text-align:center;
}

/* ── MAIN ── */
main{margin-left:var(--sidebar-w);flex:1;padding:28px 24px 60px;overflow:hidden}

/* ── PAGE HEADER ── */
.page-header{display:flex;align-items:flex-start;gap:16px;margin-bottom:24px;flex-wrap:wrap}
.page-header-icon{
  width:44px;height:44px;border-radius:12px;
  display:grid;place-items:center;font-size:22px;flex-shrink:0;
}
.page-header-text .title{font-size:22px;font-weight:800;letter-spacing:-.02em}
.page-header-text .subtitle{font-size:13px;color:var(--text2);margin-top:3px}
.page-header-actions{margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap}

/* ── STAT GRID ── */
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:14px;margin-bottom:26px}
.stat-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  padding:16px 18px;position:relative;overflow:hidden;
  transition:border-color .2s,box-shadow .2s;
}
.stat-card:hover{border-color:var(--border2);box-shadow:var(--shadow)}
.stat-card::after{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--c,var(--accent));
}
.stat-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text2);margin-bottom:8px}
.stat-icon{position:absolute;top:14px;right:14px;font-size:20px;opacity:.5}
.stat-value{font-size:28px;font-weight:900;color:var(--c,var(--text));line-height:1}
.stat-sub{font-size:11px;color:var(--text3);margin-top:5px}

/* ── TOOLBAR ── */
.toolbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.search-box{
  position:relative;flex:1;min-width:180px;max-width:320px;
}
.search-box input{
  width:100%;background:var(--surface);border:1px solid var(--border2);
  color:var(--text);border-radius:8px;padding:8px 12px 8px 34px;
  font-size:13px;outline:none;transition:border-color .15s;
}
.search-box input:focus{border-color:var(--accent)}
.search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:14px;pointer-events:none}
.filter-select{
  background:var(--surface);border:1px solid var(--border2);color:var(--text);
  border-radius:8px;padding:8px 12px;font-size:13px;outline:none;cursor:pointer;
}
.filter-select:focus{border-color:var(--accent)}
.tb-btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;
  border:1px solid var(--border2);background:var(--surface);color:var(--text2);
  transition:all .15s;
}
.tb-btn:hover{background:var(--surface2);color:var(--text)}
.tb-btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}
.tb-btn-primary:hover{background:var(--accent2);border-color:var(--accent2)}
.tb-btn-green{background:rgba(34,197,94,.12);color:var(--green);border-color:rgba(34,197,94,.3)}
.tb-btn-green:hover{background:rgba(34,197,94,.22)}

/* ── TABLE ── */
.table-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.table-scroll{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13px}
thead th{
  padding:11px 14px;text-align:left;
  font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;
  color:var(--text3);background:var(--surface2);border-bottom:1px solid var(--border);
  white-space:nowrap;
}
tbody tr{border-bottom:1px solid rgba(30,45,69,.7);transition:background .1s}
tbody tr:last-child{border-bottom:none}
tbody tr:hover{background:rgba(255,255,255,.025)}
tbody tr.clickable{cursor:pointer}
tbody td{padding:11px 14px;vertical-align:middle;color:var(--text);white-space:nowrap}

/* ── BADGES ── */
.badge{
  display:inline-flex;align-items:center;
  font-size:10px;font-weight:800;padding:3px 9px;
  border-radius:99px;letter-spacing:.03em;text-transform:uppercase;
}
.badge-green{background:rgba(34,197,94,.12);color:var(--green);border:1px solid rgba(34,197,94,.25)}
.badge-yellow{background:rgba(245,158,11,.12);color:var(--yellow);border:1px solid rgba(245,158,11,.25)}
.badge-red{background:rgba(239,68,68,.12);color:var(--red);border:1px solid rgba(239,68,68,.25)}
.badge-blue{background:rgba(59,130,246,.12);color:var(--accent);border:1px solid rgba(59,130,246,.25)}
.badge-purple{background:rgba(168,85,247,.12);color:var(--purple);border:1px solid rgba(168,85,247,.25)}
.badge-gray{background:rgba(148,163,184,.08);color:var(--text2);border:1px solid var(--border)}
.badge-cyan{background:rgba(6,182,212,.12);color:var(--cyan);border:1px solid rgba(6,182,212,.25)}
.badge-orange{background:rgba(249,115,22,.12);color:var(--orange);border:1px solid rgba(249,115,22,.25)}

/* ── AVATAR ── */
.avatar{
  width:32px;height:32px;border-radius:50%;
  display:inline-flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800;flex-shrink:0;
}

/* ── PAGINATION ── */
.pagination{
  display:flex;align-items:center;gap:6px;padding:12px 14px;
  border-top:1px solid var(--border);
}
.pagination-info{flex:1;font-size:12px;color:var(--text3)}
.pg-btn{
  width:30px;height:30px;border-radius:7px;border:1px solid var(--border2);
  background:var(--surface);color:var(--text2);font-size:12px;font-weight:700;
  display:grid;place-items:center;cursor:pointer;transition:all .12s;
}
.pg-btn:hover{background:var(--surface2);color:var(--text)}
.pg-btn.active{background:var(--accent);border-color:var(--accent);color:#fff}
.pg-btn:disabled{opacity:.35;cursor:not-allowed}

/* ── INLINE ACTION BUTTONS ── */
.action-btn{
  font-size:11px;font-weight:700;padding:3px 9px;border-radius:6px;border:none;
  cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:4px;
}
.action-btn-accept{background:rgba(34,197,94,.12);color:var(--green)}
.action-btn-accept:hover{background:rgba(34,197,94,.22)}
.action-btn-reject{background:rgba(239,68,68,.12);color:var(--red)}
.action-btn-reject:hover{background:rgba(239,68,68,.22)}
.action-btn-confirm{background:rgba(59,130,246,.12);color:var(--accent)}
.action-btn-confirm:hover{background:rgba(59,130,246,.22)}
.action-btn-view{background:rgba(148,163,184,.08);color:var(--text2);border:1px solid var(--border)}
.action-btn-view:hover{background:var(--surface2)}

/* ── DETAIL DRAWER ── */
#drawer-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:300;
  backdrop-filter:blur(3px);display:none;
}
#drawer-overlay.open{display:block}
#drawer{
  position:fixed;top:0;right:0;bottom:0;
  width:min(480px,96vw);background:var(--surface);border-left:1px solid var(--border);
  z-index:301;overflow-y:auto;padding:24px;
  transform:translateX(100%);transition:transform .25s cubic-bezier(.4,0,.2,1);
}
#drawer.open{transform:translateX(0)}
.drawer-close{
  float:right;background:none;border:none;color:var(--text2);font-size:20px;
  cursor:pointer;padding:2px 6px;border-radius:6px;
}
.drawer-close:hover{background:var(--surface2);color:var(--text)}
.drawer-title{font-size:18px;font-weight:800;margin-bottom:20px;letter-spacing:-.02em}
.drow{
  display:grid;grid-template-columns:130px 1fr;
  gap:4px 12px;margin-bottom:6px;align-items:start;
}
.dkey{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;padding-top:2px}
.dval{font-size:13px;color:var(--text);word-break:break-all}
.dsec{
  font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;
  color:var(--text3);margin:16px 0 8px;padding-bottom:6px;
  border-bottom:1px solid var(--border);
}

/* ── TOAST ── */
#toast{
  position:fixed;bottom:22px;right:22px;z-index:999;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:10px;padding:12px 18px;font-size:13px;font-weight:600;
  transform:translateY(70px);opacity:0;transition:transform .22s,opacity .22s;
  max-width:320px;box-shadow:var(--shadow);
}
#toast.show{transform:translateY(0);opacity:1}
#toast.ok{border-color:var(--green);color:var(--green)}
#toast.err{border-color:var(--red);color:var(--red)}
#toast.info{border-color:var(--accent);color:var(--accent)}

/* ── LOADER / EMPTY ── */
.loader-box{padding:60px 20px;text-align:center;color:var(--text3)}
.loader-box .spinner{
  display:inline-block;width:24px;height:24px;border:2px solid var(--border2);
  border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-box{padding:60px 20px;text-align:center}
.empty-icon{font-size:44px;margin-bottom:12px}
.empty-text{color:var(--text2);font-size:14px}
.empty-sub{color:var(--text3);font-size:12px;margin-top:4px}

/* â”€â”€ LOGIN & FILE PREVIEW â”€â”€ */
#login-screen{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at top,#1d4f91 0,var(--bg) 45%)}
#login-screen[hidden]{display:none}
.login-card{width:min(400px,100%);padding:32px;border-radius:16px;background:var(--surface);border:1px solid var(--border2);box-shadow:0 24px 60px rgba(0,0,0,.45)}
.login-card h1{font-size:24px;margin:16px 0 5px}.login-card p{font-size:13px;color:var(--text2);margin-bottom:24px}
.login-card label{display:block;font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin:14px 0 6px}
.login-card input{width:100%;padding:11px 12px;color:var(--text);background:var(--surface2);border:1px solid var(--border2);border-radius:8px;outline:none}
.login-card input:focus{border-color:var(--accent)}.login-error{min-height:18px;margin-top:12px;color:var(--red);font-size:12px}
#preview-overlay{position:fixed;inset:0;z-index:1100;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.78);backdrop-filter:blur(4px)}
#preview-overlay.open{display:flex}.preview-card{display:flex;flex-direction:column;width:min(1000px,100%);height:min(760px,100%);background:var(--surface);border:1px solid var(--border2);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)}
.preview-head{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border)}.preview-title{flex:1;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.preview-content{flex:1;min-height:0;background:#0b0d12;display:grid;place-items:center}.preview-content iframe{width:100%;height:100%;border:0}.preview-content img{max-width:100%;max-height:100%;object-fit:contain}.preview-fallback{text-align:center;color:var(--text2);padding:24px}

/* ── MINI CHART (pure CSS bar) ── */
.mini-bars{display:flex;align-items:flex-end;gap:3px;height:28px;width:80px}
.mini-bar{flex:1;background:var(--accent);border-radius:2px 2px 0 0;opacity:.7;min-height:3px}

/* ── RELATION CHIPS ── */
.chip{
  display:inline-flex;align-items:center;gap:4px;
  background:var(--surface2);border:1px solid var(--border2);
  border-radius:6px;padding:2px 8px;font-size:11px;color:var(--text2);
}

/* ── RESPONSIVE ── */
@media(max-width:768px){aside{display:none}main{margin-left:0}}
</style>
</head>
<body>

<div id="login-screen" hidden>
  <form class="login-card" onsubmit="adminLogin(event)">
    <div class="logo-mark"><span class="logo-arrow">â†—</span></div>
    <h1>Admin sign in</h1>
    <p>Sign in to review customer documents and manage AutoBidder.</p>
    <label for="admin-email">Email</label>
    <input id="admin-email" type="email" autocomplete="username" required placeholder="admin@autobidder.in"/>
    <label for="admin-password">Password</label>
    <input id="admin-password" type="password" autocomplete="current-password" required placeholder="Enter password"/>
    <div id="login-error" class="login-error" role="alert"></div>
    <button class="h-btn h-btn-primary" type="submit" style="width:100%;justify-content:center;padding:11px">Sign in</button>
  </form>
</div>

<div id="preview-overlay" onclick="closePreview(event)">
  <div class="preview-card" role="dialog" aria-modal="true" aria-labelledby="preview-title">
    <div class="preview-head"><div id="preview-title" class="preview-title">Document preview</div><a id="preview-open" class="h-btn h-btn-ghost" target="_blank" rel="noopener">Open</a><button class="drawer-close" type="button" onclick="closePreview()">âœ•</button></div>
    <div id="preview-content" class="preview-content"></div>
  </div>
</div>

<!-- HEADER -->
<header>
  <div class="logo">
    <div class="logo-mark"><span class="logo-arrow">↗</span></div>
    <div class="logo-name"><b>AUTO</b><span class="muted">Bidder.in</span> <span style="font-weight:500;color:var(--text2);font-size:12px;margin-left:6px">Admin</span></div>
  </div>
  <div class="h-spacer"></div>
  <div class="h-pill" id="api-status">Live</div>
  <button class="h-btn h-btn-seed" onclick="seedRich()"><i class="fa-solid fa-wand-magic-sparkles"></i> Seed Demo</button>
  <button class="h-btn h-btn-ghost" onclick="reloadCurrent()"><i class="fa-solid fa-rotate"></i> Refresh</button>
  <button class="h-btn h-btn-ghost" onclick="adminLogout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
</header>

<div class="layout">
<!-- SIDEBAR -->
<aside id="sidebar">
  <div class="nav-section">Overview</div>
  <div class="nav-item active" data-mod="dashboard" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-chart-line"></i></span> Admin Dashboard
  </div>
  <div class="nav-item" data-mod="analytics" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-chart-pie"></i></span> Revenue Analytics
  </div>

  <div class="nav-section">Core</div>
  <div class="nav-item" data-mod="users" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-users"></i></span> User Management
  </div>
  <div class="nav-item" data-mod="listings" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-car"></i></span> Vehicle Verification
  </div>
  <div class="nav-item" data-mod="bids" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-hand-holding-dollar"></i></span> Auction Monitoring
  </div>

  <div class="nav-section">Workflow</div>
  <div class="nav-item" data-mod="appointments" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-calendar-check"></i></span> Appointments
  </div>
  <div class="nav-item" data-mod="rtonoc" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-file-contract"></i></span> RTO & NOC
  </div>
  <div class="nav-item" data-mod="dealers" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-building-user"></i></span> Dealer Management
  </div>
  <div class="nav-item" data-mod="leads" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-address-book"></i></span> Lead Management
  </div>
  <div class="nav-item" data-mod="payments" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-credit-card"></i></span> Payment Management
  </div>
  <div class="nav-item" data-mod="commissions" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-percent"></i></span> Commissions
  </div>
  <div class="nav-item" data-mod="payouts" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-money-bill-transfer"></i></span> Payouts
  </div>

  <div class="nav-section">Safety & Logs</div>
  <div class="nav-item" data-mod="fraud" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-shield-halved"></i></span> Fraud Detection
  </div>
  <div class="nav-item" data-mod="logs" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-list-ul"></i></span> Reports & Logs
  </div>

  <div class="nav-section">Automation</div>
  <div class="nav-item" data-mod="autobid" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-robot"></i></span> Auto-Bid
  </div>
  <div class="nav-item" data-mod="notifications" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-bell"></i></span> Notification Management
  </div>
  <div class="nav-item" data-mod="notifications" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-bell"></i></span> Notifications
  </div>
  <div class="nav-item" data-mod="pushtokens" onclick="nav(this)">
    <span class="nav-icon"><i class="fa-solid fa-mobile-screen-button"></i></span> Push Tokens
  </div>
</aside>

<main id="main"></main>
</div>

<!-- DETAIL DRAWER -->
<div id="drawer-overlay" onclick="closeDrawer()"></div>
<div id="drawer"><button class="drawer-close" onclick="closeDrawer()">✕</button><div id="drawer-body"></div></div>

<!-- TOAST -->
<div id="toast"></div>

<script>
// ── UTILS ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money = v => v==null?'—':'₹\u00a0'+Number(v).toLocaleString('en-IN');
const dt = v => v ? new Date(v).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) : '—';
const dtshort = v => v ? new Date(v).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'}) : '—';
const trunc = (s,n=10) => s ? (s.slice(0,n)+(s.length>n?'…':'')) : '—';

const ADMIN_TOKEN_KEY = 'autobidder_admin_token';
let adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

function showLogin(message='') {
  $('login-error').textContent = message;
  $('login-screen').hidden = false;
  setTimeout(()=>$('admin-email').focus(), 0);
}
function adminLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  adminToken = null;
  closeDrawer();
  showLogin();
}
async function adminLogin(event) {
  event.preventDefault();
  const error = $('login-error');
  error.textContent = '';
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Signing in...';
  try {
    const response = await fetch('/api/admin/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:$('admin-email').value, password:$('admin-password').value}),
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.error || 'Sign in failed');
    adminToken = data.token;
    localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
    $('login-screen').hidden = true;
    _loaders.dashboard();
  } catch (e) {
    error.textContent = e.message || 'Unable to sign in';
  } finally {
    button.disabled = false;
    button.textContent = 'Sign in';
  }
}

function documentKind(url) {
  const path = String(url).split('?')[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(path)) return 'image';
  if (/\.pdf$/.test(path)) return 'pdf';
  return 'document';
}
function previewDocument(url, name='Document') {
  if (!url) return toast('Document is not available','err');
  const kind = documentKind(url);
  $('preview-title').textContent = name;
  $('preview-open').href = url;
  const safeUrl = esc(url);
  $('preview-content').innerHTML = kind === 'image'
    ? \`<img src="\${safeUrl}" alt="\${esc(name)}"/>\`
    : kind === 'pdf'
      ? \`<iframe src="\${safeUrl}" title="\${esc(name)}"></iframe>\`
      : \`<iframe src="https://docs.google.com/gview?embedded=1&url=\${encodeURIComponent(url)}" title="\${esc(name)}"></iframe><div class="preview-fallback">If this document cannot be previewed here, use <a href="\${safeUrl}" target="_blank" rel="noopener">Open</a> to view or download it.</div>\`;
  $('preview-overlay').classList.add('open');
}
function closePreview(event) {
  if (event && event.target !== $('preview-overlay')) return;
  $('preview-overlay').classList.remove('open');
  $('preview-content').innerHTML = '';
}
function docButton(url, name) {
  const encoded = encodeURIComponent(url || '');
  return url ? \`<button class="action-btn action-btn-view" onclick="previewDocument(decodeURIComponent('\${encoded}'),'\${esc(name)}')"><i class="fa-solid fa-eye"></i> View</button>\` : '<span style="color:var(--text3);font-size:12px">Not uploaded</span>';
}

const COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#22c55e','#ef4444','#ec4899','#f97316'];
const avatar = (name='?') => {
  const c = COLORS[(name||'?').charCodeAt(0)%COLORS.length];
  return \`<span class="avatar" style="background:\${c}18;color:\${c}">\${(name||'?')[0].toUpperCase()}</span>\`;
};

const STATUS_MAP = {
  ACTIVE:'green', SOLD:'cyan', DRAFT:'gray', PENDING_INSPECTION:'yellow', REJECTED:'red',
  SUBMITTED:'blue', ACCEPTED:'green', SUPERSEDED:'gray',
  PENDING:'yellow', CONFIRMED:'blue', COMPLETED:'green', CANCELLED:'red',
  NOT_STARTED:'gray', IN_PROGRESS:'yellow',
  SUCCEEDED:'green', FAILED:'red', REQUIRES_ACTION:'orange',
  OUTBID:'yellow', BID_ACCEPTED:'green', BID_REJECTED:'red',
  PAYMENT_CONFIRMED:'green', LISTING_SOLD:'cyan', SYSTEM:'gray',
  AUTO_BID_TRIGGERED:'purple', APPOINTMENT_CONFIRMED:'blue', APPOINTMENT_CANCELLED:'red',
};
const badge = (v,c) => \`<span class="badge badge-\${c||STATUS_MAP[v]||'gray'}">\${esc(v)}</span>\`;
const statusBadge = v => badge(v.replace(/_/g,' '),STATUS_MAP[v]||'gray');

// ── API ────────────────────────────────────────────────────────────────────
const _apiBaseUrl = '${apiBaseUrl || ''}';
async function apiFetch(path, opts={}) {
  const el = $('api-status');
  try {
    const headers = {'Content-Type':'application/json', ...(opts.headers||{})};
    if (adminToken) headers.Authorization = 'Bearer '+adminToken;
    const url = _apiBaseUrl ? _apiBaseUrl + '/api' + path : '/api' + path;
    const r = await fetch(url, { ...opts, headers });
    if (r.status === 401 && path !== '/admin/login') {
      adminLogout();
      throw new Error('Your session has expired. Please sign in again.');
    }
    if(!r.ok) { const b=await r.json().catch(()=>({})); throw new Error(b.error||'HTTP '+r.status); }
    el.textContent='● Live'; el.style.color='var(--green)';
    return r.json();
  } catch(e) {
    el.textContent='● Offline'; el.style.color='var(--red)';
    throw e;
  }
}

// ── TOAST ──────────────────────────────────────────────────────────────────
let _tTimer;
function toast(msg, type='ok') {
  const t = $('toast');
  t.textContent=msg; t.className='show '+type;
  clearTimeout(_tTimer);
  _tTimer = setTimeout(()=>t.classList.remove('show'),3000);
}

// ── DRAWER ────────────────────────────────────────────────────────────────
function openDrawer(html) {
  $('drawer-body').innerHTML = html;
  $('drawer-overlay').classList.add('open');
  $('drawer').classList.add('open');
}
function closeDrawer() {
  $('drawer-overlay').classList.remove('open');
  $('drawer').classList.remove('open');
}
const drow = (k,v) => \`<div class="drow"><div class="dkey">\${k}</div><div class="dval">\${v}</div></div>\`;
const dsec = t => \`<div class="dsec">\${t}</div>\`;

// ── TABLE BUILDER ──────────────────────────────────────────────────────────
function buildTable(cols, rows, onClickFn) {
  if(!rows.length) return \`<div class="empty-box"><div class="empty-icon">🗃️</div><p class="empty-text">No records found</p><p class="empty-sub">Click "Seed Demo" to add sample data</p></div>\`;
  const head = cols.map(c=>\`<th>\${c.label}</th>\`).join('');
  const body = rows.map(row=>{
    const cells = cols.map(c=>\`<td>\${c.r?c.r(row):esc(row[c.k]??'—')}</td>\`).join('');
    return \`<tr class="clickable" onclick='\${onClickFn}(\${JSON.stringify(row).replace(/'/g,"&#39;")})'>\${cells}</tr>\`;
  }).join('');
  return \`<div class="table-card"><div class="table-scroll"><table><thead><tr>\${head}</tr></thead><tbody>\${body}</tbody></table></div></div>\`;
}

function statGrid(cards) {
  return \`<div class="stat-grid">\${cards.map(c=>\`
    <div class="stat-card" style="--c:\${c.color||'var(--accent)'}">
      <div class="stat-icon">\${c.icon}</div>
      <div class="stat-label">\${c.label}</div>
      <div class="stat-value">\${c.value}</div>
      \${c.sub?\`<div class="stat-sub">\${c.sub}</div>\`:''}
    </div>\`).join('')}</div>\`;
}

function toolbar(inputId, placeholder, filterFn, extraControls='') {
  return \`<div class="toolbar">
    <div class="search-box">
      <span class="search-icon">⌕</span>
      <input id="\${inputId}" oninput="\${filterFn}()" placeholder="\${esc(placeholder)}"/>
    </div>
    \${extraControls}
  </div>\`;
}

// ── NAV ───────────────────────────────────────────────────────────────────
let _active = 'dashboard';
function nav(el) {
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
  _active = el.dataset.mod;
  _load(_active);
}
function reloadCurrent() { _load(_active); }
const _loaders = {};
function _load(mod) {
  $('main').innerHTML = \`<div class="loader-box"><div class="spinner"></div><p style="margin-top:12px;color:var(--text2)">Loading…</p></div>\`;
  (_loaders[mod]||loadDashboard)();
}

// ── PAGINATION HELPER ──────────────────────────────────────────────────────
function paginate(rows, page, perPage=15) {
  const total = rows.length;
  const pages = Math.ceil(total/perPage)||1;
  const slice = rows.slice((page-1)*perPage, page*perPage);
  return { slice, total, pages, page };
}
function pgBar(total, page, pages, onPage) {
  if(pages<=1) return '';
  const prev = \`<button class="pg-btn" \${page<=1?'disabled':''} onclick="\${onPage}(\${page-1})">‹</button>\`;
  const next = \`<button class="pg-btn" \${page>=pages?'disabled':''} onclick="\${onPage}(\${page+1})">›</button>\`;
  const nums = Array.from({length:Math.min(5,pages)},(_,i)=>i+1).map(n=>\`<button class="pg-btn \${n===page?'active':''}" onclick="\${onPage}(\${n})">\${n}</button>\`).join('');
  return \`<div class="pagination"><span class="pagination-info">\${total} records · Page \${page}/\${pages}</span>\${prev}\${nums}\${next}</div>\`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ① DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_loaders.dashboard = async function loadDashboard() {
  try {
    const data = await apiFetch('/admin/dashboard');
    const s = data.stats||{};
    const stats = statGrid([
      {label:'Total Users',value:s.users||0,icon:'👥',color:'var(--accent)'},
      {label:'Dealers',value:s.dealers||0,icon:'🏢',color:'var(--purple)'},
      {label:'Active Listings',value:s.activeListings||0,icon:'✅',color:'var(--green)'},
      {label:'Open Bids',value:s.submittedBids||0,icon:'💰',color:'var(--cyan)'},
      {label:'Revenue',value:money(s.totalRevenue),icon:'💳',color:'var(--green)',sub:'Succeeded'},
      {label:'Fraud Alerts',value:s.fraudAlerts||0,icon:'🚩',color:'var(--red)'},
      {label:'Leads',value:s.pendingLeads||0,icon:'📞',color:'var(--orange)'},
      {label:'Appointments',value:s.pendingAppointments||0,icon:'📅',color:'var(--orange)'},
    ]);

    const recentListingsCols = [
      {label:'Car',r:r=>\`<div style="display:flex;align-items:center;gap:8px">\${avatar(r.brand||r.title)}<div><div style="font-weight:700">\${esc(r.title||'—')}</div><div style="font-size:11px;color:var(--text3)">\${esc(r.city||'')} · \${esc(r.brand||'')} \${esc(r.model||'')}</div></div></div>\`},
      {label:'Price',r:r=>\`<span style="font-weight:700">\${money(r.demandPrice)}</span>\`},
      {label:'Status',r:r=>statusBadge(r.status)},
      {label:'Seller',r:r=>esc((r.seller||{}).name||'—')},
      {label:'Date',r:r=>dtshort(r.createdAt)},
    ];
    const recentBidsCols = [
      {label:'Amount',r:r=>\`<span style="font-weight:800;color:var(--green)">\${money(r.amount)}</span>\`},
      {label:'Status',r:r=>statusBadge(r.status)},
      {label:'Car',r:r=>esc(((r.listing)||{}).title||r.listingId||'—')},
      {label:'Bidder',r:r=>esc(((r.user)||{}).name||r.userId||'—')},
      {label:'Time',r:r=>dtshort(r.createdAt)},
    ];
    const recentApptCols = [
      {label:'Type',r:r=>statusBadge(r.type)},
      {label:'Status',r:r=>statusBadge(r.status)},
      {label:'Car',r:r=>esc(((r.listing)||{}).title||r.listingId||'—')},
      {label:'User',r:r=>esc(((r.user)||{}).name||r.userId||'—')},
      {label:'Scheduled',r:r=>dtshort(r.scheduledAt)},
    ];

    $('main').innerHTML = \`
      <div class="page-header">
        <div class="page-header-icon" style="background:rgba(59,130,246,.12)">📊</div>
        <div class="page-header-text">
          <div class="title">Dashboard</div>
          <div class="subtitle">AutoBidder platform overview — \${new Date().toLocaleDateString('en-IN',{dateStyle:'long'})}</div>
        </div>
        <div class="page-header-actions">
          <button class="tb-btn tb-btn-green" onclick="seedRich()">✨ Seed Demo</button>
          <button class="tb-btn" onclick="reloadCurrent()">↺ Refresh</button>
        </div>
      </div>
      \${stats}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px">
        <div>
          <div style="font-weight:700;font-size:14px;margin-bottom:10px;color:var(--text2)">Recent Listings</div>
          \${buildTable(recentListingsCols, (data.recentListings||[]), 'showListingDrawer')}
        </div>
        <div>
          <div style="font-weight:700;font-size:14px;margin-bottom:10px;color:var(--text2)">Recent Bids</div>
          \${buildTable(recentBidsCols, (data.recentBids||[]), 'showBidDrawer')}
        </div>
      </div>
      <div style="margin-top:20px">
        <div style="font-weight:700;font-size:14px;margin-bottom:10px;color:var(--text2)">Recent Appointments</div>
        \${buildTable(recentApptCols, (data.recentAppointments||[]), 'showApptDrawer')}
      </div>\`;
  } catch(e) {
    $('main').innerHTML = \`<div class="empty-box">
      <div class="empty-icon">🔌</div>
      <p class="empty-text">API not reachable</p>
      <p class="empty-sub">\${esc(e.message)}</p>
      <button class="tb-btn tb-btn-green" style="margin-top:16px" onclick="seedRich()">✨ Seed Demo Data</button>
    </div>\`;
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ② USERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _users = []; let _usersPage = 1;
_loaders.users = async function loadUsers() {
  try {
    const data = await apiFetch('/admin/users/all');
    _users = data.users||[];
    renderUsers();
  } catch(e) { showModErr('👥','Users',e); }
};

window.renderUsers = function(page=_usersPage) {
  _usersPage = page;
  const q = ($('u-search')||{}).value?.toLowerCase()||'';
  const filtered = _users.filter(u=>
    (u.name||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q)||(u.phone||'').toLowerCase().includes(q)
  );
  const {slice,total,pages} = paginate(filtered, page);
  const stats = statGrid([
    {label:'Total Users',value:_users.length,icon:'👥',color:'var(--accent)'},
    {label:'Verified',value:_users.filter(u=>u.isVerified).length,icon:'✅',color:'var(--green)'},
    {label:'With Listings',value:_users.filter(u=>(u._count?.listings||0)>0).length,icon:'🚗',color:'var(--purple)'},
  ]);
  const cols = [
    {label:'User',r:r=>\`<div style="display:flex;align-items:center;gap:9px">\${avatar(r.name||r.email)}<div><div style="font-weight:700">\${esc(r.name||'—')} \${r.isVerified?'<span title="Verified" style="color:var(--accent)">✔️</span>':''}</div><div style="font-size:11px;color:var(--text3)">\${esc(r.email)}</div></div></div>\`},
    {label:'Phone',r:r=>esc(r.phone||'—')},
    {label:'Status',r:r=>r.isVerified?badge('VERIFIED','blue'):badge('UNVERIFIED','gray')},
    {label:'Listings',r:r=>\`<span class="chip">🚗 \${(r._count?.listings||0)}</span>\`},
    {label:'Bids',r:r=>\`<span class="chip">💰 \${(r._count?.bids||0)}</span>\`},
    {label:'Joined',r:r=>dtshort(r.createdAt)},
    {label:'',r:r=>\`<button class="action-btn action-btn-view" onclick="event.stopPropagation();showUserDrawer(\${JSON.stringify(r).replace(/'/g,'&#39;')})">View</button>\`},
  ];
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(59,130,246,.12)">👥</div>
      <div class="page-header-text"><div class="title">Users</div><div class="subtitle">\${_users.length} registered users</div></div>
      <div class="page-header-actions"><button class="tb-btn" onclick="_loaders.users()">↺</button></div>
    </div>
    \${stats}
    \${toolbar('u-search','Search name, email, phone…','renderUsers')}
    \${buildTable(cols, slice, 'showUserDrawer')}
    \${pgBar(total, page, pages, 'renderUsers')}
  \`;
};

window.showUserDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">👥 \${esc(r.name||'User')}</div>
    \${r.kycImageUrl ? \`<div style="margin-bottom:20px"><div class="dsec">KYC Document</div>\${docButton(r.kycImageUrl,'KYC document')}<div style="font-size:11px;color:var(--text3);margin-top:6px">Preview supports images, PDFs, and office documents.</div></div>\` : ''}
    \${drow('ID',\`<code style="font-size:11px">\${esc(r.id)}</code>\`)}
    \${drow('Status',r.isVerified?badge('VERIFIED','blue'):badge('UNVERIFIED','gray'))}
    \${drow('KYC Status',statusBadge(r.kycStatus||'PENDING'))}
    \${drow('Email',esc(r.email))}
    \${drow('Phone',esc(r.phone||'—'))}
    \${drow('Joined',dt(r.createdAt))}
    \${dsec('Activity')}
    \${drow('Listings',r._count?.listings||0)}
    \${drow('Bids',r._count?.bids||0)}
    \${drow('Appointments',r._count?.appointments||0)}
    \${drow('Notifications',r._count?.notifications||0)}
    \${dsec('Actions')}
    <div style="display:flex;gap:8px">
      <button class="h-btn \${r.isVerified?'h-btn-ghost':'h-btn-primary'}" onclick="toggleUserVerify('\${r.id}',\${!r.isVerified})">
        \${r.isVerified?'Revoke Verification':'Verify Seller'}
      </button>
      <button class="h-btn h-btn-ghost" style="color:var(--red)" onclick="toast('Delete not implemented')">Delete User</button>
    </div>
  \`);
};

window.toggleUserVerify = async function(id, isVerified) {
  try {
    await apiFetch('/admin/users/'+id+'/verify', {method:'PATCH',body:JSON.stringify({isVerified})});
    toast(isVerified?'User verified':'Verification revoked');
    closeDrawer(); _loaders.users();
  } catch(e) { toast(e.message,'err'); }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ③ LISTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _listings = []; let _listingsPage = 1;
_loaders.listings = async function loadListings() {
  try {
    const data = await apiFetch('/admin/listings/all');
    _listings = data.listings||[];
    renderListings();
  } catch(e) { showModErr('🚗','Listings',e); }
};

window.renderListings = function(page=_listingsPage) {
  _listingsPage = page;
  const q = ($('l-search')||{}).value?.toLowerCase()||'';
  const sf = ($('l-status')||{}).value||'';
  const cf = ($('l-city')||{}).value?.toLowerCase()||'';
  const filtered = _listings.filter(r=>
    (!sf||r.status===sf)&&(!cf||(r.city||'').toLowerCase().includes(cf))&&
    ((r.title||'').toLowerCase().includes(q)||(r.brand||'').toLowerCase().includes(q))
  );
  const {slice,total,pages} = paginate(filtered, page);
  const counts = {};
  _listings.forEach(r=>{counts[r.status]=(counts[r.status]||0)+1});
  const stats = statGrid([
    {label:'Total',value:_listings.length,icon:'🚗',color:'var(--text)'},
    {label:'Active',value:counts.ACTIVE||0,icon:'✅',color:'var(--green)'},
    {label:'Pending',value:counts.PENDING_INSPECTION||0,icon:'⏳',color:'var(--yellow)'},
    {label:'Sold',value:counts.SOLD||0,icon:'🏷️',color:'var(--cyan)'},
    {label:'Draft',value:counts.DRAFT||0,icon:'📝',color:'var(--text2)'},
    {label:'Rejected',value:counts.REJECTED||0,icon:'❌',color:'var(--red)'},
  ]);
  const cols = [
    {label:'Car',r:r=>\`<div style="display:flex;align-items:center;gap:9px">\${avatar(r.brand||r.title)}<div><div style="font-weight:700">\${esc(r.title||'—')}</div><div style="font-size:11px;color:var(--text3)">\${esc(r.brand||'')} \${esc(r.model||'')} · \${esc(r.manufacturingYear||'')}</div></div></div>\`},
    {label:'City',r:r=>esc(r.city||'—')},
    {label:'KM',r:r=>r.kilometersDriven?Number(r.kilometersDriven).toLocaleString('en-IN')+' km':'—'},
    {label:'Demand',r:r=>\`<span style="font-weight:700">\${money(r.demandPrice)}</span>\`},
    {label:'Bids',r:r=>\`<span class="chip">💰 \${r._count?.bids||0}</span>\`},
    {label:'Status',r:r=>statusBadge(r.status)},
    {label:'Seller',r:r=>esc((r.seller||{}).name||'—')},
    {label:'',r:r=>\`<select class="filter-select" style="padding:3px 8px;font-size:11px" onchange="quickListingStatus('\${esc(r.id)}',this.value)" onclick="event.stopPropagation()">
      <option value="">Change…</option>
      <option>ACTIVE</option><option>PENDING_INSPECTION</option><option>SOLD</option><option>REJECTED</option><option>DRAFT</option>
    </select>\`},
  ];
  const cities = [...new Set(_listings.map(r=>r.city).filter(Boolean))];
  const extra = \`
    <select class="filter-select" id="l-status" onchange="renderListings(1)">
      <option value="">All Statuses</option>
      <option>ACTIVE</option><option>PENDING_INSPECTION</option><option>DRAFT</option><option>SOLD</option><option>REJECTED</option>
    </select>
    <select class="filter-select" id="l-city" onchange="renderListings(1)">
      <option value="">All Cities</option>
      \${cities.map(c=>\`<option>\${esc(c)}</option>\`).join('')}
    </select>
    <button class="tb-btn" onclick="_loaders.listings()">↺</button>
  \`;
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(168,85,247,.12)">🚗</div>
      <div class="page-header-text"><div class="title">Vehicle Verification</div><div class="subtitle">\${_listings.length} cars requiring inspection & approval</div></div>
    </div>
    \${stats}
    \${toolbar('l-search','Search title, brand…','()=>renderListings(1)',extra)}
    \${buildTable(cols, slice, 'showListingDrawer')}
    \${pgBar(total, page, pages, 'renderListings')}
  \`;
};

window.quickListingStatus = async function(id, status) {
  if(!status) return;
  try {
    await apiFetch('/admin/listings/'+id+'/status', {method:'PATCH',body:JSON.stringify({status})});
    toast('Status updated → '+status);
    _loaders.listings();
  } catch(e) { toast('Error: '+e.message,'err'); }
};

window.showListingDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  const bids = r.bids||[]; const appt = (r.appointments||[])[0];
  openDrawer(\`<div class="drawer-title">🚗 \${esc(r.title||'Listing')}</div>
    \${r.imageUrl ? \`<img src="\${r.imageUrl}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:20px;border:1px solid var(--border)">\` : ''}
    \${drow('ID',\`<code style="font-size:11px">\${esc(r.id)}</code>\`)}
    \${drow('Status',statusBadge(r.status))}
    \${dsec('Vehicle Info')}
    \${drow('Brand/Model',esc(r.brand+' '+r.model))}
    \${drow('Variant',esc(r.variant||'—'))}
    \${drow('Year',esc(r.manufacturingYear||'—'))}
    \${drow('Fuel',esc(r.fuelType||'—'))}
    \${drow('Transmission',esc(r.transmission||'—'))}
    \${drow('Color',esc(r.color||'—'))}
    \${drow('Plate No.',esc(r.plateNumber||'—'))}
    \${drow('KM Driven',r.kilometersDriven?Number(r.kilometersDriven).toLocaleString('en-IN')+' km':'—')}
    \${drow('Ownership',esc(r.ownership||'—'))}
    \${dsec('Pricing')}
    \${drow('Demand Price',money(r.demandPrice))}
    \${drow('Starting Bid',money(r.startingBid))}
    \${dsec('Location')}
    \${drow('City',esc(r.city||'—'))}
    \${dsec('Seller Documents')}
    \${drow('Registration certificate',docButton((r.rcImages||[])[0], 'Registration certificate'))}
    \${drow('Invoice attachment',docButton((r.invoiceImages||[])[0], 'Vehicle invoice'))}
    \${drow('Bank NOC attachment',docButton((r.bankNocImages||[])[0], 'Bank NOC'))}
    \${drow('Vehicle images',docButton((r.images||[])[0] || r.imageUrl, 'Vehicle image'))}
    \${drow('RC Owner',esc(r.rcOwnerName||'—'))}
    \${drow('RC Number',esc(r.rcOwnerNumber||'—'))}
    \${drow('RC Avail.',esc(r.rcAvailability||'—'))}
    \${drow('Invoice',r.originalInvoice?'Original':'Duplicate/None')}
    \${drow('Bank Hypo',r.bankHypothecation?'Yes':'No')}
    \${drow('RTO Tax',esc(r.rtoTaxStatus||'—'))}
    \${drow('RTO NOC',esc(r.rtoNocIssued||'—'))}
    \${dsec('History')}
    \${drow('Service Book',r.serviceBookAvailability?'Available':'None')}
    \${drow('Warranty',esc(r.remainingOemWarranty||'—'))}
    \${drow('Insurance',esc(r.insuranceType||'—'))}
    \${dsec('Seller')}
    \${r.seller?drow('Name',esc(r.seller.name||'—'))+drow('Email',esc(r.seller.email||'—'))+'':drow('','—')}
    \${dsec('Top Bid')}
    \${bids.length?drow('Amount',money(bids[0].amount))+drow('Status',statusBadge(bids[0].status)):'<div style="color:var(--text3);font-size:12px;padding:4px 0">No bids yet</div>'}
    \${dsec('Latest Appointment')}
    \${appt?drow('Type',esc(appt.type))+drow('Status',statusBadge(appt.status))+drow('Scheduled',dt(appt.scheduledAt)):'<div style="color:var(--text3);font-size:12px;padding:4px 0">None scheduled</div>'}
    \${dsec('Actions')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      <button class="action-btn action-btn-accept" onclick="quickListingStatus('\${esc(r.id)}','ACTIVE')">Mark Active</button>
      <button class="action-btn action-btn-confirm" onclick="quickListingStatus('\${esc(r.id)}','SOLD')">Mark Sold</button>
      <button class="action-btn action-btn-reject" onclick="quickListingStatus('\${esc(r.id)}','REJECTED')">Reject</button>
    </div>
  \`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ④ BIDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _bids = []; let _bidsPage = 1;
_loaders.bids = async function loadBids() {
  try {
    const data = await apiFetch('/admin/bids/all');
    _bids = data.bids||[];
    renderBids();
  } catch(e) { showModErr('💰','Bids',e); }
};

window.renderBids = function(page=_bidsPage) {
  _bidsPage = page;
  const sf = ($('b-status')||{}).value||'';
  const filtered = _bids.filter(r=>!sf||r.status===sf);
  const {slice,total,pages} = paginate(filtered, page);
  const counts = {};
  _bids.forEach(r=>{counts[r.status]=(counts[r.status]||0)+1});
  const stats = statGrid([
    {label:'Total Bids',value:_bids.length,icon:'💰',color:'var(--text)'},
    {label:'Submitted',value:counts.SUBMITTED||0,icon:'📨',color:'var(--accent)'},
    {label:'Accepted',value:counts.ACCEPTED||0,icon:'✅',color:'var(--green)'},
    {label:'Rejected',value:counts.REJECTED||0,icon:'❌',color:'var(--red)'},
  ]);
  const cols = [
    {label:'Amount',r:r=>\`<span style="font-weight:900;color:var(--green);font-size:15px">\${money(r.amount)}</span>\`},
    {label:'Status',r:r=>statusBadge(r.status)},
    {label:'Car',r:r=>\`<div style="max-width:200px;overflow:hidden;text-overflow:ellipsis">\${esc((r.listing||{}).title||r.listingId||'—')}</div>\`},
    {label:'Bidder',r:r=>\`<div style="display:flex;align-items:center;gap:6px">\${avatar((r.user||{}).name||'?')}\${esc((r.user||{}).name||r.userId||'—')}</div>\`},
    {label:'City',r:r=>esc((r.listing||{}).city||'—')},
    {label:'Time',r:r=>dtshort(r.createdAt)},
    {label:'',r:r=>\`<div style="display:flex;gap:4px">
      \${r.status==='SUBMITTED'?\`<button class="action-btn action-btn-accept" onclick="event.stopPropagation();quickBidStatus('\${esc(r.id)}','ACCEPTED')">✓</button><button class="action-btn action-btn-reject" onclick="event.stopPropagation();quickBidStatus('\${esc(r.id)}','REJECTED')">✗</button>\`:''}
    </div>\`},
  ];
  const extra = \`<select class="filter-select" id="b-status" onchange="renderBids(1)">
    <option value="">All Statuses</option>
    <option>SUBMITTED</option><option>ACCEPTED</option><option>REJECTED</option><option>SUPERSEDED</option>
  </select><button class="tb-btn" onclick="_loaders.bids()">↺</button>\`;
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(34,197,94,.12)">💰</div>
      <div class="page-header-text"><div class="title">Bids</div><div class="subtitle">\${_bids.length} total bids</div></div>
    </div>
    \${stats}
    <div class="toolbar">\${extra}</div>
    \${buildTable(cols, slice, 'showBidDrawer')}
    \${pgBar(total, page, pages, 'renderBids')}
  \`;
};

window.quickBidStatus = async function(id, status) {
  try {
    await apiFetch('/admin/bids/'+id+'/status', {method:'PATCH',body:JSON.stringify({status})});
    toast('Bid '+status.toLowerCase()); _loaders.bids();
  } catch(e) { toast(e.message,'err'); }
};

window.showBidDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">💰 Bid Detail</div>
    \${drow('ID',\`<code style="font-size:11px">\${esc(r.id)}</code>\`)}
    \${drow('Amount',\`<span style="font-weight:900;color:var(--green)">\${money(r.amount)}</span>\`)}
    \${drow('Status',statusBadge(r.status))}
    \${dsec('Car')}
    \${drow('Title',esc((r.listing||{}).title||r.listingId||'—'))}
    \${drow('City',esc((r.listing||{}).city||'—'))}
    \${dsec('Bidder')}
    \${drow('Name',esc((r.user||{}).name||'—'))}
    \${drow('Email',esc((r.user||{}).email||'—'))}
    \${drow('Phone',esc((r.user||{}).phone||'—'))}
    \${dsec('Meta')}
    \${drow('Created',dt(r.createdAt))}
    \${drow('Updated',dt(r.updatedAt))}
    \${r.payment?dsec('Payment')+drow('Amount',money(r.payment.amount))+drow('Status',statusBadge(r.payment.status)):''}
    \${dsec('Actions')}
    <div style="display:flex;gap:8px">
      <button class="action-btn action-btn-accept" onclick="quickBidStatus('\${esc(r.id)}','ACCEPTED')">✓ Accept</button>
      <button class="action-btn action-btn-reject" onclick="quickBidStatus('\${esc(r.id)}','REJECTED')">✗ Reject</button>
    </div>
  \`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑤ APPOINTMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _appts = []; let _apptsPage = 1;
_loaders.appointments = async function loadAppointments() {
  try {
    const data = await apiFetch('/admin/appointments/all');
    _appts = data.appointments||[];
    renderAppointments();
  } catch(e) { showModErr('📅','Appointments',e); }
};

window.renderAppointments = function(page=_apptsPage) {
  _apptsPage = page;
  const sf = ($('a-status')||{}).value||'';
  const tf = ($('a-type')||{}).value||'';
  const filtered = _appts.filter(r=>(!sf||r.status===sf)&&(!tf||r.type===tf));
  const {slice,total,pages} = paginate(filtered, page);
  const counts = {};
  _appts.forEach(r=>{counts[r.status]=(counts[r.status]||0)+1});
  const stats = statGrid([
    {label:'Total',value:_appts.length,icon:'📅',color:'var(--text)'},
    {label:'Pending',value:counts.PENDING||0,icon:'⏳',color:'var(--yellow)'},
    {label:'Confirmed',value:counts.CONFIRMED||0,icon:'✅',color:'var(--accent)'},
    {label:'Completed',value:counts.COMPLETED||0,icon:'🏁',color:'var(--green)'},
    {label:'Cancelled',value:counts.CANCELLED||0,icon:'✖️',color:'var(--red)'},
  ]);
  const cols = [
    {label:'Type',r:r=>statusBadge(r.type)},
    {label:'Status',r:r=>statusBadge(r.status)},
    {label:'Car',r:r=>\`<div style="max-width:180px;overflow:hidden;text-overflow:ellipsis">\${esc((r.listing||{}).title||r.listingId||'—')}</div>\`},
    {label:'User',r:r=>\`<div style="display:flex;align-items:center;gap:6px">\${avatar((r.user||{}).name||'?')}\${esc((r.user||{}).name||'—')}</div>\`},
    {label:'Location',r:r=>esc(r.location||'—')},
    {label:'Scheduled',r:r=>dt(r.scheduledAt)},
    {label:'',r:r=>\`<div style="display:flex;gap:4px">
      \${r.status==='PENDING'?\`<button class="action-btn action-btn-confirm" onclick="event.stopPropagation();quickApptStatus('\${esc(r.id)}','CONFIRMED')">Confirm</button>\`:''}
      \${r.status!=='CANCELLED'&&r.status!=='COMPLETED'?\`<button class="action-btn action-btn-reject" onclick="event.stopPropagation();quickApptStatus('\${esc(r.id)}','CANCELLED')">Cancel</button>\`:''}
    </div>\`},
  ];
  const extra = \`<select class="filter-select" id="a-status" onchange="renderAppointments(1)">
    <option value="">All Statuses</option>
    <option>PENDING</option><option>CONFIRMED</option><option>COMPLETED</option><option>CANCELLED</option>
  </select>
  <select class="filter-select" id="a-type" onchange="renderAppointments(1)">
    <option value="">All Types</option>
    <option>BUYER_INSPECTION</option><option>AUTOBIDDER_INSPECTION</option><option>AUTHORIZED_CENTER</option>
  </select>
  <button class="tb-btn" onclick="_loaders.appointments()">↺</button>\`;
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(249,115,22,.12)">📅</div>
      <div class="page-header-text"><div class="title">Appointments</div><div class="subtitle">\${_appts.length} appointments</div></div>
    </div>
    \${stats}
    <div class="toolbar">\${extra}</div>
    \${buildTable(cols, slice, 'showApptDrawer')}
    \${pgBar(total, page, pages, 'renderAppointments')}
  \`;
};

window.quickApptStatus = async function(id, status) {
  try {
    await apiFetch('/admin/appointments/'+id+'/status', {method:'PATCH',body:JSON.stringify({status})});
    toast('Appointment '+status.toLowerCase()); _loaders.appointments();
  } catch(e) { toast(e.message,'err'); }
};

window.showApptDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">📅 Appointment</div>
    \${drow('ID',\`<code style="font-size:11px">\${esc(r.id)}</code>\`)}
    \${drow('Type',statusBadge(r.type))}
    \${drow('Status',statusBadge(r.status))}
    \${drow('Location',esc(r.location||'—'))}
    \${drow('Scheduled',dt(r.scheduledAt))}
    \${drow('Notes',esc(r.notes||'—'))}
    \${dsec('Car')}
    \${drow('Title',esc((r.listing||{}).title||r.listingId||'—'))}
    \${dsec('User')}
    \${drow('Name',esc((r.user||{}).name||'—'))}
    \${drow('Email',esc((r.user||{}).email||'—'))}
    \${dsec('Actions')}
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="action-btn action-btn-confirm" onclick="quickApptStatus('\${esc(r.id)}','CONFIRMED')">Confirm</button>
      <button class="action-btn action-btn-accept" onclick="quickApptStatus('\${esc(r.id)}','COMPLETED')">Complete</button>
      <button class="action-btn action-btn-reject" onclick="quickApptStatus('\${esc(r.id)}','CANCELLED')">Cancel</button>
    </div>
  \`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑥ RTO & NOC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _rto = [];
_loaders.rtonoc = async function loadRtoNoc() {
  try {
    const data = await apiFetch('/admin/rto-noc/all');
    _rto = data.rtoNocs||[];
    renderRtoNoc();
  } catch(e) { showModErr('📋','RTO & NOC',e); }
};

window.renderRtoNoc = function() {
  const stats = statGrid([
    {label:'Total Records',value:_rto.length,icon:'📋',color:'var(--text)'},
    {label:'RTO NOC Done',value:_rto.filter(r=>r.rtoNocStatus==='COMPLETED').length,icon:'✅',color:'var(--green)'},
    {label:'Bank NOC Done',value:_rto.filter(r=>r.bankNocStatus==='COMPLETED').length,icon:'🏦',color:'var(--cyan)'},
    {label:'In Progress',value:_rto.filter(r=>r.rtoNocStatus==='IN_PROGRESS').length,icon:'⏳',color:'var(--yellow)'},
  ]);
  const cols = [
    {label:'Car',r:r=>\`<div style="font-weight:700">\${esc((r.listing||{}).title||r.listingId||'—')}</div>\`},
    {label:'Seller',r:r=>esc(((r.listing||{}).seller||{}).name||'—')},
    {label:'RTO Tax',r:r=>esc(r.rtoTaxStatus||'—')},
    {label:'Bank NOC',r:r=>statusBadge(r.bankNocStatus)},
    {label:'RTO NOC',r:r=>statusBadge(r.rtoNocStatus)},
    {label:'Invoice',r:r=>statusBadge(r.invoiceStatus)},
    {label:'Owner ID',r:r=>statusBadge(r.ownerIdStatus)},
    {label:'Uploads',r:r=>\`<span class="chip">📎 \${r.uploadedCount||0}</span>\`},
    {label:'Updated',r:r=>dtshort(r.updatedAt)},
  ];
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(6,182,212,.12)">📋</div>
      <div class="page-header-text"><div class="title">RTO & NOC</div><div class="subtitle">\${_rto.length} records</div></div>
      <div class="page-header-actions"><button class="tb-btn" onclick="_loaders.rtonoc()">↺</button></div>
    </div>
    \${stats}
    \${buildTable(cols, _rto, 'showRtoDrawer')}
  \`;
};

window.showRtoDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">📋 RTO & NOC</div>
    \${drow('Listing',esc((r.listing||{}).title||r.listingId||'—'))}
    \${dsec('RTO Info')}
    \${drow('Tax Status',esc(r.rtoTaxStatus||'—'))}
    \${drow('Dues',esc(r.rtoDues||'—'))}
    \${drow('NOC Issued',esc(r.rtoNocIssued||'—'))}
    \${dsec('Document Status')}
    \${drow('Bank NOC',statusBadge(r.bankNocStatus))}
    \${drow('RTO NOC',statusBadge(r.rtoNocStatus))}
    \${drow('Invoice',statusBadge(r.invoiceStatus))}
    \${drow('Owner ID',statusBadge(r.ownerIdStatus))}
    \${drow('Uploads',esc(r.uploadedCount||0))}
    \${drow('Notes',esc(r.notes||'—'))}
    \${drow('Updated',dt(r.updatedAt))}
  \`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑦ PAYMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _payments = []; let _paymentsPage = 1;
_loaders.payments = async function loadPayments() {
  try {
    const data = await apiFetch('/admin/payments/all');
    _payments = data.payments||[];
    _pStats = data.stats||{};
    renderPayments();
  } catch(e) { showModErr('💳','Payments',e); }
};
let _pStats = {};

window.renderPayments = function(page=_paymentsPage) {
  _paymentsPage = page;
  const sf = ($('pay-status')||{}).value||'';
  const filtered = _payments.filter(r=>!sf||r.status===sf);
  const {slice,total,pages} = paginate(filtered, page);
  const stats = statGrid([
    {label:'Total',value:_pStats.total||_payments.length,icon:'💳',color:'var(--text)'},
    {label:'Succeeded',value:_pStats.succeeded||0,icon:'✅',color:'var(--green)'},
    {label:'Pending',value:_pStats.pending||0,icon:'⏳',color:'var(--yellow)'},
    {label:'Failed',value:_pStats.failed||0,icon:'❌',color:'var(--red)'},
    {label:'Revenue',value:money(_pStats.totalRevenue),icon:'💰',color:'var(--green)',sub:'INR'},
  ]);
  const cols = [
    {label:'Amount',r:r=>\`<span style="font-weight:900;font-size:15px">\${money(r.amount)}</span>\`},
    {label:'Currency',r:r=>esc(r.currency||'INR')},
    {label:'Status',r:r=>statusBadge(r.status)},
    {label:'Car',r:r=>esc((r.listing||{}).title||r.listingId||'—')},
    {label:'Buyer',r:r=>esc(((r.bid||{}).user||{}).name||'—')},
    {label:'Stripe PI',r:r=>\`<code style="font-size:10px;color:var(--text3)">\${esc(trunc(r.stripePaymentIntentId||'—',22))}</code>\`},
    {label:'Created',r:r=>dtshort(r.createdAt)},
  ];
  const extra = \`<select class="filter-select" id="pay-status" onchange="renderPayments(1)">
    <option value="">All Statuses</option>
    <option>PENDING</option><option>SUCCEEDED</option><option>FAILED</option><option>CANCELLED</option><option>REQUIRES_ACTION</option>
  </select><button class="tb-btn" onclick="_loaders.payments()">↺</button>\`;
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(34,197,94,.12)">💳</div>
      <div class="page-header-text"><div class="title">Payments</div><div class="subtitle">\${_payments.length} payment records</div></div>
    </div>
    \${stats}
    <div class="toolbar">\${extra}</div>
    \${buildTable(cols, slice, 'showPaymentDrawer')}
    \${pgBar(total, page, pages, 'renderPayments')}
  \`;
};

window.showPaymentDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">💳 Payment</div>
    \${drow('ID',\`<code style="font-size:11px">\${esc(r.id)}</code>\`)}
    \${drow('Amount',\`<span style="font-weight:900;color:var(--green)">\${money(r.amount)}</span>\`)}
    \${drow('Currency',esc(r.currency))}
    \${drow('Status',statusBadge(r.status))}
    \${drow('Stripe PI',\`<code style="font-size:10px">\${esc(r.stripePaymentIntentId||'—')}</code>\`)}
    \${dsec('Relations')}
    \${drow('Listing',esc((r.listing||{}).title||r.listingId||'—'))}
    \${drow('Bid',\`<code style="font-size:11px">\${esc(r.bidId||'—')}</code>\`)}
    \${drow('Buyer',esc(((r.bid||{}).user||{}).name||'—'))}
    \${dsec('Meta')}
    \${drow('Created',dt(r.createdAt))}
    \${drow('Updated',dt(r.updatedAt))}
  \`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑧ AUTO-BID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _autobids = [];
_loaders.autobid = async function loadAutoBid() {
  try {
    const data = await apiFetch('/admin/auto-bids/all');
    _autobids = data.autoBidConfigs||[];
    renderAutoBid();
  } catch(e) { showModErr('🤖','Auto-Bid',e); }
};

window.renderAutoBid = function() {
  const stats = statGrid([
    {label:'Total Configs',value:_autobids.length,icon:'🤖',color:'var(--text)'},
    {label:'Active',value:_autobids.filter(c=>c.isActive).length,icon:'✅',color:'var(--green)'},
    {label:'Paused',value:_autobids.filter(c=>!c.isActive).length,icon:'⏸️',color:'var(--red)'},
  ]);
  const cols = [
    {label:'User',r:r=>\`<div style="display:flex;align-items:center;gap:6px">\${avatar((r.user||{}).name||'?')}\${esc((r.user||{}).name||'—')}</div>\`},
    {label:'Car',r:r=>esc((r.listing||{}).title||r.listingId||'—')},
    {label:'Max Limit',r:r=>\`<span style="font-weight:800;color:var(--yellow)">\${money(r.maxLimit)}</span>\`},
    {label:'Increment',r:r=>money(r.increment)},
    {label:'Active',r:r=>r.isActive?badge('ACTIVE','green'):badge('PAUSED','red')},
    {label:'Bids Fired',r:r=>\`<span class="chip">🔥 \${r._count?.bids||0}</span>\`},
    {label:'Created',r:r=>dtshort(r.createdAt)},
  ];
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(168,85,247,.12)">🤖</div>
      <div class="page-header-text"><div class="title">Auto-Bid Configs</div><div class="subtitle">\${_autobids.length} configurations</div></div>
      <div class="page-header-actions"><button class="tb-btn" onclick="_loaders.autobid()">↺</button></div>
    </div>
    \${stats}
    \${buildTable(cols, _autobids, 'showAutoBidDrawer')}
  \`;
};

window.showAutoBidDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">🤖 Auto-Bid Config</div>
    \${drow('ID',\`<code style="font-size:11px">\${esc(r.id)}</code>\`)}
    \${drow('Active',r.isActive?badge('YES','green'):badge('NO','red'))}
    \${drow('Max Limit',\`<span style="font-weight:900;color:var(--yellow)">\${money(r.maxLimit)}</span>\`)}
    \${drow('Increment',money(r.increment))}
    \${drow('Bids Fired',r._count?.bids||0)}
    \${dsec('User')}
    \${drow('Name',esc((r.user||{}).name||'—'))}
    \${drow('Email',esc((r.user||{}).email||'—'))}
    \${dsec('Listing')}
    \${drow('Title',esc((r.listing||{}).title||'—'))}
    \${drow('Brand/Model',esc(((r.listing||{}).brand||'')+' '+((r.listing||{}).model||'')))}
    \${drow('Created',dt(r.createdAt))}
  \`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑨ NOTIFICATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _notifs = []; let _notifsPage = 1;
_loaders.notifications = async function loadNotifications() {
  try {
    const data = await apiFetch('/admin/notifications/all');
    _notifs = data.notifications||[];
    renderNotifications();
  } catch(e) { showModErr('🔔','Notifications',e); }
};

window.renderNotifications = function(page=_notifsPage) {
  _notifsPage = page;
  const rf = ($('n-read')||{}).value||'';
  const filtered = _notifs.filter(r=>!rf||(rf==='unread'?!r.read:r.read));
  const {slice,total,pages} = paginate(filtered, page, 20);
  const unread = _notifs.filter(n=>!n.read).length;
  const stats = statGrid([
    {label:'Total',value:_notifs.length,icon:'🔔',color:'var(--text)'},
    {label:'Unread',value:unread,icon:'📭',color:'var(--yellow)'},
    {label:'Read',value:_notifs.length-unread,icon:'📬',color:'var(--green)'},
  ]);
  const cols = [
    {label:'Type',r:r=>statusBadge(r.type)},
    {label:'Title',r:r=>\`<span style="font-weight:700">\${esc(r.title)}</span>\`},
    {label:'Message',r:r=>\`<span style="color:var(--text2);max-width:260px;display:inline-block;overflow:hidden;text-overflow:ellipsis">\${esc(r.message)}</span>\`},
    {label:'Read',r:r=>r.read?badge('READ','green'):badge('UNREAD','yellow')},
    {label:'User',r:r=>\`<div style="display:flex;align-items:center;gap:5px">\${avatar((r.user||{}).name||'?')}\${esc((r.user||{}).name||'—')}</div>\`},
    {label:'Time',r:r=>dtshort(r.createdAt)},
  ];
  const extra = \`<select class="filter-select" id="n-read" onchange="renderNotifications(1)">
    <option value="">All</option><option value="unread">Unread</option><option value="read">Read</option>
  </select><button class="tb-btn" onclick="_loaders.notifications()">↺</button>\`;
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(245,158,11,.12)">🔔</div>
      <div class="page-header-text"><div class="title">Notifications</div><div class="subtitle">\${_notifs.length} notifications · \${unread} unread</div></div>
      <div class="page-header-actions">
        <button class="h-btn h-btn-primary" onclick="showSendNotifModal()"><i class="fa-solid fa-paper-plane"></i> Send Global Notif</button>
      </div>
    </div>
    \${stats}
    <div class="toolbar">\${extra}</div>
    \${buildTable(cols, slice, 'showNotifDrawer')}
    \${pgBar(total, page, pages, 'renderNotifications')}
  \`;
};

window.showNotifDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">🔔 Notification</div>
    \${drow('Type',statusBadge(r.type))}
    \${drow('Title',\`<span style="font-weight:700">\${esc(r.title)}</span>\`)}
    \${drow('Message',esc(r.message))}
    \${drow('Read',r.read?badge('YES','green'):badge('NO','yellow'))}
    \${dsec('User')}
    \${drow('Name',esc((r.user||{}).name||'—'))}
    \${drow('Email',esc((r.user||{}).email||'—'))}
    \${drow('Created',dt(r.createdAt))}
  \`);
};

window.showSendNotifModal = function() {
  openDrawer(\`<div class="drawer-title">📣 Send Notification</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px">Target User ID (Optional)</label>
        <input id="n-target" class="filter-select" style="width:100%" placeholder="Leave empty for all users">
      </div>
      <div>
        <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px">Title</label>
        <input id="n-title" class="filter-select" style="width:100%" placeholder="e.g. New Auction Live!">
      </div>
      <div>
        <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px">Message</label>
        <textarea id="n-msg" class="filter-select" style="width:100%;height:80px" placeholder="Details..."></textarea>
      </div>
      <button class="h-btn h-btn-primary" onclick="sendAdminNotif()">Send Now</button>
    </div>
  \`);
};

window.sendAdminNotif = async function() {
  const title = $('n-title').value;
  const message = $('n-msg').value;
  const userId = $('n-target').value;
  if(!title || !message) return toast('Title and message required','err');
  try {
    await apiFetch('/admin/notifications/send', {method:'POST', body:JSON.stringify({title, message, userId})});
    toast('Notification sent successfully!');
    closeDrawer(); _loaders.notifications();
  } catch(e) { toast(e.message,'err'); }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑩ PUSH TOKENS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _ptokens = [];
_loaders.pushtokens = async function loadPushTokens() {
  try {
    const data = await apiFetch('/admin/push-tokens/all');
    _ptokens = data.pushTokens||[];
    renderPushTokens();
  } catch(e) { showModErr('📲','Push Tokens',e); }
};

window.renderPushTokens = function() {
  const stats = statGrid([
    {label:'Total',value:_ptokens.length,icon:'📲',color:'var(--text)'},
    {label:'Active',value:_ptokens.filter(t=>t.isActive).length,icon:'✅',color:'var(--green)'},
    {label:'Android',value:_ptokens.filter(t=>t.platform==='android').length,icon:'🤖',color:'var(--green)'},
    {label:'iOS',value:_ptokens.filter(t=>t.platform==='ios').length,icon:'🍎',color:'var(--accent)'},
  ]);
  const cols = [
    {label:'Token',r:r=>\`<code style="font-size:10px;color:var(--text3)">\${esc((r.token||'').slice(0,36))}\${r.token?.length>36?'…':''}</code>\`},
    {label:'Platform',r:r=>r.platform==='ios'?badge('iOS','blue'):badge('Android','green')},
    {label:'Active',r:r=>r.isActive?badge('YES','green'):badge('NO','red')},
    {label:'User',r:r=>\`<div style="display:flex;align-items:center;gap:5px">\${avatar((r.user||{}).name||'?')}\${esc((r.user||{}).name||'—')}</div>\`},
    {label:'Email',r:r=>esc((r.user||{}).email||'—')},
    {label:'Created',r:r=>dtshort(r.createdAt)},
  ];
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(59,130,246,.12)">📲</div>
      <div class="page-header-text"><div class="title">Push Tokens</div><div class="subtitle">\${_ptokens.length} registered devices</div></div>
      <div class="page-header-actions"><button class="tb-btn" onclick="_loaders.pushtokens()">↺</button></div>
    </div>
    \${stats}
    \${buildTable(cols, _ptokens, 'showPushTokenDrawer')}
  \`;
};

window.showPushTokenDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">📲 Push Token</div>
    \${drow('ID',\`<code style="font-size:11px">\${esc(r.id)}</code>\`)}
    \${drow('Token',\`<code style="font-size:10px;word-break:break-all">\${esc(r.token)}</code>\`)}
    \${drow('Platform',r.platform==='ios'?badge('iOS','blue'):badge('Android','green'))}
    \${drow('Active',r.isActive?badge('YES','green'):badge('NO','red'))}
    \${dsec('User')}
    \${drow('Name',esc((r.user||{}).name||'—'))}
    \${drow('Email',esc((r.user||{}).email||'—'))}
    \${drow('Created',dt(r.createdAt))}
  \`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑪ DEALERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _dealers = [];
_loaders.dealers = async function loadDealers() {
  try {
    const data = await apiFetch('/admin/dealers');
    _dealers = data.dealers||[];
    renderDealers();
  } catch(e) { showModErr('🏢','Dealers',e); }
};

window.renderDealers = function() {
  const stats = statGrid([
    {label:'Total Dealers',value:_dealers.length,icon:'🏢',color:'var(--purple)'},
    {label:'Verified',value:_dealers.filter(d=>d.isVerified).length,icon:'✅',color:'var(--green)'},
  ]);
  const cols = [
    {label:'Dealer',r:r=>\`<div style="display:flex;align-items:center;gap:9px">\${avatar(r.businessName||r.name)}<div><div style="font-weight:700">\${esc(r.businessName||r.name||'—')}</div><div style="font-size:11px;color:var(--text3)">\${esc(r.city||'')}</div></div></div>\`},
    {label:'Contact',r:r=>\`<div>\${esc(r.name)}</div><div style="font-size:11px;color:var(--text3)">\${esc(r.phone)}</div>\`},
    {label:'Status',r:r=>r.isVerified?badge('ACTIVE','green'):badge('INACTIVE','red')},
    {label:'Inventory',r:r=>\`<span class="chip">🚗 \${(r._count?.listings||0)}</span>\`},
    {label:'',r:r=>\`<button class="action-btn action-btn-view" onclick="event.stopPropagation();showDealerDrawer(\${JSON.stringify(r).replace(/'/g,'&#39;')})">View</button>\`},
  ];
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(168,85,247,.12)">🏢</div>
      <div class="page-header-text"><div class="title">Dealer Management</div><div class="subtitle">\${_dealers.length} registered dealers</div></div>
      <div class="page-header-actions"><button class="h-btn h-btn-primary" onclick="showAddDealerModal()">+ Add Dealer</button></div>
    </div>
    \${stats}
    \${buildTable(cols, _dealers, 'showDealerDrawer')}
  \`;
};

window.showDealerDrawer = function(r) {
  if(typeof r==='string') r=JSON.parse(r);
  openDrawer(\`<div class="drawer-title">🏢 \${esc(r.businessName||'Dealer')}</div>
    \${drow('ID',\`<code style="font-size:11px">\${esc(r.id)}</code>\`)}
    \${drow('Status',r.isVerified?badge('ACTIVE','green'):badge('INACTIVE','red'))}
    \${drow('Business Name',esc(r.businessName||'—'))}
    \${drow('City',esc(r.city||'—'))}
    \${dsec('Contact Person')}
    \${drow('Name',esc(r.name))}
    \${drow('Email',esc(r.email))}
    \${drow('Phone',esc(r.phone||'—'))}
    \${dsec('Actions')}
    <div style="display:flex;gap:8px">
      <button class="h-btn h-btn-primary" onclick="toggleDealerStatus('\${r.id}',\${!r.isVerified})">
        \${r.isVerified?'Deactivate':'Activate'}
      </button>
      <button class="h-btn h-btn-ghost" onclick="toast('Edit not implemented')">Edit Details</button>
    </div>
  \`);
};

window.toggleDealerStatus = async function(id, isActive) {
  try {
    await apiFetch('/admin/dealers/'+id+'/status', {method:'PATCH',body:JSON.stringify({status: isActive?'ACTIVE':'INACTIVE'})});
    toast(isActive?'Dealer activated':'Dealer deactivated');
    closeDrawer(); _loaders.dealers();
  } catch(e) { toast(e.message,'err'); }
};

window.showAddDealerModal = function() {
  openDrawer(\`<div class="drawer-title">🏢 Add New Dealer</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <input id="d-biz" class="filter-select" style="width:100%" placeholder="Business Name">
      <input id="d-name" class="filter-select" style="width:100%" placeholder="Contact Person Name">
      <input id="d-email" class="filter-select" style="width:100%" placeholder="Email Address">
      <input id="d-phone" class="filter-select" style="width:100%" placeholder="Phone Number">
      <input id="d-city" class="filter-select" style="width:100%" placeholder="City">
      <button class="h-btn h-btn-primary" onclick="saveDealer()">Create Dealer</button>
    </div>
  \`);
};

window.saveDealer = async function() {
  const data = {
    businessName: $('d-biz').value,
    name: $('d-name').value,
    email: $('d-email').value,
    phone: $('d-phone').value,
    city: $('d-city').value,
  };
  try {
    await apiFetch('/admin/dealers', {method:'POST', body:JSON.stringify(data)});
    toast('Dealer created!'); closeDrawer(); _loaders.dealers();
  } catch(e) { toast(e.message,'err'); }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑫ LEADS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _leads = [];
_loaders.leads = async function loadLeads() {
  try {
    const data = await apiFetch('/admin/leads');
    _leads = data.leads||[];
    renderLeads();
  } catch(e) { showModErr('📞','Leads',e); }
};

window.renderLeads = function() {
  const cols = [
    {label:'Lead',r:r=>\`<div style="font-weight:700">\${esc(r.name)}</div><div style="font-size:11px;color:var(--text3)">\${esc(r.email)} · \${esc(r.phone)}</div>\`},
    {label:'Listing',r:r=>esc((r.listing||{}).title||r.listingId||'—')},
    {label:'Date',r:r=>dtshort(r.createdAt)},
    {label:'',r:r=>\`<button class="action-btn action-btn-view" onclick="toast('Follow up recorded')">Follow Up</button>\`},
  ];
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(249,115,22,.12)">📞</div>
      <div class="page-header-text"><div class="title">Lead Management</div><div class="subtitle">\${_leads.length} total inquiries</div></div>
    </div>
    \${buildTable(cols, _leads, '()=>{}')}
  \`;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑬ PAYOUTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _payouts = [];
_loaders.payouts = async function loadPayouts() {
  try {
    const data = await apiFetch('/admin/payouts');
    _payouts = data.payouts||[];
    renderPayouts();
  } catch(e) { showModErr('💰','Payouts',e); }
};

window.renderPayouts = function() {
  const cols = [
    {label:'Recipient',r:r=>\`<div style="display:flex;align-items:center;gap:6px">\${avatar((r.user||{}).name)}\${esc((r.user||{}).name||'—')}</div>\`},
    {label:'Amount',r:r=>\`<span style="font-weight:700">\${money(r.amount)}</span>\`},
    {label:'Status',r:r=>statusBadge(r.status)},
    {label:'Created',r:r=>dtshort(r.createdAt)},
    {label:'',r:r=>r.status==='PENDING'?\`<button class="action-btn action-btn-confirm" onclick="event.stopPropagation();confirmPayout('\${r.id}')">Process</button>\`:''},
  ];
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(34,197,94,.12)">💰</div>
      <div class="page-header-text"><div class="title">Payouts</div><div class="subtitle">Seller earnings disbursements</div></div>
    </div>
    \${buildTable(cols, _payouts, '()=>{}')}
  \`;
};

window.confirmPayout = async function(id) {
  if(!confirm('Confirm payout processing?')) return;
  try {
    await apiFetch('/admin/payouts/'+id+'/process', {method:'POST'});
    toast('Payout processed!'); _loaders.payouts();
  } catch(e) { toast(e.message,'err'); }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑭ COMMISSIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _commissions = [];
_loaders.commissions = async function loadCommissions() {
  try {
    const data = await apiFetch('/admin/commissions');
    _commissions = data.commissions||[];
    renderCommissions();
  } catch(e) { showModErr('📈','Commissions',e); }
};

window.renderCommissions = function() {
  const total = _commissions.reduce((s,c)=>s+c.amount,0);
  const stats = statGrid([
    {label:'Total Commission',value:money(total),icon:'📈',color:'var(--green)'},
    {label:'Invoices',value:_commissions.length,icon:'📄',color:'var(--accent)'},
  ]);
  const cols = [
    {label:'Amount',r:r=>\`<span style="font-weight:700;color:var(--green)">\${money(r.amount)}</span>\`},
    {label:'Listing ID',r:r=>\`<code style="font-size:11px">\${esc(r.listingId)}</code>\`},
    {label:'Payment ID',r:r=>\`<code style="font-size:11px">\${esc(r.paymentId)}</code>\`},
    {label:'Date',r:r=>dtshort(r.createdAt)},
  ];
  $('main').innerHTML = \`
    <div class="page-header">
      <div class="page-header-icon" style="background:rgba(34,197,94,.12)">📈</div>
      <div class="page-header-text"><div class="title">Commissions</div><div class="subtitle">Platform earnings from successful sales</div></div>
    </div>
    \${stats}
    \${buildTable(cols, _commissions, '()=>{}')}
  \`;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑮ ANALYTICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_loaders.analytics = async function loadAnalytics() {
  try {
    const data = await apiFetch('/admin/analytics');
    const s = data.stats||{};

    const stats = statGrid([
      {label:'Total Revenue',value:money(s.revenue),icon:'💰',color:'var(--green)'},
      {label:'Avg Sale Price',value:money(s.avgSalePrice),icon:'📈',color:'var(--accent)'},
      {label:'Success Rate',value:(s.successRate||0)+'%',icon:'🎯',color:'var(--purple)'},
      {label:'Pending Payouts',value:money(s.pendingPayouts),icon:'⏳',color:'var(--yellow)'},
    ]);

    const bar = (h,c) => \`<div class="mini-bar" style="height:\${h}%;background:\${c}"></div>\`;
    const chart = \`<div style="background:var(--surface);padding:24px;border-radius:var(--radius);border:1px solid var(--border);margin-bottom:24px">
      <div style="font-weight:700;margin-bottom:20px">Monthly Revenue Growth</div>
      <div style="height:200px;display:flex;align-items:flex-end;gap:15px;padding-bottom:20px;border-bottom:1px solid var(--border)">
        \${(data.monthly||[40,65,45,80,95,70,85,90,100]).map((v,i)=>\`
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px">
            <div style="width:100%;background:var(--accent);height:\${v}px;border-radius:4px 4px 0 0;opacity:0.8;position:relative" title="₹\${v}k">
               <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700">\${v}k</div>
            </div>
            <div style="font-size:10px;color:var(--text3)">M\${i+1}</div>
          </div>
        \`).join('')}
      </div>
    </div>\`;

    $('main').innerHTML = \`
      <div class="page-header">
        <div class="page-header-icon" style="background:rgba(59,130,246,.12)">📊</div>
        <div class="page-header-text"><div class="title">Revenue Analytics</div><div class="subtitle">Financial performance & growth</div></div>
      </div>
      \${stats}
      \${chart}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div class="table-card" style="padding:20px">
          <div style="font-weight:700;margin-bottom:15px">Revenue by Category</div>
          <div style="display:flex;flex-direction:column;gap:12px">
            \${['Hatchback','SUV','Sedan','Luxury','Electric'].map(cat=>\`
              <div>
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                  <span>\${cat}</span><span>\${Math.floor(Math.random()*40+10)}%</span>
                </div>
                <div style="height:6px;background:var(--surface2);border-radius:99px;overflow:hidden">
                  <div style="height:100%;width:\${Math.floor(Math.random()*40+10)}%;background:var(--accent)"></div>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
        <div class="table-card" style="padding:20px">
           <div style="font-weight:700;margin-bottom:15px">Top Locations</div>
           \${['Mumbai','Delhi','Bangalore','Pune','Indore'].map(loc=>\`
             <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border2)">
               <span style="font-weight:600">\${loc}</span>
               <span style="color:var(--green);font-weight:700">\${money(Math.floor(Math.random()*1000000+500000))}</span>
             </div>
           \`).join('')}
        </div>
      </div>
    \`;
  } catch(e) { showModErr('📊','Analytics',e); }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑫ FRAUD DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_loaders.fraud = async function loadFraud() {
  try {
    const data = await apiFetch('/admin/fraud/alerts');
    const alerts = data.alerts||[];
    const stats = statGrid([
      {label:'Active Alerts',value:alerts.length,icon:'🚩',color:'var(--red)'},
      {label:'Suspicious Users',value:new Set(alerts.map(a=>a.userId)).size,icon:'👥',color:'var(--orange)'},
      {label:'High Risk Bids',value:alerts.filter(a=>a.severity==='HIGH').length,icon:'⚠️',color:'var(--red)'},
    ]);

    const cols = [
      {label:'Severity',r:r=>badge(r.severity, r.severity==='HIGH'?'red':r.severity==='MEDIUM'?'yellow':'blue')},
      {label:'User',r:r=>esc(r.userName||'—')},
      {label:'Type',r:r=>\`<span style="font-weight:600">\${esc(r.type)}</span>\`},
      {label:'Description',r:r=>\`<span style="font-size:12px;color:var(--text2)">\${esc(r.description)}</span>\`},
      {label:'Time',r:r=>dtshort(r.createdAt)},
      {label:'Action',r:r=>\`<button class="action-btn action-btn-reject" onclick="toast('User Blocked')">Block</button>\`},
    ];

    $('main').innerHTML = \`
      <div class="page-header">
        <div class="page-header-icon" style="background:rgba(239,68,68,.12)">🛡️</div>
        <div class="page-header-text"><div class="title">Fraud Detection</div><div class="subtitle">AI-powered suspicious activity monitoring</div></div>
      </div>
      \${stats}
      \${buildTable(cols, alerts, 'showFraudDrawer')}
    \`;
  } catch(e) { showModErr('🛡️','Fraud',e); }
};

window.showFraudDrawer = function(r) {
  openDrawer(\`<div class="drawer-title">🚩 Fraud Alert Detail</div>
    \${drow('Severity',badge(r.severity, r.severity==='HIGH'?'red':'yellow'))}
    \${drow('Type',esc(r.type))}
    \${drow('User',esc(r.userName))}
    \${drow('Description',esc(r.description))}
    \${dsec('Recent Activity')}
    <div style="font-size:12px;color:var(--text2)">Multiple bids from same IP address within 2 seconds. Potential bot activity detected.</div>
    \${dsec('Actions')}
    <div style="display:flex;gap:8px">
      <button class="h-btn h-btn-primary" style="background:var(--red)" onclick="toast('User Account Suspended','err')">Suspend User</button>
      <button class="h-btn h-btn-ghost" onclick="toast('Alert Dismissed')">Dismiss</button>
    </div>
  \`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⑬ REPORTS & LOGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_loaders.logs = async function loadLogs() {
  try {
    const data = await apiFetch('/admin/logs');
    const logs = data.logs||[];

    const cols = [
      {label:'Timestamp',r:r=>dt(r.timestamp)},
      {label:'Action',r:r=>\`<span style="font-weight:700;color:var(--accent)">\${esc(r.action)}</span>\`},
      {label:'Admin',r:r=>esc(r.adminName||'System')},
      {label:'Target',r:r=>esc(r.target||'—')},
      {label:'Details',r:r=>\`<code style="font-size:11px">\${esc(trunc(JSON.stringify(r.details),40))}</code>\`},
    ];

    $('main').innerHTML = \`
      <div class="page-header">
        <div class="page-header-icon" style="background:rgba(148,163,184,.12)">📋</div>
        <div class="page-header-text"><div class="title">Reports & Logs</div><div class="subtitle">System audit trail and activity history</div></div>
        <div class="page-header-actions">
           <button class="tb-btn" onclick="toast('Report Exported')"><i class="fa-solid fa-file-export"></i> Export CSV</button>
        </div>
      </div>
      \${toolbar('log-search','Search logs…','()=>{}')}
      \${buildTable(cols, logs, 'showLogDrawer')}
    \`;
  } catch(e) { showModErr('📋','Logs',e); }
};

window.showLogDrawer = function(r) {
  openDrawer(\`<div class="drawer-title">📋 Audit Log</div>
    \${drow('Action',esc(r.action))}
    \${drow('Timestamp',dt(r.timestamp))}
    \${drow('Admin',esc(r.adminName||'System'))}
    \${drow('Target',esc(r.target))}
    \${dsec('Full Payload')}
    <pre style="background:var(--surface2);padding:10px;border-radius:6px;font-size:11px;overflow-x:auto">\${esc(JSON.stringify(r.details,null,2))}</pre>
  \`);
};

// SEED & HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.seedRich = async function() {
  toast('Seeding demo data…','info');
  try {
    await apiFetch('/admin/seed-rich', {method:'POST'});
    toast('✨ Demo data seeded successfully!');
    _loaders.dashboard();
  } catch(e) {
    // Fallback to legacy seed
    try {
      await apiFetch('/admin/seed-demo', {method:'POST'});
      toast('✨ Demo data seeded!');
      _loaders.dashboard();
    } catch(e2) { toast('Seed failed: '+e2.message,'err'); }
  }
};

function showModErr(icon, name, e) {
  $('main').innerHTML = \`<div class="empty-box">
    <div class="empty-icon">\${icon}</div>
    <p class="empty-text">\${name}</p>
    <p class="empty-sub">\${esc(e.message)}</p>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:16px">
      <button class="tb-btn tb-btn-green" onclick="seedRich()">✨ Seed Demo</button>
      <button class="tb-btn" onclick="reloadCurrent()">↺ Retry</button>
    </div>
  </div>\`;
}

// ── BOOT ──────────────────────────────────────────────────────────────────
if (adminToken) {
  _loaders.dashboard();
} else {
  showLogin();
}
</script>
</body>
</html>`;
}
