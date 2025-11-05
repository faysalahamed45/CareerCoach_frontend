import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter.jsx";
import ReactMarkdown from "react-markdown";
import { getJSON, postJSON, delJSON } from "../../lib/api.js";

export default function CoverLetterPage() {
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [output, setOutput] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadList();
  }, []);

  async function loadList() {
    setLoadingList(true);
    setErr("");
    try {
      const docs = await getJSON("/documents?type=coverLetter");
      setList(docs);
      if (!selectedId && docs.length) view(docs[0]._id, { silent: true });
    } catch (e) {
      if (e.status !== 404) setErr(e.message || "Failed to load cover letters");
    } finally {
      setLoadingList(false);
    }
  }

  async function view(id, { silent = false } = {}) {
    setSelectedId(id);
    if (!silent) setPreviewLoading(true);
    setErr("");
    try {
      const doc = await getJSON(`/documents/${id}`);
      setOutput(doc.content || "");
    } catch (e) {
      setErr(e.message || "Failed to load document");
    } finally {
      if (!silent) setPreviewLoading(false);
    }
  }

  async function generate(e) {
    e.preventDefault();
    setGenerating(true);
    setErr("");
    setOutput("");
    try {
      const res = await postJSON("/ai/cover-letter", {
        company,
        jobTitle,
        jobDescription,
      });
      const now = new Date().toISOString();
      setList((prev) => [
        {
          _id: res.id,
          title: `${jobTitle} @ ${company}`,
          type: "coverLetter",
          createdAt: now,
        },
        ...prev,
      ]);
      setSelectedId(res.id);
      setOutput(res.content || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr(e.message || "Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this cover letter?")) return;
    try {
      await delJSON(`/documents/${id}`);
      setList((prev) => {
        const next = prev.filter((d) => d._id !== id);
        if (selectedId === id) {
          if (next.length) {
            const first = next[0];
            setSelectedId(first._id);
            (async () => {
              setPreviewLoading(true);
              try {
                const doc = await getJSON(`/documents/${first._id}`);
                setOutput(doc.content || "");
              } catch {
                setOutput("");
              } finally {
                setPreviewLoading(false);
              }
            })();
          } else {
            setSelectedId("");
            setOutput("");
          }
        }
        return next;
      });
    } catch (e) {
      setErr(e.message || "Failed to delete");
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(output || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {}
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Cover Letters
            </h1>
            {!loadingList && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {list.length} saved
              </div>
            )}
          </header>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-5">
              <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Preview
                  </h2>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={copyToClipboard}
                      disabled={!output}
                      className="flex-1 sm:flex-none rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-60 dark:hover:bg-gray-800 dark:border-gray-700"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 max-h-[60vh] overflow-auto rounded-lg border p-3 sm:p-4 text-sm leading-6 dark:border-gray-800">
                  {previewLoading ? (
                    <div className="animate-pulse text-gray-500">Loading…</div>
                  ) : output ? (
                    <article className="prose prose-sm max-w-none whitespace-pre-wrap break-words dark:prose-invert">
                      <ReactMarkdown>{output}</ReactMarkdown>
                    </article>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                      Generate or select a cover letter to preview.
                    </div>
                  )}
                </div>
              </div>

              <form
                onSubmit={generate}
                className="rounded-xl border bg-white shadow-sm p-4 sm:p-5 grid gap-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <h3 className="text-base sm:text-lg font-semibold">
                  Create New
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Company</label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="PixelForge"
                      required
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Job Title</label>
                    <input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Frontend Engineer (React, TypeScript)"
                      required
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Job Description</label>
                  <textarea
                    rows={7}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the JD here for better tailoring…"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60"
                  />
                </div>

                {err && (
                  <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                    {err}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-60"
                  >
                    {generating ? "Generating…" : "Generate with AI"}
                  </button>
                </div>
              </form>
            </section>

            <aside className="rounded-xl border bg-white shadow-sm p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-base sm:text-lg font-semibold">Saved</h3>
              <div className="mt-3 space-y-2">
                {loadingList ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : list.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No cover letters yet.
                  </div>
                ) : (
                  list.map((d) => {
                    const active = d._id === selectedId;
                    return (
                      <div
                        key={d._id}
                        className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm dark:border-gray-800 ${
                          active
                            ? "ring-1 ring-cyan-500/60 bg-cyan-50/50 dark:bg-cyan-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        }`}
                      >
                        <button
                          onClick={() => view(d._id)}
                          className="text-left flex-1 font-medium line-clamp-1"
                          title={d.title}
                        >
                          {d.title || "Cover Letter"}
                          <div className="text-[11px] opacity-70">
                            {new Date(d.createdAt).toLocaleString()}
                          </div>
                        </button>

                        <div className="flex gap-2 w-full xs:w-auto justify-end">
                          <button
                            onClick={() => view(d._id)}
                            className="flex-1 xs:flex-none rounded-lg border px-2.5 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() => remove(d._id)}
                            className="flex-1 xs:flex-none rounded-lg border px-2.5 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-gray-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
