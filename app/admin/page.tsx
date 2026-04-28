"use client";

import { useState, useEffect, useRef } from "react";

const CURRY = "#C4A03A";
const CURRY_BG = "#FBF7EC";
const CURRY_BORDER = "rgba(196,160,58,0.25)";
const PAGE_BG = "#F4F6F9";
const WHITE = "#FFFFFF";
const TEXT = "#0A1628";
const MUTED = "#6B7A8A";
const BORDER = "rgba(10,22,40,0.09)";
const NAVY = "#0A1628";
const GRANITE = "#8B9099";
const ACCENT = "#2563EB";

const ADMIN_PASSWORD = "byggetalent2026";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ny:        { label: "Ny ansøgning",  color: "#2563EB", bg: "#EFF6FF" },
  screening: { label: "Screening",     color: "#7C3AED", bg: "#F5F3FF" },
  samtale:   { label: "Til samtale",   color: "#D97706", bg: "#FFFBEB" },
  tilbud:    { label: "Tilbud sendt",  color: "#059669", bg: "#ECFDF5" },
  ansat:     { label: "Ansat",         color: "#166534", bg: "#DCFCE7" },
  afvist:    { label: "Afvist",        color: "#DC2626", bg: "#FEF2F2" },
};

type StatusKey = keyof typeof STATUS_CONFIG;
type NavPage = "dashboard" | "kandidater" | "stillinger" | "ansogninger";

interface Application {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  currentTitle: string;
  experience: string;
  linkedin: string;
  salary: string;
  distance: string;
  supplementaryInfo: string;
  profiles: string[];
  profileOtherTitle: string;
  submittedAt: string;
  status: StatusKey;
  notes: string;
  interviewDate?: string;
}

interface JobPosting {
  id: string;
  title: string;
  location: string;
  region: string;
  type: string;
  description: string;
  createdAt: string;
  active: boolean;
  portals: string[];
}

const REGIONS = [
  "Hele Danmark",
  "Hovedstaden",
  "Sjælland",
  "Syddanmark",
  "Midtjylland",
  "Nordjylland",
  "Bornholm",
];

const PORTALS: { key: string; label: string; url: string; color: string }[] = [
  { key: "linkedin",   label: "LinkedIn",      url: "https://www.linkedin.com/jobs/",        color: "#0A66C2" },
  { key: "jobindex",   label: "Jobindex",      url: "https://www.jobindex.dk/",              color: "#E8000D" },
  { key: "byggejob",   label: "Byggejob.dk",   url: "https://www.byggejob.dk/",              color: "#F5A623" },
  { key: "jobnet",     label: "Jobnet.dk",     url: "https://job.jobnet.dk/",                color: "#1B6CA8" },
  { key: "ofir",       label: "Ofir.dk",       url: "https://www.ofir.dk/",                  color: "#00B140" },
];

function matchScore(app: Application): number {
  let score = 0;
  if (app.name) score += 10;
  if (app.email) score += 10;
  if (app.phone) score += 10;
  if (app.currentTitle) score += 15;
  if (app.experience) score += 15;
  if (app.profiles?.length > 0) score += 20;
  if (app.linkedin) score += 10;
  if (app.supplementaryInfo) score += 10;
  return score;
}

function scoreColor(s: number) {
  if (s >= 75) return "#059669";
  if (s >= 50) return "#D97706";
  return "#DC2626";
}

// ─── SVG Ikoner ──────────────────────────────────────────────────────────────
const Icon = {
  dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  jobs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  candidates: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  applications: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
};

