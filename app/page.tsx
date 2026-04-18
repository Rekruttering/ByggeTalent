"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

const groupedRoles = {
  "Faglærte og tekniske stillinger (udførende)": [
    "Anlægsstruktør",
    "Bygningsstruktør",
    "Brolægger",
    "Byggemontagetekniker",
    "Kloakmester",
    "Monteringstekniker",
  ],
  "Funktionærer, ledelse og teknisk personale": [
    "Projektleder (byggeri/anlæg)",
    "Byggeleder",
    "Entrepriseleder",
    "Projekteringsleder",
    "Fagchef",
    "Markedschef / forretningsudvikling",
    "Byggetekniker",
    "Byggesagsbehandler",
    "Kvalitetsansvarlig",
    "PQ-ansvarlig",
    "Kalkulatør",
    "Planlægger (tid/plan)",
  ],
  "Rådgivere og projektering": [
    "Bygningsingeniør",
    "Konstruktionsingeniør",
    "Bygningskonstruktør",
    "Arkitekt",
    "Brandrådgiver",
    "Arbejdsmiljøkoordinator (P/B)",
    "Bæredygtighedskonsulent",
    "ESG-ansvarlig",
  ],
  "Installationer og teknik": [
    "Installationsingeniør (VVS/EL)",
    "VVS-projektleder",
    "El-projektleder",
    "Teknikentrepriseleder",
  ],
  "Inspektører og specialister": [
    "Broinspektør",
    "Bygningsinspektør",
    "Jernbaneinspektør",
    "Tilsynsførende",
    "Landinspektør",
    "Geotekniker",
    "Spildevandsingeniør",
  ],
  "Drift og facility": ["Driftsleder", "Facility Manager"],
};

const groupNames = Object.keys(groupedRoles);

const testQuestions = [
  "Min nuværende rolle føles naturlig for mig",
  "Mine stærkeste sider kommer i spil i mit job",
  "De opgaver, jeg sidder med, giver mig energi",
  "Samarbejdet omkring mig understøtter den måde, jeg arbejder bedst på",
  "Jeg føler mig tryg ved at sige min mening",
  "Jeg har reel mulighed for at påvirke beslutninger i mit arbejde",
  "Tempoet og forventningerne passer til mig",
  "Jeg savner sjældent at bruge andre sider af mig selv i arbejdet",
  "Jeg kan se mig selv i denne rolle over længere tid",
  "Mit job giver mening i forhold til, hvor jeg er i arbejdslivet lige nu",
];

