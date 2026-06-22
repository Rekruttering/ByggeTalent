"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { supabase } from "../lib/supabase";
import { groupedRoles, groupNames, altQuestionsDB, type AltQuestion } from "./data";

// ─── Design tokens ────────────────────────────────────────────────────────────
const CURRY = "#C4A03A";          // Varm rav-guld (som i mockup)
const GRANITE = "#8B9099";        // Granitgrå til "Talent"
const CURRY_BG = "#FBF7EC";
const CURRY_BORDER = "rgba(196,160,58,0.25)";
const NAVY = "#0A1628";
const NAVY_MED = "#152338";
const PAGE_BG = "#F0ECE5";
const WHITE = "#FFFFFF";
const TEXT = "#0A1628";
const MUTED = "#6B7A8A";
const BORDER = "rgba(10,22,40,0.09)";

type FormState = {
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
  opportunities: string[];
  consent: boolean;
  gdpr: boolean;
};

type AccordionGroupState = Record<string, boolean>;

export default function Home() {
  const [step, setStep] = useState(0);
  const [altPhase, setAltPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [altActiveQuestions, setAltActiveQuestions] = useState<AltQuestion[]>([]);
  const [altCurrentQ, setAltCurrentQ] = useState(0);
  const [altAnswers, setAltAnswers] = useState<{ cat: string; p: number }[]>([]);
  const [selectedUniverse, setSelectedUniverse] = useState("Kandidat");
  const [detailPage, setDetailPage] = useState<string | null>(null);
  const [virksomhedView, setVirksomhedView] = useState<null | "data" | "jobmatch" | "samtale">(null);
  const [virksomhedTab, setVirksomhedTab] = useState<"Nyheder" | "Rekruttering" | "Onboarding">("Nyheder");

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const [altRole, setAltRole] = useState<"Nyuddannet" | "Fagspecialist" | "Leder" | null>(null);

  const ALT_CATEGORIES = [
    { key: "Kultur & Tone",     color: "#C4A03A" },
    { key: "Hold & Ressourcer", color: "#2563EB" },
    { key: "Ansvar & Mandat",   color: "#6A9060" },
    { key: "Trivsel",           color: "#6E7580" },
  ] as const;

  const ALT_LEVEL_LABELS = ["Meget lavt", "Lavt", "Middel", "Højt", "Meget højt"] as const;

  const ALT_LEVEL_DESC: Record<string, string[]> = {
    "Kultur & Tone": [
      "Der er tydelige tegn på utryghed og dårlig kommunikation i dit team.",
      "Kulturen i dit team har udfordringer der påvirker samarbejdet.",
      "Kulturen fungerer, men der er plads til forbedring i tone og tryghed.",
      "Du oplever en åben kultur med gensidig respekt og god kommunikation.",
      "Du befinder dig i et stærkt arbejdsmiljø med høj psykologisk tryghed.",
    ],
    "Hold & Ressourcer": [
      "Der mangler kritiske ressourcer og klarhed om opgaverne i dit team.",
      "Teamets ressourcer og kompetencer matcher ikke fuldt ud opgaverne.",
      "Ressourcerne er nogenlunde til stede, men der er synlige gaps.",
      "Dit team er godt udstyret med kompetencer og klar ansvarsfordeling.",
      "Dit team har stærke ressourcer og høj klarhed om leverancer og roller.",
    ],
    "Ansvar & Mandat": [
      "Der er stor ubalance mellem dit ansvar og din beslutningskraft.",
      "Du mangler mandat til at løse dine opgaver optimalt.",
      "Mandatet er delvist til stede, men ikke altid tilstrækkeligt.",
      "Du har god klarhed om dit ansvar og tilstrækkelig beslutningskraft.",
      "Du har fuldt mandat, klar rollefordeling og stærk handlekraft.",
    ],
    "Trivsel": [
      "Din trivsel er under pres — der er tydelige tegn på belastning.",
      "Du oplever vedvarende pres der påvirker dit velvære og din energi.",
      "Din trivsel er stabil, men der er elementer der trækker ned.",
      "Du trives godt i dit arbejdsliv med et sundt energiniveau.",
      "Du har et stærkt fundament for trivsel og høj arbejdsglæde.",
    ],
  };

  function getAltLevel(percent: number, bench: number): 1 | 2 | 3 | 4 | 5 {
    const delta = percent - bench;
    if (delta <= -25) return 1;
    if (delta <= -10) return 2;
    if (delta <= 10)  return 3;
    if (delta <= 25)  return 4;
    return 5;
  }

  const ROLE_BENCHMARKS: Record<string, Record<string, number>> = {
    "Nyuddannet":    { "Kultur & Tone": 62, "Hold & Ressourcer": 55, "Ansvar & Mandat": 50, "Trivsel": 60 },
    "Fagspecialist": { "Kultur & Tone": 65, "Hold & Ressourcer": 65, "Ansvar & Mandat": 60, "Trivsel": 65 },
    "Leder":         { "Kultur & Tone": 68, "Hold & Ressourcer": 68, "Ansvar & Mandat": 70, "Trivsel": 65 },
  };

  const catScores = ALT_CATEGORIES.map(cat => {
    const catAnswers = altAnswers.filter(a => a.cat === cat.key);
    const avg = catAnswers.length > 0 ? catAnswers.reduce((s, a) => s + a.p, 0) / catAnswers.length : 0;
    const percent = catAnswers.length > 0 ? Math.round(((3 - avg) / 2) * 100) : 0;
    return { ...cat, percent, count: catAnswers.length };
  });

  const filledCats = catScores.filter(c => c.count > 0);
  const overallPct = filledCats.length > 0
    ? Math.round(filledCats.reduce((s, c) => s + c.percent, 0) / filledCats.length)
    : 0;
  const avgScore = filledCats.length > 0 ? (overallPct / 20).toFixed(1) : "–";
  const benchmark = altRole ? ROLE_BENCHMARKS[altRole] : null;

  function startAlt() {
    if (!altRole) return;
    const roleKey = altRole === "Leder" ? "leder" : altRole === "Fagspecialist" ? "medarbejder" : "nyuddannet";
    const questions = [...altQuestionsDB.common, ...altQuestionsDB[roleKey]];
    setAltActiveQuestions(questions);
    setAltCurrentQ(0);
    setAltAnswers([]);
    setAltPhase("quiz");
  }

  function answerAlt(cat: string, p: number) {
    const updated = [...altAnswers, { cat, p }];
    setAltAnswers(updated);
    if (altCurrentQ + 1 < altActiveQuestions.length) {
      setAltCurrentQ(altCurrentQ + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setAltPhase("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const [form, setForm] = useState<FormState>({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    currentTitle: "",
    experience: "",
    linkedin: "",
    salary: "",
    distance: "",
    supplementaryInfo: "",
    profiles: [],
    profileOtherTitle: "",
    opportunities: [],
    consent: false,
    gdpr: false,
  });

  const [step1SubPage, setStep1SubPage] = useState<null | 'profile' | 'consent' | 'privacy' | 'karina'>(null);
  const [step1Tab, setStep1Tab] = useState<"Karriere" | "Nyuddannede">("Karriere");
  const [claraMuted, setClaraMuted] = useState(true);
  const [claraChat, setClaraChat] = useState<null | { question: string; messages: { from: "user" | "clara"; text: string }[] }>(null);
  const [claraInput, setClaraInput] = useState("");
  const [claraLoading, setClaraLoading] = useState(false);

  async function sendToClara(userText: string, currentMessages: { from: "user" | "clara"; text: string }[]) {
    const updated = [...currentMessages, { from: "user" as const, text: userText }];
    setClaraChat((prev) => prev ? { ...prev, messages: updated } : null);
    setClaraLoading(true);
    try {
      const res = await fetch("/api/clara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setClaraChat((prev) => prev ? { ...prev, messages: [...updated, { from: "clara" as const, text: data.text }] } : null);
    } catch {
      setClaraChat((prev) => prev ? { ...prev, messages: [...updated, { from: "clara" as const, text: "Beklager, jeg kan ikke svare lige nu. Prøv igen om lidt." }] } : null);
    } finally {
      setClaraLoading(false);
    }
  }

  // ─── Jobs ───────────────────────────────────────────────────────────────────
  type JobPosting = { id: string; title: string; location: string; region: string; type: string; description: string; active: boolean };
  const [jobView, setJobView] = useState<null | 'list' | 'detail' | 'apply' | 'success'>(null);
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobForm, setJobForm] = useState({ name: "", email: "", phone: "", experience: "", skills: "", motivation: "" });
  const [jobCv, setJobCv] = useState<File | null>(null);
  const [jobSending, setJobSending] = useState(false);

  function openJobs() {
    const jobs: JobPosting[] = JSON.parse(localStorage.getItem("bt_jobs") || "[]");
    setAllJobs(jobs.filter((j) => j.active));
    setJobView("list");
  }

  async function submitJobApplication() {
    if (!selectedJob) return;
    setJobSending(true);
    const app = {
      name: jobForm.name.split(" ")[0] || jobForm.name,
      last_name: jobForm.name.split(" ").slice(1).join(" ") || "",
      email: jobForm.email, phone: jobForm.phone, address: "",
      current_title: "", linkedin: "", salary: "", distance: "",
      experience: jobForm.experience ? `${jobForm.experience} år` : "",
      supplementary_info: `${jobForm.motivation}${jobForm.skills ? `\n\nKompetencer: ${jobForm.skills}` : ""}`,
      profiles: jobForm.skills ? jobForm.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      profile_other_title: "",
      submitted_at: new Date().toISOString(),
      status: "ny", notes: "", job_id: selectedJob.id, job_title: selectedJob.title,
    };
    await supabase.from("applications").insert([app]);
    setJobSending(false);
    setJobView("success");
  }
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [showConsentInfo, setShowConsentInfo] = useState(false);
  const [showGdprInfo, setShowGdprInfo] = useState(false);
  const [openProfileGroups, setOpenProfileGroups] = useState<AccordionGroupState>(
    Object.fromEntries(groupNames.map((n) => [n, false]))
  );

  const update = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const toggleProfile = (value: string) => {
    const exists = form.profiles.includes(value);
    update("profiles", exists ? form.profiles.filter((v) => v !== value) : [...form.profiles, value]);
  };

  const toggleGroup = (group: string, groups: AccordionGroupState, setGroups: Dispatch<SetStateAction<AccordionGroupState>>) =>
    setGroups({ ...groups, [group]: !groups[group] });

  const navCards = [
    { key: "Kandidat", label: "Kandidat", sub: "Karrieresparring og ALT", bg: "#6E7580" },
    { key: "Virksomhed", label: "Virksomhed", sub: "Kandidatbase og projektsamtale", bg: "#6A9060" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ─── Step 0: Forside ──────────────────────────────────────────── */}
      {step === 0 && (
        <div className="bt-page">

          {detailPage ? (
            /* Detail view */
            <div style={{ padding: "8px 20px 40px" }}>
              {/* Skjules på Virksomhed (har sin egen header) og WorkforceShortage */}
              {detailPage !== "Virksomhed" && virksomhedView !== "data" && !virksomhedView && (
                <button
                  onClick={() => setDetailPage(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 700, color: CURRY, padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}
                >
                  ← Tilbage
                </button>
              )}

              {detailPage === "Nyuddannet" && (
                <div style={{ background: WHITE, borderRadius: "20px", padding: "24px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px rgba(10,22,40,0.07)", display: "grid", gap: "20px" }}>

                  {/* Profil */}
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundImage: "url('/images/Karina Maria - Founder.png')", backgroundSize: "cover", backgroundPosition: "center", border: `2px solid ${CURRY_BORDER}`, flexShrink: 0 }} />
                    <div>
                      <div style={labelSt}>Bag ByggeTalent</div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>Karina Maria Nyberg</div>
                      <div style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>Grundlægger · HR-leder · Ledelseskonsulent</div>
                    </div>
                  </div>

                  {/* Intro */}
                  <div style={{ fontSize: "15px", lineHeight: 1.75, color: TEXT }}>
                    ByggeTalent er skabt af én, der kender branchen indefra. Som tidligere HR-leder i bygge- og anlægssektoren har jeg siddet med rekruttering og onboarding — og set på tæt hold, hvordan de to hænger uløseligt sammen med god ledelse.
                  </div>

                  <div style={{ fontSize: "15px", lineHeight: 1.75, color: TEXT }}>
                    Som selvstændig ledelseskonsulent har jeg rådgivet virksomheder i netop det: at tiltrække de rigtige mennesker, tage godt imod dem og give dem de bedste forudsætninger for at lykkes. Ud af det arbejde er ALT-testen opstået — <strong>Adfærd, Ledelse og Trivsel</strong> — en test udviklet specifikt til bygge- og anlægsbranchen.
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: BORDER }} />

                  {/* 3 ydelser */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY, marginBottom: "12px" }}>Hvad vi tilbyder</div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {[
                        { nr: "01", titel: "Rekruttering", tekst: "Med brancheforståelse og netværk finder vi de profiler, der passer — ikke bare på papiret, men i praksis." },
                        { nr: "02", titel: "Projekt- og karrieresamtaler", tekst: "Sparring der giver retning — uanset om du er kandidat eller leder med et team i udvikling." },
                        { nr: "03", titel: "Fokus på nyuddannede (0–3 år)", tekst: "ByggeTalent har en dedikeret Hotline med Clara — vores AI-rådgiver — der besvarer op til 10 spørgsmål og henviser til mig, når behovet er der." },
                      ].map((y) => (
                        <div key={y.nr} style={{ display: "flex", gap: "14px", padding: "14px", background: CURRY_BG, borderRadius: "12px", border: `1px solid ${CURRY_BORDER}` }}>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: CURRY, letterSpacing: "0.08em", flexShrink: 0, paddingTop: "2px" }}>{y.nr}</div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "3px" }}>{y.titel}</div>
                            <div style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>{y.tekst}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: BORDER }} />

                  {/* AI */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY, marginBottom: "10px" }}>Bygget med AI</div>
                    <div style={{ fontSize: "14px", lineHeight: 1.75, color: MUTED }}>
                      Hele ByggeTalent-platformen er udviklet med AI. Vi bruger flere AI-modeller i vores daglige arbejde — fra rekrutteringsprocessen til karriererådgivning. AI transformerer HR fra at være primært administrativt til at blive strategisk og datadrevet: bedre kandidatmatch, mere præcis screening og proaktiv indsigt i trivsel og fastholdelse.
                    </div>
                  </div>

                  {/* Brancheudfordring */}
                  <div style={{ padding: "16px", background: "#0A162808", borderRadius: "12px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>Bygge- og anlæg: en branche under pres</div>
                    <div style={{ fontSize: "13px", color: MUTED, lineHeight: 1.7 }}>
                      Branchen er en af de sværeste at rekruttere i — og fremskrivningerne er klare: der kommer til at mangle mange faglærte og specialister de kommende år. Det er præcis dér, ByggeTalent gør en forskel.
                    </div>
                    <button
                      onClick={() => { setDetailPage("Virksomhed"); }}
                      style={{ marginTop: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: CURRY, padding: 0 }}>
                      Læs mere om arbejdskraftudfordringen →
                    </button>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {["HR · Rekruttering", "Onboarding", "Ledelse", "ALT-testen", "AI-drevet", "Bygge & Anlæg"].map((tag) => (
                      <div key={tag} style={{ padding: "5px 12px", borderRadius: "999px", background: CURRY_BG, color: CURRY, fontSize: "12px", fontWeight: 700 }}>{tag}</div>
                    ))}
                  </div>

                </div>
              )}

              {detailPage === "Kandidat" && (
                <div style={{ display: "grid", gap: "16px" }}>
                  {/* Hero */}
                  <div style={{ background: CURRY_BG, borderRadius: "20px", padding: "32px 24px", border: `1px solid ${CURRY_BORDER}`, textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: CURRY, marginBottom: "12px" }}>
                      ByggeTalent · Rekruttering
                    </div>
                    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "26px", fontWeight: 700, color: TEXT, lineHeight: 1.25, marginBottom: "12px" }}>
                      Vi bygger<br />fremtiden sammen
                    </div>
                    <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.65 }}>
                      Find dit næste skridt i bygge- og anlægsbranchen — vi matcher de rigtige mennesker med de rigtige projekter.
                    </div>
                  </div>

                  {/* Jobopslag */}
                  <JobListings />

                  {/* Karrieresparring */}
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={labelSt}>Karrieresparring</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT, margin: "8px 0 6px", fontFamily: "Georgia, serif" }}>Få en personlig samtale</div>
                    <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.65, marginBottom: "16px" }}>Tag ALT-testen og få en uforpligtende karrieresamtale med ByggeTalent.</div>
                    <button onClick={() => { setDetailPage(null); setStep(1); }}
                      style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                      Kom i gang →
                    </button>
                  </div>
                </div>
              )}

              {detailPage === "Virksomhed" && (
                <div className="bt-virksomhed">

                  {/* Header */}
                  <div style={{ background: PAGE_BG, padding: "20px 20px 0", textAlign: "center", position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                      <button onClick={() => setDetailPage(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: TEXT, padding: 0, lineHeight: 1 }}>←</button>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: CURRY }}>BYGGE & ANLÆG</div>
                        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "44px", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
                          <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
                        </div>
                        <div style={{ width: "36px", height: "1.5px", background: CURRY, margin: "6px auto 0" }} />
                        <div style={{ fontFamily: "Georgia, serif", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, marginTop: "4px" }}>REKRUTTERING MED BRANCHEFORSTÅELSE</div>
                      </div>
                      <div style={{ width: "28px" }} />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, background: PAGE_BG, position: "sticky", top: "94px", zIndex: 5 }}>
                    {(["Nyheder", "Rekruttering", "Onboarding"] as const).map((tab) => (
                      <button key={tab} onClick={() => setVirksomhedTab(tab)}
                        style={{ flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer",
                          fontSize: "14px", fontWeight: virksomhedTab === tab ? 700 : 400,
                          color: virksomhedTab === tab ? TEXT : MUTED,
                          borderBottom: virksomhedTab === tab ? `2px solid ${CURRY}` : "2px solid transparent",
                          marginBottom: "-1px" }}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* ── Nyheder ── */}
                  {virksomhedTab === "Nyheder" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

                      {virksomhedView !== "data" && (<>

                        {/* Hero video */}
                        <div style={{ position: "relative", background: NAVY }}>
                          <video autoPlay muted loop playsInline
                            className="bt-news-video"
                            style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}>
                            <source src="/Metrobyggetalent-news.mp4" type="video/mp4" />
                          </video>
                          {/* News badge */}
                          <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ background: "rgba(10,22,40,0.85)", borderRadius: "6px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: 700, color: WHITE }}>Bygge</span>
                              <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: 700, color: CURRY }}>Talent</span>
                              <span style={{ fontSize: "10px", fontWeight: 800, color: WHITE, background: "#6A9060", borderRadius: "3px", padding: "1px 5px", letterSpacing: "0.05em" }}>NEWS</span>
                            </div>
                            <div style={{ background: "#DC2626", borderRadius: "6px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: WHITE }} />
                              <span style={{ fontSize: "10px", fontWeight: 800, color: WHITE, letterSpacing: "0.05em" }}>LIVE</span>
                            </div>
                          </div>
                        </div>

                        {/* Breaking news bar */}
                        <div style={{ background: "#DC2626", padding: "8px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: WHITE, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>● BREAKING NEWS</span>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", letterSpacing: "0.06em" }}>AE-RÅDET 2024</span>
                        </div>

                        {/* Headline */}
                        <div style={{ padding: "16px 16px 0" }}>
                          <div style={{ fontSize: "36px", fontWeight: 800, color: TEXT, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>
                            <span style={{ color: CURRY }}>136.000</span>
                          </div>
                          <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT, lineHeight: 1.3, marginTop: "4px" }}>
                            manglende fagpersoner frem mod 2030
                          </div>
                        </div>

                        {/* Ticker */}
                        <div style={{ background: NAVY, padding: "8px 0", overflow: "hidden", marginTop: "12px" }}>
                          <div style={{ display: "flex", gap: "32px", padding: "0 16px", fontSize: "11px", color: "rgba(255,255,255,0.75)", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                            {["Bygge & anlæg", "Faglærte", "Ingeniører", "Specialister", "24.000 KVU mangler", "13.000 MVU mangler", "11 kritiske faggrupper", "Elektrikere", "Tømrere", "Murere"].map((t) => (
                              <span key={t}>· {t}</span>
                            ))}
                          </div>
                        </div>

                        {/* Info + knap */}
                        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ background: WHITE, borderRadius: "14px", padding: "16px", border: `1px solid ${BORDER}`, display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "18px", color: CURRY, flexShrink: 0 }}>ⓘ</span>
                            <div style={{ fontSize: "14px", color: TEXT, lineHeight: 1.65 }}>
                              Branchen er en af de sværeste at rekruttere i. Fremskrivningerne er klare — det er præcis dér ByggeTalent gør en forskel.
                            </div>
                          </div>
                          <button onClick={() => setVirksomhedView("data")}
                            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: NAVY, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <span>▦</span> Se alle arbejdskraftdata →
                          </button>
                        </div>

                      </>)}

                      {/* Arbejdskraftdata sub-view */}
                      {virksomhedView === "data" && (
                        <div style={{ padding: "0 16px 40px" }}>
                          <WorkforceShortage onExitToVirksomhed={() => setVirksomhedView(null)} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Rekruttering ── */}
                  {virksomhedTab === "Rekruttering" && (
                    <div style={{ padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ background: NAVY, borderRadius: "16px", padding: "24px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY, marginBottom: "10px" }}>Rekruttering</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 700, color: WHITE, lineHeight: 1.25, marginBottom: "10px" }}>Find de rigtige profiler til jeres næste projekt</div>
                        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>Vi matcher jer med kvalificerede kandidater fra vores netværk — screenet og klar til dialog.</div>
                      </div>
                      {[
                        { nr: "01", titel: "Behovsafklaring", tekst: "Vi starter med at forstå jeres projekt, kultur og de præcise kompetencer I søger." },
                        { nr: "02", titel: "Screening & match", tekst: "Vi søger i vores netværk og screener kandidater — I får kun de bedste matches." },
                        { nr: "03", titel: "Præsentation", tekst: "Vi præsenterer 2-3 kvalificerede profiler med ALT-test resultater og vores anbefaling." },
                      ].map((y) => (
                        <div key={y.nr} style={{ background: WHITE, borderRadius: "14px", padding: "16px", border: `1px solid ${BORDER}`, display: "flex", gap: "14px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: CURRY, letterSpacing: "0.08em", flexShrink: 0, paddingTop: "2px" }}>{y.nr}</div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "4px" }}>{y.titel}</div>
                            <div style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>{y.tekst}</div>
                          </div>
                        </div>
                      ))}
                      <a href="mailto:kontakt@byggetalent.dk?subject=Rekruttering"
                        style={{ display: "block", width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
                        Kontakt os om rekruttering →
                      </a>
                    </div>
                  )}

                  {/* ── Onboarding ── */}
                  {virksomhedTab === "Onboarding" && (
                    <div style={{ padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ background: NAVY, borderRadius: "16px", padding: "24px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY, marginBottom: "10px" }}>Onboarding</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 700, color: WHITE, lineHeight: 1.25, marginBottom: "10px" }}>Et godt start giver fastholdelse</div>
                        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>God onboarding er ikke bare de første uger — det er fundamentet for trivsel og præstation.</div>
                      </div>
                      {[
                        { nr: "01", titel: "ALT-test ved ansættelse", tekst: "Kortlæg den nye medarbejders adfærd, lederstil og trivselsbehov allerede fra dag ét." },
                        { nr: "02", titel: "Onboarding-plan", tekst: "Vi hjælper med at tilpasse oplæringsforløbet til den enkelte — ikke en one-size-fits-all plan." },
                        { nr: "03", titel: "90-dages opfølgning", tekst: "Vi tjekker ind efter 30, 60 og 90 dage for at sikre, at både medarbejder og leder er tilfredse." },
                      ].map((y) => (
                        <div key={y.nr} style={{ background: WHITE, borderRadius: "14px", padding: "16px", border: `1px solid ${BORDER}`, display: "flex", gap: "14px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: CURRY, letterSpacing: "0.08em", flexShrink: 0, paddingTop: "2px" }}>{y.nr}</div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "4px" }}>{y.titel}</div>
                            <div style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>{y.tekst}</div>
                          </div>
                        </div>
                      ))}
                      <a href="mailto:kontakt@byggetalent.dk?subject=Onboarding"
                        style={{ display: "block", width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
                        Hør mere om onboarding →
                      </a>
                    </div>
                  )}

                </div>
              )}
            </div>
          ) : (
            /* Hero + navigation */
            <div className="bt-home-content">

              {/* Logo */}
              <div style={{ textAlign: "center", paddingTop: "36px", display: "grid", gap: "10px" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: CURRY }}>
                  BYGGE & ANLÆG
                </div>
                <div>
                  <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "52px", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
                    <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
                  </div>
                  <div style={{ width: "48px", height: "1.5px", background: CURRY, margin: "10px auto 0" }} />
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "12px", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED }}>
                  REKRUTTERING MED BRANCHEFORSTÅELSE
                </div>
              </div>

              {/* Navigation kort — 2 brede stakkede */}
              <div className="bt-nav-cards">
                {navCards.map((card) => (
                  <button type="button" key={card.key}
                    onClick={() => card.key === "Kandidat" ? setStep(1) : setDetailPage(card.key)}
                    style={{ borderRadius: "12px", background: card.bg, border: "1px solid transparent", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", boxShadow: "0 2px 8px rgba(10,22,40,0.10)", cursor: "pointer", width: "100%", textAlign: "left" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: WHITE }}>{card.label}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "3px" }}>{card.sub}</div>
                    </div>
                    <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.75)", flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>

              {/* Hero video */}
              <div style={{ borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 4px 16px rgba(10,22,40,0.10)" }}>
                <video autoPlay muted loop playsInline className="bt-home-video"
                  style={{ width: "100%", display: "block" }}>
                  <source src="/byggetalent-home.mp4" type="video/mp4" />
                </video>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(10,22,40,0.55) 0%, transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: "16px", left: "16px", fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.70)", letterSpacing: "0.10em" }}>
                  ByggeTalent
                </div>
              </div>

              {/* Om ByggeTalent — featured kort */}
              <button type="button" onClick={() => setDetailPage("Nyuddannet")} style={{ width: "100%", background: NAVY, borderRadius: "16px", border: "none", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", textAlign: "left", boxShadow: "0 4px 16px rgba(10,22,40,0.18)" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundImage: "url('/images/Karina Maria - Founder.png')", backgroundSize: "cover", backgroundPosition: "center", border: `2px solid ${CURRY_BORDER}`, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY, marginBottom: "4px" }}>Rekruttering</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: WHITE, lineHeight: 1.2, marginBottom: "3px" }}>Om ByggeTalent</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>Hvem vi er, og hvad vi tilbyder.</div>
                </div>
                <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>→</span>
              </button>

              {/* Diskret admin-adgang */}
              <div style={{ textAlign: "center", paddingTop: "4px" }}>
                <a href="/admin" style={{ fontSize: "12px", color: MUTED, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  ⚙ Admin
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Step 1: Hub ──────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bt-page-full" style={{ background: PAGE_BG }}>

          {step1SubPage === null ? (
            /* ── Karriere / Nyuddannede tabs ── */
            <>
              {/* Header */}
              <div style={{ background: PAGE_BG, padding: "20px 20px 0", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <button onClick={() => setStep(0)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: TEXT, padding: 0, lineHeight: 1 }}>←</button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: CURRY }}>BYGGE & ANLÆG</div>
                    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "44px", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
                      <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
                    </div>
                    <div style={{ width: "36px", height: "1.5px", background: CURRY, margin: "6px auto 0" }} />
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, marginTop: "4px" }}>REKRUTTERING MED BRANCHEFORSTÅELSE</div>
                  </div>
                  <div style={{ width: "28px" }} />
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, marginTop: "8px" }}>
                  {(["Karriere", "Nyuddannede"] as const).map((tab) => (
                    <button key={tab} onClick={() => setStep1Tab(tab)} onMouseDown={(e) => e.preventDefault()}
                      style={{ flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer",
                        fontSize: "15px", fontWeight: step1Tab === tab ? 700 : 400,
                        color: step1Tab === tab ? TEXT : MUTED,
                        borderBottom: step1Tab === tab ? `2px solid ${CURRY}` : "2px solid transparent",
                        marginBottom: "-1px", outline: "none" }}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Karriere tab */}
              {step1Tab === "Karriere" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 700, color: TEXT, lineHeight: 1.15, margin: "0 0 10px" }}>
                      Din karriere<br />i Bygge &amp; Anlæg
                    </h1>
                    <p style={{ fontSize: "15px", color: MUTED, lineHeight: 1.6, margin: 0 }}>
                      Kom godt i gang — udfyld din profil og tag ALT-testen, så vi kan hjælpe dig bedst muligt.
                    </p>
                  </div>

                  {/* Kort 1: ALT-test */}
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: NAVY, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>1</div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT }}>Tag ALT-testen</div>
                    </div>
                    <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.6, margin: "0 0 16px" }}>
                      Kortlæg din arbejdssituation på fire dimensioner — Adfærd, Ledelse og Trivsel. Tager ca. 4 minutter.
                    </p>
                    <button onClick={() => setStep(2)}
                      style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: NAVY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
                      Start ALT-testen →
                    </button>
                  </div>

                  {/* Kort 2: Profil */}
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: NAVY, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>2</div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT }}>Udfyld din profil</div>
                    </div>
                    <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.6, margin: "0 0 16px" }}>
                      Navn, kontaktoplysninger, CV og samtykke — så vi kan matche dig med de rigtige muligheder.
                    </p>
                    <button onClick={() => setStep1SubPage("profile")}
                      style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
                      Udfyld profil →
                    </button>
                  </div>

                  {/* Karina-kort */}
                  <button onClick={() => setStep1SubPage("karina")}
                    style={{ background: "#6E7580", borderRadius: "16px", padding: "16px 18px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundImage: "url('/images/Karina Maria - Founder.png')", backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: WHITE }}>Karina Maria Nyberg</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Rådgiver · ByggeTalent</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: "4px" }}>Book en karrieresamtale</div>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "18px" }}>→</span>
                  </button>
                </div>
              )}

              {/* Nyuddannede tab */}
              {step1Tab === "Nyuddannede" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Clara video med custom lydknap */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Video */}
                    <div style={{ borderRadius: "16px", overflow: "hidden", position: "relative", background: NAVY, width: "100%", aspectRatio: "9 / 16" }}>
                      <video autoPlay loop playsInline muted={claraMuted}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                        src="/clara-avatar.mp4" />
                      <button onClick={() => setClaraMuted(!claraMuted)}
                        style={{ position: "absolute", top: "12px", right: "12px", background: claraMuted ? "rgba(255,255,255,0.9)" : CURRY, border: "none", borderRadius: "20px", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 700, color: claraMuted ? TEXT : WHITE }}>
                        {claraMuted ? "🔇 Lyd" : "🔊 Lyd til"}
                      </button>
                    </div>
                    {/* Tekst under video */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E" }} />
                        <span style={{ fontSize: "11px", color: MUTED, fontWeight: 600 }}>AI-hotline · ByggeTalent</span>
                      </div>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif", lineHeight: 1 }}>Clara</div>
                      <div style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>AI-assistent</div>
                    </div>
                  </div>

                  <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.65, margin: 0 }}>
                    Vælg et spørgsmål nedenfor og få svar fra Clara — vores AI-rådgiver til nyuddannede i bygge- og anlægsbranchen.
                  </p>

                  {/* Spørgsmål */}
                  {claraChat ? (
                    /* ── Clara chat-vindue ── */
                    <div style={{ display: "flex", flexDirection: "column", gap: "0", background: WHITE, borderRadius: "16px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                      {/* Chat header */}
                      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "10px" }}>
                        <button onClick={() => { setClaraChat(null); setClaraInput(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: CURRY, fontSize: "14px", fontWeight: 700, padding: 0 }}>← Tilbage</button>
                        <div style={{ flex: 1, textAlign: "center", fontSize: "14px", fontWeight: 700, color: TEXT }}>Clara · AI-assistent</div>
                      </div>
                      {/* Beskeder */}
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "340px", overflowY: "auto" }}>
                        {claraChat.messages.map((msg, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                            {msg.from === "clara" && <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundImage: "url('/images/Karina Maria - Founder.png')", backgroundSize: "cover", flexShrink: 0 }} />}
                            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.from === "user" ? NAVY : PAGE_BG, color: msg.from === "user" ? WHITE : TEXT, fontSize: "14px", lineHeight: 1.55 }}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Loading */}
                      {claraLoading && (
                        <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundImage: "url('/images/Karina Maria - Founder.png')", backgroundSize: "cover", flexShrink: 0 }} />
                          <div style={{ background: PAGE_BG, borderRadius: "12px", padding: "10px 14px", fontSize: "20px", letterSpacing: "4px", color: MUTED }}>···</div>
                        </div>
                      )}
                      {/* Input */}
                      <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          value={claraInput}
                          onChange={(e) => setClaraInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && claraInput.trim() && !claraLoading) {
                              const userMsg = claraInput.trim();
                              setClaraInput("");
                              sendToClara(userMsg, claraChat?.messages ?? []);
                            }
                          }}
                          placeholder="Skriv til Clara…"
                          style={{ flex: 1, padding: "10px 14px", borderRadius: "24px", border: `1px solid ${BORDER}`, fontSize: "14px", background: PAGE_BG, outline: "none", color: TEXT }}
                        />
                        <button
                          onClick={() => {
                            if (!claraInput.trim() || claraLoading) return;
                            const userMsg = claraInput.trim();
                            setClaraInput("");
                            sendToClara(userMsg, claraChat?.messages ?? []);
                          }}
                          style={{ width: "38px", height: "38px", borderRadius: "50%", background: CURRY, border: "none", cursor: "pointer", color: WHITE, fontSize: "18px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          ›
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Spørgsmålsliste ── */
                    [
                      { q: "Jeg er ny i branchen og prøver at finde min plads – hvad kan være godt at være opmærksom på?", a: "Det er helt normalt at føle sig ny og usikker i starten. Mit bedste råd er at observere mere end du taler de første uger — lær kulturen at kende, lær hvem de uformelle ledere er, og still åbne spørgsmål. Bygg- og anlæg er en branche med mange uskrevne regler, men folk er generelt gode til at hjælpe dem der spørger." },
                      { q: "Hvordan kan jeg mærke, om jeg trives i mit nye arbejdsliv?", a: "Trivsel handler om mere end bare at have det ok. Spørg dig selv: glæder du dig til at komme på arbejde? Føler du dig set og hørt? Har du energi tilbage efter arbejde? Hvis du svarer nej til flere af disse over tid, er det et tegn på at noget skal justeres — og det er ok at tage den samtale med din leder." },
                      { q: "Hvordan lærer jeg bedst kulturen på min arbejdsplads at kende?", a: "Vær nysgerrig og deltag aktivt — også i de uformelle situationer som frokost og pauser. Læg mærke til hvad der roses og hvad der aldrig siges højt. Spørg en erfaren kollega om de uskrevne regler — de fleste vil gerne hjælpe en ny med at forstå, hvordan tingene fungerer hos jer." },
                      { q: "Hvad kan jeg gøre, hvis jeg er i tvivl om de uskrevne regler på arbejdspladsen?", a: "Spørg en kollega du stoler på — direkte og nysgerrigt. Du kan sige: 'Jeg er stadig ved at lære kulturen her. Er der noget jeg skal vide om hvordan I gør tingene?' De fleste vil sætte pris på ærligheden. Og husk: det er bedre at spørge én gang for meget end at træde ved siden af uden at vide det." },
                      { q: "Hvordan kan jeg stille spørgsmål på en god måde til min leder?", a: "Vælg det rigtige tidspunkt — ikke midt i en travl periode. Forbered dig kort: hvad er spørgsmålet, og hvad har du selv overvejet? Start med 'Jeg vil gerne forstå...' eller 'Kan du hjælpe mig med at...'. Det viser initiativ og respekt. De fleste ledere sætter langt mere pris på en nysgerrig medarbejder end en der lader som om de ved alt." },
                      { q: "Hvad gør jeg, hvis jeg føler mig overset eller ikke lyttet til?", a: "Det er en svær følelse, men du er ikke alene med den. Start med at sætte ord på det — til dig selv og evt. en du stoler på. Næste skridt kan være en direkte samtale med din leder: 'Jeg vil gerne bidrage mere — kan vi tale om hvordan jeg bedst gør det?' Hvis det ikke hjælper, er jeg her for at hjælpe dig finde næste skridt." },
                    ].map(({ q, a }, i) => (
                      <div key={i} onClick={() => setClaraChat({ question: q, messages: [{ from: "clara", text: a }] })}
                        style={{ background: WHITE, borderRadius: "14px", padding: "14px 16px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: CURRY, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, fontSize: "14px", color: TEXT, lineHeight: 1.5 }}>{q}</div>
                        <span style={{ color: MUTED, fontSize: "18px", flexShrink: 0 }}>›</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            /* ── Underpaneler ── */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: PAGE_BG }}>

              {/* Header */}
              <div style={{ background: PAGE_BG, padding: "20px 20px 0", textAlign: "center", position: "sticky", top: 0, zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <button onClick={() => setStep1SubPage(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: TEXT, padding: 0, lineHeight: 1 }}>←</button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: CURRY }}>BYGGE & ANLÆG</div>
                    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "44px", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
                      <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
                    </div>
                    <div style={{ width: "36px", height: "1.5px", background: CURRY, margin: "6px auto 0" }} />
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, marginTop: "4px" }}>REKRUTTERING MED BRANCHEFORSTÅELSE</div>
                  </div>
                  <div style={{ width: "28px" }} />
                </div>
                <div style={{ borderBottom: `1px solid ${BORDER}` }} />
              </div>

              {/* Din profil */}
              {step1SubPage === "profile" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: "28px" }}>
                  <FormSection label="Dit navn">
                    <TextInput placeholder="Fornavn" value={form.name} onChange={(v) => update("name", v)} />
                    <TextInput placeholder="Efternavn" value={form.lastName} onChange={(v) => update("lastName", v)} />
                  </FormSection>
                  <FormSection label="Kontakt">
                    <TextInput placeholder="E-mail *" value={form.email} onChange={(v) => update("email", v)} />
                    <TextInput placeholder="Telefon" value={form.phone} onChange={(v) => update("phone", v)} />
                    <TextInput placeholder="LinkedIn (valgfrit)" value={form.linkedin} onChange={(v) => update("linkedin", v)} />
                  </FormSection>
                  <FormSection label="Din rolle">
                    <TextInput placeholder="Nuværende stilling" value={form.currentTitle} onChange={(v) => update("currentTitle", v)} />
                    <TextInput placeholder="Ønsket stilling" value={form.address} onChange={(v) => update("address", v)} />
                  </FormSection>
                  <FormSection label="Anciennitet">
                    <PillGroup options={["0-3 år", "4-7 år", "8-12 år", "12+ år"]} value={form.experience} onChange={(v) => update("experience", v)} />
                  </FormSection>
                  <FormSection label="Lønretning">
                    <PillGroup options={["Under nuværende niveau", "Samme niveau", "Over nuværende niveau"]} value={form.salary} onChange={(v) => update("salary", v)} />
                  </FormSection>
                  <FormSection label="Pendlingsafstand">
                    <PillGroup options={["0-20 km", "20-50 km", "50+ km", "Hele Danmark"]} value={form.distance} onChange={(v) => update("distance", v)} />
                  </FormSection>
                  <FormSection label="CV og dokumenter">
                    <FileUploadField label="Upload CV *" file={cvFile} onChange={setCvFile} />
                    <FileUploadField label="Upload ekstra dokument" file={applicationFile} onChange={setApplicationFile} />
                  </FormSection>
                  <FormSection label="Faglig profil">
                    <div style={{ fontSize: "13px", color: MUTED, marginBottom: "4px" }}>Vælg én eller flere titler</div>
                    <RoleSelectionCard
                      groupedRoles={groupedRoles}
                      selectedValues={form.profiles}
                      openGroups={openProfileGroups}
                      onToggleGroup={(group) => toggleGroup(group, openProfileGroups, setOpenProfileGroups)}
                      onToggleRole={(role) => {
                        const already = form.profiles.includes(role);
                        toggleProfile(role);
                        if (!already) {
                          const group = Object.entries(groupedRoles).find(([, roles]) => roles.includes(role))?.[0];
                          if (group) setOpenProfileGroups((p) => ({ ...p, [group]: false }));
                        }
                      }}
                      otherTitle={form.profileOtherTitle}
                      onOtherTitleChange={(v) => update("profileOtherTitle", v)}
                    />
                  </FormSection>

                  {/* Samtykke */}
                  <FormSection label="Samtykke">
                    <InfoCheckboxCard
                      checked={form.consent}
                      onChange={() => update("consent", !form.consent)}
                      infoOpen={showConsentInfo}
                      onToggleInfo={() => setShowConsentInfo(!showConsentInfo)}
                      label="Jeg giver samtykke til at ByggeTalent kontakter mig om relevante karrieremuligheder."
                      infoText="Dine oplysninger opbevares i op til 6 måneder med henblik på rekruttering og relevante jobmuligheder."
                    />
                    <InfoCheckboxCard
                      checked={form.gdpr}
                      onChange={() => update("gdpr", !form.gdpr)}
                      infoOpen={showGdprInfo}
                      onToggleInfo={() => setShowGdprInfo(!showGdprInfo)}
                      label="Jeg accepterer ByggeTalents privatlivspolitik og behandling af mine personoplysninger."
                      infoText="ByggeTalent behandler dine oplysninger med henblik på rekruttering og match med relevante muligheder."
                    />
                  </FormSection>

                  {/* Indsend knap */}
                  <button
                    disabled={!form.email || !form.consent || !form.gdpr}
                    onClick={async () => {
                      await supabase.from("applications").insert([{
                        name: form.name, last_name: form.lastName, email: form.email,
                        phone: form.phone, address: form.address, current_title: form.currentTitle,
                        linkedin: form.linkedin, salary: form.salary, distance: form.distance,
                        experience: form.experience, supplementary_info: form.supplementaryInfo,
                        profiles: form.profiles, profile_other_title: form.profileOtherTitle,
                        submitted_at: new Date().toISOString(), status: "ny", notes: "",
                      }]);
                      setStep1SubPage(null);
                    }}
                    style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none",
                      background: (form.email && form.consent && form.gdpr) ? NAVY : BORDER,
                      color: (form.email && form.consent && form.gdpr) ? WHITE : MUTED,
                      fontSize: "16px", fontWeight: 700, cursor: (form.email && form.consent && form.gdpr) ? "pointer" : "not-allowed" }}
                  >
                    Indsend profil →
                  </button>
                </div>
              )}

              {/* Samtykke */}
              {step1SubPage === "consent" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 100px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif", marginBottom: "4px" }}>Samtykke</div>
                  <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.65, margin: 0 }}>
                    For at vi kan hjælpe dig bedst muligt, beder vi om dit samtykke til behandling af dine personoplysninger.
                  </p>
                  <InfoCheckboxCard
                    checked={form.consent}
                    onChange={() => update("consent", !form.consent)}
                    infoOpen={showConsentInfo}
                    onToggleInfo={() => setShowConsentInfo(!showConsentInfo)}
                    label="Jeg giver samtykke til, at ByggeTalent må opbevare og behandle mine personoplysninger i op til 6 måneder med henblik på rekruttering og relevante jobmuligheder."
                    infoText="Dine oplysninger opbevares i op til 6 måneder med henblik på rekruttering og relevante jobmuligheder."
                  />
                  <InfoCheckboxCard
                    checked={form.gdpr}
                    onChange={() => update("gdpr", !form.gdpr)}
                    infoOpen={showGdprInfo}
                    onToggleInfo={() => setShowGdprInfo(!showGdprInfo)}
                    label="Jeg accepterer, at mine personoplysninger behandles i henhold til ByggeTalents privatlivspolitik."
                    infoText="ByggeTalent behandler dine oplysninger med henblik på rekruttering og match med relevante muligheder i overensstemmelse med privatlivspolitikken."
                  />
                </div>
              )}

              {/* Karina - book samtale */}
              {step1SubPage === "karina" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 100px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "96px", height: "96px", borderRadius: "50%", backgroundImage: "url('/images/Karina Maria - Founder.png')", backgroundSize: "cover", backgroundPosition: "center", margin: "0 auto 16px" }} />
                    <div style={{ fontSize: "24px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>Karina Maria Nyberg</div>
                    <div style={{ fontSize: "14px", color: MUTED, marginTop: "4px" }}>Founder & Rådgiver · ByggeTalent</div>
                  </div>
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT, marginBottom: "10px" }}>Book en karrieresamtale</div>
                    <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.65, margin: "0 0 16px" }}>
                      Få en uforpligtende snak om dine muligheder i bygge- og anlægsbranchen. Karina hjælper dig med at finde den rigtige vej.
                    </p>
                    <a href="mailto:kontakt@byggetalent.dk?subject=Karrieresamtale"
                      style={{ display: "block", width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
                      Send besked til Karina →
                    </a>
                  </div>
                </div>
              )}

              {/* Privatlivspolitik */}
              {step1SubPage === "privacy" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 100px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif", marginBottom: "20px" }}>Privatlivspolitik</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {([
                      { title: "Hvem er vi?", body: "ByggeTalent er en rekrutteringsvirksomhed med speciale i bygge- og anlægsbranchen. Vi behandler dine personoplysninger med omhu og i overensstemmelse med GDPR." },
                      { title: "Hvilke oplysninger indsamler vi?", body: "Vi indsamler kun de oplysninger du selv afgiver: navn, e-mail, telefon, CV og faglig profil. Oplysningerne bruges udelukkende til rekruttering og jobmatch." },
                      { title: "Hvor længe opbevarer vi dine data?", body: "Dine oplysninger opbevares i op til 6 måneder fra dit samtykke, medmindre du anmoder om sletning før da." },
                      { title: "Dine rettigheder", body: "Du har til enhver tid ret til indsigt, berigtigelse og sletning af dine oplysninger. Kontakt os på kontakt@byggetalent.dk." },
                    ]).map((s) => (
                      <div key={s.title} style={{ background: WHITE, borderRadius: "14px", padding: "18px", border: `1px solid ${BORDER}`, borderLeft: `4px solid ${CURRY}` }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>{s.title}</div>
                        <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>{s.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Step 2: Mini-test ──────────────────────────────────────── */}
      {step === 2 && (
        <div className="bt-page-full">

          {/* Header */}
          <div style={{ background: PAGE_BG, padding: "20px 20px 0", textAlign: "center", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <button onClick={() => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: TEXT, padding: 0, lineHeight: 1 }}>←</button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: CURRY }}>BYGGE & ANLÆG</div>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "44px", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
                </div>
                <div style={{ width: "36px", height: "1.5px", background: CURRY, margin: "6px auto 0" }} />
                <div style={{ fontFamily: "Georgia, serif", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, marginTop: "4px" }}>REKRUTTERING MED BRANCHEFORSTÅELSE</div>
              </div>
              <div style={{ width: "28px" }} />
            </div>
            <div style={{ borderBottom: `1px solid ${BORDER}`, marginTop: "8px" }} />
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 40px" }}>

            {/* ── Intro: rollevalg ── */}
            {altPhase === "intro" && (
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Titel */}
                <div>
                  <div style={{ fontSize: "13px", color: MUTED, marginBottom: "6px" }}>Adfærd · Ledelse · Trivsel</div>
                  <h2 style={{ margin: "0 0 10px", fontSize: "30px", lineHeight: 1.15, fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>
                    Kortlæg din arbejdssituation
                  </h2>
                  <p style={{ margin: 0, fontSize: "15px", color: MUTED, lineHeight: 1.6 }}>
                    Testen måler fire dimensioner og sammenligner med branchen. Tager ca. 4 minutter.
                  </p>
                </div>

                {/* Kategori pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { label: "Kultur & Tone", color: "#C4A03A" },
                    { label: "Hold & Ressourcer", color: "#2563EB" },
                    { label: "Ansvar & Mandat", color: "#6A9060" },
                    { label: "Trivsel", color: "#6E7580" },
                  ].map(({ label, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", borderRadius: "999px", background: WHITE, border: `1px solid ${BORDER}`, fontSize: "14px", fontWeight: 500, color: TEXT }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Rollevalg */}
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT, marginBottom: "12px" }}>Vælg din rolle</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {([
                      { r: "Nyuddannet", sub: "0–3 år i branchen" },
                      { r: "Fagspecialist", sub: "Faglært eller specialiseret medarbejder" },
                      { r: "Leder", sub: "Teamleder, projektleder eller chef" },
                    ] as const).map(({ r, sub }) => (
                      <button key={r} type="button" onClick={() => setAltRole(r)}
                        style={{ textAlign: "left", padding: "16px", borderRadius: "14px", border: `1.5px solid ${BORDER}`, background: WHITE, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT }}>{r}</div>
                          <div style={{ fontSize: "13px", color: MUTED, marginTop: "2px" }}>{sub}</div>
                        </div>
                        <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: altRole === r ? `6px solid ${CURRY}` : `1.5px solid ${BORDER}`, flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Quiz: ét spørgsmål ad gangen ── */}
            {altPhase === "quiz" && altActiveQuestions.length > 0 && (() => {
              const q = altActiveQuestions[altCurrentQ];
              const progress = ((altCurrentQ) / altActiveQuestions.length) * 100;
              return (
                <div style={{ display: "grid", gap: "16px" }}>
                  {/* Progress */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: q.cat === "Kultur & Tone" ? "#C4A03A" : q.cat === "Hold & Ressourcer" ? "#2563EB" : q.cat === "Ansvar & Mandat" ? "#6A9060" : "#6E7580", textTransform: "uppercase", letterSpacing: "0.1em" }}>{q.cat}</div>
                    <div style={{ fontSize: "12px", color: MUTED, fontWeight: 600 }}>{altCurrentQ + 1} / {altActiveQuestions.length}</div>
                  </div>
                  <div style={{ height: "4px", background: BORDER, borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: CURRY, borderRadius: "2px" }} />
                  </div>

                  {/* Spørgsmål */}
                  <div style={{ background: WHITE, borderRadius: "20px", padding: "22px", border: `1px solid ${BORDER}` }}>
                    <p style={{ margin: "0 0 22px", fontSize: "18px", fontWeight: 700, color: TEXT, lineHeight: 1.45, fontFamily: "Georgia, serif" }}>
                      {q.q}
                    </p>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {q.options.map((opt, i) => (
                        <button key={i} type="button"
                          onClick={() => answerAlt(q.cat, opt.p)}
                          style={{ textAlign: "left", padding: "14px 16px", borderRadius: "14px", border: `1.5px solid ${BORDER}`, background: "#FAFAF8", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: BORDER, color: MUTED, display: "grid", placeItems: "center", fontSize: "13px", fontWeight: 700 }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: "14px", color: TEXT, lineHeight: 1.45, fontWeight: 500 }}>{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Resultat ── */}
            {altPhase === "result" && (
              <div style={{ display: "grid", gap: "14px" }}>

                {/* Hovedkort: donut + legend */}
                <div style={{ background: WHITE, borderRadius: "20px", padding: "20px", border: `1.5px solid ${CURRY_BORDER}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <div style={labelSt}>ALT · Arbejdslivstest</div>
                      <h3 style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>
                        Din arbejdsprofil
                      </h3>
                    </div>
                    {altRole && (
                      <div style={{ padding: "5px 11px", borderRadius: "999px", background: CURRY_BG, color: CURRY, fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {altRole}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ position: "relative", flexShrink: 0, width: "120px", height: "120px" }}>
                      <svg width="120" height="120" viewBox="0 0 140 140">
                        {(() => {
                          const r = 52, cx = 70, cy = 70;
                          const circ = 2 * Math.PI * r;
                          const total = catScores.reduce((s, c) => s + c.percent, 0) || 1;
                          let cum = 0;
                          return catScores.map(cat => {
                            const segLen = (cat.percent / total) * circ;
                            const dashOffset = circ / 4 - cum;
                            const el = (
                              <circle key={cat.key} cx={cx} cy={cy} r={r}
                                fill="none" stroke={cat.color} strokeWidth="22"
                                strokeDasharray={`${segLen} ${circ}`}
                                strokeDashoffset={dashOffset}
                              />
                            );
                            cum += segLen;
                            return el;
                          });
                        })()}
                        <circle cx={70} cy={70} r={40} fill="white" />
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: TEXT, lineHeight: 1 }}>{avgScore}</div>
                        <div style={{ fontSize: "9px", color: MUTED, fontWeight: 600, marginTop: "2px" }}>af 5</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "9px", flex: 1 }}>
                      {catScores.map(cat => (
                        <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: cat.color, flexShrink: 0 }} />
                          <div style={{ flex: 1, fontSize: "12px", color: TEXT, fontWeight: 600 }}>{cat.key}</div>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: TEXT }}>{cat.percent}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: "11px 14px", borderRadius: "12px", background: CURRY_BG, border: `1px solid ${CURRY_BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT }}>Samlet tilfredshed</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: CURRY, lineHeight: 1 }}>
                      {avgScore}<span style={{ fontSize: "13px", fontWeight: 600, color: MUTED }}>/5</span>
                    </div>
                  </div>
                </div>

                {/* Kategori-detaljer — 5-niveau DISC/Garuda stil */}
                <div style={{ display: "grid", gap: "10px" }}>
                  {catScores.map(cat => {
                    const bench = benchmark ? (benchmark as Record<string, number>)[cat.key] : 65;
                    const level = getAltLevel(cat.percent, bench);
                    const levelLabel = ALT_LEVEL_LABELS[level - 1];
                    const levelDesc = ALT_LEVEL_DESC[cat.key][level - 1];
                    return (
                      <div key={cat.key} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${cat.color}`, borderRadius: "14px", padding: "16px", display: "grid", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{cat.key}</div>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: TEXT }}>{levelLabel}</div>
                        </div>

                        {/* 5 bjælker */}
                        <div style={{ display: "flex", gap: "4px" }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} style={{ flex: 1, height: "8px", borderRadius: "4px", background: n <= level ? cat.color : BORDER }} />
                          ))}
                        </div>

                        <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: MUTED }}>{levelDesc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Konklusion */}
                {(() => {
                  const withBench = catScores.map(cat => ({
                    ...cat,
                    level: getAltLevel(cat.percent, benchmark ? (benchmark as Record<string, number>)[cat.key] : 65),
                  }));
                  const sorted = [...withBench].sort((a, b) => a.level - b.level);
                  const lowest = sorted[0];
                  const highest = sorted[sorted.length - 1];
                  const roleCtx = altRole === "Nyuddannet"
                    ? "Som ny i branchen sammenlignes du med normen for nyuddannede — ikke erfarne kolleger."
                    : altRole === "Leder"
                    ? "Som leder sammenlignes du med normen for ledere i bygge- og anlægsbranchen."
                    : "Som fagspecialist sammenlignes du med normen for udførende og tekniske profiler.";
                  return (
                    <div style={{ padding: "18px", borderRadius: "16px", background: CURRY_BG, border: `1px solid ${CURRY_BORDER}`, display: "grid", gap: "8px" }}>
                      <div style={labelSt}>Konklusion · {altRole}</div>
                      <h4 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>
                        {highest.key} er dit stærkeste område
                      </h4>
                      <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.7, color: MUTED }}>
                        {roleCtx} Dit stærkeste område er {highest.key.toLowerCase()} ({ALT_LEVEL_LABELS[highest.level - 1]}), mens {lowest.key.toLowerCase()} ({ALT_LEVEL_LABELS[lowest.level - 1]}) har størst udviklingspotentiale.
                      </p>
                    </div>
                  );
                })()}

                <button
                  onClick={() => { setAltPhase("intro"); setAltAnswers([]); setAltCurrentQ(0); setAltRole(null); }}
                  style={{ padding: "13px", borderRadius: "12px", border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  Tag testen igen
                </button>
              </div>
            )}
          </div>

          {/* Fast bund-navigation */}
          <div style={{ position: "sticky", bottom: 0, background: WHITE, borderTop: `1px solid ${BORDER}`, padding: "14px 20px 24px", display: "flex", gap: "10px" }}>
            {altPhase === "intro" && (
              <button
                onClick={startAlt}
                disabled={!altRole}
                style={{ flex: 1, padding: "15px", borderRadius: "14px", border: "none", background: altRole ? CURRY : BORDER, color: altRole ? WHITE : MUTED, fontSize: "15px", fontWeight: 700, cursor: altRole ? "pointer" : "not-allowed" }}
              >
                Start testen →
              </button>
            )}
            {altPhase === "quiz" && (
              <button
                onClick={() => { setAltPhase("intro"); setAltAnswers([]); setAltCurrentQ(0); }}
                style={backBtnSt}
              >←</button>
            )}
            {altPhase === "result" && (
              <button style={{ flex: 1, padding: "15px", borderRadius: "14px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer" }} onClick={() => {}}>
                Book samtale →
              </button>
            )}
          </div>
        </div>
      )}

    </main>
  );
}

// ─── Subkomponenter ───────────────────────────────────────────────────────────

function FormSection({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(10,22,40,0.42)" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)} style={{
          padding: "12px 16px", borderRadius: "12px",
          border: value === opt ? `1.5px solid ${CURRY}` : "1px solid rgba(10,22,40,0.13)",
          background: value === opt ? CURRY_BG : WHITE,
          color: value === opt ? CURRY : TEXT,
          fontSize: "14px", fontWeight: 600, cursor: "pointer",
        }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function RoleSelectionCard({ groupedRoles, selectedValues, openGroups, onToggleGroup, onToggleRole, otherTitle, onOtherTitleChange }: {
  groupedRoles: Record<string, string[]>;
  selectedValues: string[];
  openGroups: Record<string, boolean>;
  onToggleGroup: (group: string) => void;
  onToggleRole: (role: string) => void;
  otherTitle: string;
  onOtherTitleChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      {Object.entries(groupedRoles).map(([group, roles]) => (
        <div key={group} style={{ border: "1px solid rgba(10,22,40,0.12)", borderRadius: "12px", background: WHITE, overflow: "hidden" }}>
          <button type="button" onClick={() => onToggleGroup(group)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "transparent", color: TEXT, border: "none", cursor: "pointer", padding: "13px 15px", textAlign: "left", fontSize: "14px", fontWeight: 700 }}>
            <span>{group}</span>
            <span style={{ color: CURRY, fontSize: "18px", lineHeight: 1 }}>{openGroups[group] ? "−" : "+"}</span>
          </button>
          {openGroups[group] && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "0 15px 15px", borderTop: `1px solid ${BORDER}` }}>
              {roles.map((role) => {
                const sel = selectedValues.includes(role);
                return (
                  <button key={role} type="button" onClick={() => onToggleRole(role)} style={{ padding: "9px 13px", borderRadius: "999px", border: sel ? `1.5px solid ${CURRY}` : `1px solid ${BORDER}`, background: sel ? CURRY_BG : "#FAFAF8", color: sel ? CURRY : TEXT, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    {role}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <div style={{ paddingTop: "12px", borderTop: `1px solid ${BORDER}`, display: "grid", gap: "8px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>Mangler din titel?</div>
        <p style={{ margin: 0, fontSize: "13px", color: MUTED }}>Skriv den manuelt her, så matcher vi dig mere præcist.</p>
        <input style={inputSt} placeholder="Din titel" value={otherTitle} onChange={(e) => onOtherTitleChange(e.target.value)} />
      </div>
    </div>
  );
}

function FileUploadField({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <label style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>{label}</label>
      <input type="file" accept=".pdf,.doc,.docx" style={inputSt} onChange={(e) => onChange(e.target.files?.[0] || null)} />
      {file && <span style={{ fontSize: "12px", color: CURRY }}>{file.name}</span>}
    </div>
  );
}

function InfoCheckboxCard({ checked, onChange, infoOpen, onToggleInfo, label, infoText }: { checked: boolean; onChange: () => void; infoOpen: boolean; onToggleInfo: () => void; label: string; infoText: string }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "13px", background: WHITE }}>
      <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ marginTop: "2px", accentColor: CURRY }} />
        <span style={{ flex: 1, fontSize: "14px", lineHeight: 1.6, color: TEXT }}>{label}</span>
        <button type="button" onClick={onToggleInfo} style={{ background: "transparent", color: CURRY, border: "none", cursor: "pointer", fontSize: "13px", flexShrink: 0 }}>{infoOpen ? "▲" : "▼"}</button>
      </label>
      {infoOpen && <p style={{ fontSize: "13px", color: MUTED, marginTop: "10px", marginBottom: 0, lineHeight: 1.6 }}>{infoText}</p>}
    </div>
  );
}

function TextInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return <input style={inputSt} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />;
}

// ─── Ledige stillinger komponent ─────────────────────────────────────────────
function JobListings() {
  const [jobs, setJobs] = useState<{ id: string; title: string; location: string; type: string; description: string }[]>([]);
  const [view, setView] = useState<"list" | "detail" | "form" | "success">("list");
  const [selected, setSelected] = useState<{ id: string; title: string; location: string; type: string; description: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", experience: "", skills: "", motivation: "" });
  const [sending, setSending] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  useState(() => {
    const all = JSON.parse(localStorage.getItem("bt_jobs") || "[]");
    setJobs(all.filter((j: any) => j.active));
  });

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("bt_jobs") || "[]");
    setJobs(all.filter((j: any) => j.active));
  }, []);

  function submit() {
    if (!selected || !cvFile) return;
    setSending(true);
    setTimeout(() => {
      // Hent profildata fra localStorage hvis de findes
      const saved = JSON.parse(localStorage.getItem("bt_applications") || "[]");
      const latest = saved.length > 0 ? saved[saved.length - 1] : null;
      const app = {
        id: Date.now().toString(),
        name: latest?.name || "",
        lastName: latest?.lastName || "",
        email: latest?.email || "",
        phone: latest?.phone || "",
        address: latest?.address || "",
        currentTitle: latest?.currentTitle || "",
        linkedin: latest?.linkedin || "",
        salary: latest?.salary || "",
        distance: latest?.distance || "",
        experience: latest?.experience || "",
        supplementaryInfo: form.motivation ? `Vedhæftet ansøgning: ${form.motivation}` : "",
        profiles: latest?.profiles || [],
        profileOtherTitle: latest?.profileOtherTitle || "",
        submittedAt: new Date().toISOString(),
        status: "ny", notes: "",
        jobId: selected.id, jobTitle: selected.title,
        cvFileName: cvFile.name,
      };
      localStorage.setItem("bt_applications", JSON.stringify([...saved, app]));
      setSending(false);
      setView("success");
    }, 800);
  }

  if (jobs.length === 0) return null;

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "12px" }}>
        Ledige stillinger
      </div>

      {view === "list" && (
        <div style={{ display: "grid", gap: "10px" }}>
          {jobs.map((job) => (
            <div key={job.id} style={{ background: WHITE, borderRadius: "14px", padding: "18px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(10,22,40,0.05)" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>{job.title}</div>
              <div style={{ fontSize: "13px", color: MUTED, marginBottom: "14px" }}>
                {job.location && `📍 ${job.location} · `}{job.type}
              </div>
              <button onClick={() => { setSelected(job); setView("detail"); }}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: TEXT, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                Søg stillingen →
              </button>
            </div>
          ))}
        </div>
      )}

      {view === "detail" && selected && (
        <div style={{ background: WHITE, borderRadius: "14px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ padding: "20px" }}>
            <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: CURRY, fontSize: "14px", fontWeight: 700, padding: 0, marginBottom: "14px" }}>← Tilbage</button>
            <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT, marginBottom: "6px", fontFamily: "Georgia, serif" }}>{selected.title}</div>
            <div style={{ fontSize: "13px", color: MUTED, marginBottom: "16px" }}>{selected.location && `📍 ${selected.location} · `}{selected.type}</div>
            {selected.description && <div dangerouslySetInnerHTML={{ __html: selected.description }} style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7, marginBottom: "20px" }} />}
            <button onClick={() => setView("form")} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
              Ansøg stillingen →
            </button>
          </div>
        </div>
      )}

      {view === "form" && selected && (
        <div style={{ background: WHITE, borderRadius: "14px", padding: "24px 20px", border: `1px solid ${BORDER}` }}>
          <button onClick={() => setView("detail")} style={{ background: "none", border: "none", cursor: "pointer", color: CURRY, fontSize: "14px", fontWeight: 700, padding: 0, marginBottom: "20px" }}>← Tilbage</button>

          <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT, marginBottom: "4px", fontFamily: "Georgia, serif" }}>Send ansøgning</div>
          <div style={{ fontSize: "13px", color: MUTED, marginBottom: "24px" }}>{selected.title}</div>

          {/* Info-boks */}
          <div style={{ background: CURRY_BG, border: `1px solid ${CURRY_BORDER}`, borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", fontSize: "13px", color: TEXT, lineHeight: 1.6 }}>
            <strong>Dine oplysninger er allerede udfyldt</strong> under Din Profil. Vedhæft blot dit CV — ansøgningsbrev er valgfrit.
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {/* CV — påkrævet */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>CV *</div>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "12px", border: `1.5px dashed ${cvFile ? CURRY : "rgba(10,22,40,0.18)"}`, background: cvFile ? CURRY_BG : WHITE, cursor: "pointer" }}>
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                <span style={{ fontSize: "22px" }}>{cvFile ? "✅" : "📄"}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: cvFile ? CURRY : TEXT }}>{cvFile ? cvFile.name : "Upload CV"}</div>
                  <div style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>PDF eller Word</div>
                </div>
              </label>
            </div>

            {/* Ansøgning — valgfrit */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Ansøgning <span style={{ fontWeight: 400, textTransform: "none" }}>(valgfrit)</span></div>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "12px", border: `1.5px dashed ${form.motivation ? CURRY : "rgba(10,22,40,0.18)"}`, background: form.motivation ? CURRY_BG : WHITE, cursor: "pointer" }}>
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, motivation: f.name }); }} />
                <span style={{ fontSize: "22px" }}>{form.motivation ? "✅" : "📝"}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: form.motivation ? CURRY : TEXT }}>{form.motivation || "Upload ansøgning"}</div>
                  <div style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>PDF eller Word</div>
                </div>
              </label>
            </div>

            <button onClick={submit} disabled={!cvFile || sending}
              style={{ width: "100%", padding: "15px", borderRadius: "12px", border: "none", background: cvFile ? CURRY : "#D4CCBC", color: WHITE, fontSize: "15px", fontWeight: 700, cursor: cvFile ? "pointer" : "not-allowed", marginTop: "4px" }}>
              {sending ? "Sender..." : "Send ansøgning →"}
            </button>
          </div>
        </div>
      )}

      {view === "success" && (
        <div style={{ background: WHITE, borderRadius: "14px", padding: "36px 20px", textAlign: "center", border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT, marginBottom: "8px", fontFamily: "Georgia, serif" }}>Ansøgning sendt!</div>
          <div style={{ fontSize: "14px", color: MUTED, marginBottom: "20px", lineHeight: 1.6 }}>Tak for din ansøgning til <strong>{selected?.title}</strong>. Vi vender tilbage hurtigst muligt.</div>
          <button onClick={() => { setView("list"); setForm({ name: "", email: "", phone: "", experience: "", skills: "", motivation: "" }); setCvFile(null); }}
            style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: TEXT, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
            ← Se alle stillinger
          </button>
        </div>
      )}
    </div>
  );
}

// ─── WSAccordion ──────────────────────────────────────────────────────────────
function WSAccordion({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: "16px", background: WHITE, marginBottom: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}
      >
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>{sub}</div>
        </div>
        <div style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: open ? CURRY : "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
          <span style={{ fontSize: "14px", color: open ? NAVY : MUTED, display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s", fontWeight: 700 }}>›</span>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── WorkforceShortage ────────────────────────────────────────────────────────

const WS_STATS = [
  { n: "99.000", label: "Faglærte mangler", delta: "+12% siden 2022", color: "#C4A03A" },
  { n: "24.000", label: "KVU mangler",      delta: "Ingeniør & tekniker", color: "#6A9060" },
  { n: "13.000", label: "MVU mangler",      delta: "Arkitekt & bygningsk.", color: "#6E7580" },
];

const WS_ROLLER = [
  { navn: "Elektriker",          note: "Solceller & ladestandere"   },
  { navn: "VVS-installatør",     note: "Grønne varmekilder"          },
  { navn: "Energirådgiver",      note: "EPBD & energimærkning"       },
  { navn: "BIM-specialist",      note: "Digitalisering af byggeri"   },
  { navn: "Tømrer",              note: "Renovering & nybyggeri"      },
  { navn: "Anlægsstruktør",      note: "Infrastruktur & veje"        },
  { navn: "Byggeleder",          note: "Projektstyring på pladsen"   },
  { navn: "Projektleder",        note: "Totalentreprise"             },
  { navn: "Maskinsnedker",       note: "Præfabrikation"              },
  { navn: "Materialespecialist", note: "Bæredygtige materialer"      },
  { navn: "Renoveringsfaglært",  note: "Efterisolering & facade"     },
];

const WS_DRIVERE = [
  {
    nr: "01", label: "Demografi",
    body: "Store årgange pensioneres i perioden 2024–2032. For hver 3 der forlader branchen, træder kun 2 nye til — et strukturelt underskud der ikke løses af konjunkturerne.",
    tag: "Strukturelt",
    tagColor: "#6E7580",
  },
  {
    nr: "02", label: "Grøn omstilling",
    body: "Solceller, varmepumper, brintinfrastruktur og energirenovering kræver kompetencer der ikke findes i tilstrækkelig mængde i Danmark i dag.",
    tag: "Vækst",
    tagColor: "#6A9060",
  },
  {
    nr: "03", label: "Renoveringsbølgen",
    body: "Renoveringsopgaver kræver 30–50% flere arbejdstimer pr. m² end nybyggeri. Efterspørgslen stiger mens udbuddet af kvalificerede faglærte falder.",
    tag: "Efterspørgsel",
    tagColor: "#C4A03A",
  },
];

const WS_SVAR = [
  {
    label: "Præfabrikation & teknologi",
    body: "Modulbyggeri og digitale arbejdsprocesser reducerer afhængigheden af manuelle hænder på byggepladsen.",
    indikator: "Reducerer behovet",
    ind: "#6A9060",
  },
  {
    label: "International rekruttering",
    body: "Virksomheder henter i stigende grad faglært arbejdskraft fra Polen, Rumænien og Baltikum — men kræver onboarding og sproglig integration.",
    indikator: "Supplerer udbuddet",
    ind: "#2563EB",
  },
  {
    label: "Fastholdelse & trivsel",
    body: "Branchen konkurrerer nu på arbejdsmiljø og fleksibilitet. Virksomheder der investerer i kultur og trivsel holder bedre på deres folk.",
    indikator: "Langsigtet løsning",
    ind: "#C4A03A",
  },
];

const WS_FACTS = [
  { img: "/images/håndpåbyggepladsen.png",  pos: "center 30%", eyebrow: "AE-rådet 2024",   number: "136.000", label: "manglende fagpersoner i bygge & anlæg frem mod 2030" },
  { img: "/images/DIn faglg profil.png",    pos: "center 20%", eyebrow: "Faglærte",        number: "99.000",  label: "elektrikere, tømrere og VVS-installatører mangler allerede nu" },
  { img: "/images/håndpåbyggepladsen.png",  pos: "center 60%", eyebrow: "Videregående",    number: "37.000",  label: "ingeniører og teknikere mangler i branchen" },
  { img: "/images/DIn faglg profil.png",    pos: "center 40%", eyebrow: "Grøn omstilling", number: "11",      label: "kritiske faggrupper: solceller, varmepumper og BIM" },
];

function WorkforceShortage({ onExitToVirksomhed }: { onExitToVirksomhed: () => void }) {
  const [fact, setFact] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFact(f => (f + 1) % WS_FACTS.length);
        setVisible(true);
      }, 400);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const current = WS_FACTS[fact];

  return (
    <div style={{ display: "grid", gap: "12px" }}>

      {/* ── Nav ── */}
      <button onClick={onExitToVirksomhed}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: CURRY, fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-start" }}>
        ← Virksomhed
      </button>

      {/* ── Arbejdskraftdata nøgletal ── */}
      <div style={{ display: "grid", gap: "8px" }}>
        {WS_FACTS.map((f, i) => (
          <div key={i} style={{ background: WHITE, borderRadius: "14px", padding: "16px 18px", border: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: CURRY, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{f.eyebrow}</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: NAVY, fontFamily: "Georgia, serif", lineHeight: 1 }}>{f.number}</div>
              <div style={{ fontSize: "13px", color: MUTED, marginTop: "4px", lineHeight: 1.4 }}>{f.label}</div>
            </div>
            <div style={{ width: "4px", alignSelf: "stretch", borderRadius: "2px", background: i === 0 ? CURRY : i === 1 ? "#6A9060" : "#2563EB", flexShrink: 0 }} />
          </div>
        ))}
      </div>


      <style>{`
        @keyframes wsfade    { from{opacity:0;transform:scale(1.04)} to{opacity:1;transform:scale(1)} }
        @keyframes wsticker  { from{transform:translateX(0)} to{transform:translateX(-20%)} }
        @keyframes wspulse   { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes wsbar     { from{transform:scaleY(0.3);opacity:0.4} to{transform:scaleY(1);opacity:1} }
        @keyframes wsword    { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── FOLD UD KNAP ── */}
      <button
        onClick={() => setShowDetails(o => !o)}
        style={{ background: WHITE, border: "none", borderRadius: "14px", padding: "0", display: "flex", flexDirection: "column", cursor: "pointer", width: "100%", overflow: "hidden", boxShadow: "0 2px 8px rgba(10,22,40,0.10)" }}
      >
        <div style={{ background: "#C0392B", height: "3px", width: "100%" }} />
        <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", color: "#C0392B", marginBottom: "4px" }}>BYGGETALENT NEWS</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: NAVY }}>Arbejdskraftmanglen i tal</div>
            <div style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>Fagområder · Drivkræfter · Virksomhedernes svar</div>
          </div>
          <div style={{ flexShrink: 0, width: "34px", height: "34px", borderRadius: "50%", background: showDetails ? CURRY : "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
            <span style={{ fontSize: "18px", color: showDetails ? NAVY : MUTED, display: "inline-block", transform: showDetails ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s", fontWeight: 700 }}>›</span>
          </div>
        </div>
      </button>

      {/* ── ACCORDION SEKTIONER ── */}
      {showDetails && [{
          id: "roller",
          title: "11 kritiske fagområder",
          sub: "Mangel frem mod 2030",
          content: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "4px 0 4px" }}>
              {WS_ROLLER.map((r, i) => (
                <div key={r.navn} style={{ background: WHITE, borderRadius: "12px", padding: "13px 14px", borderLeft: `3px solid ${i < 4 ? CURRY : i < 8 ? "#6A9060" : "#6E7580"}` }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT }}>{r.navn}</div>
                  <div style={{ fontSize: "11px", color: MUTED, marginTop: "2px", lineHeight: 1.3 }}>{r.note}</div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "drivere",
          title: "Hvorfor opstår manglen?",
          sub: "3 strukturelle drivkræfter",
          content: (
            <div style={{ display: "grid", gap: "8px", padding: "4px 0" }}>
              {WS_DRIVERE.map(d => (
                <div key={d.label} style={{ background: WHITE, borderRadius: "14px", overflow: "hidden", display: "flex" }}>
                  <div style={{ width: "4px", flexShrink: 0, background: d.tagColor }} />
                  <div style={{ padding: "14px 16px", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>{d.label}</div>
                      <div style={{ fontSize: "9px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: d.tagColor, color: WHITE, letterSpacing: "0.08em", textTransform: "uppercase" }}>{d.tag}</div>
                    </div>
                    <div style={{ fontSize: "13px", lineHeight: 1.6, color: MUTED }}>{d.body}</div>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "svar",
          title: "Virksomhedernes svar",
          sub: "Sådan reagerer branchen",
          content: (
            <div style={{ display: "grid", gap: "8px", padding: "4px 0" }}>
              {WS_SVAR.map(s => (
                <div key={s.label} style={{ background: WHITE, borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "5px" }}>{s.label}</div>
                      <div style={{ fontSize: "13px", lineHeight: 1.6, color: MUTED }}>{s.body}</div>
                    </div>
                    <div style={{ flexShrink: 0, padding: "4px 10px", borderRadius: "8px", background: s.ind + "15", border: `1px solid ${s.ind}30`, color: s.ind, fontSize: "10px", fontWeight: 700, whiteSpace: "nowrap", marginTop: "2px" }}>
                      {s.indikator}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      ].map(sec => (
        <WSAccordion key={sec.id} title={sec.title} sub={sec.sub}>{sec.content}</WSAccordion>
      ))}

      {/* Kilde */}

      <div style={{ padding: "4px 4px 8px", fontSize: "10px", color: MUTED }}>
        Kilde: AE-rådet 2024 · ByggeTalent brancheanalyse
      </div>
    </div>
  );
}

// ─── Delte styles ─────────────────────────────────────────────────────────────

const inputSt: React.CSSProperties = {
  width: "100%", padding: "13px 15px", borderRadius: "12px", border: "1px solid rgba(10,22,40,0.13)",
  background: WHITE, color: TEXT, fontSize: "15px", outline: "none", minHeight: "50px",
  boxSizing: "border-box", fontFamily: "inherit",
};

const textareaSt: React.CSSProperties = {
  width: "100%", padding: "13px 15px", borderRadius: "12px", border: "1px solid rgba(10,22,40,0.13)",
  background: WHITE, color: TEXT, fontSize: "15px", minHeight: "100px", resize: "vertical",
  fontFamily: "inherit", boxSizing: "border-box", outline: "none",
};

const labelSt: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: CURRY,
};

const backBtnSt: React.CSSProperties = {
  width: "48px", height: "48px", borderRadius: "50%", border: `1px solid ${BORDER}`,
  background: WHITE, cursor: "pointer", fontSize: "18px", display: "grid", placeItems: "center", color: TEXT, flexShrink: 0,
};