// ─── Toolbar-knap stil (skal stå FØR Admin-komponenten) ─────────────────────
const tbBtn: React.CSSProperties = {
  padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(10,22,40,0.13)",
  background: "#FFFFFF", color: "#0A1628", fontSize: "13px", fontWeight: 700,
  cursor: "pointer", lineHeight: 1.2, minWidth: "32px",
};

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [nav, setNav] = useState<NavPage>("dashboard");
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "alle">("alle");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobForm, setJobForm] = useState({ title: "", location: "", region: "", type: "", description: "", active: false, portals: [] as string[] });
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  function togglePortal(key: string) {
    setJobForm((f) => ({
      ...f,
      portals: f.portals.includes(key) ? f.portals.filter((p) => p !== key) : [...f.portals, key],
    }));
  }

  // ─── Tekstformatering via browserens native API ──────────────────────────────
  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  }
  function restoreSelection() {
    const sel = window.getSelection();
    if (sel && savedRange.current) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  }
  function execFormat(command: string, value?: string) {
    descRef.current?.focus();
    document.execCommand(command, false, value ?? undefined);
    syncEditorToState();
  }
  function applyFontSize(px: string) {
    if (!px) return;
    descRef.current?.focus();   // giv editor fokus først
    restoreSelection();          // gendan den gemte selektion
    document.execCommand("fontSize", false, "7"); // wrap i <font size="7">
    // Erstat <font size="7"> med <span style="font-size: Xpx">
    if (descRef.current) {
      descRef.current.querySelectorAll('font[size="7"]').forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = px + "px";
        span.innerHTML = (el as HTMLElement).innerHTML;
        el.parentNode?.replaceChild(span, el);
      });
    }
    syncEditorToState();
  }
  function applyFontFamily(family: string) {
    if (!family) return;
    descRef.current?.focus();
    restoreSelection();
    document.execCommand("fontName", false, family);
    syncEditorToState();
  }
  function syncEditorToState() {
    if (descRef.current) {
      setJobForm((f) => ({ ...f, description: descRef.current!.innerHTML }));
    }
  }

  // ─── AI-generering ───────────────────────────────────────────────────────────
  function generateAIText() {
    if (!jobForm.title) return;
    setAiGenerating(true);
    setTimeout(() => {
      const html = buildJobTemplate(jobForm.title, jobForm.type, jobForm.location, jobForm.region);
      // Sæt direkte i DOM — editor er ukontrolleret af React
      if (descRef.current) {
        descRef.current.focus();
        descRef.current.innerHTML = html;
        // Flyt cursor til slutningen
        const range = document.createRange();
        range.selectNodeContents(descRef.current);
        range.collapse(false);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
      setJobForm((f) => ({ ...f, description: html }));
      setAiGenerating(false);
    }, 900);
  }

  useEffect(() => {
    if (loggedIn) {
      const raw: Application[] = JSON.parse(localStorage.getItem("bt_applications") || "[]");
      setApplications(raw.map((a) => ({ ...a, status: (a.status ?? "ny") as StatusKey, notes: a.notes ?? "" })));
      setJobs(JSON.parse(localStorage.getItem("bt_jobs") || "[]"));
    }
  }, [loggedIn]);

  // Sæt editorens indhold når formularen åbnes — UDEN at React styrer den
  useEffect(() => {
    if (showJobForm && descRef.current) {
      descRef.current.innerHTML = jobForm.description || "";
      descRef.current.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showJobForm, editingJob]);

  function saveApplications(updated: Application[]) {
    setApplications(updated);
    localStorage.setItem("bt_applications", JSON.stringify(updated));
  }
  function updateStatus(id: string, status: StatusKey) {
    const updated = applications.map((a) => a.id === id ? { ...a, status } : a);
    saveApplications(updated);
    if (selectedApp?.id === id) setSelectedApp((p) => p ? { ...p, status } : p);
  }
  function saveNote(id: string) {
    const updated = applications.map((a) => a.id === id ? { ...a, notes: noteInput } : a);
    saveApplications(updated);
    if (selectedApp?.id === id) setSelectedApp((p) => p ? { ...p, notes: noteInput } : p);
  }
  function deleteApp(id: string) {
    saveApplications(applications.filter((a) => a.id !== id));
    setSelectedApp(null);
  }
  function saveJob(publish: boolean) {
    const jobData = { ...jobForm, active: publish };
    const updated = editingJob
      ? jobs.map((j) => j.id === editingJob.id ? { ...j, ...jobData } : j)
      : [...jobs, { id: Date.now().toString(), ...jobData, createdAt: new Date().toISOString() }];
    setJobs(updated);
    localStorage.setItem("bt_jobs", JSON.stringify(updated));
    setShowJobForm(false);
    setEditingJob(null);
    setJobForm({ title: "", location: "", region: "", type: "", description: "", active: false, portals: [] });
  }
  function toggleJobActive(id: string) {
    const updated = jobs.map((j) => j.id === id ? { ...j, active: !j.active } : j);
    setJobs(updated);
    localStorage.setItem("bt_jobs", JSON.stringify(updated));
  }
  function deleteJob(id: string) {
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    localStorage.setItem("bt_jobs", JSON.stringify(updated));
  }

  const todayInterviews = applications.filter((a) => a.status === "samtale").length;
  const activeJobs = jobs.filter((j) => j.active).length;
  const draftJobs = jobs.filter((j) => !j.active).length;
  const avgScore = applications.length > 0
    ? Math.round(applications.reduce((sum, a) => sum + matchScore(a), 0) / applications.length)
    : 0;
  const topCandidates = [...applications].sort((a, b) => matchScore(b) - matchScore(a)).slice(0, 5);
  const filteredApps = statusFilter === "alle" ? applications : applications.filter((a) => a.status === statusFilter);

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A1628 0%, #152338 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: 700, marginBottom: "8px" }}>
              <span style={{ color: WHITE }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>Rekrutteringsplatform</div>
          </div>
          <div style={{ background: WHITE, borderRadius: "20px", padding: "36px", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>Velkommen tilbage</div>
            <div style={{ fontSize: "14px", color: MUTED, marginBottom: "24px" }}>Log ind for at se din rekrutteringsoversigt</div>
            <div style={{ display: "grid", gap: "12px" }}>
              <input type="password" placeholder="Kodeord" value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
                onKeyDown={(e) => e.key === "Enter" && (password === ADMIN_PASSWORD ? (setLoggedIn(true)) : setPwError(true))}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: `1.5px solid ${pwError ? "#DC2626" : BORDER}`, fontSize: "15px", outline: "none", boxSizing: "border-box", color: TEXT, fontFamily: "inherit", background: pwError ? "#FEF2F2" : WHITE }}
              />
              {pwError && <div style={{ fontSize: "13px", color: "#DC2626", display: "flex", alignItems: "center", gap: "6px" }}>⚠ Forkert kodeord — prøv igen</div>}
              <button onClick={() => password === ADMIN_PASSWORD ? setLoggedIn(true) : setPwError(true)}
                style={{ width: "100%", padding: "15px", borderRadius: "12px", border: "none", background: NAVY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
                Log ind
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── SHELL ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: PAGE_BG }}>

      {/* Sidebar */}
      <aside style={{ width: "260px", background: WHITE, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "28px 24px 20px" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 700 }}>
            <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
          </div>
          <div style={{ fontSize: "11px", color: MUTED, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", marginTop: "4px" }}>Rekrutteringsplatform</div>
        </div>

        <nav style={{ padding: "8px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
          {([
            { key: "dashboard" as NavPage, label: "Dashboard", icon: <Icon.dashboard /> },
            { key: "stillinger" as NavPage, label: "Jobopslag", badge: jobs.length, icon: <Icon.jobs /> },
            { key: "kandidater" as NavPage, label: "Kandidater", badge: applications.length, icon: <Icon.candidates /> },
            { key: "ansogninger" as NavPage, label: "Ansøgninger", badge: applications.filter(a => a.status === "ny").length, icon: <Icon.applications /> },
          ]).map((item) => (
            <button key={item.key} onClick={() => { setNav(item.key); setSelectedApp(null); }}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "10px", border: "none", background: nav === item.key ? "#EFF6FF" : "transparent", color: nav === item.key ? ACCENT : MUTED, cursor: "pointer", fontSize: "14px", fontWeight: nav === item.key ? 700 : 500, textAlign: "left", width: "100%" }}>
              <span style={{ color: nav === item.key ? ACCENT : MUTED }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{ padding: "2px 8px", borderRadius: "999px", background: nav === item.key ? ACCENT : "#E5E7EB", color: nav === item.key ? WHITE : MUTED, fontSize: "12px", fontWeight: 700 }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bruger */}
        <div style={{ padding: "16px 12px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: CURRY_BG, border: `1px solid ${CURRY_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: CURRY, flexShrink: 0 }}>K</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT }}>Karina Nyberg</div>
              <div style={{ fontSize: "12px", color: MUTED }}>Administrator</div>
            </div>
            <button onClick={() => setLoggedIn(false)} title="Log ud"
              style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: "4px" }}>
              <Icon.logout />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Header */}
        <header style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT }}>
            {nav === "dashboard" && "Overblik"}
            {nav === "stillinger" && "Jobopslag"}
            {nav === "kandidater" && (selectedApp ? `${selectedApp.name} ${selectedApp.lastName}` : "Kandidater")}
            {nav === "ansogninger" && "Ansøgninger"}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {nav === "stillinger" && !showJobForm && (
              <button onClick={() => { setShowJobForm(true); setEditingJob(null); setJobForm({ title: "", location: "", region: "", type: "", description: "", active: false, portals: [] }); }}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", border: "none", background: ACCENT, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                <Icon.plus /> Nyt Jobopslag
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* ── DASHBOARD ── */}
          {nav === "dashboard" && (
            <div style={{ display: "grid", gap: "24px" }}>

              {/* Stat kort */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {[
                  { label: `Aktive Jobs${draftJobs > 0 ? ` · ${draftJobs} kladde${draftJobs > 1 ? "r" : ""}` : ""}`, value: activeJobs, icon: <Icon.jobs />, color: ACCENT, bg: "#EFF6FF" },
                  { label: "Total Ansøgere", value: applications.length, icon: <Icon.candidates />, color: "#7C3AED", bg: "#F5F3FF" },
                  { label: "Interviews i dag", value: todayInterviews, icon: <Icon.calendar />, color: "#D97706", bg: "#FFFBEB" },
                  { label: "Gns. Match Score", value: `${avgScore}%`, icon: <Icon.chart />, color: "#059669", bg: "#ECFDF5" },
                ].map((s) => (
                  <div key={s.label} style={{ background: WHITE, borderRadius: "16px", padding: "22px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(10,22,40,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div style={{ fontSize: "13px", color: MUTED, fontWeight: 600 }}>{s.label}</div>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: TEXT, lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Pipeline + Top kandidater */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                {/* Pipeline */}
                <div style={{ background: WHITE, borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT, marginBottom: "18px" }}>Pipeline</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const count = applications.filter((a) => a.status === key).length;
                      const pct = applications.length > 0 ? (count / applications.length) * 100 : 0;
                      return (
                        <div key={key}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT }}>{cfg.label}</span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: cfg.color }}>{count}</span>
                          </div>
                          <div style={{ height: "6px", borderRadius: "999px", background: "#F1F5F9" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: "999px", transition: "width 0.4s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Kandidater */}
                <div style={{ background: WHITE, borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT, display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon.candidates /> Top Kandidater
                    </div>
                    <button onClick={() => setNav("kandidater")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: ACCENT, fontWeight: 700 }}>Se alle →</button>
                  </div>
                  {topCandidates.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: MUTED, fontSize: "14px" }}>Ingen ansøgere endnu</div>
                  ) : topCandidates.map((app) => {
                    const score = matchScore(app);
                    return (
                      <div key={app.id} onClick={() => { setNav("kandidater"); setSelectedApp(app); setNoteInput(app.notes || ""); }}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: ACCENT, flexShrink: 0 }}>
                          {app.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>{app.name} {app.lastName}</div>
                          <div style={{ fontSize: "12px", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.currentTitle || "Ingen titel"}</div>
                        </div>
                        <span style={{ fontSize: "16px", fontWeight: 800, color: scoreColor(score), flexShrink: 0 }}>{score}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── KANDIDATER ── */}
          {nav === "kandidater" && !selectedApp && (
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {([["alle", "Alle"] as [string, string], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label] as [string, string])]).map(([key, label]) => {
                  const cfg = STATUS_CONFIG[key];
                  return (
                    <button key={key} onClick={() => setStatusFilter(key as StatusKey | "alle")}
                      style={{ padding: "7px 16px", borderRadius: "999px", border: `1.5px solid ${statusFilter === key ? (cfg?.color || TEXT) : BORDER}`, background: statusFilter === key ? (cfg?.bg || "#F1F5F9") : WHITE, color: statusFilter === key ? (cfg?.color || TEXT) : MUTED, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              <div style={{ background: WHITE, borderRadius: "16px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 100px", padding: "12px 20px", borderBottom: `1px solid ${BORDER}`, background: PAGE_BG }}>
                  {["Kandidat", "Status", "Match Score", "Dato"].map((h) => (
                    <div key={h} style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED }}>{h}</div>
                  ))}
                </div>
                {filteredApps.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px", color: MUTED, fontSize: "14px" }}>Ingen kandidater i denne kategori</div>
                ) : filteredApps.map((app) => {
                  const cfg = STATUS_CONFIG[app.status];
                  const score = matchScore(app);
                  return (
                    <div key={app.id} onClick={() => { setSelectedApp(app); setNoteInput(app.notes || ""); }}
                      style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 100px", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: ACCENT, flexShrink: 0 }}>
                          {app.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>{app.name} {app.lastName}</div>
                          <div style={{ fontSize: "12px", color: MUTED }}>{app.currentTitle || "Ingen titel"}</div>
                        </div>
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: "999px", background: cfg.bg, color: cfg.color, fontSize: "12px", fontWeight: 700, width: "fit-content" }}>{cfg.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "#F1F5F9", maxWidth: "60px" }}>
                          <div style={{ height: "100%", width: `${score}%`, background: scoreColor(score), borderRadius: "999px" }} />
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: scoreColor(score) }}>{score}%</span>
                      </div>
                      <div style={{ fontSize: "12px", color: MUTED }}>{new Date(app.submittedAt).toLocaleDateString("da-DK")}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── KANDIDAT DETALJE ── */}
          {nav === "kandidater" && selectedApp && (
            <div style={{ display: "grid", gap: "16px", maxWidth: "900px" }}>
              <button onClick={() => setSelectedApp(null)} style={{ background: "none", border: "none", cursor: "pointer", color: ACCENT, fontSize: "14px", fontWeight: 700, padding: 0, display: "flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
                ← Tilbage til kandidater
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px", alignItems: "start" }}>
                <div style={{ display: "grid", gap: "16px" }}>
                  {/* Profil header */}
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "24px" }}>
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, color: ACCENT }}>
                        {selectedApp.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>{selectedApp.name} {selectedApp.lastName}</div>
                        <div style={{ fontSize: "14px", color: MUTED, marginTop: "4px" }}>{selectedApp.currentTitle || "Ingen titel"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: scoreColor(matchScore(selectedApp)) }}>Match: {matchScore(selectedApp)}%</span>
                          <span style={{ padding: "3px 10px", borderRadius: "999px", background: STATUS_CONFIG[selectedApp.status].bg, color: STATUS_CONFIG[selectedApp.status].color, fontSize: "12px", fontWeight: 700 }}>
                            {STATUS_CONFIG[selectedApp.status].label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[
                        { label: "E-mail", value: selectedApp.email },
                        { label: "Telefon", value: selectedApp.phone },
                        { label: "Adresse", value: selectedApp.address },
                        { label: "Anciennitet", value: selectedApp.experience },
                        { label: "Lønretning", value: selectedApp.salary },
                        { label: "Pendling", value: selectedApp.distance },
                        { label: "LinkedIn", value: selectedApp.linkedin },
                      ].filter((f) => f.value).map(({ label, value }) => (
                        <div key={label} style={{ background: PAGE_BG, borderRadius: "10px", padding: "12px 14px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: "3px" }}>{label}</div>
                          <div style={{ fontSize: "14px", color: TEXT, fontWeight: 600 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Faglig profil */}
                  {selectedApp.profiles.length > 0 && (
                    <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "12px" }}>Faglig profil</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {selectedApp.profiles.map((p) => (
                          <span key={p} style={{ padding: "5px 12px", borderRadius: "999px", background: CURRY_BG, border: `1px solid ${CURRY_BORDER}`, fontSize: "13px", fontWeight: 600, color: CURRY }}>{p}</span>
                        ))}
                        {selectedApp.profileOtherTitle && (
                          <span style={{ padding: "5px 12px", borderRadius: "999px", background: PAGE_BG, fontSize: "13px", color: TEXT }}>{selectedApp.profileOtherTitle}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Noter */}
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "12px" }}>Recruiter-noter</div>
                    <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Skriv dine noter om kandidaten her..."
                      style={{ width: "100%", minHeight: "100px", padding: "12px 14px", borderRadius: "10px", border: `1px solid ${BORDER}`, fontSize: "14px", color: TEXT, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", outline: "none", background: PAGE_BG }} />
                    <button onClick={() => saveNote(selectedApp.id)}
                      style={{ marginTop: "10px", padding: "10px 20px", borderRadius: "10px", border: "none", background: ACCENT, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                      Gem noter
                    </button>
                  </div>
                </div>

                {/* Side panel */}
                <div style={{ display: "grid", gap: "12px" }}>
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: "12px" }}>Opdater status</div>
                    <div style={{ display: "grid", gap: "6px" }}>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => updateStatus(selectedApp.id, key as StatusKey)}
                          style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${selectedApp.status === key ? cfg.color : BORDER}`, background: selectedApp.status === key ? cfg.bg : WHITE, color: selectedApp.status === key ? cfg.color : MUTED, fontSize: "13px", fontWeight: 700, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "8px" }}>
                          {selectedApp.status === key && <span>✓</span>}
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteApp(selectedApp.id)}
                    style={{ padding: "12px", borderRadius: "12px", border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                    Slet kandidat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ANSØGNINGER ── */}
          {nav === "ansogninger" && (
            <div style={{ display: "grid", gap: "12px", maxWidth: "800px" }}>
              {applications.length === 0 ? (
                <div style={{ background: WHITE, borderRadius: "16px", padding: "60px 24px", textAlign: "center", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT, marginBottom: "8px" }}>Ingen ansøgninger endnu</div>
                  <div style={{ fontSize: "14px", color: MUTED }}>Ansøgninger vises her automatisk når kandidater udfylder formularen på hjemmesiden.</div>
                </div>
              ) : [...applications].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((app) => {
                const cfg = STATUS_CONFIG[app.status];
                const score = matchScore(app);
                return (
                  <div key={app.id} onClick={() => { setNav("kandidater"); setSelectedApp(app); setNoteInput(app.notes || ""); }}
                    style={{ background: WHITE, borderRadius: "14px", padding: "18px 22px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 6px rgba(10,22,40,0.04)", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: 700, color: ACCENT, flexShrink: 0 }}>
                      {(app.name || app.email || "?")?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: TEXT }}>
                        {app.name ? `${app.name} ${app.lastName}`.trim() : app.email || "Ukendt ansøger"}
                      </div>
                      <div style={{ fontSize: "13px", color: MUTED, marginTop: "2px" }}>
                        {(app as any).jobTitle || app.currentTitle || "Ingen stilling"}{app.email ? ` · ${app.email}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                      <span style={{ padding: "3px 12px", borderRadius: "999px", background: cfg.bg, color: cfg.color, fontSize: "12px", fontWeight: 700 }}>{cfg.label}</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: scoreColor(score) }}>{score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STILLINGER ── */}
          {nav === "stillinger" && (
            <div style={{ display: "grid", gap: "14px", maxWidth: "800px" }}>
              {showJobForm && (
                <div style={{ background: WHITE, borderRadius: "16px", padding: "26px", border: `1.5px solid ${ACCENT}33`, boxShadow: "0 4px 16px rgba(10,22,40,0.07)" }}>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT, marginBottom: "20px" }}>{editingJob ? "Rediger jobopslag" : "Opret nyt jobopslag"}</div>
                  <div style={{ display: "grid", gap: "16px" }}>

                    {/* Jobtitel + hurtigvalg */}
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input placeholder="Vælg titel..." value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} className="bt-input" style={{ ...fInput, flex: 1 }} />
                        <button type="button" onClick={() => setShowTitleSuggestions(!showTitleSuggestions)}
                          style={{ padding: "12px 14px", borderRadius: "10px", border: `1px solid ${BORDER}`, background: showTitleSuggestions ? "#EFF6FF" : WHITE, color: showTitleSuggestions ? ACCENT : MUTED, cursor: "pointer", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}>
                          Vælg titel {showTitleSuggestions ? "▲" : "▼"}
                        </button>
                      </div>
                      {showTitleSuggestions && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "12px", borderRadius: "10px", border: `1px solid ${BORDER}`, background: PAGE_BG }}>
                          {["Projektleder", "Byggeleder", "Entrepriseleder", "Formand", "Ingeniør (Bygning)", "Ingeniør (Anlæg)", "Konstruktionsingeniør", "Arkitekt", "Bygningskonstruktør", "BIM-koordinator", "Tilbudskalkulator", "Arbejdsmiljøkoordinator", "Driftsleder", "Site Manager", "Tømrer", "Murer", "VVS-montør", "El-installatør", "Maler", "Stilladsbygger", "Maskinfører", "Betonstøber"].map((t) => (
                            <button key={t} type="button" onClick={() => { setJobForm({ ...jobForm, title: t }); setShowTitleSuggestions(false); }}
                              style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${jobForm.title === t ? ACCENT : BORDER}`, background: jobForm.title === t ? "#EFF6FF" : WHITE, color: jobForm.title === t ? ACCENT : TEXT, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* By + hurtigvalg */}
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input placeholder="Vælg by..." value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="bt-input" style={{ ...fInput, flex: 1 }} />
                        <button type="button" onClick={() => setShowCitySuggestions(!showCitySuggestions)}
                          style={{ padding: "12px 14px", borderRadius: "10px", border: `1px solid ${BORDER}`, background: showCitySuggestions ? "#EFF6FF" : WHITE, color: showCitySuggestions ? ACCENT : MUTED, cursor: "pointer", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}>
                          Vælg by {showCitySuggestions ? "▲" : "▼"}
                        </button>
                      </div>
                      {showCitySuggestions && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "14px", borderRadius: "10px", border: `1px solid ${BORDER}`, background: PAGE_BG }}>
                          {[
                            "København", "Østerbro", "Nørrebro", "Vesterbro", "Amager", "Valby", "Vanløse", "Brønshøj", "Frederiksberg",
                            "Gladsaxe", "Hvidovre", "Rødovre", "Ballerup", "Taastrup", "Lyngby", "Gentofte", "Hellerup",
                            "Aarhus", "Risskov", "Brabrand", "Viby J", "Odense", "Aalborg", "Esbjerg", "Randers",
                            "Kolding", "Horsens", "Vejle", "Silkeborg", "Næstved", "Fredericia", "Viborg", "Herning",
                            "Helsingør", "Hillerød", "Holstebro", "Slagelse", "Køge", "Roskilde", "Frederikshavn",
                            "Sønderborg", "Svendborg", "Holbæk", "Greve", "Kalundborg", "Ringsted", "Hjørring",
                            "Ikast", "Skive", "Thisted", "Nyborg", "Middelfart", "Assens", "Faaborg",
                            "Vordingborg", "Nykøbing F", "Nakskov", "Rønne", "Bornholm"
                          ].map((by) => (
                            <button key={by} type="button" onClick={() => { setJobForm({ ...jobForm, location: by }); setShowCitySuggestions(false); }}
                              style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${jobForm.location === by ? ACCENT : BORDER}`, background: jobForm.location === by ? "#EFF6FF" : WHITE, color: jobForm.location === by ? ACCENT : TEXT, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                              {by}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Region + Ansættelsestype */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <select value={jobForm.region} onChange={(e) => setJobForm({ ...jobForm, region: e.target.value })} style={{ ...fInput, color: jobForm.region ? "#0A1628" : "#9AA3AF" }}>
                        <option value="" disabled>Vælg region...</option>
                        {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })} style={{ ...fInput, color: jobForm.type ? "#0A1628" : "#9AA3AF" }}>
                        <option value="" disabled>Vælg ansættelsestype...</option>
                        <option>Fastansættelse</option>
                        <option>Projektansættelse</option>
                        <option>Freelance</option>
                        <option>Praktik</option>
                      </select>
                    </div>

                    {/* ── Beskrivelse-editor med toolbar ── */}
                    <div style={{ border: "1px solid rgba(10,22,40,0.13)", borderRadius: "10px", overflow: "hidden" }}>

                      {/* ── Toolbar (Word-stil) ── */}
                      <div style={{ background: "#F0F2F5", borderBottom: "1px solid rgba(10,22,40,0.10)" }}>

                        {/* Række 1: Fortryd · Skrifttype · Størrelse */}
                        <div style={{ display: "flex", gap: "4px", padding: "6px 10px 4px", flexWrap: "wrap", alignItems: "center" }}>
                          {/* Fortryd / Gentag */}
                          <button type="button" title="Fortryd" onMouseDown={(e) => { e.preventDefault(); document.execCommand("undo"); syncEditorToState(); }} style={tbBtn}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                          </button>
                          <button type="button" title="Gentag" onMouseDown={(e) => { e.preventDefault(); document.execCommand("redo"); syncEditorToState(); }} style={tbBtn}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
                          </button>

                          <div style={{ width: "1px", height: "20px", background: "rgba(10,22,40,0.15)", margin: "0 4px" }} />

                          {/* Skrifttype */}
                          <select onMouseDown={saveSelection} onChange={(e) => { applyFontFamily(e.target.value); e.target.selectedIndex = 0; }}
                            style={{ padding: "4px 6px", borderRadius: "6px", border: `1px solid ${BORDER}`, background: WHITE, color: TEXT, fontSize: "13px", cursor: "pointer", outline: "none", maxWidth: "140px" }}>
                            <option value="">Skrifttype</option>
                            {["Arial", "Georgia", "Times New Roman", "Calibri", "Verdana", "Helvetica", "Courier New", "Trebuchet MS"].map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>

                          {/* Skriftstørrelse */}
                          <select onMouseDown={saveSelection} onChange={(e) => { applyFontSize(e.target.value); e.target.selectedIndex = 0; }}
                            style={{ padding: "4px 6px", borderRadius: "6px", border: `1px solid ${BORDER}`, background: WHITE, color: TEXT, fontSize: "13px", cursor: "pointer", outline: "none", width: "68px" }}>
                            <option value="">12</option>
                            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 36, 48, 72].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <div style={{ flex: 1 }} />

                          {/* ✨ AI-knap */}
                          <button type="button" onClick={generateAIText} disabled={!jobForm.title || aiGenerating}
                            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", border: "none", background: jobForm.title && !aiGenerating ? "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)" : "#C4C8D0", color: WHITE, fontSize: "13px", fontWeight: 700, cursor: jobForm.title && !aiGenerating ? "pointer" : "not-allowed", whiteSpace: "nowrap", boxShadow: jobForm.title && !aiGenerating ? "0 2px 8px rgba(124,58,237,0.30)" : "none" }}>
                            {aiGenerating ? "✨ Genererer..." : "✨ Anvend AI"}
                          </button>
                        </div>

                        {/* Række 2: Formatering (præcis som Word's Hjem-fane) */}
                        <div style={{ display: "flex", gap: "2px", padding: "0 10px 7px", flexWrap: "wrap", alignItems: "center" }}>
                          {/* Fed */}
                          <button type="button" title="Fed" onMouseDown={(e) => { e.preventDefault(); execFormat("bold"); }}
                            style={{ ...tbBtn, fontWeight: 800, fontFamily: "Georgia, serif", fontSize: "15px", minWidth: "30px" }}>F</button>
                          {/* Kursiv */}
                          <button type="button" title="Kursiv" onMouseDown={(e) => { e.preventDefault(); execFormat("italic"); }}
                            style={{ ...tbBtn, fontStyle: "italic", fontFamily: "Georgia, serif", fontSize: "15px", minWidth: "30px" }}>K</button>
                          {/* Understreget */}
                          <button type="button" title="Understreget" onMouseDown={(e) => { e.preventDefault(); execFormat("underline"); }}
                            style={{ ...tbBtn, textDecoration: "underline", fontSize: "15px", minWidth: "30px" }}>U</button>
                          {/* Gennemstreget */}
                          <button type="button" title="Gennemstreget" onMouseDown={(e) => { e.preventDefault(); execFormat("strikeThrough"); }}
                            style={{ ...tbBtn, textDecoration: "line-through", fontSize: "13px", minWidth: "30px" }}>ab</button>

                          <div style={{ width: "1px", height: "20px", background: "rgba(10,22,40,0.15)", margin: "0 4px" }} />

                          {/* Hævet skrift */}
                          <button type="button" title="Hævet skrift" onMouseDown={(e) => { e.preventDefault(); execFormat("superscript"); }}
                            style={{ ...tbBtn, fontSize: "12px", minWidth: "30px" }}>x²</button>
                          {/* Sænket skrift */}
                          <button type="button" title="Sænket skrift" onMouseDown={(e) => { e.preventDefault(); execFormat("subscript"); }}
                            style={{ ...tbBtn, fontSize: "12px", minWidth: "30px" }}>x₂</button>

                          <div style={{ width: "1px", height: "20px", background: "rgba(10,22,40,0.15)", margin: "0 4px" }} />

                          {/* Punktliste */}
                          <button type="button" title="Punktliste" onMouseDown={(e) => { e.preventDefault(); execFormat("insertUnorderedList"); }}
                            style={tbBtn}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
                          </button>
                          {/* Nummereret liste */}
                          <button type="button" title="Nummereret liste" onMouseDown={(e) => { e.preventDefault(); execFormat("insertOrderedList"); }}
                            style={tbBtn}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" strokeLinejoin="round"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                          </button>

                          <div style={{ width: "1px", height: "20px", background: "rgba(10,22,40,0.15)", margin: "0 4px" }} />

                          {/* Justering */}
                          <button type="button" title="Venstrestillet" onMouseDown={(e) => { e.preventDefault(); execFormat("justifyLeft"); }} style={tbBtn}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
                          </button>
                          <button type="button" title="Centreret" onMouseDown={(e) => { e.preventDefault(); execFormat("justifyCenter"); }} style={tbBtn}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                          </button>
                          <button type="button" title="Højrestillet" onMouseDown={(e) => { e.preventDefault(); execFormat("justifyRight"); }} style={tbBtn}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
                          </button>
                          <button type="button" title="Lige margener" onMouseDown={(e) => { e.preventDefault(); execFormat("justifyFull"); }} style={tbBtn}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                          </button>
                        </div>
                      </div>

                      {/* ── ContentEditable editor (ukontrolleret af React) ── */}
                      {/* Stil til HTML-indhold i editoren */}
                      <style>{`
                        .bt-editor h2{font-size:15px;font-weight:700;margin:14px 0 5px;color:#0A1628}
                        .bt-editor h3{font-size:14px;font-weight:700;margin:10px 0 4px;color:#0A1628}
                        .bt-editor p{margin:0 0 8px;font-size:14px}
                        .bt-editor ul,.bt-editor ol{padding-left:20px;margin:4px 0 10px}
                        .bt-editor li{margin:3px 0;font-size:14px}
                        .bt-editor:empty::before{content:attr(data-placeholder);color:#A0A8B4;font-style:italic;pointer-events:none}
                        .bt-input::placeholder{color:#9AA3AF;opacity:1}
                      `}</style>
                      <div
                        ref={descRef}
                        contentEditable
                        suppressContentEditableWarning
                        className="bt-editor"
                        data-placeholder={jobForm.title ? `Beskriv ${jobForm.title}-stillingen — eller tryk ✨ Anvend AI for et udkast...` : "Udfyld jobtitel øverst og tryk ✨ Anvend AI for hjælp..."}
                        onInput={syncEditorToState}
                        style={{
                          minHeight: "220px", padding: "16px", background: WHITE,
                          color: TEXT, fontSize: "14px", lineHeight: 1.75,
                          outline: "none", cursor: "text", fontFamily: "inherit",
                        }}
                      />
                      {aiGenerating && (
                        <div style={{ padding: "8px 16px", background: "#F5F3FF", fontSize: "12px", color: "#7C3AED", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                          ✨ AI skriver dit opslag baseret på {jobForm.title}{jobForm.location ? ` i ${jobForm.location}` : ""}...
                        </div>
                      )}
                    </div>

                    {/* Jobportaler */}
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "10px" }}>Del på jobportaler</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {PORTALS.map((p) => {
                          const active = jobForm.portals.includes(p.key);
                          return (
                            <button key={p.key} type="button" onClick={() => togglePortal(p.key)}
                              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", borderRadius: "10px", border: `1.5px solid ${active ? p.color : BORDER}`, background: active ? `${p.color}12` : WHITE, color: active ? p.color : MUTED, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                              {active && <span>✓</span>}
                              {p.label}
                              {p.key === "byggejob" && <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "999px", background: "#F5A62322", color: "#F5A623", fontWeight: 700 }}>Branche</span>}
                            </button>
                          );
                        })}
                      </div>
                      {jobForm.portals.length > 0 && (
                        <div style={{ marginTop: "10px", fontSize: "12px", color: MUTED }}>
                          Klik på portalens link efter du har gemt for at oprette opslaget der direkte.
                        </div>
                      )}
                    </div>
                    {/* Status indikator */}
                    <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: "13px", color: "#92400E", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📝</span> Opslaget gemmes som <strong>kladde</strong> og er ikke synligt for kandidater — tryk "Publiser nu" for at gøre det live.
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => saveJob(false)} disabled={!jobForm.title}
                        style={{ flex: 1, padding: "13px", borderRadius: "10px", border: `1.5px solid ${jobForm.title ? BORDER : "#E5E7EB"}`, background: WHITE, color: jobForm.title ? TEXT : MUTED, fontSize: "14px", fontWeight: 700, cursor: jobForm.title ? "pointer" : "not-allowed" }}>
                        💾 Gem kladde
                      </button>
                      <button onClick={() => saveJob(true)} disabled={!jobForm.title}
                        style={{ flex: 1, padding: "13px", borderRadius: "10px", border: "none", background: jobForm.title ? "#059669" : "#D4CCBC", color: WHITE, fontSize: "14px", fontWeight: 700, cursor: jobForm.title ? "pointer" : "not-allowed" }}>
                        🚀 Publiser nu
                      </button>
                      <button onClick={() => { setShowJobForm(false); setEditingJob(null); }}
                        style={{ padding: "13px 16px", borderRadius: "10px", border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                        Annuller
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {jobs.length === 0 && !showJobForm ? (
                <div style={{ background: WHITE, borderRadius: "16px", padding: "60px 24px", textAlign: "center", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📌</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT, marginBottom: "8px" }}>Ingen jobopslag endnu</div>
                  <div style={{ fontSize: "14px", color: MUTED }}>Klik "Nyt Jobopslag" for at oprette dit første opslag.</div>
                </div>
              ) : jobs.map((job) => (
                <div key={job.id} style={{ background: WHITE, borderRadius: "14px", padding: "22px 24px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 6px rgba(10,22,40,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT }}>{job.title}</div>
                        <span style={{ padding: "3px 10px", borderRadius: "999px", background: job.active ? "#ECFDF5" : PAGE_BG, color: job.active ? "#059669" : MUTED, fontSize: "11px", fontWeight: 700 }}>
                          {job.active ? "● Aktiv" : "○ Inaktiv"}
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", color: MUTED, display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                        {job.location && <span>📍 {job.location}</span>}
                        {job.region && <span>🗺 {job.region}</span>}
                        <span>🏷 {job.type}</span>
                        <span>📅 {new Date(job.createdAt).toLocaleDateString("da-DK")}</span>
                      </div>
                      {job.portals?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {job.portals.map((key) => {
                            const portal = PORTALS.find((p) => p.key === key);
                            if (!portal) return null;
                            return (
                              <a key={key} href={portal.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "8px", background: `${portal.color}12`, border: `1px solid ${portal.color}33`, color: portal.color, fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
                                {portal.label} ↗
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      {/* Publiser / Afpubliser toggle */}
                      <button onClick={() => toggleJobActive(job.id)}
                        style={{ padding: "8px 16px", borderRadius: "8px", border: `1.5px solid ${job.active ? "#059669" : "#D97706"}`, background: job.active ? "#ECFDF5" : "#FFFBEB", color: job.active ? "#059669" : "#D97706", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        {job.active ? "✓ Publiseret" : "🚀 Publiser"}
                      </button>
                      <button onClick={() => { setEditingJob(job); setJobForm({ title: job.title, location: job.location, region: job.region || "Hele Danmark", type: job.type, description: job.description, active: job.active, portals: job.portals || [] }); setShowJobForm(true); }}
                        style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: PAGE_BG, color: TEXT, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Rediger</button>
                      <button onClick={() => deleteJob(job.id)}
                        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Slet</button>
                    </div>
                  </div>
                  {job.description && (
                    <div dangerouslySetInnerHTML={{ __html: job.description }}
                      style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7, borderTop: `1px solid ${BORDER}`, paddingTop: "14px", marginTop: "14px" }} />
                  )}
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

const fInput: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "10px",
  border: "1px solid rgba(10,22,40,0.13)", background: "#F8F9FA",
  color: "#0A1628", fontSize: "14px", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};

// ─── AI Jobopslag-skabelon ────────────────────────────────────────────────────
function buildJobTemplate(title: string, type: string, location: string, region: string): string {
  const t = title.toLowerCase();
  const sted = location || region || "Danmark";
  const li = (items: string[]) => `<ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
  const h2 = (txt: string) => `<h2>${txt}</h2>`;

  // ── Projektleder ──
  if (t.includes("projektleder") || t.includes("entrepriseleder") || t.includes("site manager")) return `
<p>Vi søger en <strong>${title}</strong> til ${sted}. Du får det overordnede ansvar for projekter fra opstart til aflevering og er bindeledet mellem bygherre, rådgivere og underentreprenører.</p>
${h2("Dine opgaver")}${li([
  "Planlæg og styr projekter — tid, økonomi og kvalitet",
  "Koordiner underentreprenører og leverandører",
  "Bygherre-kontakt og løbende rapportering",
  "Kontrakter, entreprisejura og risikovurdering",
])}
${h2("Du har")}${li([
  "Erfaring som projektleder i bygge- og anlæg",
  "Godt overblik og stærk kommunikation",
  "Kendskab til entrepriseret — gerne BIM",
])}
${h2("Vi tilbyder")}
<p>${type} i ${sted} med konkurrencedygtig løn, faglig sparring og frihed under ansvar. Stillingen formidles via ByggeTalent.</p>`.trim();

  // ── Byggeleder / Formand ──
  if (t.includes("byggeleder") || t.includes("formand") || t.includes("driftsleder")) return `
<p>Vi søger en erfaren <strong>${title}</strong> til at styre den daglige drift på byggepladsen i ${sted}. Du holder styr på fremdrift, kvalitet og sikkerhed og er den naturlige leder for svende og underentreprenører.</p>
${h2("Dine opgaver")}${li([
  "Led og koordiner svende, lærlinge og underentreprenører",
  "Sikr fremdrift og kvalitet efter tidsplan",
  "Daglig kontakt med projektleder og bygherre",
  "Håndhæv arbejdsmiljøregler på pladsen",
])}
${h2("Du har")}${li([
  "Erfaring som byggeleder eller formand",
  "Naturlig autoritet og god til at motivere",
  "Styr på sikkerhed og arbejdsmiljø",
])}
${h2("Vi tilbyder")}
<p>${type} med god løn og varierede projekter i ${sted}. Stillingen formidles via ByggeTalent.</p>`.trim();

  // ── Ingeniør / BIM ──
  if (t.includes("ingeniør") || t.includes("konstruktions") || t.includes("bim")) return `
<p>Vi søger en <strong>${title}</strong> til teknisk projektering og rådgivning i ${sted}. Du indgår i et stærkt fagteam og har en central rolle i at sikre, at vores projekter holder mål på funktion, sikkerhed og bæredygtighed.</p>
${h2("Dine opgaver")}${li([
  "Projektering, beregning og dokumentation",
  "Tegninger og tekniske beskrivelser",
  "Samarbejde med arkitekter, projektledere og myndigheder",
  "Kvalitetssikring og myndighedsbehandling",
])}
${h2("Du har")}${li([
  "Relevant ingeniøruddannelse",
  "Erfaring fra bygge- og anlægsprojekter",
  "Kendskab til Revit, AutoCAD eller tilsvarende",
])}
${h2("Vi tilbyder")}
<p>${type} i ${sted} med faglig sparring, fleksibilitet og gode vilkår. Stillingen formidles via ByggeTalent.</p>`.trim();

  // ── Arkitekt / Konstruktør ──
  if (t.includes("arkitekt") || t.includes("konstruktør") || t.includes("tegner")) return `
<p>Vi søger en <strong>${title}</strong> der brænder for god arkitektur og praktisk byggeri i ${sted}. Du arbejder med projekter fra skitse til udførelse og er med til at sætte det visuelle og funktionelle fingeraftryk.</p>
${h2("Dine opgaver")}${li([
  "Design og projektering fra skitse til myndighedsprojekt",
  "Tegninger, visualiseringer og beskrivelser",
  "Koordinering med ingeniører, bygherre og myndigheder",
  "Tilsyn og opfølgning på byggepladsen",
])}
${h2("Du har")}${li([
  "Uddannelse som arkitekt, konstruktør eller tilsvarende",
  "Godt håndlag med ArchiCAD, Revit eller AutoCAD",
  "Sans for detaljer og godt øje for kvalitet",
])}
${h2("Vi tilbyder")}
<p>${type} på projekter med høj ambition i ${sted}. Stillingen formidles via ByggeTalent.</p>`.trim();

  // ── Håndværk (tømrer/murer/VVS/el/maler) ──
  if (t.includes("tømrer") || t.includes("snedker") || t.includes("murer") ||
      t.includes("vvs") || t.includes("maler") || t.includes("el-") ||
      t.includes("elektriker") || t.includes("installatør") || t.includes("blikkenslager")) return `
<p>Vi søger en dygtig <strong>${title}</strong> til opgaver i ${sted}. Du er fagligt stærk, selvstændig og mødestabil — og du sætter en ære i at levere ordentligt arbejde.</p>
${h2("Dine opgaver")}${li([
  `Faglig udførelse som ${title} på projekter i ${sted}`,
  "Samarbejde med formand og øvrige håndværkere",
  "Arbejde efter tegninger, beskrivelser og tidsplan",
  "Overholde sikkerhedsregler på pladsen",
])}
${h2("Du har")}${li([
  "Faglig uddannelse — gerne svendebrev",
  "Erfaring fra relevante opgaver",
  "Kørekort B og mødestabilitet",
])}
${h2("Vi tilbyder")}
<p>${type} med konkurrencedygtig løn og gode kolleger i ${sted}. Stillingen formidles via ByggeTalent.</p>`.trim();

  // ── Kalkulator ──
  if (t.includes("kalkul") || t.includes("tilbud")) return `
<p>Vi søger en <strong>${title}</strong> til at udarbejde præcise og konkurrencedygtige tilbud på bygge- og anlægsopgaver i ${sted}. Du spiller en nøglerolle i at vinde de rigtige projekter til de rigtige priser.</p>
${h2("Dine opgaver")}${li([
  "Tilbudsudarbejdelse og prisskøn",
  "Gennemgang af udbudsmateriale og identifikation af risici",
  "Indhentning af priser fra leverandører og UE'er",
  "Samarbejde med projektledere og ledelse",
])}
${h2("Du har")}${li([
  "Solid kalkulationserfaring fra bygge- og anlæg",
  "Godt kendskab til materialer og markedspriser",
  "Analytisk og detaljeorienteret tilgang",
])}
${h2("Vi tilbyder")}
<p>${type} med attraktiv løn og en central rolle i ${sted}. Stillingen formidles via ByggeTalent.</p>`.trim();

  // ── Generisk fallback ──
  return `
<p>Vi søger en <strong>${title}</strong> til ${type.toLowerCase()} i ${sted}.</p>
${h2("Dine opgaver")}${li([
  "Beskriv de 3-4 vigtigste arbejdsopgaver her",
  "Hvad skal personen konkret gøre hver dag?",
  "Hvilke projekter/kunder er involveret?",
])}
${h2("Du har")}${li([
  "Hvilken uddannelse eller erfaring kræves?",
  "Hvilke personlige egenskaber er vigtige?",
  "Er der specifikke værktøjer eller systemer?",
])}
${h2("Vi tilbyder")}
<p>${type} i ${sted} med [lønniveau], [særlige fordele] og et stærkt fagligt miljø. Stillingen formidles via ByggeTalent.</p>`.trim();
}
