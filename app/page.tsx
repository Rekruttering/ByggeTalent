"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { groupedRoles, groupNames, testQuestions } from "./data";

// ─── Design tokens ────────────────────────────────────────────────────────────
const CURRY = "#C4A03A";          // Varm rav-guld (som i mockup)
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
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);

  const handleVideoEnd = () => {
    setIntroFading(true);
    setTimeout(() => setShowIntro(false), 800);
  };

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));
  const [showResult, setShowResult] = useState(false);
  const [selectedUniverse, setSelectedUniverse] = useState("Kandidat");
  const [detailPage, setDetailPage] = useState<string | null>(null);

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
    { key: "Kandidat", label: "Kandidat", sub: "Karrieresparring og ALT", bg: "#1A2E3F" },
    { key: "Virksomhed", label: "Virksomhed", sub: "Kandidatbase og projektsamtale", bg: "#0F2040" },
    { key: "Om Byggetalent", label: "Om Byggetalent", sub: "Menneskerne bag", bg: "#4A4F54" },
  ];

  if (showIntro) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: introFading ? 0 : 1,
        transition: "opacity 0.8s ease",
      }}>
        <video
          src="/Byggetalent.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ─── Step 0: Forside ──────────────────────────────────────────── */}
      {step === 0 && (
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 0 40px" }}>

          {detailPage ? (
            /* Detail view */
            <div style={{ padding: "20px 20px 40px" }}>
              <button
                onClick={() => setDetailPage(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 700, color: CURRY, padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}
              >
                ← Tilbage
              </button>

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
                <div style={{ background: WHITE, borderRadius: "20px", padding: "24px", border: `1px solid ${BORDER}`, display: "grid", gap: "12px" }}>
                  <div style={labelSt}>Kandidat</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>Karrieresparring og ALT</div>
                  <div style={{ fontSize: "15px", lineHeight: 1.65, color: MUTED }}>Få en karrieresamtale og tag arbejdslivstesten</div>
                </div>
              )}

              {detailPage === "Virksomhed" && (
                <div style={{ background: WHITE, borderRadius: "20px", padding: "24px", border: `1px solid ${BORDER}`, display: "grid", gap: "12px" }}>
                  <div style={labelSt}>Virksomhed</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif" }}>Kandidatbase og projektsamtale</div>
                  <div style={{ fontSize: "15px", lineHeight: 1.65, color: MUTED }}>Få indsigt i en kandidatbase eller book en projektsamtale.</div>
                </div>
              )}
            </div>
          ) : (
            /* Hero + navigation */
            <>
              <div style={{
                background: `linear-gradient(175deg, ${NAVY} 0%, ${NAVY_MED} 60%, #1C2E3A 100%)`,
                borderRadius: "0 0 28px 28px",
                padding: "36px 20px 20px",
                display: "grid",
                gap: "20px",
              }}>
                {/* Logo — stor og tydelig som i mockup */}
                <div style={{ textAlign: "center", display: "grid", gap: "14px" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: CURRY }}>
                    DANMARK · BYGGE & ANLÆG
                  </div>

                  <div>
                    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "52px", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
                      <span style={{ color: "#F5F0E5" }}>Bygge</span><span style={{ color: CURRY }}>Talent</span>
                    </div>
                    {/* Understregning som i mockup */}
                    <div style={{ width: "48px", height: "1.5px", background: CURRY, margin: "10px auto 0" }} />
                  </div>

                  <div style={{ fontFamily: "Georgia, serif", fontSize: "11px", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
                    REKRUTTERING MED BRANCHEFORSTÅELSE
                  </div>
                </div>

                {/* Navigation kort */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {navCards.map((card) => {
                    const active = selectedUniverse === card.key;
                    return (
                      <div key={card.key} style={{
                        borderRadius: "14px",
                        background: card.bg,
                        border: active ? `2px solid rgba(255,255,255,0.35)` : "1px solid rgba(255,255,255,0.08)",
                        padding: "12px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "4px",
                      }}>
                        <button type="button" onClick={() => setSelectedUniverse(card.key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700, color: "#FFFFFF", textAlign: "left", padding: 0, lineHeight: 1.3 }}>
                          {card.label}
                        </button>
                        <button type="button" onClick={() => setDetailPage(card.key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "rgba(255,255,255,0.75)", flexShrink: 0, padding: 0 }}>
                          →
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Hero billede */}
                <div style={{ borderRadius: "18px", overflow: "hidden", position: "relative" }}>
                  <img
                    src="/images/DIn faglg profil.png"
                    alt="Ingeniør med ByggeTalent på telefonen"
                    style={{ width: "100%", height: "380px", objectFit: "cover", objectPosition: "center 42%", borderRadius: "14px", display: "block" }}
                  />
                  {/* Gradient så telefon-skærmen fremhæves */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(10,22,40,0.55) 0%, transparent 100%)", borderRadius: "0 0 14px 14px" }} />
                  <div style={{ position: "absolute", bottom: "16px", left: "16px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.90)", letterSpacing: "0.06em" }}>
                    INGENIØR · ARKITEKT · HÅNDVÆRKER
                  </div>
                </div>
              </div>

              {/* CTA knap */}
              <div style={{ padding: "20px 20px 0" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ width: "100%", padding: "17px", borderRadius: "16px", border: "none", background: CURRY, color: WHITE, fontSize: "16px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em" }}
                >
                  Kom i gang →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Step 1: Kandidatprofil ──────────────────────────────────── */}
      {step === 1 && (
        <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh", background: NAVY }}>

          {/* Top bar */}
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px", background: NAVY, position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: 700, flex: 1 }}>
              <span style={{ color: "#F5F0E5" }}>Bygge</span><span style={{ color: CURRY, fontFamily: "Georgia, serif" }}>Talent</span>
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>Din profil</div>
          </div>

          {/* Scrollbar indhold */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>

            {/* Hero billede — viser pigen med telefon */}
            <div style={{ margin: "20px -20px 0", height: "440px", overflow: "hidden" }}>
              <img src="/images/DIn faglg profil.png" alt="Professionel med ByggeTalent" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingTop: "28px", paddingBottom: "100px" }}>

              {/* Navn */}
              <FormSection label="Dit navn">
                <TextInput placeholder="Fornavn" value={form.name} onChange={(v) => update("name", v)} />
                <TextInput placeholder="Efternavn" value={form.lastName} onChange={(v) => update("lastName", v)} />
              </FormSection>

              {/* Kontakt */}
              <FormSection label="Kontakt">
                <TextInput placeholder="E-mail" value={form.email} onChange={(v) => update("email", v)} />
                <TextInput placeholder="Telefon" value={form.phone} onChange={(v) => update("phone", v)} />
                <TextInput placeholder="Adresse / by / postnummer" value={form.address} onChange={(v) => update("address", v)} />
              </FormSection>

              {/* Din rolle */}
              <FormSection label="Din rolle">
                <TextInput placeholder="Nuværende titel / rolle" value={form.currentTitle} onChange={(v) => update("currentTitle", v)} />
                <TextInput placeholder="LinkedIn" value={form.linkedin} onChange={(v) => update("linkedin", v)} />
              </FormSection>

              {/* Anciennitet */}
              <FormSection label="Anciennitet">
                <PillGroup
                  options={["0-3 år", "4-7 år", "8-12 år", "12+ år"]}
                  value={form.experience}
                  onChange={(v) => update("experience", v)}
                />
              </FormSection>

              {/* Lønretning */}
              <FormSection label="Lønretning">
                <PillGroup
                  options={["Under nuværende niveau", "Samme niveau", "Over nuværende niveau"]}
                  value={form.salary}
                  onChange={(v) => update("salary", v)}
                />
              </FormSection>

              {/* Pendling */}
              <FormSection label="Pendlingsafstand">
                <PillGroup
                  options={["0-20 km", "20-50 km", "50+ km", "Hele Danmark"]}
                  value={form.distance}
                  onChange={(v) => update("distance", v)}
                />
              </FormSection>

              {/* CV */}
              <FormSection label="CV og dokumenter">
                <FileUploadField label="Upload CV *" file={cvFile} onChange={setCvFile} />
                <FileUploadField label="Upload ekstra dokument" file={applicationFile} onChange={setApplicationFile} />
              </FormSection>

              {/* Faglig profil */}
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

              {/* En kort note */}
              <FormSection label={<>En kort note <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(valgfrit)</span></>}>
                <textarea style={textareaSt} placeholder="Hvad skal vi vide om dig?" value={form.supplementaryInfo} onChange={(e) => update("supplementaryInfo", e.target.value)} />
              </FormSection>

              {/* Samtykke */}
              <FormSection label="Samtykke">
                <InfoCheckboxCard checked={form.consent} onChange={() => update("consent", !form.consent)} infoOpen={showConsentInfo} onToggleInfo={() => setShowConsentInfo(!showConsentInfo)} label="Jeg giver samtykke til, at ByggeTalent må opbevare og behandle mine personoplysninger i op til 6 måneder med henblik på rekruttering og relevante jobmuligheder." infoText="Dine oplysninger opbevares i op til 6 måneder med henblik på rekruttering og relevante jobmuligheder." />
                <InfoCheckboxCard checked={form.gdpr} onChange={() => update("gdpr", !form.gdpr)} infoOpen={showGdprInfo} onToggleInfo={() => setShowGdprInfo(!showGdprInfo)} label="Jeg accepterer, at mine personoplysninger behandles i henhold til ByggeTalents privatlivspolitik." infoText="ByggeTalent behandler dine oplysninger med henblik på rekruttering og match med relevante muligheder i overensstemmelse med privatlivspolitikken." />
                <a href="#" style={{ fontSize: 14, color: CURRY, textDecoration: "underline" }}>Læs vores privatlivspolitik</a>
              </FormSection>

            </div>
          </div>

          {/* Fast bund-navigation */}
          <div style={{ position: "sticky", bottom: 0, background: NAVY, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <button
              style={{ borderRadius: "14px", background: "#4A4F54", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", cursor: "pointer", color: WHITE, fontSize: "13px", fontWeight: 700, width: "100%" }}
              onClick={() => { setShowResult(false); setAnswers(Array(10).fill(0)); setStep(2); }}
            >
              <span>Videre til ALT</span>
              <span>→</span>
            </button>
            <button onClick={() => setStep(0)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 600, padding: 0 }}>
              ← Tilbage
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Mini-test ──────────────────────────────────────── */}
      {step === 2 && (
        <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

          {/* Top bar */}
          <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${BORDER}`, background: WHITE, position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: 700, marginBottom: "6px" }}>
              <span style={{ color: TEXT }}>Bygge</span><span style={{ color: CURRY, fontFamily: "Georgia, serif" }}>Talent</span>
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
          border: value === opt ? `1.5px solid ${CURRY}` : `1px solid ${BORDER}`,
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
        <div key={group} style={{ border: `1px solid ${BORDER}`, borderRadius: "12px", background: WHITE, overflow: "hidden" }}>
          <button type="button" onClick={() => onToggleGroup(group)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "transparent", color: TEXT, border: "none", cursor: "pointer", padding: "13px 15px", textAlign: "left", fontSize: "14px", fontWeight: 700 }}>
            <span>{group}</span>
            <span style={{ color: CURRY, fontSize: "18px", lineHeight: 1 }}>{openGroups[group] ? "−" : "+"}</span>
          </button>
          {openGroups[group] && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "0 15px 15px", borderTop: `1px solid ${BORDER}` }}>
              {roles.map((role) => {
                const sel = selectedValues.includes(role);
                return (
                  <button key={role} type="button" onClick={() => onToggleRole(role)} style={{ padding: "9px 13px", borderRadius: "999px", border: sel ? `1.5px solid ${CURRY}` : `1px solid ${BORDER}`, background: sel ? CURRY_BG : WHITE, color: sel ? CURRY : TEXT, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
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
      <label style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.80)" }}>{label}</label>
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

// ─── Delte styles ─────────────────────────────────────────────────────────────

const inputSt: React.CSSProperties = {
  width: "100%", padding: "13px 15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)",
  background: WHITE, color: TEXT, fontSize: "15px", outline: "none", minHeight: "50px",
  boxSizing: "border-box", fontFamily: "inherit",
};

const textareaSt: React.CSSProperties = {
  width: "100%", padding: "13px 15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)",
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
