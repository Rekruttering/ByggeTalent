"use client";

import { useState, useEffect } from "react";

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

interface AppForm {
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string;
  motivation: string;
}

type Screen = "list" | "detail" | "success";

export default function Jobs() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selected, setSelected] = useState<JobPosting | null>(null);
  const [screen, setScreen] = useState<Screen>("list");
  const [showForm, setShowForm] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<AppForm>({ name: "", email: "", phone: "", experience: "", skills: "", motivation: "" });

  useEffect(() => {
    const all: JobPosting[] = JSON.parse(localStorage.getItem("bt_jobs") || "[]");
    setJobs(all.filter((j) => j.active));
  }, []);

  function update(key: keyof AppForm, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function submit() {
    if (!form.name || !form.email || !selected) return;
    setSending(true);
    setTimeout(() => {
      const application = {
        id: Date.now().toString(),
        name: form.name.split(" ")[0] || form.name,
        lastName: form.name.split(" ").slice(1).join(" ") || "",
        email: form.email,
        phone: form.phone,
        address: "",
        currentTitle: "",
        experience: form.experience ? `${form.experience} år` : "",
        linkedin: "",
        salary: "",
        distance: "",
        supplementaryInfo: `${form.motivation}${form.skills ? `\n\nKompetencer: ${form.skills}` : ""}`,
        profiles: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        profileOtherTitle: "",
        submittedAt: new Date().toISOString(),
        status: "ny",
        notes: "",
        jobId: selected.id,
        jobTitle: selected.title,
      };
      const existing = JSON.parse(localStorage.getItem("bt_applications") || "[]");
      localStorage.setItem("bt_applications", JSON.stringify([...existing, application]));
      setSending(false);
      setScreen("success");
    }, 800);
  }

  const canSubmit = form.name.trim().length > 1 && form.email.includes("@");

  // ─── SUCCES ───────────────────────────────────────────────────────────────────
  if (screen === "success") {
    return (
      <main style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: "480px", width: "100%", background: WHITE, borderRadius: "24px", padding: "48px 36px", textAlign: "center", boxShadow: "0 8px 32px rgba(10,22,40,0.10)", border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: "56px", marginBottom: "20px" }}>✅</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "26px", fontWeight: 700, color: TEXT, marginBottom: "12px" }}>Ansøgning modtaget!</div>
          <p style={{ fontSize: "15px", color: MUTED, lineHeight: 1.7, marginBottom: "32px" }}>
            Tak for din ansøgning til <strong>{selected?.title}</strong>. Vi vender tilbage til dig hurtigst muligt.
          </p>
          <button onClick={() => { setScreen("list"); setSelected(null); setShowForm(false); setForm({ name: "", email: "", phone: "", experience: "", skills: "", motivation: "" }); setCvFile(null); }}
            style={{ padding: "14px 28px", borderRadius: "12px", border: "none", background: NAVY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
            ← Se alle stillinger
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: NAVY, padding: "0 32px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 700, textDecoration: "none" }}>
            <span style={{ color: WHITE }}>Bygge</span><span style={{ color: GRANITE }}>Talent</span>
          </a>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase" }}>Ledige stillinger</div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px 80px" }}>

        {/* ─── LISTE ─── */}
        {screen === "list" && (
          <>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif", marginBottom: "8px" }}>Ledige stillinger</div>
              <div style={{ fontSize: "15px", color: MUTED }}>Vi rekrutterer til bygge- og anlægsbranchen i hele Danmark</div>
            </div>

            {jobs.length === 0 ? (
              <div style={{ background: WHITE, borderRadius: "20px", padding: "60px 24px", textAlign: "center", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>🏗</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT, marginBottom: "8px" }}>Ingen ledige stillinger pt.</div>
                <div style={{ fontSize: "14px", color: MUTED }}>Vi opdaterer løbende — tjek igen snart.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {jobs.map((job) => (
                  <div key={job.id} style={{ background: WHITE, borderRadius: "16px", padding: "28px 32px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(10,22,40,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "6px", background: CURRY_BG, color: CURRY, fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          Bygge & Anlæg
                        </span>
                      </div>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT, marginBottom: "10px", fontFamily: "Georgia, serif" }}>{job.title}</div>
                      <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: MUTED }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {job.type}
                        </span>
                        {job.location && (
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            {job.location}{job.region && job.region !== "Hele Danmark" ? `, ${job.region}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => { setSelected(job); setScreen("detail"); setShowForm(false); }}
                      style={{ padding: "13px 28px", borderRadius: "12px", border: "none", background: NAVY, color: WHITE, fontSize: "14px", fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
                      Søg stillingen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── DETALJE + ANSØGNINGSFORMULAR ─── */}
        {screen === "detail" && selected && (
          <>
            <button onClick={() => { setScreen("list"); setShowForm(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: CURRY, fontSize: "14px", fontWeight: 700, padding: 0, marginBottom: "24px", display: "flex", alignItems: "center", gap: "6px" }}>
              ← Tilbage til stillinger
            </button>

            {/* Job header */}
            <div style={{ background: WHITE, borderRadius: "20px", padding: "36px 40px", border: `1px solid ${BORDER}`, marginBottom: "16px", boxShadow: "0 2px 12px rgba(10,22,40,0.06)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ padding: "4px 12px", borderRadius: "6px", background: CURRY_BG, color: CURRY, fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-block", marginBottom: "14px" }}>
                    Bygge & Anlæg
                  </span>
                  <div style={{ fontSize: "30px", fontWeight: 700, color: TEXT, fontFamily: "Georgia, serif", marginBottom: "12px" }}>{selected.title}</div>
                  <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: MUTED }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {selected.type}
                    </span>
                    {selected.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        {selected.location}{selected.region && selected.region !== "Hele Danmark" ? `, ${selected.region}` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowForm(true)}
                  style={{ padding: "14px 32px", borderRadius: "14px", border: "none", background: NAVY, color: WHITE, fontSize: "15px", fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
                  Ansøg stillingen
                </button>
              </div>

              {selected.description && (
                <>
                  <div style={{ height: "1px", background: BORDER, margin: "28px 0" }} />
                  <div style={{ fontSize: "15px", color: TEXT, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{selected.description}</div>
                </>
              )}
            </div>

            {/* Ansøgningsformular */}
            {showForm && (
              <div style={{ background: WHITE, borderRadius: "20px", padding: "36px 40px", border: `1.5px solid ${CURRY_BORDER}`, boxShadow: "0 4px 20px rgba(196,160,58,0.10)" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>Din ansøgning</div>
                <div style={{ fontSize: "14px", color: MUTED, marginBottom: "28px" }}>Udfyld formularen og send din ansøgning til ByggeTalent</div>

                <div style={{ display: "grid", gap: "20px" }}>
                  {/* Navn + email */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelSt}>Fulde navn *</label>
                      <input placeholder="Eks. Mads Nielsen" value={form.name} onChange={(e) => update("name", e.target.value)} style={inp} />
                    </div>
                    <div>
                      <label style={labelSt}>E-mail adresse *</label>
                      <input placeholder="mads@mail.dk" value={form.email} onChange={(e) => update("email", e.target.value)} style={inp} />
                    </div>
                  </div>

                  {/* Telefon + erfaring */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelSt}>Telefon</label>
                      <input placeholder="+45 12 34 56 78" value={form.phone} onChange={(e) => update("phone", e.target.value)} style={inp} />
                    </div>
                    <div>
                      <label style={labelSt}>Erfaring (antal år)</label>
                      <input placeholder="Eks. 5" type="number" min="0" value={form.experience} onChange={(e) => update("experience", e.target.value)} style={inp} />
                    </div>
                  </div>

                  {/* Kompetencer */}
                  <div>
                    <label style={labelSt}>Kompetencer</label>
                    <input placeholder="Eks. Projektledelse, AutoCAD, Revit..." value={form.skills} onChange={(e) => update("skills", e.target.value)} style={inp} />
                  </div>

                  {/* Motivation */}
                  <div>
                    <label style={labelSt}>Kort om dig selv</label>
                    <textarea placeholder="Fortæl kort om din baggrund og hvorfor du er interesseret i stillingen..." value={form.motivation} onChange={(e) => update("motivation", e.target.value)}
                      style={{ ...inp, minHeight: "120px", resize: "vertical" }} />
                  </div>

                  {/* CV upload */}
                  <div>
                    <label style={labelSt}>Upload CV (PDF)</label>
                    <label style={{ display: "block", padding: "16px", borderRadius: "12px", border: `2px dashed ${cvFile ? CURRY : BORDER}`, background: cvFile ? CURRY_BG : PAGE_BG, cursor: "pointer", textAlign: "center" }}>
                      <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                      {cvFile ? (
                        <span style={{ fontSize: "14px", fontWeight: 700, color: CURRY }}>✓ {cvFile.name}</span>
                      ) : (
                        <span style={{ fontSize: "14px", color: MUTED }}>Klik for at vælge fil — PDF, Word</span>
                      )}
                    </label>
                  </div>

                  {/* Send */}
                  <button onClick={submit} disabled={!canSubmit || sending}
                    style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: canSubmit ? NAVY : "#D4CCBC", color: WHITE, fontSize: "16px", fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    {sending ? "Sender..." : "Send ansøgning →"}
                  </button>

                  <div style={{ fontSize: "12px", color: MUTED, textAlign: "center" }}>
                    Din ansøgning behandles fortroligt af ByggeTalent i henhold til vores privatlivspolitik.
                  </div>
                </div>
              </div>
            )}

            {!showForm && (
              <div style={{ textAlign: "center", padding: "12px" }}>
                <button onClick={() => setShowForm(true)}
                  style={{ padding: "16px 40px", borderRadius: "14px", border: "none", background: CURRY, color: WHITE, fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
                  Ansøg stillingen →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const labelSt: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: MUTED, marginBottom: "8px",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: "12px",
  border: "1.5px solid rgba(10,22,40,0.12)", background: "#F8F9FA",
  color: "#0A1628", fontSize: "15px", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
