import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";
import { delJSON, getJSON, postJSON, putJSON } from "../../lib/api.js";

const CATEGORIES = [
  "Frontend",
  "Backend",
  "DevOps",
  "Mobile",
  "Data/AI",
  "Testing",
  "Soft",
  "General",
];

export default function SkillsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("recent");

  const [draft, setDraft] = useState({
    name: "",
    category: "General",
    level: 20,
    target: 80,
    notes: "",
  });
  const [editingId, setEditingId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getJSON("/skills");
        setList(data);
      } catch (e) {
        setErr(e.message || "Failed to load skills");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    let workingList = list.filter((skill) => {
      const categoryMatches = cat === "All" || skill.category === cat;
      const textMatches =
        !searchTerm ||
        skill.name.toLowerCase().includes(searchTerm) ||
        (skill.notes || "").toLowerCase().includes(searchTerm);
      return categoryMatches && textMatches;
    });

    if (sort === "level") {
      workingList = workingList.sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
    }
    if (sort === "name") {
      workingList = workingList.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === "recent") {
      workingList = workingList.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt),
      );
    }
    return workingList;
  }, [list, query, cat, sort]);

  function resetForm() {
    setDraft({
      name: "",
      category: "General",
      level: 20,
      target: 80,
      notes: "",
    });
    setEditingId("");
  }

  async function save(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    try {
      if (!draft.name.trim()) throw new Error("Skill name is required");
      if (editingId) {
        const updated = await putJSON(`/skills/${editingId}`, draft);
        setList((prev) =>
          prev.map((skill) => (skill._id === editingId ? updated : skill)),
        );
      } else {
        const created = await postJSON("/skills", draft);
        setList((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this skill?")) return;
    try {
      await delJSON(`/skills/${id}`);
      setList((prev) => prev.filter((skill) => skill._id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  }

  async function nudge(id, delta = 5) {
    const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

    const currentLevel = list.find((skill) => skill._id === id)?.level ?? 0;
    const nextLevel = clamp(currentLevel + delta);

    setList((prev) =>
      prev.map((skill) =>
        skill._id === id ? { ...skill, level: nextLevel } : skill,
      ),
    );

    try {
      const updated = await putJSON(`/skills/${id}`, {
        level: nextLevel,
        lastPracticedAt: new Date().toISOString(),
      });
      setList((prev) =>
        prev.map((skill) => (skill._id === id ? updated : skill)),
      );
    } catch (e) {
      setList((prev) =>
        prev.map((skill) =>
          skill._id === id ? { ...skill, level: currentLevel } : skill,
        ),
      );
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Skill Tracker
            </h1>
            <div className="text-xs opacity-70">{list.length} total</div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills…"
              className="rounded-2xl border border-gray-300 bg-white/80 px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-900/70 dark:focus:border-cyan-500"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="rounded-2xl border border-gray-300 bg-white/80 px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-900/70 dark:focus:border-cyan-500"
            >
              <option>All</option>
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl border border-gray-300 bg-white/80 px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-900/70 dark:focus:border-cyan-500"
            >
              <option value="recent">Sort: Recent</option>
              <option value="level">Sort: Level</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          <form
            onSubmit={save}
            className="mt-6 rounded-3xl border bg-white/80 backdrop-blur p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/70"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs mb-1 opacity-70">
                  Skill name
                </label>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((prevDraft) => ({
                      ...prevDraft,
                      name: e.target.value,
                    }))
                  }
                  required
                  placeholder="e.g., React, Node.js, Docker"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-70">
                  Category
                </label>
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft((prevDraft) => ({
                      ...prevDraft,
                      category: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-70">
                  Current level
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.level}
                  onChange={(e) =>
                    setDraft((prevDraft) => ({
                      ...prevDraft,
                      level: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-70">Target</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.target}
                  onChange={(e) =>
                    setDraft((prevDraft) => ({
                      ...prevDraft,
                      target: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-xs mb-1 opacity-70">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((prevDraft) => ({
                      ...prevDraft,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="What to practice next, courses to follow, etc."
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                />
              </div>
            </div>

            {err && (
              <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                {err}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-60"
              >
                {editingId
                  ? submitting
                    ? "Updating…"
                    : "Update skill"
                  : submitting
                    ? "Adding…"
                    : "Add skill"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border px-4 py-2 text-sm dark:border-gray-700"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          {loading ? (
            <div className="py-12 text-center text-sm opacity-70">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border p-6 text-sm opacity-80 dark:border-gray-800">
              No skills yet. Add your first skill above!
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((skill) => (
                <SkillCard
                  key={skill._id}
                  skill={skill}
                  onEdit={() => {
                    setEditingId(skill._id);
                    setDraft({
                      name: skill.name,
                      category: skill.category,
                      level: skill.level ?? 0,
                      target: skill.target ?? 80,
                      notes: skill.notes ?? "",
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onDelete={() => remove(skill._id)}
                  onNudge={(delta) => nudge(skill._id, delta)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

function SkillCard({ skill, onEdit, onDelete, onNudge }) {
  const pct = Math.max(0, Math.min(100, Number(skill.level ?? 0)));
  const target = Math.max(0, Math.min(100, Number(skill.target ?? 80)));
  const gap = Math.max(0, target - pct);
  const reached = pct >= target;

  return (
    <div className="rounded-2xl border bg-white/80 backdrop-blur p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {skill.category || "General"}
          </div>
          <div className="text-lg font-semibold">{skill.name}</div>
        </div>
        <div className="text-xs rounded-xl border px-2 py-1 dark:border-gray-700">
          {new Date(skill.updatedAt || skill.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span>Level: {pct}%</span>
          <span>Target: {target}%</span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className={`h-2 rounded-full ${reached ? "bg-emerald-500" : "bg-cyan-600"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {!reached && (
          <div className="mt-1 text-[11px] text-gray-500">
            ~{gap}% to target
          </div>
        )}
      </div>

      {skill.notes ? (
        <div className="mt-2 rounded-xl border px-3 py-2 text-xs dark:border-gray-800">
          {skill.notes}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => onNudge(+5)}
          className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          +5
        </button>
        <button
          onClick={() => onNudge(-5)}
          className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          -5
        </button>
        <button
          onClick={onEdit}
          className="ml-auto rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg border px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-900/20"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
