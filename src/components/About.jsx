import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-14 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
        Your AI Career Coach for <br className="hidden md:block" />
        Professional Success
      </h1>
      <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mt-4">
        Advance your career with personalized guidance, interview prep, and
        AI-powered tools for job success.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/insights"
          className="px-4 py-2 rounded-2xl bg-cyan-400 text-white font-medium hover:bg-cyan-500"
        >
          Get Started
        </Link>
        <Link
          to="/jobs"
          className="px-4 py-2 rounded-2xl border border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
        >
          Try Career Quiz
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border p-8 text-gray-600 dark:text-gray-400 bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800">
        CareerCoachAI analyzes your onboarding profile using Gemini to generate
        industry insights, resumes, cover letters, and mock interviews tailored
        to your role.
      </div>
    </section>
  );
}
