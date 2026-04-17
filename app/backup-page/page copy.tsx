"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

const groupedRoles = {
  "Faglaerte og tekniske stillinger (udfoerende)": [
    "Anlaegsstruktoer",
    "Bygningsstruktoer",
    "Brolaegger",
    "Byggemontagetekniker",
    "Kloakmester",
    "Monteringstekniker",
  ],
  "Funktionaerer, ledelse og teknisk personale": [
    "Projektleder (byggeri/anlaeg)",
    "Byggeleder",
    "Entrepriseleder",
    "Projekteringsleder",
    "Fagchef",
    "Markedschef / Forretningsudvikling",
    "Byggetekniker",
    "Byggesagsbehandler",
    "Kvalitetsansvarlig",
    "PQ-ansvarlig",
    "Kalkulatoer",
    "Planlaegger (tid/plan)",
  ],
  "Raadgivere og projektering": [
    "Bygningsingenioer",
    "Konstruktionsingenioer",
    "Bygningskonstruktoer",
    "Arkitekt",
    "Brandraadgiver",
    "Arbejdsmiljoekoordinator (P/B)",
    "Baeredygtighedskonsulent",
    "ESG-ansvarlig",
  ],
  "Installationer og teknik": [
    "Installationsingenioer (VVS/EL)",
    "VVS-projektleder",
    "El-projektleder",
    "Teknikentrepriseleder",
  ],
  "Inspektoerer og specialister": [
    "Broinspektoer",
    "Bygningsinspektoer",
    "Jernbaneinspektoer",
    "Tilsynsfoerende",
    "Landinspektoer",
    "Geotekniker",
    "Spildevandsingenioer",
  ],
  "Drift og facility": ["Driftsleder", "Facility Manager"],
};

const groupNames = Object.keys(groupedRoles);

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
  opportunities: string[];
  consent: boolean;
  gdpr: boolean;
};

type AccordionGroupState = Record<string, boolean>;

const primaryGreen = "#6EDC5F";

export default function Home() {
  const [enteredApp, setEnteredApp] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));
  const [showResult, setShowResult] = useState(false);
