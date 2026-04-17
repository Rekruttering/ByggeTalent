"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type CSSProperties,
  type ReactNode,
} from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────

const groupedRoles: Record<string, string[]> = {
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

// ── TYPES ─────────────────────────────────────────────────────────────────────

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

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────

const C = {
  pageBg: "#CEC7BC",
  appBg: "#07111B",
  appBg2: "#0A1824",
  surface: "rgba(15, 28, 42, 0.96)",
  surfaceSoft: "rgba(19, 35, 51, 0.92)",
  surfaceMid: "#112233",
  surfaceHigh: "#16293B",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.14)",
  text: "#F4F0E8",
  textDim: "rgba(244,240,232,0.78)",
  textMuted: "rgba(244,240,232,0.48)",
  gold: "#E0B437",
  goldSoft: "rgba(224,180,55,0.16)",
  goldBorder: "rgba(224,180,55,0.26)",
  blue: "#2258B6",
  blueDeep: "#163A7A",
  green: "#7ED957",
  red: "#E1554B",
  orange: "#E58F46",
  yellow: "#E7C34B",
};

const scoreColors = [C.red, C.orange, C.yellow, "#9ACB57", "#58C84A"];

// ── ICONS ─────────────────────────────────────────────────────────────────────

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 1 1 14 0"
        stroke={C.gold}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
        stroke={C.gold}
        strokeWidth="2"
      />
      <path
        d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke={C.gold}
        strokeWidth="2"
      />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
        stroke={C.gold}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke={C.gold} strokeWidth="2" />
    </svg>
  );
}

function IconTools() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m14 7 3-3a3 3 0 1 1 3 3l-3 3"
        stroke={C.gold}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m5 19 6.5-6.5M3 21l5-1 9.5-9.5-4-4L4 16l-1 5Z"
        stroke={C.gold}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={C.appBg} strokeWidth="2" />
      <path
        d="m8.5 12.5 2.2 2.2 4.8-5.2"
        stroke={C.appBg}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

export default function Home() {
  const [enteredApp, setEnteredApp] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));
  const [showResult, setShowResult] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

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
      Object.fromEntries(
        Object.keys(groupedRoles).map((name) => [name, false])
      )
    );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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

  const totalScore = answers.reduce((sum, value) => sum + value, 0);
  const allAnswered = answers.every((answer) => answer > 0);

  const resultCards = [
    {
      title: "Det du savner",
      percent: Math.round(
        (((answers[0] || 0) + (answers[1] || 0) + (answers[2] || 0)) / 15) * 100
      ),
    },
    {
      title: "Det du ønsker mere af",
      percent: Math.round(
        (((answers[3] || 0) + (answers[4] || 0) + (answers[5] || 0)) / 15) * 100
      ),
    },
    {
      title: "Det du ønsker mindre af",
      percent: Math.round(
        (((answers[6] || 0) + (answers[7] || 0)) / 10) * 100
      ),
    },
    {
      title: "Det der peger fremad",
      percent: Math.round(
        (((answers[8] || 0) + (answers[9] || 0)) / 10) * 100
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.pageBg,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "20px 12px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #07111B 0%, #091725 35%, #08131D 100%)",
          color: C.text,
          borderRadius: "30px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 28px 80px rgba(0,0,0,0.34)",
          border: "1px solid rgba(255,255,255,0.05)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
        }}
      >
        {!enteredApp && (
          <LandingScreen
            onEnter={() => {
              setEnteredApp(true);
            }}
          />
        )}

        {enteredApp && step === 0 && (
          <OverviewScreen
            onNext={() => setStep(1)}
            onBack={() => setEnteredApp(false)}
          />
        )}

        {enteredApp && step === 1 && (
          <ProfileScreen
            form={form}
            update={update}
            cvFile={cvFile}
            setCvFile={setCvFile}
            applicationFile={applicationFile}
            setApplicationFile={setApplicationFile}
            openProfileGroups={openProfileGroups}
            setOpenProfileGroups={setOpenProfileGroups}
            toggleGroup={toggleGroup}
            toggleProfile={toggleProfile}
            showConsentInfo={showConsentInfo}
            setShowConsentInfo={setShowConsentInfo}
            showGdprInfo={showGdprInfo}
            setShowGdprInfo={setShowGdprInfo}
            onBack={() => {
              setEnteredApp(false);
              setStep(0);
            }}
            onNext={() => {
              setAnswers(Array(10).fill(0));
              setCurrentQ(0);
              setShowResult(false);
              setStep(2);
            }}
          />
        )}

        {enteredApp && step === 2 && !showResult && (
          <MiniTestScreen
            currentQ={currentQ}
            setCurrentQ={setCurrentQ}
            answers={answers}
            setAnswers={setAnswers}
            allAnswered={allAnswered}
            onBack={() => setStep(1)}
            onShowResult={() => setShowResult(true)}
          />
        )}

        {enteredApp && step === 2 && showResult && (
          <ResultScreen
            totalScore={totalScore}
            resultCards={resultCards}
            onBack={() => setShowResult(false)}
            onNext={() => {}}
          />
        )}
      </div>
    </div>
  );
}

