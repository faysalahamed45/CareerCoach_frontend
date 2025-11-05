import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";
import { getJSON, postJSON } from "../../lib/api.js";
import { industries } from "../../data/industries.js";
import Dropdown from "../../components/Dropdown.jsx";

export default function Onboarding() {
  const navigate = useNavigate();

  const [industryId, setIndustryId] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState(0);
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedIndustry = useMemo(
    () => industries.find((industry) => industry.id === industryId) || null,
    [industryId],
  );

  useEffect(() => {
    if (selectedIndustry?.subIndustries?.length) {
      setJobRole(selectedIndustry.subIndustries[0]);
    } else {
      setJobRole("");
    }
  }, [selectedIndustry]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const status = await getJSON("/onboarding/status");
        if (status?.isOnboarded) navigate("/insights");
      } catch {
        // silently ignore; user may not be onboarded yet
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!industryId) return setErrorMessage("Please choose a job field.");
    if (!jobRole) return setErrorMessage("Please choose a job role.");
    setLoading(true);
    try {
      const payload = {
        industry: selectedIndustry?.name || "",
        jobRole,
        experience: Number(experience) || 0,
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        bio: bio.trim(),
      };
      await postJSON("/onboarding", payload);
      navigate("/insights");
    } catch (e) {
      if (e.status === 401)
        setErrorMessage("Your session expired. Please sign in again.");
      else setErrorMessage(e.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const industryOptions = useMemo(
    () =>
      industries.map((industry) => ({
        value: industry.id,
        label: industry.name,
      })),
    [],
  );

  const roleOptions = useMemo(
    () =>
      (selectedIndustry?.subIndustries || []).map((roleName) => ({
        value: roleName,
        label: roleName,
      })),
    [selectedIndustry],
  );

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Let’s tailor your experience
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Choose your job field & role. We’ll generate insights just for
              you.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border p-6 bg-white/80 backdrop-blur border-gray-200 shadow-xl dark:bg-gray-900/70 dark:border-gray-800">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Dropdown
                label="Job Field (Industry)"
                placeholder="Choose a job field…"
                value={industryId}
                onChange={setIndustryId}
                options={industryOptions}
                required
              />

              <Dropdown
                label="Job Role"
                placeholder={
                  selectedIndustry
                    ? "Choose a role…"
                    : "Choose job field first…"
                }
                value={jobRole}
                onChange={setJobRole}
                options={roleOptions}
                disabled={!selectedIndustry}
                required
              />

              <div>
                <label className="block text-sm mb-1">Experience (years)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                  placeholder="e.g., 3"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Skills (comma separated)
                </label>
                <input
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                  placeholder="React, Node.js, SQL…"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Example: React, Tailwind, Node.js, MongoDB
                </p>
              </div>

              <div>
                <label className="block text-sm mb-1">Short Bio</label>
                <textarea
                  rows={5}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                  placeholder="Briefly summarize your background…"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Save & Generate Insights"}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            We’ll analyze your profile to create charts and recommendations on
            the Insights page.
          </p>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