const totalScore = answers.reduce((sum, value) => sum + value, 0);
const isCompleted = answers.every((answer) => answer > 0);
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
    opportunities: [],
    consent: false,
    gdpr: false,
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applicationFile, setApplicationFile] = useState<File | null>(null);

  const [showConsentInfo, setShowConsentInfo] = useState(false);
  const [showGdprInfo, setShowGdprInfo] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

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

  const isStep1Valid =
    !!form.name &&
    !!form.email &&
    !!form.phone &&
    !!form.address &&
    !!form.currentTitle &&
    !!form.experience &&
    !!form.linkedin &&
    !!form.salary &&
    !!form.distance;


  const isStep2Valid = form.profiles.length > 0;
  const isStep3Valid = form.consent && form.gdpr;
  const isValid = isStep1Valid && isStep2Valid && isStep3Valid;

  return (
    <main style={mainStyle}>
      {!enteredApp ? (
        <section style={heroScreenStyle}>
          <div style={heroOverlayStyle}>
            <div style={heroBrandStyle}>ByggeTalent</div>

            <div style={heroContentStyle}>
              <h1 style={heroTitleStyle}>
                I dag er starten paa dit nye arbejdsliv
              </h1>

            <p style={heroTextStyle}>
                Bliv synlig for nye muligheder i bygge- og anlaegsbranchen - i
                dit eget tempo.
            </p>

            <button
                style={heroButtonStyle}
              onClick={() => {
                setEnteredApp(true);
                setStep(0);
                  window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Kom i gang
            </button>
            </div>
          </div>
        </section>
      ) : (
        <section
          style={{
            ...flowWrapStyle,
            maxWidth: step === 0 ? "1180px" : "760px",
          }}
        >
          <StepHeader
            step={step}
            total={4}
            title={
              step === 0
                ? ""
                : step === 1
                ? "Din profil"
                : step === 2
                ? "Mini-test"
                : step === 3
                ? "Samtykke"
                : "Opsummering"
            }
            subtitle={
              step === 0
                ? "Faa ro, overblik og retning foer naeste skridt"
                : step === 1
                ? "Profiloplysninger og CV"
                : step === 2
                ? "Vurder din retning"
                : step === 3
                ? "Privatliv og godkendelse"
                : "Gennemgaa dine oplysninger"
            }
          />

          {step === 0 && (
            <div
              style={{
                background: "#F3EFE6",
                borderRadius: "30px",
                padding: "28px",
                border: "1px solid #D6CBBE",
                boxShadow: "0 10px 30px rgba(44,62,79,0.05)",
                display: "grid",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "22px",
                }}
              >
                <div
                  style={{
                    background: "#D6CBBE",
                    borderRadius: "26px",
                    padding: "28px",
                    minHeight: "290px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                  <div style={eyebrowStyle}>Om appen</div>
                    <h2
                      style={{
                        fontSize: "38px",
                        lineHeight: 1.08,
                        color: "#2C3E4F",
                        margin: "0 0 18px 0",
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        maxWidth: "480px",
                      }}
                    >
                      Naar tempoet er hoejt, kan det vaere svaert at maerke,
                      hvad der egentlig kalder
                  </h2>

                    <p
                      style={{
                        color: "#2C3E4F",
                        lineHeight: 1.7,
                        fontSize: "17px",
                        margin: 0,
                        maxWidth: "520px",
                      }}
                    >
                      ByggeTalent er en netvaerks- og rekrutteringsapp udviklet
                      saerligt til bygge- og anlaegsbranchen, hvor projekter,
                      ansvar og deadlines ofte fylder saa meget, at der
                      sjaeldent er tid til at stoppe op og maerke efter.
                      <br />
                      <br />
                      For mange viser tanken sig foerst som en stille fornemmelse
                      af, at noget maaske godt maatte vaere anderledes - maaske
                      en anden rolle, et nyt projekt, mere balance eller stoerre
                      faglig retning.
                      <br />
                      <br />
                      ByggeTalent giver dig et professionelt rum til at afklare
                      netop det med respekt for baade timing, relation og
                      naeste skridt.
                  </p>
                  </div>
                </div>

                <div
                  style={{
                    position: "relative",
                    minHeight: "290px",
                    borderRadius: "26px",
                    overflow: "hidden",
                    backgroundImage:
                    "linear-gradient(to bottom, rgba(44,62,79,0.10), rgba(44,62,79,0.30)), url('/images/image.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "1px solid #D6CBBE",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "18px",
                      left: "18px",
                      background: "rgba(243,239,230,0.92)",
                      color: "#2C3E4F",
                      borderRadius: "999px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    Diskret - professionelt - respektfuldt
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      left: "18px",
                      right: "18px",
                      bottom: "18px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <PreviewMetric label="Timing" value="Afstemt" />
                    <PreviewMetric label="Relation" value="Foerst" />
                    <PreviewMetric label="Retning" value="Afklaret" />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "22px",
                }}
              >
                <div
                  style={{
                    background: "#D3E1EA",
                    borderRadius: "26px",
                    padding: "28px",
                    minHeight: "250px",
                  }}
                >
                  <div style={eyebrowStyle}>Afsender</div>
                  <h3
                    style={{
                      color: "#2C3E4F",
                      margin: "0 0 14px 0",
                      fontSize: "30px",
                      lineHeight: 1.1,
                    }}
                  >
                    Bag ByggeTalent staar Karina Maria Nyberg
                  </h3>

                  <p
                    style={{
                      color: "#2C3E4F",
                      lineHeight: 1.7,
                      fontSize: "14px",
                      margin: 0,
                    }}
                  >
                    ByggeTalent er skabt af Karina Maria Nyberg, med afsaet i
                    mange aars erfaring som HR-leder i en ingenioervirksomhed og
                    som selvstaendig ledelseskonsulent med fokus paa
                    rekruttering, arbejdsliv og samarbejde i bygge- og
                    anlaegsbranchen.
                    <br />
                    <br />
                    Gennem arbejdet med baade rekruttering, sygefravaer,
                    projektteams og ledelsesudvikling har hun opbygget en staerk
                    indsigt i branchens mennesker, samarbejdsformer og de
                    udfordringer, som ofte opstaar i et arbejdsliv med hoejt
                    tempo og komplekse projekter.
                  </p>
                </div>

                <div
                  style={{
                    background: "#F3EFE6",
                    borderRadius: "26px",
                    padding: "28px",
                    minHeight: "250px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "16px",
                    border: "1px solid #D3E1EA",
                  }}
                >
                  {[
                    {
                      text: "Respektfuld kontakt",
                      bg: "#8FB0C3",
                      color: "#2C3E4F",
                      width: "155px",
                    },
                    {
                      text: "Relation foer rekruttering",
                      bg: "#D3E1EA",
                      color: "#2C3E4F",
                      width: "175px",
                    },
                    {
                      text: "Karriereklarhed foer handling",
                      bg: "#2C3E4F",
                      color: "#F3EFE6",
                      width: "190px",
                    },
                  ].map((arrow, index) => (
                    <div
                      key={index}
                      style={{
                        background: arrow.bg,
                        color: arrow.color,
                        minWidth: arrow.width,
                        height: "64px",
                        padding: "0 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "14px",
                        lineHeight: 1.25,
                        borderRadius: "16px",
                        clipPath:
                          "polygon(0 0, 84% 0, 100% 50%, 84% 100%, 0 100%, 8% 50%)",
                        boxShadow: "0 6px 18px rgba(44,62,79,0.06)",
                      }}
                    >
                      {arrow.text}
                    </div>
                  ))}
                </div>
              </div>

              <div style={stepButtonsStyle}>
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
                  Videre
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={stepCardStyle}>
              <div style={formGridStyle}>
                <TextInput
                  placeholder="Navn *"
                  value={form.name}
                  onChange={(value) => update("name", value)}
                />

                <TextInput
                  placeholder="Email *"
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
                  placeholder="Nuvaerende titel / rolle *"
                  value={form.currentTitle}
                  onChange={(value) => update("currentTitle", value)}
                />

                <SelectInput
                  value={form.experience}
                  onChange={(value) => update("experience", value)}
                  options={[
                    "Vaelg erfaring *",
                    "0-3 aar",
                    "4-7 aar",
                    "8-12 aar",
                    "12+ aar",
                  ]}
                />

                <TextInput
                  placeholder="LinkedIn *"
                  value={form.linkedin}
                  onChange={(value) => update("linkedin", value)}
                />

                <SelectInput
                  value={form.salary}
                  onChange={(value) => update("salary", value)}
                  options={[
                    "Vaelg loenretning *",
                    "Under nuvaerende niveau",
                    "Samme niveau",
                    "Over nuvaerende niveau",
                  ]}
                />

                <SelectInput
                  value={form.distance}
                  onChange={(value) => update("distance", value)}
                  options={[
                    "Vaelg geografisk raekkevidde *",
                    "0-20 km",
                    "20-50 km",
                    "50+ km",
                    "Hele Danmark",
                  ]}
                />

                <textarea
                  style={textareaStyle}
                  placeholder="Er der noget vigtigt vi skal vide om dig?"
                  value={form.supplementaryInfo}
                  onChange={(e) => update("supplementaryInfo", e.target.value)}
                />
              </div>

              <CvUploadCard
                cvFile={cvFile}
                applicationFile={applicationFile}
                onCvChange={setCvFile}
                onApplicationChange={setApplicationFile}
              />

              <div style={stepButtonsStyle}>
                <button
                  style={secondaryButtonStyle}
                  onClick={() => setStep(0)}
                >
                  Tilbage
                </button>

                <button
                  style={{
                    ...primaryButtonStyle,
                    opacity: isStep1Valid ? 1 : 0.5,
                    cursor: isStep1Valid ? "pointer" : "not-allowed",
                  }}
                  onClick={() => setStep(2)}
                  disabled={false}
                >
                  Naeste
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
  <div style={stepCardStyle}>
    <div
      style={{
        borderRadius: "26px",
        overflow: "hidden",
        minHeight: "420px",
        backgroundImage: "url('/images/Minitest.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1px solid #D6CBBE",
      }}
    />

    <div style={stepButtonsStyle}>
      <button
        style={secondaryButtonStyle}
        onClick={() => setStep(1)}
      >
                  Tilbage
                </button>

                <button
                  style={primaryButtonStyle}
        onClick={() => setStep(21)}
                >
                  Start testen
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={stepCardStyle}>
              <h2 style={guideTitleStyle}>Er du egentlig det rigtige sted?</h2>

              <p style={guideSubtitleStyle}>
                Nogle gange aendrer arbejdet sig - eller ogsaa goer man selv.
                <br />
                Tag mini-testen og faa en fornemmelse af, hvad du egentlig savner
                mest i dit arbejdsliv.
              </p>

              <RoleSelectionCard
                title="Vaelg faglige profiler *"
                groupedRoles={groupedRoles}
                selectedValues={form.profiles}
                openGroups={openProfileGroups}
                onToggleGroup={(group) =>
                  toggleGroup(group, openProfileGroups, setOpenProfileGroups)
                }
                onToggleRole={toggleProfile}
              />

              <div style={stepButtonsStyle}>
                <button
                  style={secondaryButtonStyle}
                  onClick={() => setStep(1)}
                >
                  Tilbage
                </button>

                <button
                  style={{
                    ...primaryButtonStyle,
                    opacity: isStep2Valid ? 1 : 0.5,
                    cursor: isStep2Valid ? "pointer" : "not-allowed",
                  }}
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                >
                  Videre
                </button>
              </div>
            </div>
          )}
          {step === 21 && (
  <div
    style={{
      background: "#16181d",
      borderRadius: "28px",
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

    {[
      "Min nuværende rolle føles naturlig for mig",
      "Mine stærkeste sider kommer i spil i mit job",
      "De opgaver jeg sidder med giver mig energi",
      "Samarbejdet omkring mig understøtter den måde, jeg arbejder bedst på",
      "Jeg føler mig tryg ved at sige min mening",
      "Jeg har reel mulighed for at påvirke beslutninger i mit arbejde",
      "Tempoet og forventningerne passer til mig",
      "Jeg savner sjældent at bruge andre sider af mig selv i arbejdet",
      "Jeg kan se mig selv i denne rolle over længere tid",
      "Mit job giver mening i forhold til, hvor jeg er i arbejdslivet lige nu",
      
    ].map((question, index) => (
                <div
        key={index}
                  style={{
                    display: "grid",
          gap: "6px",
          paddingBottom: "2px",
                    borderBottom:
            index === 10 ? "none" : "1px solid rgba(243,239,230,0.08)",
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
          style={{
            display: "flex",
            gap: "34px",
            paddingLeft: "22px",
          }}
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
                color: answers[index] === value ? "#6EDC5F" : "#F3EFE6",
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
        onClick={() => setStep(2)}
                >
                  Tilbage
                </button>

                <button
      style={primaryButtonStyle}
                  type="button"
                  onClick={() => setShowResult(true)}
                >
      
    
                  Se mit resultat
                </button>
      <div style={{ marginTop: "24px", color: "#F3EFE6" }}>
    Samlet score: {totalScore}
    <h3 style={{ marginTop: "12px", marginBottom: "8px", color: "#6EDC5F" }}>
  Din arbejdssituation lige nu
</h3>
<p>
  Din score viser, at du stadig finder værdi i dit nuværende arbejde,
  men der er tydelige områder, hvor du savner mere mening, udvikling
  eller bedre rammer. Det kan være et tegn på, at du er klar til næste skridt.
</p>
              </div>

                  </div>
            </div>
          )}

          {step === 3 && (
            <div style={stepCardStyle}>
              <InfoCheckboxCard
                checked={form.consent}
                onChange={() => update("consent", !form.consent)}
                infoOpen={showConsentInfo}
                onToggleInfo={() => setShowConsentInfo(!showConsentInfo)}
                label="Jeg giver samtykke til, at ByggeTalent maa opbevare og behandle mine personoplysninger i op til 6 maaneder med henblik paa rekruttering og relevante jobmuligheder. *"
                infoText="Dine oplysninger opbevares i op til 6 maaneder med henblik paa rekruttering og mulige fremtidige jobmuligheder. Du kan til enhver tid traekke dit samtykke tilbage."
              />

              <InfoCheckboxCard
                checked={form.gdpr}
                onChange={() => update("gdpr", !form.gdpr)}
                infoOpen={showGdprInfo}
                onToggleInfo={() => setShowGdprInfo(!showGdprInfo)}
                label="Jeg accepterer, at mine personoplysninger behandles i henhold til ByggeTalents privatlivspolitik. *"
                infoText="ByggeTalent behandler dine oplysninger med henblik paa rekruttering og match med relevante virksomheder. Dine data opbevares sikkert i den oplyste periode."
              />

              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
                style={privacyLinkButtonStyle}
              >
                Laes vores privatlivspolitik
              </button>

              {showPrivacyPolicy && (
                <div style={privacyPolicyBoxStyle}>
                  <p style={privacyPolicyTextStyle}>
                    Privatlivspolitik for ByggeTalent
                  <br />
                    <br />
                    1. Indledning
                    <br />
                    ByggeTalent er dataansvarlig for behandlingen af dine
                    personoplysninger.
                    <br />
                    <br />
                    2. Hvilke oplysninger indsamler vi?
                    <br />
                    Vi indsamler oplysninger som navn, e-mail, telefonnummer,
                    adresse, LinkedIn og CV.
                    <br />
                    <br />
                    3. Formaal
                    <br />
                    Dine oplysninger bruges til rekruttering og match med
                    relevante virksomheder.
                    <br />
                    <br />
                    4. Opbevaring
                    <br />
                    Dine data gemmes i op til 6 maaneder.
                    <br />
                    <br />
                    5. Dine rettigheder
                    <br />
                    Du kan til enhver tid faa indsigt, rettelse eller sletning af
                    dine data.
                  </p>
                </div>
              )}

              <div style={stepButtonsStyle}>
                <button
                  style={secondaryButtonStyle}
                  onClick={() => {
                    setShowResult(false);
  setStep(2);
                  }}
                >
                  Tilbage
                </button>

                <button
                  style={{
                    ...primaryButtonStyle,
                    opacity: isStep3Valid ? 1 : 0.5,
                    cursor: isStep3Valid ? "pointer" : "not-allowed",
                  }}
                  onClick={() => setStep(4)}
                  disabled={!isStep3Valid}
                >
                  Naeste
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={stepCardStyle}>
              <div style={summaryBoxStyle}>
              <SummaryRow label="Navn" value={form.name} />
              <SummaryRow label="Email" value={form.email} />
              <SummaryRow label="Telefon" value={form.phone} />
              <SummaryRow label="Adresse" value={form.address} />
                <SummaryRow
                  label="Nuvaerende titel"
                  value={form.currentTitle}
                />
              <SummaryRow label="Erfaring" value={form.experience} />
              <SummaryRow label="LinkedIn" value={form.linkedin} />
              <SummaryRow label="Loenretning" value={form.salary} />
                <SummaryRow
                  label="Geografisk raekkevidde"
                  value={form.distance}
                />
                <SummaryRow
                  label="Valgte faglige profiler"
                  value={`${form.profiles.length} valgt`}
                />
                <SummaryRow
                  label="CV"
                  value={cvFile ? cvFile.name : "Ikke uploadet"}
                />
              </div>

              <div style={stepButtonsStyle}>
                <button
                  style={secondaryButtonStyle}
                  onClick={() => {
  setShowResult(false);
  setStep(21);
}}
                >
                  Tilbage
                </button>

                <button
                  style={{
                    ...primaryButtonStyle,
                    opacity: isValid ? 1 : 0.5,
                    cursor: isValid ? "pointer" : "not-allowed",
                  }}
                  disabled={!isValid}
                  onClick={() => alert("Sendt til godkendelse")}
                >
                  Send til godkendelse
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function PreviewMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "rgba(243,239,230,0.92)",
        borderRadius: "18px",
        padding: "14px",
      }}
    >
      <div style={{ fontSize: "12px", color: "#2C3E4F", opacity: 0.7 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "18px",
          color: "#2C3E4F",
          fontWeight: 700,
          marginTop: "4px",
        }}
      >
        {value}
      </div>
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
      <div style={stepMetaStyle}>Step {step} af {total}</div>

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

function AboutAppCard() {
  const [open, setOpen] = useState(false);

  return (
    <div style={lightCardStyle}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={foldButtonLightStyle}
      >
        <span style={arrowLightStyle}>{open ? "▼" : "▶"}</span>
        <span>Laes om appen</span>
      </button>

      {open && (
        <div style={aboutContentLightStyle}>
          <p>
            ByggeTalent er udviklet med afsaet i mange aars erfaring med
            rekruttering og projektarbejde i bygge- og anlaegsbranchen.
          </p>

          <p>
            Appen er skabt som et mere roligt og maalrettet alternativ, hvor
            kandidater selv kan goere opmaerksom paa deres interesse.
          </p>

          <p>
            Maalet er at goere det nemmere at blive synlig for relevante
            muligheder uden at det foeles som en tung formular eller en klassisk
            jobportal.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={summaryRowStyle}>
      <span style={summaryLabelStyle}>{label}</span>
      <span style={summaryValueStyle}>{value}</span>
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
}: {
  title: string;
  groupedRoles: Record<string, string[]>;
  selectedValues: string[];
  openGroups: Record<string, boolean>;
  onToggleGroup: (group: string) => void;
  onToggleRole: (role: string) => void;
}) {
  return (
    <div style={lightCardStyle}>
      <div style={cardHeadingStyle}>{title}</div>

      <div style={detailsContentStyle}>
        {Object.entries(groupedRoles).map(([group, roles]) => (
          <div key={group} style={accordionBlockLightStyle}>
            <button
              type="button"
              onClick={() => onToggleGroup(group)}
              style={accordionButtonLightStyle}
            >
              <span style={arrowLightStyle}>{openGroups[group] ? "▼" : "▶"}</span>
              <span>{group}</span>
            </button>

            {openGroups[group] && (
              <div style={accordionContentStyle}>
                {roles.map((role) => {
                  const checked = selectedValues.includes(role);

                  return (
                    <label
                      key={role}
                      style={{
                        ...checkboxPillStyle,
                        borderColor: checked ? primaryGreen : "#e5e7eb",
                        background: checked ? "#f3ffef" : "#ffffff",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleRole(role)}
                      />
                      <span>{role}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CvUploadCard({
  cvFile,
  applicationFile,
  onCvChange,
  onApplicationChange,
}: {
  cvFile: File | null;
  applicationFile: File | null;
  onCvChange: (file: File | null) => void;
  onApplicationChange: (file: File | null) => void;
}) {
  return (
    <div style={lightCardStyle}>
      <div style={cardHeadingStyle}>CV og dokumenter</div>

      <div style={accordionContentStyle}>
        <FileUploadField
          label="Upload CV *"
          file={cvFile}
          onChange={onCvChange}
        />

        <FileUploadField
          label="Upload ekstra dokument"
          file={applicationFile}
          onChange={onApplicationChange}
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
    <div style={lightCardStyle}>
      <label style={checkboxLabelLightStyle}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span>{label}</span>
        <button
          type="button"
          onClick={onToggleInfo}
          style={arrowButtonStyle}
        >
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
  background: "#f3f4f6",
  color: "#111827",
  fontFamily: "Arial, sans-serif",
};

const heroScreenStyle = {
  width: "100%",
  maxWidth: "760px",
  minHeight: "min(88vh, 760px)",
  borderRadius: "32px",
  overflow: "hidden",
  margin: "0 auto",
  backgroundImage:
    "linear-gradient(to bottom, rgba(0,0,0,0.10), rgba(0,0,0,0.45)), url('/images/image.png')",
  backgroundSize: "cover",
  backgroundPosition: "72% center",
  position: "relative" as const,
};

const heroOverlayStyle = {
  position: "relative" as const,
  width: "100%",
  minHeight: "min(88vh, 760px)",
  padding: "12px",
};

const heroBrandStyle = {
  position: "absolute" as const,
  top: "22px",
  left: "50%",
  transform: "translateX(-50%)",
  color: "white",
  fontSize: "34px",
  lineHeight: "1",
  fontWeight: 500,
};

const heroContentStyle = {
  position: "absolute" as const,
  left: "28px",
  bottom: "28px",
  maxWidth: "380px",
};

const heroTitleStyle = {
  fontSize: "clamp(38px, 6vw, 58px)",
  lineHeight: "1.02",
  color: "white",
  margin: "0 0 16px 0",
  fontWeight: 600,
};

const heroTextStyle = {
  fontSize: "18px",
  lineHeight: "1.5",
  color: "rgba(255,255,255,0.92)",
  margin: "0 0 22px 0",
};

const heroButtonStyle = {
  padding: "17px 28px",
  borderRadius: "999px",
  border: "none",
  background: primaryGreen,
  color: "#111827",
  fontSize: "18px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 10px 30px rgba(110, 220, 95, 0.28)",
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
  color: "#6b7280",
  marginBottom: "10px",
};

const progressTrackStyle = {
  width: "100%",
  height: "8px",
  background: "#e5e7eb",
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
  color: "#111827",
  margin: "0 0 8px 0",
  fontWeight: 600,
};

const stepSubtitleStyle = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#6b7280",
  margin: 0,
};

const stepCardStyle = {
  background: "#F3EFE6",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  display: "grid",
  gap: "16px",
};

const lightCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "16px",
  background: "#ffffff",
};

const cardHeadingStyle = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#111827",
};

const formGridStyle = {
  display: "grid",
  gap: "12px",
};

const inputStyle = {
  padding: "15px 16px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "16px",
  outline: "none",
};

const textareaStyle = {
  padding: "15px 16px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "16px",
  minHeight: "130px",
  resize: "vertical" as const,
  fontFamily: "Arial, sans-serif",
};

const stepButtonsStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginTop: "8px",
};

const primaryButtonStyle = {
  padding: "16px 24px",
  borderRadius: "999px",
  border: "none",
  background: primaryGreen,
  color: "#111827",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  minWidth: "140px",
};

const guideTitleStyle = {
  fontSize: "32px",
  lineHeight: "1.1",
  color: "#2C3E4F",
  margin: "0 0 20px 0",
  fontWeight: 600,
};

const guideSubtitleStyle = {
  fontSize: "18px",
  lineHeight: "1.6",
  color: "#2C3E4F",
  margin: "0 0 10px 0",
};

const secondaryButtonStyle = {
  padding: "16px 24px",
  borderRadius: "999px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "16px",
  fontWeight: 500,
  cursor: "pointer",
  minWidth: "140px",
};

const foldButtonLightStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
 background: "transparent",
color: "#F3EFE6",
border: "none",
  cursor: "pointer",
  padding: 0,
  textAlign: "left" as const,
  fontSize: "16px",
  fontWeight: 600,
};

const aboutContentLightStyle = {
  marginTop: "16px",
  color: "#4b5563",
  lineHeight: "1.8",
  display: "grid",
  gap: "14px",
};

const detailsContentStyle = {
  marginTop: "14px",
};

const accordionBlockLightStyle = {
  borderTop: "1px solid #eef2f7",
  paddingTop: "10px",
};

const accordionButtonLightStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "transparent",
  color: "#111827",
  border: "none",
  cursor: "pointer",
  padding: "10px 0",
  textAlign: "left" as const,
  fontSize: "15px",
  fontWeight: 600,
};

const accordionContentStyle = {
  display: "grid",
  gap: "6px",
  paddingTop: "10px",
  paddingLeft: "6px",
  paddingBottom: "4px",
};

const arrowLightStyle = {
  fontSize: "14px",
  color: "#6b7280",
  width: "16px",
  flexShrink: 0,
};

const checkboxPillStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "12px 14px",
  color: "#111827",
  cursor: "pointer",
};

const checkboxLabelLightStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  color: "#111827",
};

const infoTextStyle = {
  fontSize: "13px",
  color: "#6b7280",
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
  fontWeight: 600,
};

const fileInputStyle = {
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "14px",
};

const fileNameStyle = {
  fontSize: "13px",
  color: "#6b7280",
};

const privacyLinkButtonStyle = {
  background: "transparent",
  border: "none",
  padding: 0,
  margin: 0,
  color: "#6b7280",
  textDecoration: "underline",
  fontSize: "14px",
  cursor: "pointer",
  width: "fit-content",
  textAlign: "left" as const,
};

const privacyPolicyBoxStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "16px",
  background: "#f8fafc",
};

const privacyPolicyTextStyle = {
  color: "#334155",
  lineHeight: "1.7",
  fontSize: "14px",
};

const summaryBoxStyle = {
  display: "grid",
  gap: "10px",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  padding: "12px 14px",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  background: "#ffffff",
};

const summaryLabelStyle = {
  color: "#6b7280",
  fontSize: "14px",
};

const summaryValueStyle = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: 600,
};

const eyebrowStyle = {
  fontSize: "13px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "#2C3E4F",
  opacity: 0.7,
  marginBottom: "14px",
  fontWeight: 600,
};