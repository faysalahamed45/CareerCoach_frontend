import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Insights from "./pages/insights";
import Onboarding from "./pages/onboarding";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import OnboardingGate from "./routes/OnboardingGate.jsx";
import CoverLetterPage from "./pages/cover-letter/index.jsx";
import ATS from "./pages/ats/ATS.jsx";
import InterviewDashboard from "./pages/interview/Dashboard.jsx";
import InterviewQuiz from "./pages/interview/Quiz.jsx";
import Resume from "./pages/resume/index.jsx";
import SkillsPage from "./pages/skills/index.jsx";
import Jobs from "./pages/jobs";
import RequireAuthRoute from "./components/RequireAuth.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuthRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/insights"
            element={
              <OnboardingGate>
                <Insights />
              </OnboardingGate>
            }
          />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/ats" element={<ATS />} />
          <Route path="/interview" element={<InterviewDashboard />} />
          <Route path="/interview/quiz" element={<InterviewQuiz />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/cover-letter" element={<CoverLetterPage />} />
          <Route path="/skills" element={<SkillsPage />} />
        </Route>

        {/* Catch-all: if unknown path and not matched above */}
        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  );
}
