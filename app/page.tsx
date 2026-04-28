"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { groupedRoles, groupNames, testQuestions } from "./data";

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
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));
  const [showResult, setShowResult] = useState(false);
  const [selectedUniverse, setSelectedUniverse] = useState("Kandidat");
  const [detailPage, setDetailPage] = useState<string | null>(null);
  const [virksomhedView, setVirksomhedView] = useState<null | "data" | "jobmatch" | "samtale">(null);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const totalScore = answers.reduce((sum, v) => sum + v, 0);

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

  function submitJobApplication() {
    if (!selectedJob) return;
    setJobSending(true);
    setTimeout(() => {
      const app = {
        id: Date.now().toString(),
        name: jobForm.name.split(" ")[0] || jobForm.name,
        lastName: jobForm.name.split(" ").slice(1).join(" ") || "",
        email: jobForm.email, phone: jobForm.phone, address: "",
        currentTitle: "", linkedin: "", salary: "", distance: "",
        experience: jobForm.experience ? `${jobForm.experience} år` : "",
        supplementaryInfo: `${jobForm.motivation}${jobForm.skills ? `\n\nKompetencer: ${jobForm.skills}` : ""}`,
        profiles: jobForm.skills ? jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        profileOtherTitle: "",
        submittedAt: new Date().toISOString(),
        status: "ny", notes: "", jobId: selectedJob.id, jobTitle: selectedJob.title,
      };
      const existing = JSON.parse(localStorage.getItem("bt_applications") || "[]");
      localStorage.setItem("bt_applications", JSON.stringify([...existing, app]));
      setJobSending(false);
      setJobView("success");
    }, 800);
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
    { key: "Om Byggetalent", label: "Om Byggetalent", sub: "Menneskerne bag", bg: "#C4A03A" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ─── Step 0: Forside ──────────────────────────────────────────── */}
      {step === 0 && (
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 0 40px" }}>

          {detailPage ? (
            /* Detail view */
            <div style={{ padding: "8px 20px 40px" }}>
              {/* Skjules når WorkforceShortage styrer sin egen back-navigation */}
              {virksomhedView !== "data" && (
                <button
                  onClick={() => setDetailPage(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 700, color: CURRY, padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}
                >
                  ← Tilbage
                </button>
              )}

              {detailPage === "Om Byggetalent" && (
                <div style={{ background: WHITE, borderRadius: "20px", padding: "24px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px rgba(10,22,40,0.07)", display: "grid", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundImage: "url('/images/Karina Maria - Founder.png')", backgroundSize: "cover", backgroundPosition: "center", border: `2px solid ${CURRY_BORDER}`, flexShrink: 0 }} />
                    <div>
                      <div style={labelSt}>Bag ByggeTalent</div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>Karina Maria Nyberg</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "15px", lineHeight: 1.7, color: MUTED }}>ByggeTalent er skabt med fokus på HR, rekruttering, organisationsudvikling og stærke projektteams i bygge- og anlægsbranchen.</div>
                  <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: "999px", background: CURRY_BG, color: CURRY, fontSize: "12px", fontWeight: 700, width: "fit-content" }}>HR · rekruttering · teams</div>
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
            </div>
          ) : (
            /* Hero + navigation */
            <div style={{ padding: "0 20px 40px", display: "grid", gap: "16px" }}>

              {/* Logo */}
              <div style={{ textAlign: "center", paddingTop: "36px", display: "grid", gap: "10px" }}>
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

              {/* Navigation kort */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {navCards.map((card) => {
                  const active = selectedUniverse === card.key;
                  return (
                    <button type="button" key={card.key} onClick={() => setDetailPage(card.key)} style={{
                      borderRadius: "14px",
                      background: card.bg,
                      border: active ? `2px solid ${CURRY}` : "1px solid transparent",
                      padding: "12px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "4px",
                      boxShadow: "0 2px 8px rgba(10,22,40,0.10)",
                      cursor: "pointer",
                      width: "100%",
                    }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: WHITE, textAlign: "left", lineHeight: 1.3 }}>
                        {card.label}<br />
                        <span style={{ fontWeight: 400, fontSize: "11px", opacity: 0.8 }}>{card.sub}</span>
                      </span>
                      <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", flexShrink: 0 }}>→</span>
                    </button>
                  );
                })}
              </div>

              {/* Video */}
              <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(10,22,40,0.10)" }}>
                <video
                  src="/Byggetalent.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ width: "100%", display: "block" }}
                />
              </div>

              {/* Hero billede */}
              <div style={{ borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 4px 16px rgba(10,22,40,0.10)" }}>
                <img
                  src="/images/DIn faglg profil.png"
                  alt="Ingeniør med ByggeTalent på telefonen"
                  style={{ width: "100%", height: "380px", objectFit: "cover", objectPosition: "center 42%", display: "block" }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(10,22,40,0.55) 0%, transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: "16px", left: "16px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.90)", letterSpacing: "0.06em" }}>
                  INGENIØR · ARKITEKT · HÅNDVÆRKER
                </div>
              </div>

              {/* CTA knap */}
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ width: "100%", padding: "17px", borderRadius: "16px", border: "none", background: CURRY, color: WHITE, fontSize: "16px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em" }}
              >
                Kom i gang →
              </button>


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
                <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} src="/Byggetalent.mp4" />
              </div>

              {/* Kortknapper */}
              <div style={{ flex: 1, padding: "28px 20px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, fontFamily: "Georgia, serif", textAlign: "center", marginBottom: "4px" }}>
                  INDEN DU STARTER ALT
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
                  onClick={() => {
                    const application = { ...form, id: Date.now().toString(), submittedAt: new Date().toISOString() };
                    const existing = JSON.parse(localStorage.getItem("bt_applications") || "[]");
                    localStorage.setItem("bt_applications", JSON.stringify([...existing, application]));
                    window.location.href = "/alt-test";
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
                <button onClick={() => setStep1SubPage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: CURRY, fontSize: "15px", fontWeight: 700, padding: 0 }}>
                  ← Tilbage
                </button>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: 700, flex: 1, textAlign: "right" }}>
                  <span style={{ color: TEXT }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
                </div>
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

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 120px" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: "24px", lineHeight: 1.15, fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>
              Hvordan oplever du dit arbejdsliv lige nu?
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: "15px", color: MUTED, lineHeight: 1.6 }}>
              Vurder hvert udsagn fra 1 til 5.
            </p>

            <div style={{ display: "grid", gap: "16px" }}>
              {testQuestions.map((question, index) => (
                <div key={index} style={{ background: WHITE, borderRadius: "16px", padding: "16px", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT, lineHeight: 1.5, marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <span>{index + 1}. {question}</span>
                    {answers[index] > 0 && (
                      <span style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: CURRY, color: WHITE, display: "grid", placeItems: "center", fontSize: "13px", fontWeight: 700 }}>
                        {answers[index]}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((val) => {
                      const sel = answers[index] === val;
                      return (
                        <button key={val} type="button"
                          onClick={() => { const u = [...answers]; u[index] = val; setAnswers(u); }}
                          style={{
                            flex: 1, padding: "13px 0", borderRadius: "12px",
                            border: sel ? `2px solid ${CURRY}` : `1.5px solid ${BORDER}`,
                            background: sel ? CURRY_BG : "#FAFAF8",
                            color: sel ? CURRY : MUTED,
                            fontSize: "16px", fontWeight: 700, cursor: "pointer",
                          }}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                    <span style={{ fontSize: "10px", color: MUTED }}>Lav</span>
                    <span style={{ fontSize: "10px", color: MUTED }}>Høj</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Resultat */}
            {showResult && (
              <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
                <div style={{ background: WHITE, borderRadius: "20px", padding: "20px", border: `1.5px solid ${CURRY_BORDER}` }}>
                  <div style={labelSt}>Resultatoversigt</div>
                  <h3 style={{ margin: "8px 0 6px", fontSize: "22px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>
                    Din karriereposition lige nu
                  </h3>
                  <p style={{ margin: "0 0 20px", fontSize: "14px", color: MUTED, lineHeight: 1.65 }}>
                    Dine svar giver et samlet billede af, hvor godt din nuværende rolle matcher det, du har brug for i arbejdslivet.
                  </p>

                  {/* Score cirkel */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: "130px", height: "130px", borderRadius: "50%", background: `conic-gradient(${CURRY} ${(totalScore / 50) * 360}deg, ${BORDER} 0deg)`, display: "grid", placeItems: "center", margin: "0 auto" }}>
                        <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: WHITE, display: "grid", placeItems: "center", textAlign: "center" }}>
                          <div>
                            <div style={{ fontSize: "32px", fontWeight: 800, color: TEXT, lineHeight: 1 }}>{totalScore}</div>
                            <div style={{ fontSize: "11px", color: MUTED, marginTop: "3px" }}>ud af 50</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: 700, color: TEXT }}>Samlet score</div>
                    </div>
                  </div>

                  {/* Insight tiles */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[
                      { title: "Det du savner", percent: Math.round((((answers[0] || 0) + (answers[1] || 0) + (answers[2] || 0)) / 15) * 100), text: "Match mellem rolle, styrker og energi." },
                      { title: "Det du ønsker mere af", percent: Math.round((((answers[3] || 0) + (answers[4] || 0) + (answers[5] || 0)) / 15) * 100), text: "Samarbejde, indflydelse og vilkår." },
                      { title: "Det du ønsker mindre af", percent: Math.round((((answers[6] || 0) + (answers[7] || 0)) / 10) * 100), text: "Tempo, belastning og ubalance." },
                      { title: "Det der peger fremad", percent: Math.round((((answers[8] || 0) + (answers[9] || 0)) / 10) * 100), text: "Retning, tidshorisont og næste skridt." },
                    ].map((item) => {
                      const sc = item.percent < 40 ? "#C0392B" : item.percent < 70 ? "#C9A820" : "#2E7D32";
                      const sl = item.percent < 40 ? "Lavt fokus" : item.percent < 70 ? "Stabilt signal" : "Høj prioritet";
                      return (
                        <div key={item.title} style={{ background: "#FAFAF8", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "14px", display: "grid", gap: "8px" }}>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.title}</div>
                          <div style={{ fontSize: "28px", fontWeight: 800, color: TEXT, lineHeight: 1 }}>{item.percent}%</div>
                          <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: "999px", background: `${sc}18`, color: sc, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", width: "fit-content" }}>{sl}</div>
                          <div style={{ fontSize: "12px", lineHeight: 1.5, color: MUTED }}>{item.text}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Konklusion */}
                  <div style={{ marginTop: "14px", padding: "16px", borderRadius: "14px", background: CURRY_BG, border: `1px solid ${CURRY_BORDER}`, display: "grid", gap: "6px" }}>
                    <div style={labelSt}>Foreløbig konklusion</div>
                    <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>Din arbejdssituation lige nu</h4>
                    <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.7, color: MUTED }}>Din score viser klare signaler om, hvad du savner, hvad du ønsker mere af, og hvad der eventuelt kalder på næste skridt.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fast bund-navigation */}
          <div style={{ position: "sticky", bottom: 0, background: WHITE, borderTop: `1px solid ${BORDER}`, padding: "14px 20px 24px", display: "flex", gap: "10px" }}>
            <button onClick={() => showResult ? setShowResult(false) : setStep(1)} style={backBtnSt}>←</button>
            {!showResult ? (
              <button
                style={{ flex: 1, padding: "15px", borderRadius: "14px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
                onClick={() => { setShowResult(true); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 150); }}
              >
                Se mit resultat →
              </button>
            ) : (
              <button style={{ flex: 1, padding: "15px", borderRadius: "14px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer" }} onClick={() => {}}>
                Videre →
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

// ─── Workforce Shortage Insights ─────────────────────────────────────────────

// ── Data — kun validerede tal og kategorier (AE-rådet 2024) ──
const SD = {
  kategorier: [
    { navn: "Håndværk", color: "#6A9060", roller: [
      { navn: "Elektriker",       note: "Solceller, ladestandere, energieffektivisering" },
      { navn: "VVS",              note: "Omstilling til grønne varmekilder" },
      { navn: "Tømrer",           note: "Central rolle i renoveringsprojekter" },
      { navn: "Maskinsnedker",    note: "Præfabrikerede byggemoduler" },
      { navn: "Anlægsstruktør",   note: "Infrastrukturprojekter" },
    ]},
    { navn: "Bæredygtighed", color: "#C4A03A", roller: [
      { navn: "Energirådgiver",       note: "EPBD-direktiv og energimærkning" },
      { navn: "Materialespecialist",  note: "Bæredygtige og cirkulære materialer" },
      { navn: "Renoveringsfaglært",   note: "Energiforbedring af eksisterende bygningsmasse" },
    ]},
    { navn: "Teknik & ledelse", color: "#2563EB", roller: [
      { navn: "Byggeleder",     note: "Bæredygtighedscertificeringer (DGNB, BREEAM)" },
      { navn: "Projektleder",   note: "Bæredygtighedscertificeringer og planlægning" },
      { navn: "BIM-specialist", note: "Digitalisering og Building Information Modeling" },
    ]},
  ],
  drivere: [
    { icon: "👴", label: "Demografi",      sub: "Store årgange pensioneres — for få unge erstatter dem" },
    { icon: "🌿", label: "Grøn omstilling", sub: "Solceller, varmepumper og energiinfrastruktur kræver nye kompetencer" },
    { icon: "🏗️", label: "Renovering",    sub: "Kræver flere arbejdstimer pr. m² end nybyggeri" },
  ],
  svar: [
    { icon: "🤖", label: "Præfabrikation", sub: "Teknologi og modulbyggeri reducerer behovet for hænder" },
    { icon: "🌍", label: "Udenlandsk arbejdskraft", sub: "Rekruttering på tværs af grænser" },
    { icon: "💼", label: "Arbejdsmiljø",   sub: "Fastholdelse via bedre vilkår og trivsel" },
  ],
};

// ─── Mini-visualiseringer ──────────────────────────────────────────────────────

function MiniBarChart() {
  const bars = [
    { label: "Faglærte", n: 99000, color: CURRY },
    { label: "KVU",      n: 24000, color: "#6A9060" },
    { label: "MVU",      n: 13000, color: "#2563EB" },
  ];
  return (
    <div style={{ display: "grid", gap: "10px" }}>
      {bars.map(b => (
        <div key={b.label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: TEXT }}>{b.label}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: b.color }}>{(b.n / 1000).toFixed(0)}.000</span>
          </div>
          <div style={{ height: "10px", background: "#F0ECE5", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round(b.n / 99000 * 100)}%`, background: b.color, borderRadius: "5px" }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: "9px", color: MUTED, fontStyle: "italic", marginTop: "2px" }}>Absolutte tal · ingen procenter</div>
    </div>
  );
}

function RoleCluster() {
  return (
    <svg width="100%" viewBox="0 0 240 90" style={{ overflow: "visible" }}>
      {/* Håndværk: 5 roller — størst boble */}
      <circle cx="52" cy="45" r="40" fill="#6A906015" stroke="#6A9060" strokeWidth="1.5" />
      <text x="52" y="40" textAnchor="middle" fontSize="18" fontWeight="700" fill="#6A9060" fontFamily="Georgia, serif">5</text>
      <text x="52" y="56" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6A9060" fontFamily="inherit">Håndværk</text>
      {/* Bæredygtighed: 3 roller */}
      <circle cx="138" cy="45" r="30" fill="#C4A03A15" stroke="#C4A03A" strokeWidth="1.5" />
      <text x="138" y="40" textAnchor="middle" fontSize="18" fontWeight="700" fill="#C4A03A" fontFamily="Georgia, serif">3</text>
      <text x="138" y="56" textAnchor="middle" fontSize="9" fontWeight="700" fill="#C4A03A" fontFamily="inherit">Bæredygtig.</text>
      {/* Teknik: 3 roller */}
      <circle cx="210" cy="45" r="30" fill="#2563EB15" stroke="#2563EB" strokeWidth="1.5" />
      <text x="210" y="40" textAnchor="middle" fontSize="18" fontWeight="700" fill="#2563EB" fontFamily="Georgia, serif">3</text>
      <text x="210" y="56" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2563EB" fontFamily="inherit">Teknik</text>
    </svg>
  );
}

function CauseMap() {
  return (
    <svg width="100%" viewBox="0 0 240 72" style={{ overflow: "visible" }}>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L7,3.5z" fill={MUTED} />
        </marker>
      </defs>
      {/* Node 1 */}
      <rect x="2" y="18" width="66" height="36" rx="10" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.2" />
      <text x="35" y="33" textAnchor="middle" fontSize="9" fontWeight="700" fill="#DC2626">Demografi</text>
      <text x="35" y="46" textAnchor="middle" fontSize="8" fill="#DC2626">−faglærte</text>
      {/* Arrow */}
      <line x1="70" y1="36" x2="84" y2="36" stroke={MUTED} strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* Node 2 */}
      <rect x="86" y="18" width="68" height="36" rx="10" fill="#F0FDF4" stroke="#6A9060" strokeWidth="1.2" />
      <text x="120" y="33" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6A9060">Grøn omstilling</text>
      <text x="120" y="46" textAnchor="middle" fontSize="8" fill="#6A9060">+kompetencer</text>
      {/* Arrow */}
      <line x1="156" y1="36" x2="170" y2="36" stroke={MUTED} strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* Node 3 */}
      <rect x="172" y="18" width="66" height="36" rx="10" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.2" />
      <text x="205" y="33" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2563EB">Renovering</text>
      <text x="205" y="46" textAnchor="middle" fontSize="8" fill="#2563EB">+arbejdstimer</text>
    </svg>
  );
}

function DecisionMatrix() {
  const items = [
    { icon: "🤖", label: "Præfabrikation", color: CURRY },
    { icon: "🌍", label: "Rekruttér internationalt", color: "#6A9060" },
    { icon: "💼", label: "Bedre arbejdsmiljø", color: "#2563EB" },
    { icon: "🤝", label: "Sammensæt tidligt", color: "#7C3AED" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
      {items.map(i => (
        <div key={i.label} style={{ background: i.color + "15", border: `1px solid ${i.color}35`, borderRadius: "10px", padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>{i.icon}</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: i.color, marginTop: "4px", lineHeight: 1.3 }}>{i.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Insight detail views ─────────────────────────────────────────────────────

function MangelDetail() {
  const bars = [
    { label: "Faglærte", n: 99000, tag: "Størst mangel", tagColor: "#DC2626", color: CURRY },
    { label: "KVU",      n: 24000, tag: "Kortere videregående", tagColor: "#D97706", color: "#6A9060" },
    { label: "MVU",      n: 13000, tag: "Mellemlang uddannelse", tagColor: "#2563EB", color: "#2563EB" },
  ];
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ background: NAVY, borderRadius: "14px", padding: "18px" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY }}>AE-rådet · 2024</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: WHITE, marginTop: "4px" }}>Mangel pr. uddannelsesniveau</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "40px", fontWeight: 700, color: CURRY, marginTop: "6px", lineHeight: 1 }}>99k</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>faglærte mangler i 2030</div>
      </div>
      <div style={{ background: WHITE, borderRadius: "14px", padding: "16px 18px", border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "16px" }}>Forventet mangel · absolutte tal</div>
        {bars.map(b => (
          <div key={b.label} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>{b.label}</span>
                <span style={{ fontSize: "10px", color: b.tagColor, fontWeight: 700, background: b.tagColor + "15", borderRadius: "999px", padding: "2px 8px", marginLeft: "8px" }}>{b.tag}</span>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: b.color, fontFamily: "Georgia, serif" }}>{(b.n / 1000).toFixed(0)}.000</span>
            </div>
            <div style={{ height: "12px", background: "#F0ECE5", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round(b.n / 99000 * 100)}%`, background: b.color, borderRadius: "6px" }} />
            </div>
          </div>
        ))}
        <div style={{ fontSize: "10px", color: MUTED, fontStyle: "italic" }}>Søjler viser absolutte tal — ingen procenter</div>
      </div>
      <button style={{ padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: NAVY, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
        Se jobmatch →
      </button>
    </div>
  );
}

function RollerDetail() {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ background: NAVY, borderRadius: "14px", padding: "18px" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY }}>11 kritiske roller</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: WHITE, marginTop: "4px" }}>Rolleområder · bygge & anlæg</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>Håndværk · Bæredygtighed · Teknik & ledelse</div>
      </div>
      {SD.kategorier.map(g => (
        <div key={g.navn} style={{ background: WHITE, borderRadius: "14px", padding: "16px 18px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: g.color }} />
            <span style={{ fontSize: "10px", fontWeight: 700, color: g.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{g.navn} · {g.roller.length} roller</span>
          </div>
          <div style={{ display: "grid", gap: "6px" }}>
            {g.roller.map(r => (
              <div key={r.navn} style={{ background: g.color + "10", border: `1px solid ${g.color}30`, borderRadius: "10px", padding: "10px 12px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT }}>{r.navn}</div>
                <div style={{ fontSize: "11px", color: MUTED, marginTop: "3px" }}>{r.note}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button style={{ padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: NAVY, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
        Find team →
      </button>
    </div>
  );
}

function DrivereDetail() {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ background: NAVY, borderRadius: "14px", padding: "18px" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY }}>3 strukturelle årsager</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: WHITE, marginTop: "4px" }}>Hvorfor opstår manglen?</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>Demografi · Grøn omstilling · Renovering</div>
      </div>
      {SD.drivere.map((d, i) => (
        <div key={d.label} style={{ background: WHITE, borderRadius: "14px", padding: "16px 18px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "28px", flexShrink: 0 }}>{d.icon}</div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: "4px" }}>Årsag {i + 1}</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: TEXT }}>{d.label}</div>
              <div style={{ fontSize: "12px", color: MUTED, marginTop: "6px", lineHeight: 1.5 }}>{d.sub}</div>
            </div>
          </div>
        </div>
      ))}
      <button style={{ padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: NAVY, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
        Start projektsamtale →
      </button>
    </div>
  );
}

function SvarDetail() {
  const handlinger = [
    { icon: "📋", label: "Planlæg", sub: "Kortlæg kritiske roller 2–3 år frem" },
    { icon: "🎓", label: "Udvikl", sub: "Opkvalificér internt — BIM & energi" },
    { icon: "🌍", label: "Rekruttér internationalt", sub: "Udvid søgefeltet på tværs af grænser" },
    { icon: "🤝", label: "Sammensæt tidligt", sub: "Byg projektteams i prækvalificeringen" },
  ];
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ background: NAVY, borderRadius: "14px", padding: "18px" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: CURRY }}>Virksomhedernes svar</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: WHITE, marginTop: "4px" }}>Sådan imødegår I manglen</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>Præfabrikation · Rekruttering · Arbejdsmiljø</div>
      </div>
      {SD.svar.map(s => (
        <div key={s.label} style={{ background: WHITE, borderRadius: "14px", padding: "16px 18px", border: `1px solid ${BORDER}`, display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "26px", flexShrink: 0 }}>{s.icon}</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>{s.label}</div>
            <div style={{ fontSize: "12px", color: MUTED, marginTop: "5px", lineHeight: 1.5 }}>{s.sub}</div>
          </div>
        </div>
      ))}
      <div style={{ background: CURRY_BG, borderRadius: "14px", padding: "16px 18px", border: `1px solid ${CURRY_BORDER}` }}>
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: CURRY, marginBottom: "12px" }}>Hvad bør I gøre nu?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {handlinger.map(h => (
            <div key={h.label} style={{ background: WHITE, borderRadius: "10px", padding: "12px 10px", border: `1px solid ${CURRY_BORDER}` }}>
              <div style={{ fontSize: "20px", marginBottom: "5px" }}>{h.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{h.label}</div>
              <div style={{ fontSize: "10px", color: MUTED, marginTop: "3px", lineHeight: 1.4 }}>{h.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <button style={{ padding: "14px", borderRadius: "12px", border: "none", background: CURRY, color: NAVY, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
        Start projektsamtale →
      </button>
    </div>
  );
}

// ─── WorkforceShortage: hero + swipeable insight cards ────────────────────────

function WorkforceShortage({ onExitToVirksomhed }: { onExitToVirksomhed: () => void }) {
  const [activeCard, setActiveCard] = useState<null | "mangel" | "roller" | "drivere" | "svar">(null);

  const backBtn = (label: string, onClick: () => void) => (
    <button onClick={onClick}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700, color: CURRY, padding: 0, display: "flex", alignItems: "center", gap: "6px" }}>
      ← {label}
    </button>
  );

  if (activeCard === "mangel")  return <div style={{ display: "grid", gap: "12px" }}>{backBtn("Indsigter", () => setActiveCard(null))}<MangelDetail /></div>;
  if (activeCard === "roller")  return <div style={{ display: "grid", gap: "12px" }}>{backBtn("Indsigter", () => setActiveCard(null))}<RollerDetail /></div>;
  if (activeCard === "drivere") return <div style={{ display: "grid", gap: "12px" }}>{backBtn("Indsigter", () => setActiveCard(null))}<DrivereDetail /></div>;
  if (activeCard === "svar")    return <div style={{ display: "grid", gap: "12px" }}>{backBtn("Indsigter", () => setActiveCard(null))}<SvarDetail /></div>;

  const cards: { id: "mangel" | "roller" | "drivere" | "svar"; category: string; title: string; sub: string; visual: React.ReactNode }[] = [
    {
      id: "mangel",
      category: "Uddannelsesniveau",
      title: "99k faglærte mangler i 2030",
      sub: "Størst mangel på faglærte — derefter KVU og MVU",
      visual: <MiniBarChart />,
    },
    {
      id: "roller",
      category: "Faggrupper",
      title: "11 kritiske rolleområder",
      sub: "Håndværk, Bæredygtighed og Teknik & ledelse",
      visual: <RoleCluster />,
    },
    {
      id: "drivere",
      category: "Årsager",
      title: "3 drivere bag manglen",
      sub: "Demografi · Grøn omstilling · Renovering",
      visual: <CauseMap />,
    },
    {
      id: "svar",
      category: "Strategi",
      title: "Virksomhedernes svar",
      sub: "Præfabrikation · Rekruttering · Arbejdsmiljø",
      visual: <DecisionMatrix />,
    },
  ];

  return (
    <div style={{ display: "grid", gap: "16px" }}>

      {/* Tilbage til Virksomhed */}
      {backBtn("Virksomhed", onExitToVirksomhed)}

      {/* Hero */}
      <div style={{ background: NAVY, borderRadius: "16px", padding: "20px 18px" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: CURRY }}>AE-rådet · 2024</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: WHITE, marginTop: "6px", lineHeight: 1.2 }}>Arbejdskraftmangel<br />i bygge & anlæg · 2030</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "12px" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "44px", fontWeight: 700, color: CURRY, lineHeight: 1 }}>99k</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>faglærte mangler</span>
        </div>
      </div>

      {/* Swipe hint */}
      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
        4 indsigter — stryg →
      </div>

      {/* Swipeable insight cards */}
      <div style={{
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        paddingBottom: "4px",
        marginLeft: "-20px",
        paddingLeft: "20px",
        marginRight: "-20px",
        paddingRight: "20px",
      } as React.CSSProperties}>
        {cards.map(c => (
          <div key={c.id} style={{
            minWidth: "78%",
            maxWidth: "78%",
            scrollSnapAlign: "start",
            flexShrink: 0,
            background: WHITE,
            borderRadius: "14px",
            border: `1px solid ${BORDER}`,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>{c.category}</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{c.title}</div>
            <div style={{ padding: "4px 0" }}>{c.visual}</div>
            <div style={{ fontSize: "11px", color: MUTED, lineHeight: 1.5 }}>{c.sub}</div>
            <button
              onClick={() => setActiveCard(c.id)}
              style={{
                marginTop: "auto",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "none",
                background: NAVY,
                color: WHITE,
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <span>Åbn indsigt</span>
              <span>→</span>
            </button>
          </div>
        ))}
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
