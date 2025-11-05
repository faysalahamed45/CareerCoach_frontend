import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter.jsx";
import { getJSON, postJSON } from "../../lib/api.js";

export default function ATS() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [resumeTextInput, setResumeTextInput] = useState("");

  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const fetched = await getJSON("/ats");
        setLatest(fetched);
      } catch (e) {
        if (e.status !== 404)
          setErrorMessage(e.message || "Failed to load ATS report");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const saved = await postJSON("/ats/evaluate", {
        jobTitle,
        jobDescription: jobDescriptionInput,
        cvText: resumeTextInput,
      });
      setLatest(saved);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      if (e.status === 401) setErrorMessage("Please sign in again.");
      else setErrorMessage(e.message || "Failed to evaluate ATS");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-amber-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">ATS Checker</h1>

          {loading ? (
            <div className="py-12 text-center text-sm opacity-70">Loading…</div>
          ) : (
            <>
              {latest ? <ReportCard data={latest} /> : <EmptyNotice />}

              <div className="mt-8 rounded-3xl border bg-white/80 backdrop-blur p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
                <h2 className="text-lg font-semibold mb-3">
                  Compare Job Description & Your CV
                </h2>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm mb-1">
                      Job Title (optional)
                    </label>
                    <input
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Product Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      Job Description (paste)
                    </label>
                    <textarea
                      rows={10}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                      value={jobDescriptionInput}
                      onChange={(e) => setJobDescriptionInput(e.target.value)}
                      placeholder="Paste the job description here…"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      Your CV / Resume (paste text)
                    </label>
                    <textarea
                      rows={14}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                      value={resumeTextInput}
                      onChange={(e) => setResumeTextInput(e.target.value)}
                      placeholder="Paste your resume text here…"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Tip: convert your PDF to text and paste. Keep formatting
                      simple for ATS.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                      {errorMessage}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-60"
                    >
                      {submitting
                        ? "Analyzing…"
                        : latest
                          ? "Re-run ATS Check"
                          : "Run ATS Check"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

function ReportCard({ data }) {
  const report = data.result || {};
  return (
    <div className="mt-4 rounded-3xl border bg-white/80 backdrop-blur p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-gray-500">Overall ATS Score</div>
          <div className="text-3xl font-extrabold tracking-tight">
            {Math.round(report.score ?? 0)}/100
          </div>
          {report.summary && (
            <div className="mt-1 text-sm opacity-80">{report.summary}</div>
          )}
        </div>
        <div className="w-full sm:w-80">
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-3 bg-emerald-500"
              style={{
                width: `${Math.min(100, Math.max(0, report.score || 0))}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChipBlock
          title="Keywords Present"
          items={report.keywordMatch?.present}
          kind="present"
        />
        <ChipBlock
          title="Missing Keywords"
          items={report.keywordMatch?.missing}
          kind="missing"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ListBlock title="Gaps vs Job Description" items={report.gaps} />
        <ListBlock title="Resume Improvements" items={report.improvements} />
      </div>

      <div className="mt-6">
        <ListBlock title="ATS Formatting Tips" items={report.formatting} />
      </div>

      {Array.isArray(report.learning) && report.learning.length > 0 && (
        <div className="mt-6 rounded-2xl border p-4 dark:border-gray-800">
          <h3 className="font-semibold mb-2">Where to Learn</h3>
          <div className="grid gap-3">
            {report.learning.map((learningItem, learningIndex) => (
              <div key={learningIndex}>
                <div className="font-medium">{learningItem.skill}</div>
                <ul className="mt-1 text-sm list-disc pl-5">
                  {(learningItem.resources || []).map(
                    (resourceItem, resourceIndex) => (
                      <li key={resourceIndex}>
                        <a
                          className="underline"
                          target="_blank"
                          rel="noreferrer"
                          href={resourceItem.url}
                        >
                          {resourceItem.title}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Updated {new Date(data.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}

function ChipBlock({ title, items, kind }) {
  const chipClass =
    kind === "missing"
      ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      : "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20";
  return (
    <div className="rounded-2xl border p-4 dark:border-gray-800">
      <h3 className="font-semibold mb-2">{title}</h3>
      {!items?.length ? (
        <div className="text-sm opacity-70">—</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((keywordItem) => (
            <span
              key={keywordItem}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${chipClass}`}
            >
              {keywordItem}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ListBlock({ title, items }) {
  if (!items?.length)
    return (
      <div className="rounded-2xl border p-4 dark:border-gray-800">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="text-sm opacity-70">—</div>
      </div>
    );
  return (
    <div className="rounded-2xl border p-4 dark:border-gray-800">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {items.map((listItemText) => (
          <li key={listItemText}>{listItemText}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyNotice() {
  return (
    <div className="mt-4 rounded-2xl border p-4 text-sm opacity-80 dark:border-gray-800">
      No ATS report yet — paste a job description and your CV below to generate
      one.
    </div>
  );
}
