import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";
import { getJSON, postJSON, putJSON } from "../../lib/api.js";
import { marked } from "marked";
import DOMPurify from "dompurify";

async function getHtml2Pdf() {
  if (typeof window !== "undefined" && window.html2pdf) return window.html2pdf;
  const mod = await import("html2pdf.js");
  return mod.default || mod;
}

const Label = ({ children }) => (
  <label className="block text-xs mb-1 text-white/80">{children}</label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-white/15 bg-[#0e1628] px-3 py-2 text-sm text-white
                placeholder:text-white/50 outline-none focus:border-cyan-500 ${props.className || ""}`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border border-white/15 bg-[#0e1628] px-3 py-2 text-sm text-white
                placeholder:text-white/50 outline-none focus:border-cyan-500 ${props.className || ""}`}
  />
);

function Button({ children, className = "", ...rest }) {
  return (
    <button
      className={`rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10
                  disabled:opacity-60 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function LoadingButton({ loading, children, className = "", ...rest }) {
  return (
    <button
      disabled={loading}
      className={`rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10
                  disabled:opacity-60 inline-flex items-center gap-2 ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
      )}
      {children}
    </button>
  );
}

function Primary({ loading, children, className = "", ...rest }) {
  return (
    <button
      disabled={loading}
      className={`rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white
                  shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 inline-flex items-center gap-2 ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
      )}
      {children}
    </button>
  );
}

function MonthInput({ label, value, onChange, disabled }) {
  return (
    <div className="relative">
      <Label>{label}</Label>
      <input
        type="month"
        value={value}
        disabled={disabled}
        onChange={onChange}
        className="w-full appearance-none rounded-xl border border-white/15 bg-[#0e1628] px-3 py-2 pr-10 text-sm text-white
                   outline-none focus:border-cyan-500"
      />
      <svg
        className="pointer-events-none absolute right-3 top-9 h-4 w-4"
        viewBox="0 0 24 24"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="white" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>
  );
}

export default function ResumePage() {
  const [me, setMe] = useState({ name: "", email: "", phone: "", links: "" });
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const emptyExp = {
    title: "",
    company: "",
    start: "",
    end: "",
    current: false,
    description: "",
  };
  const [expDraft, setExpDraft] = useState({ ...emptyExp });
  const [experiences, setExperiences] = useState([]);

  const emptyEdu = {
    institution: "",
    degree: "",
    start: "",
    end: "",
    current: false,
    description: "",
  };
  const [eduDraft, setEduDraft] = useState({ ...emptyEdu });
  const [educations, setEducations] = useState([]);

  const [jobDescription, setJobDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [improvingExp, setImprovingExp] = useState(false);
  const [improvingEdu, setImprovingEdu] = useState(false);
  const [improvingSum, setImprovingSum] = useState(false);

  const [toast, setToast] = useState({ kind: "", text: "" });

  const [markdownOpen, setMarkdownOpen] = useState(false);
  const [markdownText, setMarkdownText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { user } = await getJSON("/auth/me");
        if (user)
          setMe((profile) => ({
            ...profile,
            name: user.name || profile.name,
            email: user.email || profile.email,
          }));
      } catch {}
      try {
        const last = await getJSON("/resume");
        if (last?.sections) {
          setSummary(last.sections.bio || "");
        }
        if (last?.meta) {
          setMe((profile) => ({
            ...profile,
            phone: last.meta.phone || profile.phone,
            links: last.meta.links || profile.links,
          }));
          if (Array.isArray(last.meta.skills)) setSkills(last.meta.skills);
          if (Array.isArray(last.meta.experiences))
            setExperiences(last.meta.experiences);
          if (Array.isArray(last.meta.educations))
            setEducations(last.meta.educations);
        }
      } catch {}
    })();
  }, []);

  const addSkill = () => {
    const skillText = skillInput.trim();
    if (!skillText) return;
    if (!skills.includes(skillText)) setSkills((list) => [...list, skillText]);
    setSkillInput("");
  };
  const removeSkill = (skillToRemove) =>
    setSkills((list) => list.filter((skill) => skill !== skillToRemove));

  const addExperience = () => {
    if (!expDraft.title || !expDraft.company) return;
    setExperiences((existing) => [...existing, { ...expDraft }]);
    setExpDraft({ ...emptyExp });
  };
  const delExperience = (index) =>
    setExperiences((existing) => existing.filter((_, idx) => idx !== index));

  const improveExperience = async () => {
    setImprovingExp(true);
    try {
      const seed =
        `Role: ${expDraft.title}\nCompany: ${expDraft.company}\nPeriod: ${expDraft.start} - ${expDraft.current ? "Present" : expDraft.end}\n` +
        (jobDescription ? `Target JD:\n${jobDescription}\n` : "") +
        (expDraft.description ? `User Text:\n${expDraft.description}` : "");
      const out = await postJSON("/ai/improve", {
        text: seed,
        section: "experience",
        tone: "professional",
      });
      setExpDraft((priorDraft) => ({
        ...priorDraft,
        description: out.text || priorDraft.description,
      }));
    } catch {
      setToast({ kind: "err", text: "AI improve failed (experience)." });
    } finally {
      setImprovingExp(false);
    }
  };

  const addEducation = () => {
    if (!eduDraft.institution || !eduDraft.degree) return;
    setEducations((existing) => [...existing, { ...eduDraft }]);
    setEduDraft({ ...emptyEdu });
  };
  const delEducation = (index) =>
    setEducations((existing) => existing.filter((_, idx) => idx !== index));

  const improveEducation = async () => {
    setImprovingEdu(true);
    try {
      const seed =
        `Institution: ${eduDraft.institution}\nDegree: ${eduDraft.degree}\nPeriod: ${eduDraft.start} - ${eduDraft.current ? "Present" : eduDraft.end}\n` +
        (eduDraft.description ? `User Text:\n${eduDraft.description}` : "");
      const out = await postJSON("/ai/improve", {
        text: seed,
        section: "education",
        tone: "professional",
      });
      setEduDraft((priorDraft) => ({
        ...priorDraft,
        description: out.text || priorDraft.description,
      }));
    } catch {
      setToast({ kind: "err", text: "AI improve failed (education)." });
    } finally {
      setImprovingEdu(false);
    }
  };

  const improveSummary = async () => {
    if (!summary.trim()) return;
    setImprovingSum(true);
    try {
      const out = await postJSON("/ai/improve", {
        text: summary,
        section: "bio",
        tone: "professional",
      });
      setSummary(out.text || summary);
    } catch {
      setToast({ kind: "err", text: "AI improve failed (summary)." });
    } finally {
      setImprovingSum(false);
    }
  };

  function buildMarkdown() {
    let markdownString = "";
    if (me.name) markdownString += `# ${me.name}\n`;
    const contactLine = [me.email, me.phone, me.links]
      .filter(Boolean)
      .join(" · ");
    if (contactLine) markdownString += `${contactLine}\n\n`;

    if (summary.trim())
      markdownString += `## Professional Summary\n${summary.trim()}\n\n`;

    if (skills.length)
      markdownString += `## Skills\n- ${skills.join(", ")}\n\n`;

    if (experiences.length) {
      markdownString += `## Work Experience\n`;
      experiences.forEach((experience) => {
        markdownString += `**${experience.title} · ${experience.company}** — ${experience.start || "—"} – ${experience.current ? "Present" : experience.end || "—"}\n`;
        if (experience.description?.trim())
          markdownString += `${experience.description.trim()}\n\n`;
      });
    }

    if (educations.length) {
      markdownString += `## Education\n`;
      educations.forEach((education) => {
        markdownString += `**${education.degree} — ${education.institution}** (${education.start || "—"} – ${education.current ? "Present" : education.end || "—"})\n`;
        if (education.description?.trim())
          markdownString += `${education.description.trim()}\n\n`;
      });
    }

    return markdownString.trim();
  }

  const saveAllToProfile = async () => {
    setSaving(true);
    try {
      await putJSON("/resume", {
        title: `${me.name || "My"} Resume`,
        markdown: buildMarkdown(),
        meta: {
          phone: me.phone,
          links: me.links,
          skills,
          experiences,
          educations,
        },
        sections: { bio: summary },
      });
      setToast({ kind: "ok", text: "Saved to your profile." });
    } catch (e) {
      setToast({ kind: "err", text: e.message || "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  const openMarkdown = () => {
    setMarkdownText(buildMarkdown());
    setMarkdownOpen(true);
  };

  return (
    <div className="bg-[#0B1220] text-white min-h-screen">
      <Navbar />

      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1220]/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-extrabold">Resume Builder</h1>
          <div className="flex gap-2">
            <Button onClick={openMarkdown}>Markdown View / Edit</Button>
            <LoadingButton loading={saving} onClick={saveAllToProfile}>
              Save to Profile
            </LoadingButton>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {toast.text && (
          <div
            className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
              toast.kind === "ok"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            {toast.text}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={me.name}
                onChange={(e) => setMe({ ...me, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={me.email}
                onChange={(e) => setMe({ ...me, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={me.phone}
                onChange={(e) => setMe({ ...me, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Links</Label>
              <Input
                placeholder="LinkedIn | GitHub"
                value={me.links}
                onChange={(e) => setMe({ ...me, links: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Professional Summary</div>
            <Primary loading={improvingSum} onClick={improveSummary}>
              AI Improve
            </Primary>
          </div>
          <Textarea
            rows={5}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">Skills</div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill())
              }
              className="flex-1"
            />
            <Button onClick={addSkill}>Add</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">Work Experience</div>

          <div className="rounded-xl border border-white/10 p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Title / Position</Label>
                <Input
                  value={expDraft.title}
                  onChange={(e) =>
                    setExpDraft({ ...expDraft, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Organization / Company</Label>
                <Input
                  value={expDraft.company}
                  onChange={(e) =>
                    setExpDraft({ ...expDraft, company: e.target.value })
                  }
                />
              </div>
              <MonthInput
                label="Start (Month)"
                value={expDraft.start}
                onChange={(e) =>
                  setExpDraft({ ...expDraft, start: e.target.value })
                }
              />
              <MonthInput
                label="End (Month)"
                value={expDraft.end}
                disabled={expDraft.current}
                onChange={(e) =>
                  setExpDraft({ ...expDraft, end: e.target.value })
                }
              />
            </div>
            <label className="mt-2 inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={expDraft.current}
                onChange={(e) =>
                  setExpDraft({ ...expDraft, current: e.target.checked })
                }
              />
              Current Experience
            </label>

            <div className="mt-2 flex items-center justify-between">
              <Label>Description (impact, metrics, results)</Label>
              <Primary loading={improvingExp} onClick={improveExperience}>
                AI Improve
              </Primary>
            </div>
            <Textarea
              rows={6}
              value={expDraft.description}
              onChange={(e) =>
                setExpDraft({ ...expDraft, description: e.target.value })
              }
            />

            <div className="mt-3 flex justify-end">
              <Primary onClick={addExperience}>Add Entry</Primary>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {experiences.map((experience, index) => (
              <li
                key={index}
                className="rounded-xl border border-white/10 p-3 text-sm"
              >
                <div className="flex justify-between">
                  <div className="font-semibold">
                    {experience.title} · {experience.company}
                  </div>
                  <button
                    onClick={() => delExperience(index)}
                    className="opacity-70 hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs text-white/70">
                  {experience.start || "—"} –{" "}
                  {experience.current ? "Present" : experience.end || "—"}
                </div>
                {experience.description && (
                  <p className="mt-1 whitespace-pre-wrap">
                    {experience.description}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Label>Target Job Description (optional, used by AI)</Label>
            <Textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">Education</div>

          <div className="rounded-xl border border-white/10 p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Institution</Label>
                <Input
                  value={eduDraft.institution}
                  onChange={(e) =>
                    setEduDraft({ ...eduDraft, institution: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Degree / Program</Label>
                <Input
                  value={eduDraft.degree}
                  onChange={(e) =>
                    setEduDraft({ ...eduDraft, degree: e.target.value })
                  }
                />
              </div>
              <MonthInput
                label="Start (Month)"
                value={eduDraft.start}
                onChange={(e) =>
                  setEduDraft({ ...eduDraft, start: e.target.value })
                }
              />
              <MonthInput
                label="End (Month)"
                value={eduDraft.end}
                disabled={eduDraft.current}
                onChange={(e) =>
                  setEduDraft({ ...eduDraft, end: e.target.value })
                }
              />
            </div>
            <label className="mt-2 inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={eduDraft.current}
                onChange={(e) =>
                  setEduDraft({ ...eduDraft, current: e.target.checked })
                }
              />
              Current Education
            </label>

            <div className="mt-2 flex items-center justify-between">
              <Label>
                Description (achievements, GPA if strong, highlights)
              </Label>
              <Primary loading={improvingEdu} onClick={improveEducation}>
                AI Improve
              </Primary>
            </div>
            <Textarea
              rows={5}
              value={eduDraft.description}
              onChange={(e) =>
                setEduDraft({ ...eduDraft, description: e.target.value })
              }
            />

            <div className="mt-3 flex justify-end">
              <Primary onClick={addEducation}>Add Entry</Primary>
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {educations.map((education, index) => (
              <li
                key={index}
                className="rounded-xl border border-white/10 p-3 text-sm"
              >
                <div className="flex justify-between">
                  <div className="font-semibold">
                    {education.degree} — {education.institution}
                  </div>
                  <button
                    onClick={() => delEducation(index)}
                    className="opacity-70 hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs text-white/70">
                  {education.start || "—"} –{" "}
                  {education.current ? "Present" : education.end || "—"}
                </div>
                {education.description && (
                  <p className="mt-1 whitespace-pre-wrap">
                    {education.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">Resume Preview</div>
          <div className="p-6 rounded-xl bg-white text-gray-900 prose prose-sm max-w-none">
            {me.name && <h1 className="!mt-0 text-2xl font-bold">{me.name}</h1>}
            <div className="text-xs">
              {[me.email, me.phone, me.links].filter(Boolean).join(" · ")}
            </div>

            {summary.trim() && (
              <>
                <h2>Professional Summary</h2>
                <p>{summary}</p>
              </>
            )}

            {skills.length > 0 && (
              <>
                <h2>Skills</h2>
                <ul>
                  {skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </>
            )}

            {experiences.length > 0 && (
              <>
                <h2>Work Experience</h2>
                {experiences.map((experience, index) => (
                  <section key={index}>
                    <p>
                      <strong>{experience.title}</strong> · {experience.company}
                      <br />
                      <span className="text-xs">
                        {experience.start || "—"} –{" "}
                        {experience.current ? "Present" : experience.end || "—"}
                      </span>
                    </p>
                    {experience.description && (
                      <ul>
                        {experience.description
                          .split(/\n+/)
                          .filter(Boolean)
                          .map((line, lineIndex) => (
                            <li key={lineIndex}>{line}</li>
                          ))}
                      </ul>
                    )}
                  </section>
                ))}
              </>
            )}

            {educations.length > 0 && (
              <>
                <h2>Education</h2>
                {educations.map((education, index) => (
                  <section key={index}>
                    <p>
                      <strong>{education.degree}</strong> —{" "}
                      {education.institution}
                      <br />
                      <span className="text-xs">
                        {education.start || "—"} –{" "}
                        {education.current ? "Present" : education.end || "—"}
                      </span>
                    </p>
                    {education.description && (
                      <ul>
                        {education.description
                          .split(/\n+/)
                          .filter(Boolean)
                          .map((line, lineIndex) => (
                            <li key={lineIndex}>{line}</li>
                          ))}
                      </ul>
                    )}
                  </section>
                ))}
              </>
            )}
          </div>
        </section>
      </main>

      {markdownOpen && (
        <MarkdownModal
          value={markdownText}
          onChange={setMarkdownText}
          onClose={() => setMarkdownOpen(false)}
          onExport={async () => {
            const container = document.createElement("div");
            container.style.background = "#fff";
            container.style.padding = "24px";
            container.style.color = "#111827";
            container.className = "prose prose-sm";
            container.innerHTML = DOMPurify.sanitize(
              marked.parse(markdownText || ""),
            );
            document.body.appendChild(container);
            try {
              const html2pdf = await getHtml2Pdf();
              await html2pdf()
                .from(container)
                .set({
                  margin: [10, 10, 10, 10],
                  filename: `${(me.name || "resume_markdown").replace(/\s+/g, "_")}.pdf`,
                  image: { type: "jpeg", quality: 0.98 },
                  html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                  },
                  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                  pagebreak: { mode: ["css", "legacy"] },
                })
                .save();
            } finally {
              document.body.removeChild(container);
            }
          }}
        />
      )}

      <SiteFooter />
    </div>
  );
}

function MarkdownModal({ value, onChange, onClose, onExport }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="font-semibold">Markdown View / Edit</div>
          <button onClick={onClose} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={20}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none
                       focus:border-cyan-500 dark:border-gray-700 dark:bg-white dark:text-gray-900"
          />
        </div>
        <div className="px-4 py-3 border-t border-black/10 flex gap-2 justify-end">
          <Button onClick={onExport}>Export PDF</Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
