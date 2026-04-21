"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { groupedRoles, groupNames, testQuestions } from "./data";

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

const primaryGreen = "#7ED957";

export default function Home() {
  const [enteredApp, setEnteredApp] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));
  const [showResult, setShowResult] = useState(false);
  const [selectedUniverse, setSelectedUniverse] = useState("Kandidat");
  const [detailPage, setDetailPage] = useState<string | null>(null);
  const [step1SubStep, setStep1SubStep] = useState(0);

  const totalScore = answers.reduce((sum, value) => sum + value, 0);

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

  const [openProfileGroups, setOpenProfileGroups] =
    useState<AccordionGroupState>(
      Object.fromEntries(groupNames.map((name) => [name, false]))
    );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleProfile = (value: string) => {
    const exists = form.profiles.includes(value);
    update(
      "profiles",
      exists
        ? form.profiles.filter((v) => v !== value)
        : [...form.profiles, value]
    );
  };

  const toggleGroup = (
    group: string,
    groups: AccordionGroupState,
    setGroups: Dispatch<SetStateAction<AccordionGroupState>>
  ) => {
    setGroups({
      ...groups,
      [group]: !groups[group],
    });
  };

  const displayStep =
    step === 0 ? 1 : step === 1 ? 2 : step === 2 ? 3 : 4;

  const totalSteps = 4;

  const stepTitle =
    displayStep === 1
      ? "Forsiden"
      : displayStep === 2
      ? "Din profil"
      : displayStep === 3
      ? "Mini-test"
      : "Resultat";

  const stepSubtitle =
    displayStep === 1
      ? "En kort introduktion til appen"
      : displayStep === 2
      ? "Profiloplysninger, dokumenter og faglig profil"
      : displayStep === 3
      ? "Klar til at tage testen"
      : "Vurder din retning";

  const overviewCards = [
    {
      key: "Kandidat",
      title: "Kandidat",
      subtitle: "Karrieresparring og ALT",
      text: "Få en karrieresamtale og tag arbejdslivstesten",
      bg: "linear-gradient(135deg, #3D4A52 0%, #2E3A42 100%)",
      border: "1px solid rgba(61,74,82,0.0)",
      accent: "#A8BDC7",
      muted: "#8FA3AD",
      activeBg: "#2E3A42",
      activeColor: "#FFFFFF",
    },
    {
      key: "Virksomhed",
      title: "Virksomhed",
      subtitle: "Kandidatbase og projektsamtale",
      text: "Få indsigt i en kandidatbase eller book en projektsamtale.",
      bg: "linear-gradient(135deg, #1B3A5C 0%, #10263F 100%)",
      border: "1px solid rgba(27,58,92,0.0)",
      accent: "#A8C4E0",
      muted: "#7AAACE",
      activeBg: "#10263F",
      activeColor: "#FFFFFF",
    },
    {
      key: "Om Byggetalent",
      title: "Om Byggetalent",
      subtitle: "Menneskerne bag",
      text: "Hvem står bag Byggetalent.",
      bg: "linear-gradient(135deg, #D4962A 0%, #B87E18 100%)",
      border: "1px solid rgba(212,150,42,0.0)",
      accent: "#5C3800",
      muted: "#6B4500",
      activeBg: "#B87E18",
      activeColor: "#FFFFFF",
    },
  ];

  return (
    <main style={mainStyle}>
      {!enteredApp ? (
        <section
          style={{
            width: "100%",
            maxWidth: "560px",
            margin: "0 auto",
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}
        >
          <img
            src="/images/Frontbillede.png"
            alt="ByggeTalent forside"
            style={{
              width: "100%",
              display: "block",
              height: "auto",
            }}
          />

          <button
            onClick={() => {
              setEnteredApp(true);
              setStep(0);
            }}
            style={{
              position: "absolute",
              right: "28px",
              bottom: "34px",
              padding: "18px 28px",
              borderRadius: "16px",
              border: "none",
              background: "linear-gradient(180deg, #1d4f9c 0%, #153d7a 100%)",
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 24px rgba(21,61,122,0.28)",
            }}
          >
            Kom i gang
          </button>
        </section>
      ) : (
        <section
          style={{
            ...flowWrapStyle,
            maxWidth: step === 0 ? "880px" : step === 1 ? "460px" : "820px",
          }}
        >
          {step > 1 && (
            <StepHeader
              step={displayStep}
              total={totalSteps}
              title={stepTitle}
              subtitle={stepSubtitle}
            />
          )}

          {step === 0 && detailPage && (
            <div style={{ display: "grid", gap: "18px" }}>
              <button
                type="button"
                onClick={() => setDetailPage(null)}
                style={{
                  alignSelf: "flex-start",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#295BA8",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: 0,
                }}
              >
                ← Tilbage
              </button>

              {detailPage === "Om Byggetalent" && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                    borderRadius: "24px",
                    padding: "24px",
                    border: "1px solid #E6EBF1",
                    boxShadow: "0 12px 28px rgba(36,51,64,0.05)",
                    display: "grid",
                    gridTemplateColumns: "92px minmax(0, 1fr)",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "92px",
                      height: "92px",
                      borderRadius: "50%",
                      backgroundImage: "url('/images/Karina Maria - Founder.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      boxShadow: "0 8px 20px rgba(44,62,79,0.10)",
                    }}
                  />
                  <div style={{ display: "grid", gap: "8px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#6B7280",
                        }}
                      >
                        Bag ByggeTalent
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          background: "#EEF4FF",
                          color: "#295BA8",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        HR · rekruttering · teams
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#22313F",
                        letterSpacing: "-0.03em",
                        lineHeight: 1.08,
                      }}
                    >
                      Karina Maria Nyberg
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        lineHeight: 1.65,
                        color: "#5B6875",
                      }}
                    >
                      ByggeTalent er skabt med fokus på HR, rekruttering,
                      organisationsudvikling og stærke projektteams i bygge- og
                      anlægsbranchen.
                    </div>
                  </div>
                </div>
              )}

              {detailPage === "Kandidat" && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #EEF4FF 0%, #E4ECFF 100%)",
                    borderRadius: "24px",
                    padding: "24px",
                    border: "1px solid rgba(41,91,168,0.10)",
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#22313F", letterSpacing: "-0.03em" }}>
                    Kandidat
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#295BA8" }}>
                    Karrieresparring og ALT
                  </div>
                  <div style={{ fontSize: "14px", lineHeight: 1.65, color: "#5B6875" }}>
                    Få en karrieresamtale og tag arbejdslivstesten
                  </div>
                </div>
              )}

              {detailPage === "Virksomhed" && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #F6F1E7 0%, #EEE3D0 100%)",
                    borderRadius: "24px",
                    padding: "24px",
                    border: "1px solid rgba(117,91,42,0.12)",
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#22313F", letterSpacing: "-0.03em" }}>
                    Virksomhed
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#755B2A" }}>
                    Kandidatbase og projektsamtale
                  </div>
                  <div style={{ fontSize: "14px", lineHeight: 1.65, color: "#5F6B76" }}>
                    Få indsigt i en kandidatbase eller book en projektsamtale.
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 0 && !detailPage && (
            <div style={{ display: "grid", gap: "18px" }}>
              <div
                style={{
                  background:
                    "linear-gradient(180deg, #07111D 0%, #0B1B2B 55%, #1B2430 100%)",
                  borderRadius: "28px",
                  padding: "18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 20px 48px rgba(16,38,63,0.20)",
                  display: "grid",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.62)",
                    textAlign: "center",
                  }}
                >
                  ByggeTalent
                </div>

                <div style={{ display: "grid", gap: "12px", textAlign: "center" }}>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "32px",
                      lineHeight: 1.1,
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      color: "#F4F1E8",
                    }}
                  >
                    Rekruttering med{" "}
                    <span style={{ color: "#F5C441" }}>brancheforståelse</span>
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    Byggetalent er udviklet til bygge- og anlægsbranchen.
                  </p>
                </div>

                <div style={{ height: "16px" }} />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "8px",
                  }}
                >
                  {overviewCards.map((card) => {
                    const active = selectedUniverse === card.key;
                    return (
                      <div
                        key={card.key}
                        style={{
                          borderRadius: "14px",
                          background: card.bg,
                          border: active
                            ? "2px solid rgba(255,255,255,0.40)"
                            : "1px solid rgba(255,255,255,0.10)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          gap: "6px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedUniverse(card.key)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: card.activeColor,
                            textAlign: "left",
                          }}
                        >
                          {card.title}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailPage(card.key)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: card.activeColor,
                            flexShrink: 0,
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          →
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(245,196,81,0.14) 0%, rgba(217,142,4,0.10) 45%, rgba(255,255,255,0.06) 100%)",
                    borderRadius: "18px",
                    padding: "6px",
                  }}
                >
                  <img
                    src="/images/mobil-haanden.png"
                    alt="ByggeTalent direkte i hverdagen"
                    style={{
                      width: "100%",
                      height: "420px",
                      objectFit: "cover",
                      objectPosition: "center top",
                      borderRadius: "14px",
                      display: "block",
                    }}
                  />
                </div>
              </div>



              <div
                style={{
                  position: "sticky",
                  bottom: "12px",
                  zIndex: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0",
                  background: "none",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEnteredApp(false);
                    setStep(1);
                  }}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "1px solid rgba(44,62,79,0.14)",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "grid",
                    placeItems: "center",
                    color: "#22313F",
                    marginLeft: "40px",
                  }}
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep1SubStep(0);
                    setStep(1);
                  }}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#4ADE80",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "grid",
                    placeItems: "center",
                    color: "#14532D",
                    fontWeight: 700,
                  }}
                >
                  →
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div
              className="max-w-[460px] mx-auto flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl"
              style={{ height: "calc(100vh - 48px)", maxHeight: "820px" }}
            >
              <div
                className="shrink-0 px-5 pt-5 pb-4"
                style={{ borderBottom: "1px solid rgba(16,38,63,0.07)" }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#10263F",
                    marginBottom: "10px",
                    textAlign: "center",
                  }}
                >
                  ByggeTalent
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      step1SubStep === 0
                        ? setStep(0)
                        : setStep1SubStep((s) => s - 1)
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 24,
                      fontWeight: 300,
                      lineHeight: 1,
                      padding: 0,
                      color: "#10263F",
                    }}
                  >
                    ‹
                  </button>
                  <div>
                    <div
                      className="text-[11px] font-bold tracking-[0.12em] uppercase"
                      style={{ color: "#F5C441" }}
                    >
                      Din profil
                    </div>
                    <div
                      className="text-[13px] font-semibold"
                      style={{ color: "rgba(16,38,63,0.45)" }}
                    >
                      {step1SubStep + 1} af 10
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-[3px] rounded-full"
                      style={{
                        background:
                          i <= step1SubStep
                            ? "#F5C441"
                            : "rgba(16,38,63,0.10)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pb-4 flex flex-col gap-5">
                {step1SubStep === 0 && (
                  <>
                    <div style={{ position: "relative", height: "360px", flexShrink: 0 }}>
                      <img
                        src="/images/DIn faglg profil.png"
                        alt="Din faglige profil"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center 15%",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to bottom, rgba(7,17,29,0.0) 40%, rgba(7,17,29,0.85) 100%)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "16px",
                          left: "20px",
                          right: "20px",
                        }}
                      >
                        <div style={{ fontSize: "26px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                          Din Profil
                        </div>
                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>
                          Udfyld dine oplysninger trin for trin
                        </div>
                      </div>
                    </div>

                    <div className="px-6 flex flex-col gap-4">
                    <TextInput
                      placeholder="Fornavn"
                      value={form.name}
                      onChange={(v) => update("name", v)}
                    />
                    <input
                      style={inputStyle}
                      placeholder="Efternavn"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && form.lastName) {
                          setStep1SubStep((s) => s + 1);
                        }
                      }}
                    />
                    </div>
                  </>
                )}

                {step1SubStep === 1 && (
                  <>
                    <div
                      className="text-[32px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      Kontakt
                    </div>
                    <TextInput
                      placeholder="E-mail"
                      value={form.email}
                      onChange={(v) => update("email", v)}
                    />
                    <TextInput
                      placeholder="Telefon"
                      value={form.phone}
                      onChange={(v) => update("phone", v)}
                    />
                    <TextInput
                      placeholder="Adresse / by / postnummer"
                      value={form.address}
                      onChange={(v) => update("address", v)}
                    />
                  </>
                )}

                {step1SubStep === 2 && (
                  <>
                    <div
                      className="text-[32px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      Din rolle
                    </div>
                    <TextInput
                      placeholder="Nuværende titel / rolle"
                      value={form.currentTitle}
                      onChange={(v) => update("currentTitle", v)}
                    />
                    <TextInput
                      placeholder="LinkedIn"
                      value={form.linkedin}
                      onChange={(v) => update("linkedin", v)}
                    />
                  </>
                )}

                {step1SubStep === 3 && (
                  <>
                    <div
                      className="text-[32px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      En kort note
                    </div>
                    <div
                      className="text-[14px]"
                      style={{ color: "rgba(16,38,63,0.5)" }}
                    >
                      Valgfrit
                    </div>
                    <textarea
                      style={{ ...textareaStyle, minHeight: "140px" }}
                      placeholder="Hvad skal vi vide om dig?"
                      value={form.supplementaryInfo}
                      onChange={(e) =>
                        update("supplementaryInfo", e.target.value)
                      }
                    />
                  </>
                )}

                {step1SubStep === 4 && (
                  <>
                    <div
                      className="text-[26px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      Hvor mange års erfaring har du?
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                      {["0-3 år", "4-7 år", "8-12 år", "12+ år"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            update("experience", opt);
                            setStep1SubStep((s) => s + 1);
                          }}
                          style={{
                            padding: "18px 20px",
                            borderRadius: 14,
                            border:
                              form.experience === opt
                                ? "2px solid #10263F"
                                : "1px solid rgba(16,38,63,0.15)",
                            background:
                              form.experience === opt ? "#10263F" : "#fff",
                            color:
                              form.experience === opt ? "#fff" : "#10263F",
                            textAlign: "left",
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step1SubStep === 5 && (
                  <>
                    <div
                      className="text-[26px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      Hvad er din lønretning?
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                      {[
                        "Under nuværende niveau",
                        "Samme niveau",
                        "Over nuværende niveau",
                      ].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            update("salary", opt);
                            setStep1SubStep((s) => s + 1);
                          }}
                          style={{
                            padding: "18px 20px",
                            borderRadius: 14,
                            border:
                              form.salary === opt
                                ? "2px solid #10263F"
                                : "1px solid rgba(16,38,63,0.15)",
                            background: form.salary === opt ? "#10263F" : "#fff",
                            color: form.salary === opt ? "#fff" : "#10263F",
                            textAlign: "left",
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step1SubStep === 6 && (
                  <>
                    <div
                      className="text-[26px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      Hvor langt vil du pendle?
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                      {["0-20 km", "20-50 km", "50+ km", "Hele Danmark"].map(
                        (opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              update("distance", opt);
                              setStep1SubStep((s) => s + 1);
                            }}
                            style={{
                              padding: "18px 20px",
                              borderRadius: 14,
                              border:
                                form.distance === opt
                                  ? "2px solid #10263F"
                                  : "1px solid rgba(16,38,63,0.15)",
                              background:
                                form.distance === opt ? "#10263F" : "#fff",
                              color:
                                form.distance === opt ? "#fff" : "#10263F",
                              textAlign: "left",
                              fontSize: 16,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {opt}
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}

                {step1SubStep === 7 && (
                  <>
                    <div
                      className="text-[26px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      Upload dit CV
                    </div>
                    <div
                      className="text-[14px]"
                      style={{ color: "rgba(16,38,63,0.5)" }}
                    >
                      Vælg en fil — så går vi videre automatisk
                    </div>
                    <FileUploadField
                      label="Upload CV *"
                      file={cvFile}
                      onChange={(file) => {
                        setCvFile(file);
                        if (file) setStep1SubStep((s) => s + 1);
                      }}
                    />
                    <FileUploadField
                      label="Upload ekstra dokument"
                      file={applicationFile}
                      onChange={setApplicationFile}
                    />
                  </>
                )}

                {step1SubStep === 8 && (
                  <>
                    <div
                      className="text-[26px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      Hvad er din faglige profil?
                    </div>
                    <div
                      className="text-[14px]"
                      style={{ color: "rgba(16,38,63,0.5)" }}
                    >
                      Vælg én eller flere titler
                    </div>
                    <RoleSelectionCard
                      title=""
                      groupedRoles={groupedRoles}
                      selectedValues={form.profiles}
                      openGroups={openProfileGroups}
                      onToggleGroup={(group) =>
                        toggleGroup(group, openProfileGroups, setOpenProfileGroups)
                      }
                      onToggleRole={(role) => {
                        const alreadySelected = form.profiles.includes(role);
                        toggleProfile(role);
                        if (!alreadySelected) {
                          const group = Object.entries(groupedRoles).find(
                            ([, roles]) => roles.includes(role)
                          )?.[0];
                          if (group) {
                            setOpenProfileGroups((prev) => ({
                              ...prev,
                              [group]: false,
                            }));
                          }
                        }
                      }}
                      otherTitle={form.profileOtherTitle}
                      onOtherTitleChange={(v) => update("profileOtherTitle", v)}
                    />
                  </>
                )}

                {step1SubStep === 9 && (
                  <>
                    <div
                      className="text-[26px] font-bold leading-tight"
                      style={{ color: "#10263F" }}
                    >
                      Næsten færdig!
                    </div>
                    <div
                      className="text-[14px]"
                      style={{ color: "rgba(16,38,63,0.5)" }}
                    >
                      Bekræft samtykke og privatliv
                    </div>
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
                    <a
                      href="#"
                      style={{
                        fontSize: 14,
                        color: "#2C3E4F",
                        textDecoration: "underline",
                        opacity: 0.85,
                      }}
                    >
                      Læs vores privatlivspolitik
                    </a>
                  </>
                )}
              </div>

              {![4, 5, 6].includes(step1SubStep) && (
                <div
                  className="shrink-0 px-5 pb-5 pt-3 bg-white"
                  style={{ borderTop: "1px solid rgba(16,38,63,0.06)" }}
                >
                  <button
                    className="w-full py-4 rounded-2xl text-[17px] font-bold"
                    style={{
                      background: "#10263F",
                      color: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (step1SubStep === 9) {
                        setShowResult(false);
                        setAnswers(Array(10).fill(0));
                        setStep(2);
                      } else {
                        setStep1SubStep((s) => s + 1);
                      }
                    }}
                  >
                    {step1SubStep === 9
                      ? "Videre til mini-testen →"
                      : "Næste →"}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div
              style={{
                background: "linear-gradient(180deg, #16181D 0%, #1D2228 100%)",
                borderRadius: "18px",
                padding: "28px",
                color: "#F3EFE6",
                display: "grid",
                gap: "22px",
                border: "1px solid #2C3E4F",
                maxWidth: "980px",
                margin: "0 auto",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "32px",
                    lineHeight: 1.1,
                    color: "#F3EFE6",
                    margin: "0 0 10px 0",
                    fontWeight: 700,
                  }}
                >
                  Hvordan oplever du dit arbejdsliv lige nu?
                </h2>

                <p
                  style={{
                    color: "rgba(243,239,230,0.78)",
                    fontSize: "16px",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Vurder hvert udsagn fra 1 til 5.
                </p>
              </div>

              {testQuestions.map((question, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gap: "6px",
                    paddingBottom: "2px",
                    borderBottom:
                      index === testQuestions.length - 1
                        ? "none"
                        : "1px solid rgba(243,239,230,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.5,
                      color: "#F3EFE6",
                      fontWeight: 500,
                    }}
                  >
                    {index + 1}. {question}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#D83A34",
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        flex: "0 0 180px",
                        height: "3px",
                        background: "rgba(255,255,255,0.8)",
                        borderRadius: "999px",
                      }}
                    />
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#62C84A",
                        flexShrink: 0,
                      }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", gap: "34px", paddingLeft: "22px" }}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          const updated = [...answers];
                          updated[index] = value;
                          setAnswers(updated);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color:
                            answers[index] === value ? "#6EDC5F" : "#F3EFE6",
                          fontSize: "20px",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div style={stepButtonsStyle}>
                <button
                  style={secondaryButtonStyle}
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Tilbage
                </button>

                {!showResult && (
                  <button
                    style={primaryButtonStyle}
                    type="button"
                    onClick={() => {
                      setShowResult(true);

                      setTimeout(() => {
                        window.scrollTo({
                          top: document.body.scrollHeight,
                          behavior: "smooth",
                        });
                      }, 150);
                    }}
                  >
                    Se mit resultat
                  </button>
                )}
              </div>

              {showResult && (
                <div
                  style={{
                    marginTop: "18px",
                    display: "grid",
                    gap: "14px",
                    color: "#F3EFE6",
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #101820 0%, #18202A 55%, #2A2216 100%)",
                      border: "1px solid rgba(110, 220, 95, 0.14)",
                      borderRadius: "20px",
                      padding: "18px",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
                      display: "grid",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(0, 1.2fr) minmax(220px, 0.8fr)",
                        gap: "16px",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "grid", gap: "8px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#8FA3B8",
                            fontWeight: 700,
                          }}
                        >
                          Resultatoversigt
                        </div>

                        <h2
                          style={{
                            margin: 0,
                            fontSize: "26px",
                            lineHeight: 1.08,
                            color: "#F3EFE6",
                          }}
                        >
                          Din karriereposition lige nu
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            lineHeight: 1.6,
                            color: "#B8C4D0",
                            maxWidth: "560px",
                          }}
                        >
                          Dine svar giver et samlet billede af, hvor godt din
                          nuværende rolle matcher det, du har brug for i
                          arbejdslivet lige nu.
                        </p>
                      </div>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "16px",
                          padding: "16px",
                          display: "grid",
                          justifyItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "130px",
                            height: "130px",
                            borderRadius: "50%",
                            background: `conic-gradient(#6EDC5F ${
                              (totalScore / 50) * 360
                            }deg, rgba(255,255,255,0.08) 0deg)`,
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "92px",
                              height: "92px",
                              borderRadius: "50%",
                              background: "#0D141A",
                              display: "grid",
                              placeItems: "center",
                              textAlign: "center",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "30px",
                                  fontWeight: 800,
                                  color: "#F3EFE6",
                                  lineHeight: 1,
                                }}
                              >
                                {totalScore}
                              </div>
                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "11px",
                                  color: "#8FA3B8",
                                }}
                              >
                                ud af 50
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: "13px", fontWeight: 600 }}>
                          Samlet score
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {[
                        {
                          title: "Det du savner",
                          percent: Math.round(
                            (((answers[0] || 0) +
                              (answers[1] || 0) +
                              (answers[2] || 0)) /
                              15) *
                              100
                          ),
                          text: "Signal om match mellem rolle, styrker og energi.",
                        },
                        {
                          title: "Det du ønsker mere af",
                          percent: Math.round(
                            (((answers[3] || 0) +
                              (answers[4] || 0) +
                              (answers[5] || 0)) /
                              15) *
                              100
                          ),
                          text: "Signal om samarbejde, indflydelse og arbejdsvilkår.",
                        },
                        {
                          title: "Det du ønsker mindre af",
                          percent: Math.round(
                            (((answers[6] || 0) + (answers[7] || 0)) / 10) * 100
                          ),
                          text: "Signal om tempo, belastning og ubalance i rollen.",
                        },
                        {
                          title: "Det der peger fremad",
                          percent: Math.round(
                            (((answers[8] || 0) + (answers[9] || 0)) / 10) * 100
                          ),
                          text: "Signal om retning, tidshorisont og næste skridt.",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "16px",
                            padding: "14px",
                            display: "grid",
                            gap: "12px",
                            minHeight: "168px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#8FA3B8",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                fontWeight: 700,
                                lineHeight: 1.4,
                                maxWidth: "110px",
                              }}
                            >
                              {item.title}
                            </div>

                            <div
                              style={{
                                width: "54px",
                                height: "54px",
                                borderRadius: "50%",
                                background: `conic-gradient(#6EDC5F ${
                                  (item.percent / 100) * 360
                                }deg, rgba(255,255,255,0.08) 0deg)`,
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "50%",
                                  background: "#0D141A",
                                  display: "grid",
                                  placeItems: "center",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "#F3EFE6",
                                }}
                              >
                                {item.percent}%
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "24px",
                              fontWeight: 800,
                              lineHeight: 1,
                              color: "#F3EFE6",
                            }}
                          >
                            {item.percent}%
                          </div>

                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color:
                                item.percent < 40
                                  ? "#D83A34"
                                  : item.percent < 70
                                  ? "#F5C451"
                                  : "#6EDC5F",
                            }}
                          >
                            {item.percent < 40
                              ? "Lavt fokus"
                              : item.percent < 70
                              ? "Stabilt signal"
                              : "Høj prioritet"}
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              lineHeight: 1.55,
                              color: "#C9D3DD",
                            }}
                          >
                            {item.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        background: "rgba(110, 220, 95, 0.06)",
                        border: "1px solid rgba(110, 220, 95, 0.16)",
                        borderRadius: "16px",
                        padding: "16px",
                        display: "grid",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#8FA3B8",
                          fontWeight: 700,
                        }}
                      >
                        Foreløbig konklusion
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "22px",
                          lineHeight: 1.15,
                          color: "#F3EFE6",
                        }}
                      >
                        Din arbejdssituation lige nu
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          lineHeight: 1.7,
                          color: "#D7E0E8",
                        }}
                      >
                        Din score viser klare signaler om, hvad du savner, hvad
                        du ønsker mere af, og hvad der eventuelt kalder på næste
                        skridt.
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px",
                        gap: "12px",
                      }}
                    >
                      <button
                        type="button"
                        style={secondaryButtonStyle}
                        onClick={() => {
                          setShowResult(false);
                          setStep(2);
                        }}
                      >
                        Tilbage
                      </button>

                      <button
                        type="button"
                        style={primaryButtonStyle}
                        onClick={() => {}}
                      >
                        Videre
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function SectionBar({
  eyebrow,
  title,
  rightTag,
}: {
  eyebrow: string;
  title: string;
  rightTag?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        paddingBottom: "10px",
        borderBottom: "1px solid rgba(44,62,79,0.08)",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6B7280",
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#22313F",
          }}
        >
          {title}
        </div>
      </div>

      {rightTag && (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "999px",
            background: "#D8E0E6",
            color: "#22313F",
            fontSize: "12px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {rightTag}
        </div>
      )}
    </div>
  );
}

function StepHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={stepHeaderWrapStyle}>
      <div style={stepMetaStyle}>
        Step {step} af {total}
      </div>

      <div style={progressTrackStyle}>
        <div
          style={{
            ...progressFillStyle,
            width: `${(step / total) * 100}%`,
          }}
        />
      </div>

      <h2 style={stepTitleStyle}>{title}</h2>
      <p style={stepSubtitleStyle}>{subtitle}</p>
    </div>
  );
}

function RoleSelectionCard({
  title,
  groupedRoles,
  selectedValues,
  openGroups,
  onToggleGroup,
  onToggleRole,
  otherTitle,
  onOtherTitleChange,
}: {
  title: string;
  groupedRoles: Record<string, string[]>;
  selectedValues: string[];
  openGroups: Record<string, boolean>;
  onToggleGroup: (group: string) => void;
  onToggleRole: (role: string) => void;
  otherTitle: string;
  onOtherTitleChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#22313F",
        }}
      >
        {title}
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {Object.entries(groupedRoles).map(([group, roles]) => (
          <div
            key={group}
            style={{
              border: "1px solid rgba(44,62,79,0.12)",
              borderRadius: "12px",
              background: "#F8F7F3",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => onToggleGroup(group)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                background: "transparent",
                color: "#111827",
                border: "none",
                cursor: "pointer",
                padding: "14px 16px",
                textAlign: "left",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              <span>{group}</span>
              <span style={{ color: "#6B7280" }}>
                {openGroups[group] ? "−" : "+"}
              </span>
            </button>

            {openGroups[group] && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  padding: "0 16px 16px 16px",
                  borderTop: "1px solid rgba(44,62,79,0.08)",
                }}
              >
                {roles.map((role) => {
                  const checked = selectedValues.includes(role);

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => onToggleRole(role)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "999px",
                        border: checked
                          ? "1px solid #2C3E4F"
                          : "1px solid #C6CDD4",
                        background: checked ? "#2C3E4F" : "#FFFFFF",
                        color: checked ? "#F8FAFC" : "#111827",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={otherTitleWrapStyle}>
        <div style={otherTitleHeadingStyle}>Mangler din titel?</div>
        <p style={otherTitleTextStyle}>
          Skriv den manuelt her, så matcher vi dig mere præcist.
        </p>
        <input
          style={inputStyle}
          placeholder="Din titel"
          value={otherTitle}
          onChange={(e) => onOtherTitleChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function FileUploadField({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div style={fileFieldStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        style={fileInputStyle}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {file && <span style={fileNameStyle}>{file.name}</span>}
    </div>
  );
}

function InfoCheckboxCard({
  checked,
  onChange,
  infoOpen,
  onToggleInfo,
  label,
  infoText,
}: {
  checked: boolean;
  onChange: () => void;
  infoOpen: boolean;
  onToggleInfo: () => void;
  label: string;
  infoText: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(44,62,79,0.12)",
        borderRadius: "12px",
        padding: "14px",
        background: "#F8F7F3",
      }}
    >
      <label style={checkboxLabelLightStyle}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span style={{ flex: 1 }}>{label}</span>
        <button type="button" onClick={onToggleInfo} style={arrowButtonStyle}>
          {infoOpen ? "▲" : "▼"}
        </button>
      </label>

      {infoOpen && <p style={infoTextStyle}>{infoText}</p>}
    </div>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      style={inputStyle}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      style={inputStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option, index) => (
        <option key={option} value={index === 0 ? "" : option}>
          {option}
        </option>
      ))}
    </select>
  );
}

const mainStyle = {
  minHeight: "100vh",
  padding: "24px",
  background: "#E7E1D6",
  color: "#111827",
  fontFamily: "Arial, sans-serif",
};

const flowWrapStyle = {
  width: "100%",
  maxWidth: "760px",
  margin: "0 auto",
};

const stepHeaderWrapStyle = {
  marginBottom: "20px",
};

const stepMetaStyle = {
  fontSize: "14px",
  color: "#5E6872",
  marginBottom: "10px",
  fontWeight: 600,
};

const progressTrackStyle = {
  width: "100%",
  height: "8px",
  background: "#C8D3DB",
  borderRadius: "999px",
  overflow: "hidden",
  marginBottom: "18px",
};

const progressFillStyle = {
  height: "100%",
  background: primaryGreen,
  borderRadius: "999px",
  transition: "width 0.25s ease",
};

const stepTitleStyle = {
  fontSize: "34px",
  lineHeight: "1.08",
  color: "#243340",
  margin: "0 0 8px 0",
  fontWeight: 700,
};

const stepSubtitleStyle = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#243340",
  margin: 0,
};

const industrialCardStyle = {
  background: "#F1ECE3",
  border: "1px solid rgba(44,62,79,0.14)",
  borderRadius: "14px",
  padding: "18px",
  display: "grid",
  boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
};

const industrialPanelStyle = {
  background: "#D9E1E6",
  border: "1px solid rgba(44,62,79,0.14)",
  borderRadius: "14px",
  padding: "18px",
  display: "grid",
  boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
};

const complianceCardStyle = {
  background: "#E6DED1",
  border: "1px solid rgba(44,62,79,0.14)",
  borderRadius: "14px",
  padding: "18px",
  display: "grid",
  boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #BFC7CF",
  background: "#F8F7F4",
  color: "#111827",
  fontSize: "16px",
  outline: "none",
  minHeight: "52px",
  boxSizing: "border-box" as const,
};

const textareaStyle = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: "10px",
  border: "1px solid #BFC7CF",
  background: "#F8F7F4",
  color: "#111827",
  fontSize: "16px",
  minHeight: "120px",
  resize: "vertical" as const,
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box" as const,
};

const stepButtonsStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginTop: "8px",
};

const primaryButtonStyle = {
  padding: "16px 24px",
  borderRadius: "12px",
  border: "none",
  background: primaryGreen,
  color: "#0F172A",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
  minWidth: "140px",
};

const secondaryButtonStyle = {
  padding: "16px 24px",
  borderRadius: "12px",
  border: "1px solid #B8C0C8",
  background: "#F8F7F4",
  color: "#111827",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  minWidth: "140px",
};

const checkboxLabelLightStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  color: "#111827",
};

const infoTextStyle = {
  fontSize: "13px",
  color: "#5E6872",
  marginTop: "10px",
  lineHeight: "1.6",
};

const arrowButtonStyle = {
  marginLeft: "8px",
  background: "transparent",
  color: "#6b7280",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  flexShrink: 0,
};

const fileFieldStyle = {
  display: "grid",
  gap: "8px",
};

const fieldLabelStyle = {
  fontSize: "14px",
  color: "#111827",
  fontWeight: 700,
};

const fileInputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #BFC7CF",
  background: "#F8F7F4",
  color: "#111827",
  fontSize: "14px",
  boxSizing: "border-box" as const,
};

const fileNameStyle = {
  fontSize: "13px",
  color: "#5E6872",
};

const otherTitleWrapStyle = {
  marginTop: "12px",
  paddingTop: "14px",
  borderTop: "1px solid rgba(44,62,79,0.08)",
  display: "grid",
  gap: "8px",
};

const otherTitleHeadingStyle = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#111827",
};

const otherTitleTextStyle = {
  margin: 0,
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#5E6872",
};