type FormState = {
  name: string;
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
  const [selectedUniverse, setSelectedUniverse] = useState("Samtaler");

  const totalScore = answers.reduce((sum, value) => sum + value, 0);

  const [form, setForm] = useState<FormState>({
    name: "",
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

  const isStep1Valid = true;

  const displayStep =
    step === 0 ? 1 : step === 1 ? 2 : step === 2 ? 3 : 4;

  const totalSteps = 4;

  const stepTitle =
    displayStep === 1
      ? "Forsiden"
      : displayStep === 2
      ? "Din profil"
      : displayStep === 3
      ? "Tag mini-testen"
      : "Mini-test";

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
      key: "Samtaler",
      title: "Samtaler",
      subtitle: "Sparring og næste skridt",
      text: "Få karrieresamtaler, refleksion og konkrete næste skridt i bygge- og anlægsbranchen.",
      statLabel: "Fokus",
      statValue: "AI sparring",
      bg: "linear-gradient(135deg, #EEF4FF 0%, #E4ECFF 100%)",
      border: "1px solid rgba(41,91,168,0.10)",
      accent: "#295BA8",
      muted: "#5B6875",
      activeBg: "#295BA8",
      activeColor: "#FFFFFF",
    },
    {
      key: "Analyse",
      title: "Analyse",
      subtitle: "Mini-test og indsigt",
      text: "Skab overblik over styrker, energi og retning med en kort test og visuel opsummering.",
      statLabel: "Varighed",
      statValue: "3 min test",
      bg: "linear-gradient(135deg, #F6F1E7 0%, #EEE3D0 100%)",
      border: "1px solid rgba(117,91,42,0.12)",
      accent: "#755B2A",
      muted: "#5F6B76",
      activeBg: "#755B2A",
      activeColor: "#FFFFFF",
    },
    {
      key: "Match",
      title: "Match",
      subtitle: "Rolle, team og retning",
      text: "Se hvordan mennesker, roller og teams kan passe bedre sammen i praksis.",
      statLabel: "Potentiale",
      statValue: "Stærkt fit",
      bg: "linear-gradient(135deg, #F7F8FA 0%, #EEF2F6 100%)",
      border: "1px solid rgba(44,62,79,0.10)",
      accent: "#314252",
      muted: "#5B6875",
      activeBg: "#314252",
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
            maxWidth: step === 0 ? "880px" : step === 1 ? "1120px" : "820px",
          }}
        >
          {step !== 0 && (
            <StepHeader
              step={displayStep}
              total={totalSteps}
              title={stepTitle}
              subtitle={stepSubtitle}
            />
          )}

          {step === 0 && (
            <div style={{ display: "grid", gap: "18px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #10263F 0%, #173857 100%)",
                  borderRadius: "28px",
                  padding: "18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 20px 48px rgba(16,38,63,0.20)",
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(240px, 320px)",
                  gap: "18px",
                  alignItems: "stretch",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: "18px",
                    alignContent: "space-between",
                    minHeight: "100%",
                    padding: "6px",
                  }}
                >
                  <div style={{ display: "grid", gap: "14px" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.62)",
                      }}
                    >
                      ByggeTalent
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {["Samtaler", "Analyse", "Match"].map((item) => {
                        const active = selectedUniverse === item;

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setSelectedUniverse(item)}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "999px",
                              border: active
                                ? "1px solid rgba(255,255,255,0.24)"
                                : "1px solid rgba(255,255,255,0.08)",
                              background: active
                                ? "rgba(255,255,255,0.18)"
                                : "rgba(255,255,255,0.08)",
                              color: "#F8FAFC",
                              fontSize: "14px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "grid", gap: "10px" }}>
                      <h1
                        style={{
                          margin: 0,
                          fontSize: "34px",
                          lineHeight: 1.02,
                          fontWeight: 700,
                          letterSpacing: "-0.04em",
                          color: "#F8FAFC",
                          maxWidth: "11ch",
                        }}
                      >
                        Rekruttering og karrieresparring i ét flow
                      </h1>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          lineHeight: 1.7,
                          color: "rgba(255,255,255,0.78)",
                          maxWidth: "46ch",
                        }}
                      >
                        ByggeTalent samler samtaler, analyse og match i en mere
                        enkel app-oplevelse for bygge- og anlægsbranchen.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {[
                      { label: "Samtaler", value: "Refleksion" },
                      { label: "Analyse", value: "Mini-test" },
                      { label: "Match", value: "Bedre fit" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          borderRadius: "18px",
                          padding: "12px",
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          display: "grid",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "rgba(255,255,255,0.58)",
                            fontWeight: 700,
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#FFFFFF",
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "22px",
                    padding: "8px",
                    display: "grid",
                    minHeight: "100%",
                  }}
                >
                  <img
                    src="/images/mobil-haanden.png"
                    alt="ByggeTalent direkte i hverdagen"
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "300px",
                      maxHeight: "360px",
                      objectFit: "cover",
                      objectPosition: "center top",
                      borderRadius: "18px",
                      display: "block",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "14px",
                }}
              >
                {overviewCards.map((card) => {
                  const active = selectedUniverse === card.key;

                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setSelectedUniverse(card.key)}
                      style={{
                        background: card.bg,
                        borderRadius: "24px",
                        padding: "18px",
                        border: active
                          ? `2px solid ${card.accent}`
                          : card.border,
                        boxShadow: active
                          ? "0 16px 30px rgba(15,23,42,0.08)"
                          : "0 10px 24px rgba(36,51,64,0.05)",
                        display: "grid",
                        gap: "16px",
                        minHeight: "250px",
                        alignContent: "space-between",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.58)",
                            border: "1px solid rgba(44,62,79,0.08)",
                          }}
                        />
                        <div
                          style={{
                            padding: "8px 11px",
                            borderRadius: "999px",
                            background: active
                              ? card.activeBg
                              : "rgba(255,255,255,0.62)",
                            color: active ? card.activeColor : card.accent,
                            fontSize: "11px",
                            fontWeight: 700,
                            border: active
                              ? "none"
                              : "1px solid rgba(44,62,79,0.08)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {card.statValue}
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: "8px" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            lineHeight: 1.05,
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            color: "#22313F",
                          }}
                        >
                          {card.title}
                        </div>

                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: card.accent,
                          }}
                        >
                          {card.subtitle}
                        </div>

                        <div
                          style={{
                            fontSize: "14px",
                            lineHeight: 1.65,
                            color: card.muted,
                          }}
                        >
                          {card.text}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "end",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "grid", gap: "4px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              fontWeight: 700,
                              color: "#6B7280",
                            }}
                          >
                            {card.statLabel}
                          </div>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#22313F",
                            }}
                          >
                            {card.statValue}
                          </div>
                        </div>

                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "50%",
                            border: `6px solid ${card.accent}22`,
                            display: "grid",
                            placeItems: "center",
                            color: card.accent,
                            fontSize: "18px",
                            fontWeight: 700,
                          }}
                        >
                          →
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                  borderRadius: "24px",
                  padding: "18px",
                  border: "1px solid #E6EBF1",
                  boxShadow: "0 12px 28px rgba(36,51,64,0.05)",
                  display: "grid",
                  gridTemplateColumns: "92px minmax(0, 1fr)",
                  gap: "16px",
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
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
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
                      lineHeight: 1.08,
                      fontWeight: 700,
                      color: "#22313F",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Karina Maria Nyberg
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.65,
                      color: "#5B6875",
                      maxWidth: "60ch",
                    }}
                  >
                    ByggeTalent er skabt med fokus på HR, rekruttering,
                    organisationsudvikling og stærke projektteams i bygge- og
                    anlægsbranchen.
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: "sticky",
                  bottom: "12px",
                  zIndex: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "18px",
                  background: "rgba(241,236,227,0.96)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(44,62,79,0.12)",
                  boxShadow: "0 12px 28px rgba(15,23,42,0.10)",
                }}
              >
                <button
                  style={secondaryButtonStyle}
                  onClick={() => {
                    setEnteredApp(false);
                    setStep(1);
                  }}
                >
                  Tilbage til forsiden
                </button>

                <button
                  style={primaryButtonStyle}
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Næste
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "grid", gap: "18px" }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #2C3E4F 0%, #1F2B36 100%)",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
                  display: "grid",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.58)",
                  }}
                >
                  Kandidatprofil · Step 2
                </div>

                <div
                  style={{
                    fontSize: 34,
                    lineHeight: 1.02,
                    fontWeight: 700,
                    color: "#F8FAFC",
                  }}
                >
                  Din profil
                </div>

                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.8)",
                    maxWidth: 720,
                  }}
                >
                  Udfyld dine oplysninger, upload dokumenter og vælg den faglige
                  retning, der matcher din profil i bygge- og anlægsbranchen.
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "16px",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    ...industrialCardStyle,
                    gap: "14px",
                  }}
                >
                  <SectionBar
                    eyebrow="Grunddata"
                    title="Personoplysninger"
                    rightTag="Kandidat"
                  />

                  <div style={{ display: "grid", gap: "10px" }}>
                    <TextInput
                      placeholder="Navn *"
                      value={form.name}
                      onChange={(value) => update("name", value)}
                    />
                    <TextInput
                      placeholder="E-mail *"
                      value={form.email}
                      onChange={(value) => update("email", value)}
                    />
                    <TextInput
                      placeholder="Telefon *"
                      value={form.phone}
                      onChange={(value) => update("phone", value)}
                    />
                    <TextInput
                      placeholder="Adresse / by / postnummer *"
                      value={form.address}
                      onChange={(value) => update("address", value)}
                    />
                    <TextInput
                      placeholder="Nuværende titel / rolle *"
                      value={form.currentTitle}
                      onChange={(value) => update("currentTitle", value)}
                    />
                    <TextInput
                      placeholder="LinkedIn *"
                      value={form.linkedin}
                      onChange={(value) => update("linkedin", value)}
                    />
                    <textarea
                      style={textareaStyle}
                      placeholder="Kort note: Hvad skal vi vide om dig?"
                      value={form.supplementaryInfo}
                      onChange={(e) =>
                        update("supplementaryInfo", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gap: "16px" }}>
                  <div
                    style={{
                      ...industrialCardStyle,
                      gap: "12px",
                    }}
                  >
                    <SectionBar eyebrow="Match" title="Jobparametre" />

                    <SelectInput
                      value={form.experience}
                      onChange={(value) => update("experience", value)}
                      options={[
                        "Vælg erfaring *",
                        "0-3 år",
                        "4-7 år",
                        "8-12 år",
                        "12+ år",
                      ]}
                    />

                    <SelectInput
                      value={form.salary}
                      onChange={(value) => update("salary", value)}
                      options={[
                        "Vælg lønretning *",
                        "Under nuværende niveau",
                        "Samme niveau",
                        "Over nuværende niveau",
                      ]}
                    />

                    <SelectInput
                      value={form.distance}
                      onChange={(value) => update("distance", value)}
                      options={[
                        "Vælg geografisk rækkevidde *",
                        "0-20 km",
                        "20-50 km",
                        "50+ km",
                        "Hele Danmark",
                      ]}
                    />
                  </div>

                  <div
                    style={{
                      ...industrialPanelStyle,
                      gap: "12px",
                    }}
                  >
                    <SectionBar eyebrow="Dokumenter" title="CV og bilag" />

                    <FileUploadField
                      label="Upload CV *"
                      file={cvFile}
                      onChange={setCvFile}
                    />
                    <FileUploadField
                      label="Upload ekstra dokument"
                      file={applicationFile}
                      onChange={setApplicationFile}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...industrialCardStyle,
                  gap: "14px",
                }}
              >
                <SectionBar eyebrow="Fagområde" title="Faglig profil" />

                <RoleSelectionCard
                  title="Vælg faglige profiler *"
                  groupedRoles={groupedRoles}
                  selectedValues={form.profiles}
                  openGroups={openProfileGroups}
                  onToggleGroup={(group) =>
                    toggleGroup(group, openProfileGroups, setOpenProfileGroups)
                  }
                  onToggleRole={toggleProfile}
                  otherTitle={form.profileOtherTitle}
                  onOtherTitleChange={(value) =>
                    update("profileOtherTitle", value)
                  }
                />
              </div>

              <div
                style={{
                  ...complianceCardStyle,
                  gap: "14px",
                }}
              >
                <SectionBar eyebrow="Compliance" title="Samtykke og privatliv" />

                <div style={{ display: "grid", gap: 10 }}>
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

                  <div style={{ marginTop: 2 }}>
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
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: "sticky",
                  bottom: "12px",
                  zIndex: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "14px",
                  background: "rgba(241,236,227,0.96)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(44,62,79,0.12)",
                  boxShadow: "0 12px 28px rgba(15,23,42,0.10)",
                }}
              >
                <button style={secondaryButtonStyle} onClick={() => setStep(0)}>
                  Tilbage
                </button>

                <button
                  style={{
                    ...primaryButtonStyle,
                    opacity: isStep1Valid ? 1 : 0.5,
                    cursor: isStep1Valid ? "pointer" : "not-allowed",
                  }}
                  onClick={() => {
                    if (!isStep1Valid) return;
                    setShowResult(false);
                    setAnswers(Array(10).fill(0));
                    setStep(2);
                  }}
                  disabled={!isStep1Valid}
                >
                  Videre
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div
              style={{
                background: "#16181d",
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
                        "linear-gradient(135deg, #101820 0%, #0B1117 100%)",
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