// ── SCREENS ───────────────────────────────────────────────────────────────────

function LandingScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.appBg,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Foto-sektion — fast højde, kun kvindens ansigt vises */}
      <div
        style={{
          position: "relative",
          height: "56vh",
          flexShrink: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <img
          src="/images/Nytfrontbillede.png"
          alt="ByggeTalent"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 8%",
            pointerEvents: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        />
        {/* Dækker bagt-ind tekst øverst */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "22%",
            background: `linear-gradient(to bottom, ${C.appBg}, transparent)`,
            pointerEvents: "none",
          }}
        />
        {/* Dækker bagt-ind tekst og knapper i bunden */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "35%",
            background: `linear-gradient(to top, ${C.appBg}, transparent)`,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Mørkt indholds-område */}
      <div
        style={{
          flex: 1,
          padding: "24px 24px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Logo + tekst */}
        <div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.text,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            ByggeTalent
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: 20,
            }}
          >
            Rekruttering med brancheforståelse
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              color: C.text,
              lineHeight: 1.2,
            }}
          >
            Find dit <span style={{ color: C.gold }}>næste skridt</span> i
            Bygge- og anlægsbranchen
          </h1>
          <p
            style={{
              margin: "12px 0 0 0",
              fontSize: 15,
              color: C.textDim,
              lineHeight: 1.6,
            }}
          >
            Rekruttering, karrieresamtaler og karrieretest i Bygge- og
            anlægsbranchen
          </p>
        </div>

        {/* Knap */}
        <button
          type="button"
          onClick={onEnter}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 14,
            border: "none",
            background: `linear-gradient(180deg, ${C.gold} 0%, #C89E28 100%)`,
            color: "#07111B",
            fontSize: 17,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(224,180,55,0.3)",
            marginTop: 32,
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            WebkitAppearance: "none",
            appearance: "none",
            position: "relative",
            zIndex: 10,
          }}
        >
          Kom i gang
        </button>
      </div>
    </div>
  );
}

