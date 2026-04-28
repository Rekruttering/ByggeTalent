"use client";

const NAVY = "#0A1628";
const NAVY_MED = "#152338";
const CURRY = "#C4A03A";
const WHITE = "#FFFFFF";
const PAGE_BG = "#F0ECE5";
const TEXT = "#0A1628";
const MUTED = "#6B7A8A";
const BORDER = "rgba(10,22,40,0.09)";
const TEAL = "#1E6B5C";
const WARM = "#8B5E3C";

// ─── Sample data ─────────────────────────────────────────────────────────────
// Replace with real scores derived from question answers

const RADAR_CURRENT: Record<string, number> = {
  roleClarity:     0.72,
  influence:       0.45,
  collaboration:   0.80,
  socialWellbeing: 0.60,
  workPace:        0.38,
  development:     0.55,
};

const RADAR_IDEAL: Record<string, number> = {
  roleClarity:     0.90,
  influence:       0.82,
  collaboration:   0.90,
  socialWellbeing: 0.85,
  workPace:        0.72,
  development:     0.86,
};

const RADAR_DIMS: { key: string; label: string }[] = [
  { key: "roleClarity",     label: "Rolleklarhed" },
  { key: "influence",       label: "Indflydelse" },
  { key: "collaboration",   label: "Samarbejde" },
  { key: "socialWellbeing", label: "Socialt velvære" },
  { key: "workPace",        label: "Arbejdstempo" },
  { key: "development",     label: "Udvikling" },
];

const ROLE_FIT = [
  { id: "specialist",   label: "Specialist",      score: 88, desc: "Du dykker ned i detaljer og leverer kvalitet inden for dit fagområde." },
  { id: "executor",     label: "Udførende",        score: 79, desc: "Du får tingene gjort og holder fokus på det konkrete resultat." },
  { id: "driver",       label: "Drivkraft",        score: 71, desc: "Du sætter retning og presser projekterne fremad, selv i modvind." },
  { id: "coordinator",  label: "Koordinator",      score: 62, desc: "Du holder overblik og sikrer at de rette mennesker taler sammen." },
  { id: "relational",   label: "Relationsskaber",  score: 54, desc: "Du bygger tillid og styrker det sociale fundament i teamet." },
];

// 0 = fuldt selvstændig / fuldt fleksibel, 1 = fuldt samarbejdende / fuldt struktureret
const COLLAB = { collaborative: 0.65, structured: 0.35 };

// ─── Work Life Radar ──────────────────────────────────────────────────────────

