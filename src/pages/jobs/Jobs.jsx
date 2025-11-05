import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";
import { getJSON, postJSON } from "../../lib/api.js";
import { jobQuestions } from "../../data/jobQuestions.js";
import Dropdown from "../../components/Dropdown.jsx";

export default function Jobs() {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState(() => {
    const initialFormState = {};
    for (const questionDef of jobQuestions) {
      if (questionDef.type === "multi") initialFormState[questionDef.key] = [];
      else if (questionDef.type === "scale")
        initialFormState[questionDef.key] = questionDef.defaultValue ?? 3;
      else if (questionDef.type === "domain")
        initialFormState[questionDef.key] = { domains: [], custom: [] }; // NEW
      else initialFormState[questionDef.key] = "";
    }
    return initialFormState;
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const fetched = await getJSON("/job-matching");
        setLatest(fetched);
      } catch (e) {
        if (e.status !== 404)
          setErrorMessage(e.message || "Failed to load job match");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChangeSingle = (key, value) =>
    setForm((state) => ({ ...state, [key]: value }));
  const onToggleMulti = (key, optionValue) =>
    setForm((state) => {
      const current = new Set(state[key]);
      current.has(optionValue)
        ? current.delete(optionValue)
        : current.add(optionValue);
      return { ...state, [key]: [...current] };
    });
  const onChangeScale = (key, value) =>
    setForm((state) => ({ ...state, [key]: Number(value) }));
  const onChangeText = (key, value) =>
    setForm((state) => ({ ...state, [key]: value }));

  const toggleDomain = (domainId) => {
    setForm((state) => {
      const current = new Set(state.domainInterests.domains);
      current.has(domainId) ? current.delete(domainId) : current.add(domainId);
      return {
        ...state,
        domainInterests: { ...state.domainInterests, domains: [...current] },
      };
    });
  };

  const addCustomTag = (tagText) => {
    const trimmed = tagText.trim();
    if (!trimmed) return;
    setForm((state) => {
      const lowerSet = new Set(
        state.domainInterests.custom.map((v) => v.toLowerCase()),
      );
      if (lowerSet.has(trimmed.toLowerCase())) return state;
      return {
        ...state,
        domainInterests: {
          ...state.domainInterests,
          custom: [...state.domainInterests.custom, trimmed],
        },
      };
    });
  };

  const removeCustomTag = (tagText) => {
    setForm((state) => ({
      ...state,
      domainInterests: {
        ...state.domainInterests,
        custom: state.domainInterests.custom.filter((v) => v !== tagText),
      },
    }));
  };

  const answersPayload = useMemo(() => {
    return jobQuestions.map((questionDef) => {
      if (questionDef.type === "domain") {
        return {
          key: questionDef.key,
          question: questionDef.question,
          value: {
            selectedDomains: form.domainInterests.domains,
            customTags: form.domainInterests.custom,
          },
          meta: {
            domains:
              questionDef.domains?.map((domainItem) => ({
                id: domainItem.id,
                label: domainItem.label,
              })) || [],
          },
        };
      }
      return {
        key: questionDef.key,
        question: questionDef.question,
        value: form[questionDef.key],
      };
    });
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const saved = await postJSON("/job-matching/evaluate", {
        answers: answersPayload,
      });
      setLatest(saved);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      if (e.status === 401) setErrorMessage("Please sign in again.");
      else setErrorMessage(e.message || "Failed to evaluate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Job Matching</h1>

          {loading ? (
            <div className="py-12 text-center text-sm opacity-70">Loading…</div>
          ) : (
            <>
              {latest ? <ResultCard latest={latest} /> : <EmptyNotice />}

              <div className="mt-8 rounded-3xl border bg-white/80 backdrop-blur p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
                <h2 className="text-lg font-semibold">Job Matching Quiz</h2>
                <form className="mt-4 grid gap-5" onSubmit={handleSubmit}>
                  {jobQuestions.map((questionDef) => (
                    <div key={questionDef.key}>
                      <label className="block text-sm font-medium mb-2">
                        {questionDef.question}
                      </label>

                      {questionDef.type === "single" && (
                        <Dropdown
                          placeholder="Select an option…"
                          value={form[questionDef.key]}
                          onChange={(value) =>
                            onChangeSingle(questionDef.key, value)
                          }
                          options={questionDef.options.map((optionLabel) => ({
                            label: optionLabel,
                            value: optionLabel,
                          }))}
                          required
                        />
                      )}

                      {questionDef.type === "multi" && (
                        <div className="grid sm:grid-cols-2 gap-2">
                          {questionDef.options.map((optionLabel) => {
                            const isChecked =
                              form[questionDef.key].includes(optionLabel);
                            return (
                              <label
                                key={optionLabel}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer
                                    ${isChecked ? "bg-cyan-50 border-cyan-300 dark:bg-cyan-900/20 dark:border-cyan-700" : "border-gray-300 dark:border-gray-700"}`}
                              >
                                <input
                                  type="checkbox"
                                  className="accent-cyan-600"
                                  checked={isChecked}
                                  onChange={() =>
                                    onToggleMulti(questionDef.key, optionLabel)
                                  }
                                />
                                {optionLabel}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {questionDef.type === "scale" && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>
                              {questionDef.minLabel || questionDef.min}
                            </span>
                            <span>
                              {questionDef.maxLabel || questionDef.max}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={questionDef.min}
                            max={questionDef.max}
                            value={form[questionDef.key]}
                            onChange={(e) =>
                              onChangeScale(questionDef.key, e.target.value)
                            }
                            className="w-full"
                          />
                          <div className="text-xs mt-1">
                            Selected: {form[questionDef.key]}
                          </div>
                        </div>
                      )}

                      {questionDef.type === "domain" && (
                        <div className="space-y-3">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {questionDef.domains.map((domainItem) => {
                              const isChecked =
                                form.domainInterests.domains.includes(
                                  domainItem.id,
                                );
                              return (
                                <label
                                  key={domainItem.id}
                                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer
                                  ${isChecked ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700" : "border-gray-300 dark:border-gray-700"}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="accent-indigo-600"
                                    checked={isChecked}
                                    onChange={() => toggleDomain(domainItem.id)}
                                  />
                                  <span className="font-medium">
                                    {domainItem.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          <details className="rounded-xl border px-3 py-2 text-sm dark:border-gray-700">
                            <summary className="cursor-pointer select-none">
                              Show example sub-areas
                            </summary>
                            <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {questionDef.domains
                                .flatMap((domainItem) =>
                                  domainItem.areas.map(
                                    (areaLabel) =>
                                      `${domainItem.label}: ${areaLabel}`,
                                  ),
                                )
                                .map((lineText, lineIndex) => (
                                  <div
                                    key={lineIndex}
                                    className="rounded-lg border px-3 py-1 dark:border-gray-700"
                                  >
                                    {lineText}
                                  </div>
                                ))}
                            </div>
                          </details>

                          <TagInput
                            label="Add your own interests (press Enter)"
                            tags={form.domainInterests.custom}
                            onAdd={addCustomTag}
                            onRemove={removeCustomTag}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {errorMessage && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                      {errorMessage}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-60"
                    >
                      {submitting
                        ? "Evaluating…"
                        : latest
                          ? "Re-run Matching"
                          : "Get My Match"}
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

function ResultCard({ latest }) {
  return (
    <div className="mt-4 rounded-3xl border bg-white/80 backdrop-blur p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-gray-500">Recommended Role</div>
          <div className="text-2xl font-extrabold tracking-tight">
            {latest?.result?.title || "—"}
          </div>
        </div>
        <div className="rounded-2xl border px-4 py-2 text-sm dark:border-gray-700">
          Fit Score:{" "}
          <span className="font-semibold">
            {latest?.result?.fitScore ?? "—"}
          </span>
          /100
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Block title="Why this match" items={latest?.result?.rationale} />
        <Block title="Related roles" items={latest?.result?.topRoles} />
        <Block title="Skills to highlight" items={latest?.result?.topSkills} />
      </div>

      {latest?.result?.learningPlan?.length > 0 && (
        <div className="mt-4 rounded-2xl border p-4 dark:border-gray-800">
          <h3 className="font-semibold mb-2">Learning Plan</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {latest.result.learningPlan.map((planItem) => (
              <li key={planItem}>{planItem}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Updated {new Date(latest.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}

function EmptyNotice() {
  return (
    <div className="mt-4 rounded-2xl border p-4 text-sm opacity-80 dark:border-gray-800">
      No job match yet — take the quiz below to generate your recommendation.
    </div>
  );
}

function Block({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border p-4 dark:border-gray-800">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {items.map((itemText) => (
          <li key={itemText}>{itemText}</li>
        ))}
      </ul>
    </div>
  );
}

function TagInput({ label, tags, onAdd, onRemove }) {
  const [inputValue, setInputValue] = useState("");
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(inputValue);
            setInputValue("");
          }
        }}
        placeholder="e.g., Veterinary care, Museum curation, Sports analytics"
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
      />
      {!!tags.length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tagText) => (
            <span
              key={tagText}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs dark:border-gray-700"
            >
              {tagText}
              <button
                className="opacity-70 hover:opacity-100"
                onClick={() => onRemove(tagText)}
                aria-label={`Remove ${tagText}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
