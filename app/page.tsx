"use client";

import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
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
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const claraVideoRef = useRef<HTMLVideoElement>(null);
  const [detailPage, setDetailPage] = useState<string | null>(null);
  const [virksomhedView, setVirksomhedView] = useState<null | "data" | "jobmatch" | "samtale">(null);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);
  useEffect(() => { setIsPlaying(false); if (claraVideoRef.current) { claraVideoRef.current.pause(); claraVideoRef.current.currentTime = 0; } }, [detailPage]);

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

  const [step1SubPage, setStep1SubPage] = useState<null | 'profile' | 'consent' | 'privacy'>(null);

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
    { key: "Nyuddannet", label: "Nyuddannet", sub: "0–3 års erfaring", bg: "#C4A03A" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ─── Step 0: Forside ──────────────────────────────────────────── */}
      {step === 0 && (
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 0 40px" }}>

          {detailPage === "Nyuddannet" ? (
            /* Nyuddannet — scrollbar side */
            <div style={{ position: "fixed", inset: 0, background: PAGE_BG, zIndex: 10, overflowY: "auto" }}>
              <div style={{ maxWidth: "480px", margin: "0 auto", padding: "16px 20px 40px" }}>


                {/* Logo header */}
                <div style={{ textAlign: "center", padding: "16px 0 20px", display: "grid", gap: "6px" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: CURRY }}>
                    BYGGE & ANLÆG
                  </div>
                  <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "42px", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
                    <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
                  </div>
                  <div style={{ width: "40px", height: "1.5px", background: CURRY, margin: "4px auto 0" }} />
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "10px", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, marginTop: "4px" }}>
                    KARRIERESAMTALE MED BRANCHEFORSTÅELSE
                  </div>
                </div>

                {/* Video */}
                <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(10,22,40,0.15)", marginBottom: "24px" }}>
                  <video
                    ref={claraVideoRef}
                    src="/Avatar_IV_Video.mov"
                    playsInline
                    muted={isMuted}
                    style={{ width: "100%", height: "320px", objectFit: "cover", display: "block", transform: "scale(1.2)", transformOrigin: "center 65%" }}
                  />
                  {!isPlaying && (
                    <div
                      onClick={() => { claraVideoRef.current?.play(); setIsPlaying(true); }}
                      style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <div style={{ width: "36px", height: "36px", background: WHITE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
                        <span style={{ color: TEXT, fontSize: "13px", marginLeft: "3px" }}>▶</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA direkte under video */}
                <button
                  style={{ padding: "10px 24px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer", marginBottom: "16px", display: "block", margin: "0 auto 16px" }}>
                  Skriv til Clara i chatten →
                </button>

                {/* Tekst-indhold */}
                <div style={{ display: "grid", gap: "16px" }}>

                  {/* Intro */}
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: CURRY, marginBottom: "10px" }}>Clara · ByggeTalent Hotline</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: TEXT, lineHeight: 1.3, marginBottom: "12px" }}>Din professionelle hotline til branchen</div>
                    <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75 }}>
                      Som nyuddannet ved du, at hverdagen i bygge- og anlægsbranchen kræver mere end blot teknisk snilde. Komplekse projekter, stramme tidsplaner og en kontant kommunikationsform kræver både robusthed og de rette strategier.
                    </div>
                  </div>

                  {/* Sparring med Clara */}
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: CURRY, marginBottom: "10px" }}>Sparring med Clara</div>
                    <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75, marginBottom: "16px" }}>
                      Clara er din AI-rådgiver i ByggeTalent Hotline. Hun er trænet specifikt i branchens mekanismer og de professionelle udfordringer, du møder i din nye rolle.
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "10px" }}>Brug Clara til direkte sparring om:</div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {[
                        { titel: "Arbejdskultur og trivsel", tekst: "Strategier til at håndtere arbejdspres og tonen i branchen." },
                        { titel: "Professionel udvikling", tekst: "Hvordan du finder din plads og får gennemslagskraft." },
                        { titel: "Konflikthåndtering", tekst: "Input til de svære dialoger med kolleger eller samarbejdspartnere." },
                      ].map((p) => (
                        <div key={p.titel} style={{ padding: "12px 14px", background: CURRY_BG, borderRadius: "10px", border: `1px solid ${CURRY_BORDER}` }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "3px" }}>{p.titel}</div>
                          <div style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>{p.tekst}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "14px", fontSize: "12px", color: MUTED, fontStyle: "italic", lineHeight: 1.6 }}>
                      Oplysningerne er vejledende. Rådfør dig altid med en professionel for lægefaglig rådgivning eller diagnose.
                    </div>
                  </div>

                  {/* Næste skridt */}
                  <div style={{ background: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: CURRY, marginBottom: "10px" }}>Tag næste skridt</div>
                    <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75, marginBottom: "16px" }}>
                      Når du har sparret med Clara, kan du gå i dybden med din trivsel og karriere gennem vores målrettede værktøjer:
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {[
                        { titel: "Arbejdslivstesten (ALT)", tekst: "Få sort på hvidt, hvordan du trives. ALT-testen er et professionelt værktøj, der måler din nuværende situation og identificerer præcis, hvor der skal sættes ind for at sikre din langsigtede holdbarhed i branchen." },
                        { titel: "Personlig Karrieresamtale", tekst: "Har du brug for at tale din profil og retning igennem med en rådgiver? Book en samtale, hvor vi fokuserer på din faglige udvikling og din fremtid i branchen." },
                      ].map((p) => (
                        <div key={p.titel} style={{ padding: "12px 14px", background: CURRY_BG, borderRadius: "10px", border: `1px solid ${CURRY_BORDER}` }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "3px" }}>{p.titel}</div>
                          <div style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>{p.tekst}</div>
                        </div>
                      ))}
                    </div>
                  </div>


                </div>

                {/* Tilbage — nederst i indholdet */}
                <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: "24px", paddingTop: "20px", textAlign: "center" }}>
                  <button
                    onClick={() => { setDetailPage(null); setIsPlaying(false); if (claraVideoRef.current) { claraVideoRef.current.pause(); claraVideoRef.current.currentTime = 0; } }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#6B7A8A", padding: 0 }}
                  >
                    ← Tilbage
                  </button>
                </div>

              </div>
            </div>
          ) : detailPage ? (
            /* Detail view */
            <div style={{ padding: "8px 20px 40px" }}>

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
                <div style={{ display: "grid", gap: "16px" }}>

                  {/* Tilbage fra sub-view — vises ikke for "data" da WorkforceShortage styrer sin egen navigation */}
                  {virksomhedView && virksomhedView !== "data" && (
                    <button onClick={() => setVirksomhedView(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700, color: CURRY, padding: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      ← Tilbage
                    </button>
                  )}

                  {/* Virksomhed forside */}
                  {!virksomhedView && (
                    <div style={{ display: "grid", gap: "8px" }}>

                      {/* Logo */}
                      <div style={{ textAlign: "center", display: "grid", gap: "10px" }}>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: CURRY }}>
                          BYGGE & ANLÆG
                        </div>
                        <div>
                          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "52px", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
                            <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
                          </div>
                          <div style={{ width: "48px", height: "1.5px", background: CURRY, margin: "10px auto 0" }} />
                        </div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: "11px", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED }}>
                          REKRUTTERING MED BRANCHEFORSTÅELSE
                        </div>
                      </div>

                      {/* 3 kort */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        {[
                          { key: "data" as const,    label: "Arbejdskraftdata", sub: "Mangel frem mod 2030",           bg: "#6A9060" },
                          { key: "jobmatch" as const, label: "Jobmatch",         sub: "Find de rigtige kandidater",    bg: "#6E7580" },
                          { key: "samtale" as const,  label: "Projektsamtale",   sub: "Book en uforpligtende samtale", bg: "#C4A03A" },
                        ].map((card) => (
                          <button key={card.key} type="button" onClick={() => setVirksomhedView(card.key)}
                            style={{ borderRadius: "14px", background: card.bg, border: "1px solid transparent",
                              padding: "12px 10px", display: "flex", alignItems: "center", justifyContent: "space-between",
                              gap: "4px", boxShadow: "0 2px 8px rgba(10,22,40,0.10)", cursor: "pointer", width: "100%", textAlign: "left" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: WHITE, lineHeight: 1.3 }}>
                              {card.label}<br />
                              <span style={{ fontWeight: 400, fontSize: "11px", opacity: 0.8 }}>{card.sub}</span>
                            </span>
                            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", flexShrink: 0 }}>→</span>
                          </button>
                        ))}
                      </div>

                      {/* Billede */}
                      <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(10,22,40,0.10)" }}>
                        <img src="/images/håndpåbyggepladsen.png" alt="ByggeTalent virksomhed"
                          style={{ width: "100%", display: "block", maxHeight: "430px", objectFit: "cover", objectPosition: "center 30%" }} />
                      </div>

                    </div>
                  )}

                  {/* Sub-view: Arbejdskraftdata */}
                  {virksomhedView === "data" && <WorkforceShortage onExitToVirksomhed={() => setVirksomhedView(null)} />}

                  {/* Sub-view: Jobmatch */}
                  {virksomhedView === "jobmatch" && (
                    <div style={{ display: "grid", gap: "14px" }}>
                      <div style={{ background: "#0A1628", borderRadius: "16px", padding: "24px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY, marginBottom: "10px" }}>Jobmatch</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: WHITE, lineHeight: 1.25, marginBottom: "10px" }}>Find de rigtige profiler til jeres næste projekt</div>
                        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>Vi matcher jer med kvalificerede kandidater fra vores netværk — screenet og klar til dialog.</div>
                      </div>
                      <div style={{ background: WHITE, borderRadius: "14px", padding: "18px", border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>Beskriv hvilke roller I søger, og vi vender tilbage med relevante profiler inden for 48 timer.</div>
                        <button style={{ marginTop: "14px", width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                          Kontakt os →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sub-view: Projektsamtale */}
                  {virksomhedView === "samtale" && (
                    <div style={{ display: "grid", gap: "14px" }}>
                      <div style={{ background: "#0A1628", borderRadius: "16px", padding: "24px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY, marginBottom: "10px" }}>Projektsamtale</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: WHITE, lineHeight: 1.25, marginBottom: "10px" }}>Vi sammensætter det rigtige team — allerede før projektet starter</div>
                        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>En uforpligtende samtale om jeres bemandingsbehov, projektfaser og rekrutteringsstrategi.</div>
                      </div>
                      <div style={{ background: WHITE, borderRadius: "14px", padding: "18px", border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>Book en samtale direkte med ByggeTalent. Vi mødes fysisk, online eller på telefon — hvad der passer jer bedst.</div>
                        <button style={{ marginTop: "14px", width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: CURRY, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                          Book samtale →
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Tilbage — nederst i indholdet */}
              {virksomhedView !== "data" && !virksomhedView && (
                <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: "8px", paddingTop: "20px", textAlign: "center" }}>
                  <button
                    onClick={() => setDetailPage(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#6B7A8A", padding: 0 }}
                  >
                    ← Tilbage
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Hero + navigation */
            <div style={{ padding: "0 20px 40px", display: "grid", gap: "16px" }}>

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

              {/* Navigation kort */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {navCards.map((card) => {
                  const active = selectedUniverse === card.key;
                  return (
                    <button type="button" key={card.key} onClick={() => card.key === "Kandidat" ? setStep(1) : setDetailPage(card.key)} style={{
                      borderRadius: "6px",
                      background: card.bg,
                      border: active ? `2px solid ${CURRY}` : "1px solid transparent",
                      padding: "14px 10px 14px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "4px",
                      boxShadow: "0 2px 8px rgba(10,22,40,0.10)",
                      cursor: "pointer",
                      width: "100%",
                    }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: WHITE, textAlign: "left", lineHeight: 1.3 }}>
                        {card.label}
                      </span>
                      <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", flexShrink: 0 }}>→</span>
                    </button>
                  );
                })}
              </div>

              {/* Video */}
              <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(10,22,40,0.10)" }}>
                <video
                  src="/Byggetalent 2.0.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ width: "100%", height: "260px", objectFit: "cover", display: "block" }}
                />
              </div>

              {/* Hero billede */}
              <div style={{ borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 4px 16px rgba(10,22,40,0.10)" }}>
                <img
                  src="/images/DIn faglg profil.png"
                  alt="Ingeniør med ByggeTalent på telefonen"
                  style={{ width: "100%", height: "280px", objectFit: "cover", objectPosition: "center 60%", display: "block" }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(10,22,40,0.55) 0%, transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: "16px", left: "16px", fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.70)", letterSpacing: "0.10em" }}>
                  Karrieresamtale
                </div>
              </div>

              {/* Diskret admin-adgang */}
              <div style={{ textAlign: "center", paddingTop: "12px" }}>
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
        <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", background: PAGE_BG }}>

          {step1SubPage === null ? (
            /* ── Hub-visning ── */
            <>
              {/* Logo */}
              <div style={{ background: WHITE, padding: "28px 20px 20px", textAlign: "center", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: "42px", fontWeight: 700, lineHeight: 1 }}>
                  <span style={{ color: TEXT, fontFamily: "Georgia, 'Times New Roman', serif" }}>Bygge</span><span style={{ color: GRANITE, fontFamily: "Georgia, 'Times New Roman', serif" }}>Talent</span>
                </div>
                <div style={{ width: "40px", height: "1.5px", background: CURRY, margin: "10px auto 0" }} />
              </div>

              {/* Video */}
              <div style={{ height: "200px", overflow: "hidden", flexShrink: 0 }}>
                <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} src="/Byggetalent 2.0.mp4" />
              </div>

              {/* Kortknapper */}
              <div style={{ flex: 1, padding: "28px 20px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, fontFamily: "Georgia, serif", textAlign: "center", marginBottom: "4px" }}>
                  START MED
                </div>

                {([
                  { key: "profile" as const, label: "Din profil",       sub: "Kontakt, rolle og faglig baggrund" },
                  { key: "consent" as const, label: "Samtykke",          sub: "Giv dit samtykke til behandling" },
                  { key: "privacy" as const, label: "Privatlivspolitik", sub: "Læs hvordan vi behandler dine data" },
                ]).map((card) => (
                  <button
                    key={card.key}
                    onClick={() => setStep1SubPage(card.key)}
                    style={{ textAlign: "left", padding: "16px 18px", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%", boxShadow: "0 2px 8px rgba(10,22,40,0.05)" }}
                  >
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: TEXT }}>{card.label}</div>
                      <div style={{ fontSize: "13px", color: MUTED, marginTop: "3px" }}>{card.sub}</div>
                    </div>
                    <span style={{ color: CURRY, fontSize: "18px", flexShrink: 0, fontWeight: 700 }}>→</span>
                  </button>
                ))}
              </div>

              {/* Bund-navigation */}
              <div style={{ position: "sticky", bottom: 0, background: WHITE, padding: "14px 20px 32px", borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em" }}
                  onClick={async () => {
                    const application = {
                      name: form.name,
                      last_name: form.lastName,
                      email: form.email,
                      phone: form.phone,
                      address: form.address,
                      current_title: form.currentTitle,
                      experience: form.experience,
                      linkedin: form.linkedin,
                      salary: form.salary,
                      distance: form.distance,
                      supplementary_info: form.supplementaryInfo,
                      profiles: form.profiles,
                      profile_other_title: form.profileOtherTitle,
                      submitted_at: new Date().toISOString(),
                      status: "ny",
                      notes: "",
                    };
                    await supabase.from("applications").insert([application]);
                    setStep(2);
                  }}
                >
                  Videre til ALT →
                </button>
                <button onClick={() => setStep(0)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: MUTED, fontWeight: 600, padding: 0, textAlign: "center" }}>
                  ← Tilbage
                </button>
              </div>
            </>
          ) : (
            /* ── Underpaneler ── */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: PAGE_BG }}>

              {/* Top bar */}
              <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${BORDER}`, background: WHITE, position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: "12px" }}>
                <button onClick={() => setStep1SubPage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: "13px", fontWeight: 600, padding: 0 }}>
                  ← Tilbage
                </button>
              </div>

              {/* Din profil */}
              {step1SubPage === "profile" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 100px", display: "flex", flexDirection: "column", gap: "28px" }}>
                  <FormSection label="Dit navn">
                    <TextInput placeholder="Fornavn" value={form.name} onChange={(v) => update("name", v)} />
                    <TextInput placeholder="Efternavn" value={form.lastName} onChange={(v) => update("lastName", v)} />
                  </FormSection>
                  <FormSection label="Kontakt">
                    <TextInput placeholder="E-mail" value={form.email} onChange={(v) => update("email", v)} />
                    <TextInput placeholder="Telefon" value={form.phone} onChange={(v) => update("phone", v)} />
                    <TextInput placeholder="Adresse / by / postnummer" value={form.address} onChange={(v) => update("address", v)} />
                  </FormSection>
                  <FormSection label="Din rolle">
                    <TextInput placeholder="Nuværende titel / rolle" value={form.currentTitle} onChange={(v) => update("currentTitle", v)} />
                    <TextInput placeholder="LinkedIn" value={form.linkedin} onChange={(v) => update("linkedin", v)} />
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
                  <FormSection label={<>En kort note <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(valgfrit)</span></>}>
                    <textarea style={textareaSt} placeholder="Hvad skal vi vide om dig?" value={form.supplementaryInfo} onChange={(e) => update("supplementaryInfo", e.target.value)} />
                  </FormSection>
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
        <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

          {/* Top bar */}
          <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${BORDER}`, background: WHITE, position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: 700, marginBottom: "6px" }}>
              <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE, fontFamily: "Georgia, serif" }}>Talent</span>
            </div>
            <div style={{ fontSize: "13px", color: MUTED }}>Trin 3 af 4 · ALT</div>
            <div style={{ marginTop: "8px", height: "3px", background: BORDER, borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ width: "75%", height: "100%", background: CURRY, borderRadius: "99px" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 40px" }}>

            {/* ── Intro: rollevalg ── */}
            {altPhase === "intro" && (
              <div style={{ display: "grid", gap: "16px" }}>
                <div>
                  <h2 style={{ margin: "0 0 6px", fontSize: "24px", lineHeight: 1.15, fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>
                    Arbejdslivstest · ALT
                  </h2>
                  <p style={{ margin: 0, fontSize: "15px", color: MUTED, lineHeight: 1.6 }}>
                    Testen giver dig et øjebliksbillede af dit arbejdsliv — tilpasset din rolle i branchen.
                  </p>
                </div>

                <div style={{ background: WHITE, borderRadius: "16px", padding: "18px", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>Vælg din rolle for at starte</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {([
                      { r: "Leder", sub: "For dig med personale- eller projektansvar" },
                      { r: "Fagspecialist", sub: "For dig der arbejder med faglige leverancer" },
                      { r: "Nyuddannet", sub: "For dig der er ny i branchen (0–2 år)" },
                    ] as const).map(({ r, sub }) => (
                      <button key={r} type="button" onClick={() => setAltRole(r)}
                        style={{ textAlign: "left", padding: "14px 16px", borderRadius: "12px", border: altRole === r ? `2px solid ${CURRY}` : `1.5px solid ${BORDER}`, background: altRole === r ? CURRY_BG : "#FAFAF8", cursor: "pointer" }}>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: altRole === r ? CURRY : TEXT }}>{r}</div>
                        <div style={{ fontSize: "13px", color: MUTED, marginTop: "2px" }}>{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startAlt}
                  disabled={!altRole}
                  style={{ padding: "15px", borderRadius: "14px", border: "none", background: altRole ? CURRY : BORDER, color: altRole ? WHITE : MUTED, fontSize: "15px", fontWeight: 700, cursor: altRole ? "pointer" : "not-allowed" }}
                >
                  {altRole ? `Start ALT som ${altRole} →` : "Vælg din rolle for at starte"}
                </button>
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
            <button
              onClick={() => {
                if (altPhase === "quiz") { setAltPhase("intro"); setAltAnswers([]); setAltCurrentQ(0); }
                else if (altPhase === "result") { setAltPhase("intro"); setAltAnswers([]); setAltCurrentQ(0); }
                else setStep(1);
              }}
              style={backBtnSt}
            >←</button>
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
            <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: "13px", fontWeight: 600, padding: 0, marginBottom: "14px" }}>← Tilbage</button>
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
          <button onClick={() => setView("detail")} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: "13px", fontWeight: 600, padding: 0, marginBottom: "20px" }}>← Tilbage</button>

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
function WSAccordion({ title, sub, children, defaultOpen }: { title: string; sub: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
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

      {/* ── BYGGETALENT NEWS ── */}
      <div style={{ borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(10,22,40,0.14)" }}>

        {/* FULD VIDEOBAGGRUND — TV2-stil */}
        <div style={{ position: "relative", height: "420px", overflow: "hidden" }}>

          {/* Baggrundsvideo */}
          <video
            autoPlay muted loop playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="/byggetalent-news.mov" type="video/quicktime" />
            <source src="/byggetalent-news.mov" type="video/mp4" />
          </video>

          {/* Gradient overlay — transparent øverst, navy i bunden */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35%, rgba(10,22,40,0.75) 65%, rgba(10,22,40,0.97) 100%)" }} />

          {/* TOP: Logo + LIVE */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(10,22,40,0.80)", backdropFilter: "blur(6px)", padding: "6px 12px", borderRadius: "8px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: 700 }}>
                <span style={{ color: WHITE }}>Bygge</span><span style={{ color: CURRY }}>Talent</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#C0392B", borderRadius: "4px", padding: "2px 7px" }}>
                <span style={{ fontSize: "9px", fontWeight: 800, color: WHITE, letterSpacing: "0.18em" }}>NEWS</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#C0392B", borderRadius: "5px", padding: "5px 11px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: WHITE, animation: "wspulse 1s ease infinite" }} />
              <span style={{ fontSize: "10px", fontWeight: 800, color: WHITE, letterSpacing: "0.14em" }}>LIVE</span>
            </div>
          </div>

          {/* BUND: TV lower-third — 3 smalle striber */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2 }}>

            {/* Stripe 1: Rød — BREAKING NEWS + kategori */}
            <div style={{ background: "#C0392B", padding: "5px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: WHITE, animation: "wspulse 1s ease infinite" }} />
                <span style={{ fontSize: "9px", fontWeight: 900, color: WHITE, letterSpacing: "0.18em" }}>BREAKING NEWS</span>
              </div>
              <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.3)" }} />
              <span style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.10em", opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}>
                {current.eyebrow.toUpperCase()}
              </span>
            </div>

            {/* Stripe 2: Hvid — tal + kort label */}
            <div style={{ background: WHITE, padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#111", letterSpacing: "-0.01em", fontFamily: "Georgia, serif" }}>
                  {current.number}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#444", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {current.eyebrow}
                </span>
              </div>
              <div style={{ display: "flex", gap: "3px" }}>
                {WS_FACTS.map((_, i) => (
                  <button key={i} onClick={() => { setVisible(false); setTimeout(() => { setFact(i); setVisible(true); }, 280); }}
                    style={{ width: i === fact ? "14px" : "4px", height: "4px", borderRadius: "2px", background: i === fact ? "#C0392B" : "#CCCCCC", border: "none", cursor: "pointer", padding: 0, transition: "width 0.3s ease" }} />
                ))}
              </div>
            </div>

            {/* Stripe 3: Sort — beskrivende tekst hvid */}
            <div style={{ background: "#111111", padding: "5px 12px" }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.90)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {visible && current.label.split(" ").map((word, i) => (
                  <span key={`${fact}-${i}`} style={{ display: "inline-block", marginRight: "3px", animation: "wsword 0.15s ease forwards", animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Stripe 4: Gold ticker */}
            <div style={{ background: CURRY, overflow: "hidden", padding: "5px 0" }}>
              <div style={{ display: "flex", gap: "32px", animation: "wsticker 6s linear infinite", whiteSpace: "nowrap" }}>
                {[...Array(5)].flatMap(() => [
                  "99.000 faglærte mangler", "·", "24.000 KVU mangler", "·", "13.000 MVU mangler", "·",
                  "11 kritiske faggrupper", "·", "Elektriker · VVS · BIM · Tømrer · Energirådgiver", "·",
                ]).map((t, i) => (
                  <span key={i} style={{ fontSize: "10px", fontWeight: t === "·" ? 400 : 700, color: t === "·" ? "rgba(10,22,40,0.30)" : NAVY, letterSpacing: "0.05em" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
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
      ].map((sec, i) => (
        <WSAccordion key={sec.id} title={sec.title} sub={sec.sub} defaultOpen={i === 0}>{sec.content}</WSAccordion>
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