function OverviewScreen({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.appBg,
        display: "flex",
        flexDirection: "column",
        padding: "28px 18px 48px",
        gap: "16px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "4px" }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.02em",
          }}
        >
          ByggeTalent
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: C.gold,
            marginTop: 2,
          }}
        >
          Rekruttering med brancheforståelse
        </div>
      </div>

      {/* Kort 1 — Bag ByggeTalent */}
      <div
        style={{
          background: "linear-gradient(180deg, #112233 0%, #0D1C2B 100%)",
          border: `1px solid ${C.lineStrong}`,
          borderRadius: "22px",
          padding: "20px 18px",
          display: "grid",
          gap: "10px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.13em",
            textTransform: "uppercase" as const,
            color: C.gold,
          }}
        >
          Om os
        </div>
        <div
          style={{ fontSize: 19, fontWeight: 800, color: C.text, lineHeight: 1.2 }}
        >
          Bag ByggeTalent
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.65,
            color: C.textDim,
          }}
        >
          ByggeTalent er skabt af Karina Maria Nyberg — med mange års erfaring
          som HR-leder i bygge- og anlægsbranchen. Vi arbejder diskret,
          professionelt og med respekt for din timing og dine relationer.
        </p>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap" as const,
            marginTop: "4px",
          }}
        >
          {["Diskret", "Professionelt", "Respektfuldt"].map((tag) => (
            <span
              key={tag}
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                background: C.goldSoft,
                border: `1px solid ${C.goldBorder}`,
                color: C.gold,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Kort 2 — Til kandidater */}
      <div
        style={{
          background: `linear-gradient(180deg, ${C.gold} 0%, #C89E28 100%)`,
          borderRadius: "22px",
          padding: "20px 18px",
          display: "grid",
          gap: "10px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.13em",
            textTransform: "uppercase" as const,
            color: "rgba(7,17,27,0.62)",
          }}
        >
          For dig som søger
        </div>
        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: C.appBg,
            lineHeight: 1.2,
          }}
        >
          Til kandidater
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.65,
            color: "rgba(7,17,27,0.80)",
          }}
        >
          Udfyld din profil, upload dit CV og tag vores mini-karrieretest.
          Vi matcher dig diskret med relevante muligheder i branchen.
        </p>
        <button
          type="button"
          onClick={onNext}
          style={{
            marginTop: "6px",
            padding: "14px 18px",
            borderRadius: "14px",
            border: "none",
            background: C.appBg,
            color: C.gold,
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            textAlign: "left" as const,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Kom i gang som kandidat</span>
          <span style={{ fontSize: 20 }}>›</span>
        </button>
      </div>

      {/* Kort 3 — Til virksomheder */}
      <div
        style={{
          background: "linear-gradient(180deg, #0E2035 0%, #091725 100%)",
          border: `1px solid ${C.blue}33`,
          borderRadius: "22px",
          padding: "20px 18px",
          display: "grid",
          gap: "10px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.13em",
            textTransform: "uppercase" as const,
            color: "#6BA3D6",
          }}
        >
          For dig som ansætter
        </div>
        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: C.text,
            lineHeight: 1.2,
          }}
        >
          Til virksomheder
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.65,
            color: C.textDim,
          }}
        >
          Vi hjælper jer med at finde de rette profiler i bygge- og
          anlægsbranchen — med fokus på match, timing og den rigtige
          kandidat frem for hurtige løsninger.
        </p>
        <a
          href="mailto:karina@byggetalent.dk"
          style={{
            marginTop: "4px",
            padding: "12px 16px",
            borderRadius: "12px",
            border: `1px solid ${C.blue}55`,
            background: "rgba(34,88,182,0.12)",
            color: "#6BA3D6",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "none",
            display: "block",
            textAlign: "center" as const,
          }}
        >
          Kontakt os
        </a>
      </div>

      {/* Tilbage-knap */}
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: C.textMuted,
          fontSize: 14,
          cursor: "pointer",
          padding: "8px 0",
          textAlign: "center" as const,
        }}
      >
        ← Tilbage til forsiden
      </button>
    </div>
  );
}

