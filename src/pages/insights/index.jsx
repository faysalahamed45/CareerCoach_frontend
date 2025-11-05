import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";
import { getJSON } from "../../lib/api.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const fallback = {
  updatedAt: new Date().toISOString(),
  marketOutlook: "Positive",
  growthPercent: 5.5, // %
  demandLevel: "High",
  topSkills: ["Python", "Java", "JavaScript", "AWS", "Cloud Computing"],
  salaryRanges: [
    { role: "Software Engineer", min: 70, median: 110, max: 165 },
    { role: "Data Scientist", min: 85, median: 140, max: 180 },
    { role: "Frontend Developer", min: 65, median: 95, max: 150 },
    { role: "DevOps Engineer", min: 75, median: 125, max: 160 },
    { role: "Cloud Architect", min: 95, median: 170, max: 200 },
  ],
  keyTrends: [
    "Cloud Computing",
    "AI/ML",
    "DevOps",
    "Cybersecurity",
    "Big Data",
  ],
  recommendedSkills: [
    "Python",
    "Agile",
    "Cloud Computing",
    "Cybersecurity",
    "Data Analysis",
  ],
};

export default function Insights() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getJSON("/insights");
        if (mounted) setData(res && res.salaryRanges ? res : fallback);
      } catch (e) {
        setErr(e.message || "Failed to load insights");
        setData(fallback);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const updatedLabel = useMemo(() => {
    const d = new Date(data?.updatedAt || Date.now());
    return d.toLocaleDateString();
  }, [data]);

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pb-14">
        <div className="pt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Industry Insights
          </h1>
          <div
            className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs
                          bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800"
          >
            <span className="opacity-70">Last updated:</span>
            <span className="font-medium">{updatedLabel}</span>
          </div>
        </div>

        {err && (
          <div
            className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800
                          dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
          >
            Showing demo insights: {err}
          </div>
        )}

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Market Outlook
            </div>
            <div className="mt-1 text-xl font-semibold">
              {data?.marketOutlook || "—"}
            </div>
            <div className="mt-2 text-green-500 text-xs">↑ improving</div>
          </Card>

          <Card>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Industry Growth
            </div>
            <div className="mt-1 text-xl font-semibold">
              {(data?.growthPercent ?? 0).toFixed(1)}%
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-2 rounded-full bg-cyan-600"
                style={{ width: `${Math.min(100, data?.growthPercent ?? 0)}%` }}
              />
            </div>
          </Card>

          <Card>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Demand Level
            </div>
            <div className="mt-1 text-xl font-semibold">
              {data?.demandLevel || "—"}
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width:
                    data?.demandLevel === "High"
                      ? "100%"
                      : data?.demandLevel === "Medium"
                        ? "60%"
                        : "30%",
                }}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Top Skills
                </div>
              </div>
              <span className="text-xs opacity-60">⚙</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(data?.topSkills || []).slice(0, 6).map((skillName) => (
                <span
                  key={skillName}
                  className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-800
                             dark:bg-gray-800 dark:text-gray-200"
                >
                  {skillName}
                </span>
              ))}
            </div>
          </Card>
        </section>

        <section
          className="mt-6 rounded-2xl border bg-white p-4 shadow-sm
                            border-gray-200 dark:bg-gray-900/60 dark:border-gray-800"
        >
          <div className="mb-3 font-semibold">Salary Ranges by Role</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1 mb-4">
            Displaying minimum, median, and maximum salaries (in thousands).
          </div>

          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.salaryRanges || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-800"
                />
                <XAxis
                  dataKey="role"
                  stroke="currentColor"
                  className="text-gray-700 dark:text-gray-300"
                />
                <YAxis
                  stroke="currentColor"
                  className="text-gray-700 dark:text-gray-300"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--tw-prose-bg, #0b1220)",
                    borderRadius: 12,
                    border: "1px solid rgba(148, 163, 184, .2)",
                  }}
                  labelStyle={{ color: "white" }}
                />
                <Legend />
                <Bar dataKey="min" name="Min" fill="#6b7280" />
                <Bar dataKey="median" name="Median" fill="#94a3b8" />
                <Bar dataKey="max" name="Max" fill="#cbd5e1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="font-semibold mb-2">Key Industry Trends</div>
            <ul className="space-y-2 text-sm">
              {(data?.keyTrends || []).map((trendLabel) => (
                <li key={trendLabel} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {trendLabel}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="font-semibold mb-2">Recommended Skills</div>
            <div className="flex flex-wrap gap-2">
              {(data?.recommendedSkills || []).map((recommendedSkill) => (
                <span
                  key={recommendedSkill}
                  className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-800
                             dark:bg-gray-800 dark:text-gray-200"
                >
                  {recommendedSkill}
                </span>
              ))}
            </div>
          </Card>
        </section>

        {loading && (
          <div className="mt-6 animate-pulse">
            <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      className="rounded-2xl border bg-white p-4 shadow-sm
                    border-gray-200 dark:bg-gray-900/60 dark:border-gray-800"
    >
      {children}
    </div>
  );
}