function WorkLifeRadar() {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 95;
  const n = RADAR_DIMS.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const poly = (vals: number[]) =>
    vals.map((v, i) => `${cx + r * v * Math.cos(angle(i))},${cy + r * v * Math.sin(angle(i))}`).join(" ");

  const currentVals = RADAR_DIMS.map((d) => RADAR_CURRENT[d.key]);
  const idealVals   = RADAR_DIMS.map((d) => RADAR_IDEAL[d.key]);

  // Biggest gap dims (gap > 0.2)
  const gaps = RADAR_DIMS.map((d) => RADAR_IDEAL[d.key] - RADAR_CURRENT[d.key]);
  const maxGap = Math.max(...gaps);
  const bigGapThreshold = Math.max(0.15, maxGap * 0.6);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", margin: "0 auto" }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={RADAR_DIMS.map((_, i) => {
            const a = angle(i);
            return `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`;
          }).join(" ")}
          fill="none"
          stroke={level === 1 ? "rgba(10,22,40,0.14)" : "rgba(10,22,40,0.07)"}
          strokeWidth="1"
        />
      ))}

      {/* Axis spokes */}
      {RADAR_DIMS.map((_, i) => {
        const a = angle(i);
        const gap = gaps[i];
        const isBig = gap >= bigGapThreshold;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
            stroke={isBig ? WARM : "rgba(10,22,40,0.10)"}
            strokeWidth={isBig ? 1.5 : 1}
            strokeDasharray={isBig ? "3,3" : undefined}
          />
        );
      })}

      {/* Gap fill between ideal and current */}
      <polygon
        points={poly(idealVals)}
        fill="rgba(196,160,58,0.10)"
        stroke="none"
      />

      {/* Current state */}
      <polygon
        points={poly(currentVals)}
        fill="rgba(30,107,92,0.18)"
        stroke={TEAL}
        strokeWidth="2"
      />

      {/* Ideal outline */}
      <polygon
        points={poly(idealVals)}
        fill="none"
        stroke={CURRY}
        strokeWidth="1.5"
        strokeDasharray="5,3"
      />

      {/* Current dots */}
      {currentVals.map((v, i) => {
        const a = angle(i);
        const isBig = gaps[i] >= bigGapThreshold;
        return (
          <circle
            key={i}
            cx={cx + r * v * Math.cos(a)}
            cy={cy + r * v * Math.sin(a)}
            r={isBig ? 5 : 3.5}
            fill={isBig ? WARM : TEAL}
          />
        );
      })}

      {/* Labels */}
      {RADAR_DIMS.map((d, i) => {
        const a = angle(i);
        const lx = cx + (r + 26) * Math.cos(a);
        const ly = cy + (r + 26) * Math.sin(a);
        const isBig = gaps[i] >= bigGapThreshold;
        return (
          <text
            key={i} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9.5" fontWeight={isBig ? 800 : 600}
            fill={isBig ? WARM : TEXT}
            fontFamily="Arial, sans-serif"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Role Fit Bars ────────────────────────────────────────────────────────────

function RoleFitBars() {
  const sorted = [...ROLE_FIT].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      {sorted.map((role, idx) => {
        const isTop = idx < 2;
        const barColor = isTop ? CURRY : "rgba(10,22,40,0.15)";
        const scoreColor = isTop ? CURRY : MUTED;

        return (
          <div key={role.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div style={{ flex: 1, paddingRight: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>{role.label}</span>
                  {isTop && (
                    <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: CURRY, color: WHITE, padding: "2px 7px", borderRadius: "999px" }}>
                      Top match
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: MUTED, lineHeight: 1.5 }}>{role.desc}</div>
              </div>
              <span style={{ fontSize: "20px", fontWeight: 800, color: scoreColor, flexShrink: 0 }}>{role.score}%</span>
            </div>
            <div style={{ height: "8px", background: "#E8E3DA", borderRadius: "999px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${role.score}%`,
                  background: barColor,
                  borderRadius: "999px",
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Collaboration Quadrant ───────────────────────────────────────────────────

const QUADRANTS = [
  {
    id: "tl",
    x: 0.25, y: 0.25,
    label: "Systematisk ekspert",
    desc: "Arbejder bedst med klar struktur og selvstændige opgaver.",
  },
  {
    id: "tr",
    x: 0.75, y: 0.25,
    label: "Teamdrevet planlægger",
    desc: "Trives med fælles mål og tydelige rammer i gruppen.",
  },
  {
    id: "bl",
    x: 0.25, y: 0.75,
    label: "Autonom innovatør",
    desc: "Skaber egne løsninger med frihed til at definere vejen.",
  },
  {
    id: "br",
    x: 0.75, y: 0.75,
    label: "Dynamisk teamspiller",
    desc: "Blomstrer i agile, samarbejdende miljøer med plads til tilpasning.",
  },
];

function CollabQuadrant() {
  const size = 280;
  const pad = 32;
  const inner = size - pad * 2;

  const ux = pad + COLLAB.collaborative * inner;
  const uy = pad + (1 - COLLAB.structured) * inner;

  // Which quadrant is user in?
  const userQuadrant =
    COLLAB.collaborative >= 0.5 && COLLAB.structured >= 0.5 ? "tr" :
    COLLAB.collaborative >= 0.5 && COLLAB.structured < 0.5  ? "br" :
    COLLAB.collaborative < 0.5  && COLLAB.structured >= 0.5 ? "tl" : "bl";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", margin: "0 auto" }}>
      {/* Quadrant backgrounds */}
      <rect x={pad} y={pad} width={inner / 2} height={inner / 2} fill="rgba(10,22,40,0.03)" rx="0" />
      <rect x={pad + inner / 2} y={pad} width={inner / 2} height={inner / 2} fill="rgba(196,160,58,0.06)" rx="0" />
      <rect x={pad} y={pad + inner / 2} width={inner / 2} height={inner / 2} fill="rgba(10,22,40,0.03)" rx="0" />
      <rect x={pad + inner / 2} y={pad + inner / 2} width={inner / 2} height={inner / 2}
        fill={userQuadrant === "br" ? "rgba(30,107,92,0.10)" : "rgba(10,22,40,0.03)"} rx="0" />

      {/* Grid lines */}
      <rect x={pad} y={pad} width={inner} height={inner} fill="none" stroke="rgba(10,22,40,0.12)" strokeWidth="1" />
      <line x1={pad + inner / 2} y1={pad} x2={pad + inner / 2} y2={pad + inner} stroke="rgba(10,22,40,0.12)" strokeWidth="1" strokeDasharray="4,3" />
      <line x1={pad} y1={pad + inner / 2} x2={pad + inner} y2={pad + inner / 2} stroke="rgba(10,22,40,0.12)" strokeWidth="1" strokeDasharray="4,3" />

      {/* Axis labels */}
      <text x={pad} y={pad - 10} textAnchor="start" fontSize="9" fontWeight="700" fill={MUTED} fontFamily="Arial, sans-serif">SELVSTÆNDIG</text>
      <text x={pad + inner} y={pad - 10} textAnchor="end" fontSize="9" fontWeight="700" fill={MUTED} fontFamily="Arial, sans-serif">SAMARBEJDENDE</text>
      <text x={pad - 6} y={pad + 6} textAnchor="middle" fontSize="9" fontWeight="700" fill={MUTED} fontFamily="Arial, sans-serif" transform={`rotate(-90 ${pad - 14} ${pad + inner / 2})`}>STRUKTURERET</text>
      <text x={pad - 6} y={pad + inner} textAnchor="middle" fontSize="9" fontWeight="700" fill={MUTED} fontFamily="Arial, sans-serif" transform={`rotate(-90 ${pad - 14} ${pad + inner / 2})`}>FLEKSIBEL</text>

      {/* Quadrant labels */}
      {QUADRANTS.map((q) => (
        <text
          key={q.id}
          x={pad + q.x * inner}
          y={pad + q.y * inner}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9.5"
          fontWeight={q.id === userQuadrant ? 800 : 600}
          fill={q.id === userQuadrant ? TEAL : "rgba(10,22,40,0.30)"}
          fontFamily="Arial, sans-serif"
        >
          {q.label}
        </text>
      ))}

      {/* User dot */}
      <circle cx={ux} cy={uy} r={10} fill={TEAL} opacity={0.18} />
      <circle cx={ux} cy={uy} r={5} fill={TEAL} />
      <circle cx={ux} cy={uy} r={2} fill={WHITE} />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: WHITE,
  borderRadius: "24px",
  padding: "28px 24px",
  boxShadow: "0 4px 24px rgba(10,22,40,0.08)",
  border: `1px solid ${BORDER}`,
};

const sectionLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.20em",
  textTransform: "uppercase" as const,
  color: CURRY,
  marginBottom: "6px",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: "20px",
  fontWeight: 700,
  color: TEXT,
  lineHeight: 1.3,
  marginBottom: "20px",
};

const insightBox: React.CSSProperties = {
  background: PAGE_BG,
  borderRadius: "14px",
  padding: "16px 18px",
  marginTop: "24px",
  border: `1px solid ${BORDER}`,
};

export default function ResultsPage() {
  const biggestGapDim = RADAR_DIMS.reduce((max, d) => {
    const gap = RADAR_IDEAL[d.key] - RADAR_CURRENT[d.key];
    return gap > (RADAR_IDEAL[max.key] - RADAR_CURRENT[max.key]) ? d : max;
  }, RADAR_DIMS[0]);

  const topRoles = [...ROLE_FIT].sort((a, b) => b.score - a.score).slice(0, 2);

  const userQuadrant = QUADRANTS.find((q) =>
    COLLAB.collaborative >= 0.5 && COLLAB.structured < 0.5 ? q.id === "br" :
    COLLAB.collaborative >= 0.5 && COLLAB.structured >= 0.5 ? q.id === "tr" :
    COLLAB.collaborative < 0.5  && COLLAB.structured >= 0.5 ? q.id === "tl" :
    q.id === "bl"
  );

  return (
    <main style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "0 0 60px" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MED} 100%)`, padding: "48px 24px 36px", textAlign: "center" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: CURRY, marginBottom: "12px" }}>
          ByggeTalent · ALT
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 700, color: WHITE, margin: "0 0 10px", lineHeight: 1.2 }}>
          Dine arbejdslivsprofiler
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6, maxWidth: "340px", marginLeft: "auto", marginRight: "auto" }}>
          Tre perspektiver på, hvor du er nu — og hvad der kan styrke din hverdag
        </p>
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "28px 16px 0", display: "grid", gap: "20px" }}>

        {/* ── 1. Work Life Radar ── */}
        <div style={card}>
          <div style={sectionLabel}>Profil 1 af 3</div>
          <div style={sectionTitle}>Arbejdslivsradar</div>
          <WorkLifeRadar />

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "14px", height: "3px", background: TEAL, borderRadius: "2px" }} />
              <span style={{ fontSize: "11px", color: MUTED, fontWeight: 600 }}>Nu</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "14px", height: "2px", borderTop: `1.5px dashed ${CURRY}` }} />
              <span style={{ fontSize: "11px", color: MUTED, fontWeight: 600 }}>Ønsket niveau</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: WARM }} />
              <span style={{ fontSize: "11px", color: MUTED, fontWeight: 600 }}>Størst kløft</span>
            </div>
          </div>

          <div style={insightBox}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: WARM, marginBottom: "6px" }}>
              Hvad dette betyder for dig
            </div>
            <p style={{ fontSize: "13px", color: TEXT, lineHeight: 1.65, margin: 0 }}>
              Den største afstand mellem nu og ønsket niveau finder vi i <strong>{biggestGapDim.label}</strong>. Det er ikke en svaghed — det er et klart signal om, hvor en lille investering kan give mest tilbage i hverdagen. De dimensioner der vises i brunt er dem, det kan betale sig at tale om med din leder eller næste arbejdsgiver.
            </p>
          </div>
        </div>

        {/* ── 2. Role Fit ── */}
        <div style={card}>
          <div style={sectionLabel}>Profil 2 af 3</div>
          <div style={sectionTitle}>Teamrolleprofil</div>
          <RoleFitBars />

          <div style={insightBox}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: "6px" }}>
              Hvad dette betyder for dig
            </div>
            <p style={{ fontSize: "13px", color: TEXT, lineHeight: 1.65, margin: 0 }}>
              Du passer bedst som <strong>{topRoles[0].label}</strong> og <strong>{topRoles[1].label}</strong>. Det betyder at du leverer mest, når opgaverne matcher din naturlige stil — og at du har noget særligt at tilbyde teams, der mangler netop den kombination. Brug det aktivt i din næste samtale om ansvar og placering.
            </p>
          </div>
        </div>

        {/* ── 3. Collaboration Quadrant ── */}
        <div style={card}>
          <div style={sectionLabel}>Profil 3 af 3</div>
          <div style={sectionTitle}>Samarbejdsstil</div>
          <CollabQuadrant />

          <div style={insightBox}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: CURRY, marginBottom: "6px" }}>
              Hvad dette betyder for dig
            </div>
            {userQuadrant && (
              <p style={{ fontSize: "13px", color: TEXT, lineHeight: 1.65, margin: 0 }}>
                Du befinder dig i <strong>{userQuadrant.label}</strong>-kvadranten. {userQuadrant.desc} Det er værdifuldt at kende sin egen stil — både når du vælger arbejdsplads, og når du navigerer i en ny gruppe.
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ ...card, textAlign: "center", background: NAVY }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: WHITE, marginBottom: "8px" }}>
            Vil du arbejde videre med dine resultater?
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.60)", lineHeight: 1.65, marginBottom: "20px" }}>
            Få en uforpligtende samtale med ByggeTalent om, hvad profilerne peger på — og hvad der kan være dit næste skridt.
          </p>
          <button
            type="button"
            style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: CURRY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer", marginBottom: "12px" }}
          >
            Book en samtale
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = "/alt-test"; }}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}
          >
            ← Tag testen igen
          </button>
        </div>

      </div>
    </main>
  );
}