function ProfileScreen({
  form,
  update,
  cvFile,
  setCvFile,
  applicationFile,
  setApplicationFile,
  openProfileGroups,
  setOpenProfileGroups,
  toggleGroup,
  toggleProfile,
  showConsentInfo,
  setShowConsentInfo,
  showGdprInfo,
  setShowGdprInfo,
  onBack,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  cvFile: File | null;
  setCvFile: (file: File | null) => void;
  applicationFile: File | null;
  setApplicationFile: (file: File | null) => void;
  openProfileGroups: AccordionGroupState;
  setOpenProfileGroups: Dispatch<SetStateAction<AccordionGroupState>>;
  toggleGroup: (
    group: string,
    groups: AccordionGroupState,
    setGroups: Dispatch<SetStateAction<AccordionGroupState>>
  ) => void;
  toggleProfile: (value: string) => void;
  showConsentInfo: boolean;
  setShowConsentInfo: Dispatch<SetStateAction<boolean>>;
  showGdprInfo: boolean;
  setShowGdprInfo: Dispatch<SetStateAction<boolean>>;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div style={screenStyle}>
      <StepHeader
        step={2}
        total={4}
        title="Din profil"
        subtitle="Udfyld dine oplysninger, upload dokumenter og vælg din faglige profil, så vi kan matche dig bedre."
      />

      <div style={contentScrollStyle}>
        <SectionCard icon={<IconUser />} title="Personoplysninger">
          <AppInput
            placeholder="Navn *"
            value={form.name}
            onChange={(value) => update("name", value)}
          />
          <AppInput
            placeholder="E-mail *"
            value={form.email}
            onChange={(value) => update("email", value)}
          />
          <AppInput
            placeholder="Telefon *"
            value={form.phone}
            onChange={(value) => update("phone", value)}
          />
          <AppInput
            placeholder="By / Postnummer *"
            value={form.address}
            onChange={(value) => update("address", value)}
          />
          <AppInput
            placeholder="Nuværende titel *"
            value={form.currentTitle}
            onChange={(value) => update("currentTitle", value)}
          />
          <AppInput
            placeholder="LinkedIn *"
            value={form.linkedin}
            onChange={(value) => update("linkedin", value)}
          />
        </SectionCard>

        <SectionCard icon={<IconBriefcase />} title="Jobparametre">
          <AppSelect
            value={form.experience}
            onChange={(value) => update("experience", value)}
            options={[
              "Vælg erfaring",
              "0-3 år",
              "4-7 år",
              "8-12 år",
              "12+ år",
            ]}
          />
          <AppSelect
            value={form.salary}
            onChange={(value) => update("salary", value)}
            options={[
              "Vælg lønretning",
              "Under nuværende niveau",
              "Samme eller højere",
              "Kun højere",
            ]}
          />
          <AppSelect
            value={form.distance}
            onChange={(value) => update("distance", value)}
            options={[
              "Geografisk rækkevidde",
              "0-20 km",
              "20-50 km",
              "50+ km",
              "Hele Danmark",
            ]}
          />
        </SectionCard>

        <SectionCard icon={<IconFile />} title="Dokumenter">
          <FileUploadRow
            label="Upload CV *"
            file={cvFile}
            onChange={setCvFile}
          />
          <FileUploadRow
            label="Ekstra dokument"
            file={applicationFile}
            onChange={setApplicationFile}
          />
        </SectionCard>

        <SectionCard icon={<IconTools />} title="Faglig profil">
          <div style={{ display: "grid", gap: "8px" }}>
            {Object.entries(groupedRoles).map(([group, roles]) => (
              <div
                key={group}
                style={{
                  border: `1px solid ${C.line}`,
                  borderRadius: "14px",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleGroup(group, openProfileGroups, setOpenProfileGroups)
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    background: "transparent",
                    border: "none",
                    color: C.text,
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span>{group}</span>
                  <span style={{ color: C.gold, fontSize: "18px" }}>
                    {openProfileGroups[group] ? "−" : "›"}
                  </span>
                </button>

                {openProfileGroups[group] && (
                  <div
                    style={{
                      padding: "0 14px 14px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      borderTop: `1px solid ${C.line}`,
                    }}
                  >
                    {roles.map((role) => {
                      const selected = form.profiles.includes(role);

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleProfile(role)}
                          style={{
                            padding: "9px 12px",
                            borderRadius: "999px",
                            border: selected
                              ? `1px solid ${C.goldBorder}`
                              : `1px solid ${C.lineStrong}`,
                            background: selected
                              ? C.goldSoft
                              : "rgba(255,255,255,0.04)",
                            color: selected ? C.gold : C.textDim,
                            fontSize: "13px",
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

          <AppInput
            placeholder="Mangler din titel? Skriv den her"
            value={form.profileOtherTitle}
            onChange={(value) => update("profileOtherTitle", value)}
          />
        </SectionCard>

        <SectionCard
          icon={
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: C.goldSoft,
                border: `1px solid ${C.goldBorder}`,
                display: "grid",
                placeItems: "center",
                color: C.gold,
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              ✓
            </div>
          }
          title="Samtykke og privatliv"
          emphasis="light"
        >
          <ConsentCard
            checked={form.consent}
            onChange={() => update("consent", !form.consent)}
            infoOpen={showConsentInfo}
            onToggleInfo={() => setShowConsentInfo(!showConsentInfo)}
            label="Samtykke og privatliv skal accepteres"
            infoText="Jeg giver samtykke til, at ByggeTalent må opbevare og behandle mine personoplysninger i op til 6 måneder med henblik på rekruttering."
          />

          <ConsentCard
            checked={form.gdpr}
            onChange={() => update("gdpr", !form.gdpr)}
            infoOpen={showGdprInfo}
            onToggleInfo={() => setShowGdprInfo(!showGdprInfo)}
            label="Jeg accepterer privatlivspolitikken"
            infoText="ByggeTalent behandler dine oplysninger med henblik på rekruttering og match med relevante muligheder."
          />
        </SectionCard>
      </div>

      <BottomStickyBar
        backLabel="Tilbage"
        nextLabel="Videre"
        onBack={onBack}
        onNext={onNext}
        nextVariant="gold"
      />
    </div>
  );
}

function MiniTestScreen({
  currentQ,
  setCurrentQ,
  answers,
  setAnswers,
  allAnswered,
  onBack,
  onShowResult,
}: {
  currentQ: number;
  setCurrentQ: Dispatch<SetStateAction<number>>;
  answers: number[];
  setAnswers: Dispatch<SetStateAction<number[]>>;
  allAnswered: boolean;
  onBack: () => void;
  onShowResult: () => void;
}) {
  const value = answers[currentQ] || 0;
  const fillPercent = value > 0 ? ((value - 1) / 4) * 100 : 50;

  const handleSelect = (selected: number) => {
    const updated = [...answers];
    updated[currentQ] = selected;
    setAnswers(updated);
  };

  return (
    <div style={screenStyle}>
      <StepHeader
        step={3}
        total={4}
        title="Mini-test"
        subtitle="Vurder din retning. Vurder hvert udsagn fra 1 til 5"
      />

      <div style={contentScrollStyle}>
        <div style={largeCardStyle}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: "14px",
            }}
          >
            {currentQ + 1}/{testQuestions.length}
          </div>

          <div
            style={{
              fontSize: "18px",
              lineHeight: 1.45,
              color: C.text,
              fontWeight: 700,
              marginBottom: "24px",
              maxWidth: "20ch",
            }}
          >
            {testQuestions[currentQ]}
          </div>

          <div
            style={{
              position: "relative",
              height: "14px",
              borderRadius: "999px",
              background:
                "linear-gradient(90deg, #E1554B 0%, #E58F46 22%, #E7C34B 50%, #9ACB57 75%, #58C84A 100%)",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `calc(${fillPercent}% - 14px)`,
                transform: "translateY(-50%)",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: C.gold,
                boxShadow: "0 8px 18px rgba(224,180,55,0.35)",
                border: "2px solid rgba(255,255,255,0.18)",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
              alignItems: "center",
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const selected = value === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSelect(n)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: selected ? C.gold : C.text,
                    fontSize: "26px",
                    fontWeight: 800,
                    cursor: "pointer",
                    padding: "0",
                    lineHeight: 1,
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              color: C.textMuted,
              fontSize: "12px",
              lineHeight: 1.4,
            }}
          >
            <span>Slet ikke</span>
            <span>I høj grad</span>
          </div>
        </div>
      </div>

      <BottomStickyBar
        backLabel="Tilbage"
        nextLabel={currentQ === testQuestions.length - 1 ? "Næste" : "Næste"}
        onBack={() => {
          if (currentQ === 0) {
            onBack();
          } else {
            setCurrentQ((prev) => prev - 1);
          }
        }}
        onNext={() => {
          if (currentQ < testQuestions.length - 1) {
            setCurrentQ((prev) => prev + 1);
            return;
          }
          if (allAnswered) onShowResult();
        }}
        nextVariant="gold"
      />
    </div>
  );
}

function ResultScreen({
  totalScore,
  resultCards,
  onBack,
  onNext,
}: {
  totalScore: number;
  resultCards: { title: string; percent: number }[];
  onBack: () => void;
  onNext: () => void;
}) {
  const circumference = 2 * Math.PI * 52;
  const progress = (totalScore / 50) * circumference;

  return (
    <div style={screenStyle}>
      <div style={{ padding: "22px 18px 12px" }}>
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(8,22,34,0.98) 0%, rgba(7,18,28,0.98) 100%)",
            borderRadius: "28px",
            border: `1px solid ${C.line}`,
            padding: "22px 18px 18px",
          }}
        >
          <div
            style={{
              display: "grid",
              justifyItems: "center",
              textAlign: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: `2px solid ${C.gold}`,
                display: "grid",
                placeItems: "center",
                color: C.gold,
                fontSize: "18px",
                fontWeight: 800,
              }}
            >
              ✓
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.gold,
              }}
            >
              Resultat
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                lineHeight: 1.15,
                fontWeight: 800,
                color: C.text,
                maxWidth: "12ch",
              }}
            >
              Din karriereposition lige nu
            </h2>

            <svg width="170" height="170" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="10"
              />
              <circle
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke={C.green}
                strokeWidth="10"
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
              <text
                x="70"
                y="64"
                textAnchor="middle"
                fill={C.text}
                fontSize="30"
                fontWeight="800"
                fontFamily="-apple-system, sans-serif"
              >
                {totalScore}
              </text>
              <text
                x="70"
                y="88"
                textAnchor="middle"
                fill="rgba(244,240,232,0.74)"
                fontSize="12"
                fontFamily="-apple-system, sans-serif"
              >
                ud af 50
              </text>
            </svg>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            {resultCards.map((card, index) => {
              const accent =
                index === 0
                  ? C.text
                  : index === 1
                  ? C.text
                  : index === 2
                  ? C.gold
                  : C.green;

              return (
                <div
                  key={card.title}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${C.line}`,
                    borderRadius: "18px",
                    padding: "16px 14px",
                    minHeight: "112px",
                    display: "grid",
                    alignContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: accent,
                    }}
                  >
                    {card.percent}%
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.45,
                      color: C.textDim,
                    }}
                  >
                    {card.title}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "14px",
              background:
                "linear-gradient(180deg, rgba(224,180,55,0.14) 0%, rgba(255,255,255,0.03) 100%)",
              border: `1px solid ${C.goldBorder}`,
              borderRadius: "18px",
              padding: "16px 16px 18px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: C.gold,
                marginBottom: "8px",
              }}
            >
              Foreløbig konklusion
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                lineHeight: 1.65,
                color: C.textDim,
              }}
            >
              Din score viser, at du står stærkt, men der er tydelige områder,
              hvor du kan skabe endnu bedre balance og udvikling.
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 18px 28px", marginTop: "auto" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            ...ctaSecondaryStyle,
            width: "100%",
            marginBottom: "12px",
          }}
        >
          Tilbage til testen
        </button>

        <button
          type="button"
          onClick={onNext}
          style={{
            ...ctaPrimaryStyle,
            width: "100%",
            background: `linear-gradient(180deg, #F0C94F 0%, #E0B437 100%)`,
            color: C.appBg,
          }}
        >
          Videre
        </button>
      </div>
    </div>
  );
}

// ── SHARED UI ─────────────────────────────────────────────────────────────────

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
    <div style={{ padding: "20px 18px 14px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: C.text,
          marginBottom: "8px",
        }}
      >
        Step {step} af {total}
      </div>

      <div
        style={{
          width: "100%",
          height: "5px",
          background: "rgba(255,255,255,0.10)",
          borderRadius: "999px",
          overflow: "hidden",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: `${(step / total) * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, #E0B437 0%, #F0C94F 100%)`,
            borderRadius: "999px",
          }}
        />
      </div>

      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "28px",
          lineHeight: 1.04,
          color: C.text,
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: 1.55,
          color: C.textDim,
          maxWidth: "30ch",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
  emphasis = "dark",
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  emphasis?: "dark" | "light";
}) {
  const light = emphasis === "light";

  return (
    <div
      style={{
        background: light
          ? "linear-gradient(180deg, #E5D1A5 0%, #EADAB5 100%)"
          : "linear-gradient(180deg, rgba(17,34,51,0.98) 0%, rgba(12,25,38,0.98) 100%)",
        border: light
          ? "1px solid rgba(255,255,255,0.12)"
          : `1px solid ${C.line}`,
        borderRadius: "22px",
        padding: "16px",
        display: "grid",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: light ? C.appBg : C.text,
        }}
      >
        {icon}
        <div
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: light ? C.appBg : C.text,
          }}
        >
          {title}
        </div>
      </div>

      {children}
    </div>
  );
}

function BottomStickyBar({
  backLabel,
  nextLabel,
  onBack,
  onNext,
  nextVariant = "gold",
}: {
  backLabel: string;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  nextVariant?: "gold" | "blue";
}) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        padding: "14px 18px 22px",
        background:
          "linear-gradient(180deg, rgba(7,17,27,0) 0%, rgba(7,17,27,0.86) 30%, rgba(7,17,27,0.98) 100%)",
        display: "flex",
        gap: "12px",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          ...ctaSecondaryStyle,
          flex: 1,
        }}
      >
        {backLabel}
      </button>

      <button
        type="button"
        onClick={onNext}
        style={{
          ...ctaPrimaryStyle,
          flex: 1,
          background:
            nextVariant === "blue"
              ? "linear-gradient(180deg, #2559BB 0%, #1A468F 100%)"
              : "linear-gradient(180deg, #F0C94F 0%, #E0B437 100%)",
          color: nextVariant === "blue" ? "#FFFFFF" : C.appBg,
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function AppInput({
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

function AppSelect({
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
      style={{
        ...inputStyle,
        appearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23F4F0E8' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 16px center",
      }}
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

function FileUploadRow({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${C.line}`,
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: C.goldSoft,
          border: `1px solid ${C.goldBorder}`,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <IconFile />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: C.text,
            marginBottom: "4px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: file ? C.textDim : C.textMuted,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {file ? file.name : "Vælg fil"}
        </div>
      </div>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        style={{ display: "none" }}
        id={label}
      />

      <label
        htmlFor={label}
        style={{
          color: C.text,
          fontSize: "22px",
          cursor: "pointer",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ›
      </label>
    </div>
  );
}

function ConsentCard({
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
        borderRadius: "16px",
        border: `1px solid ${
          checked ? "rgba(7,17,27,0.10)" : "rgba(7,17,27,0.08)"
        }`,
        background: checked
          ? "rgba(255,255,255,0.16)"
          : "rgba(255,255,255,0.08)",
        padding: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={onChange}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "none",
            background: checked ? C.appBg : "rgba(7,17,27,0.12)",
            display: "grid",
            placeItems: "center",
            padding: 0,
            cursor: "pointer",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          {checked && <IconCheckCircle />}
        </button>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "14px",
              lineHeight: 1.55,
              color: C.appBg,
              fontWeight: 700,
            }}
          >
            {label}
          </div>

          {infoOpen && (
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: "13px",
                lineHeight: 1.55,
                color: "rgba(7,17,27,0.74)",
              }}
            >
              {infoText}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleInfo}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(7,17,27,0.62)",
            fontSize: "14px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {infoOpen ? "▲" : "▼"}
        </button>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const screenStyle: CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
};

const contentScrollStyle: CSSProperties = {
  padding: "0 18px 8px",
  display: "grid",
  gap: "14px",
  overflowY: "auto",
};

const largeCardStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(16,31,46,0.98) 0%, rgba(10,22,34,0.98) 100%)",
  border: `1px solid ${C.line}`,
  borderRadius: "22px",
  padding: "20px 18px 18px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: `1px solid ${C.lineStrong}`,
  background: "rgba(255,255,255,0.04)",
  color: C.text,
  fontSize: "15px",
  outline: "none",
  minHeight: "52px",
  boxSizing: "border-box",
};

const ctaPrimaryStyle: CSSProperties = {
  padding: "18px 22px",
  borderRadius: "18px",
  border: "none",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
  WebkitAppearance: "none",
  appearance: "none",
};

const ctaSecondaryStyle: CSSProperties = {
  padding: "18px 22px",
  borderRadius: "18px",
  border: `1px solid ${C.lineStrong}`,
  background: "rgba(255,255,255,0.03)",
  color: C.text,
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
  WebkitAppearance: "none",
  appearance: "none",
};