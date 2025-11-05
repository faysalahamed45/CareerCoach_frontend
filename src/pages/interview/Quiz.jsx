import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter.jsx";
import { postJSON } from "../../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function InterviewQuiz() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [step, setStep] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();

  async function startQuiz() {
    setLoading(true);
    setErrorMessage("");
    setQuiz(null);
    setResult(null);
    setStep(0);
    setAnswers([]);

    try {
      const response = await postJSON("/interview/quiz/start", {});
      setQuiz(response);
      setAnswers(Array(response.questions.length).fill(null));
    } catch (e) {
      if (e.status === 401) setErrorMessage("Please sign in to take the quiz.");
      else setErrorMessage(e.message || "Failed to start quiz.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    startQuiz();
  }, []);

  const selectAnswer = (optionIndex) =>
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = optionIndex;
      return next;
    });

  const goToNextQuestion = () =>
    setStep((current) => Math.min(current + 1, quiz.questions.length - 1));

  const goToPreviousQuestion = () =>
    setStep((current) => Math.max(current - 1, 0));

  async function submit() {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const submission = await postJSON("/interview/quiz/submit", {
        quizId: quiz.id,
        answers,
      });
      setResult(submission);
    } catch (e) {
      if (e.status === 401)
        setErrorMessage("Your session expired. Please sign in again.");
      else setErrorMessage(e.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Mock Interview</h1>

          {loading && (
            <div className="py-16 text-center text-sm opacity-70">
              Preparing your tailored quiz…
            </div>
          )}

          {!loading && errorMessage && (
            <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-800 dark:bg-red-900/20">
              <div className="font-medium mb-1">Couldn’t start the quiz</div>
              <div className="opacity-80">{errorMessage}</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={startQuiz}
                  className="rounded-xl border px-3 py-2 text-sm dark:border-gray-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/interview")}
                  className="rounded-xl border px-3 py-2 text-sm dark:border-gray-700"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {!loading && !errorMessage && result && (
            <div className="mt-4 rounded-3xl border bg-white/80 backdrop-blur p-6 dark:border-gray-800 dark:bg-gray-900/70">
              <div className="text-xs text-gray-500">Your Result</div>
              <div className="text-3xl font-extrabold tracking-tight">
                {result.percent}/100
              </div>
              <div className="text-xs text-gray-500">
                Correct: {result.score} of {result.review.length}
              </div>
              <div className="w-full sm:w-96 mt-4">
                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-3 ${
                      result.percent >= 70 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${result.percent}%` }}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => navigate("/interview")}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={startQuiz}
                  className="rounded-xl border px-4 py-2 text-sm dark:border-gray-700"
                >
                  Take Another Quiz
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Detailed per-question review appears on the dashboard (click
                your quiz in Recent Quizzes).
              </p>
            </div>
          )}

          {!loading && !errorMessage && !result && quiz && (
            <div className="mt-4 rounded-3xl border bg-white/80 backdrop-blur p-6 dark:border-gray-800 dark:bg-gray-900/70">
              <div className="text-xs text-gray-500">
                Question {step + 1} of {quiz.questions.length}
              </div>
              <div className="mt-2 text-lg font-semibold">
                {quiz.questions[step].question}
              </div>

              <div className="mt-4 grid gap-2">
                {quiz.questions[step].options.map((optionText, optionIndex) => {
                  const isSelected = answers[step] === optionIndex;
                  return (
                    <button
                      key={optionIndex}
                      onClick={() => selectAnswer(optionIndex)}
                      className={`text-left rounded-2xl border px-4 py-3 text-sm transition
                        ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20"
                            : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
                        }`}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      {optionText}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={step === 0}
                  className="rounded-xl border px-4 py-2 text-sm dark:border-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                {step < quiz.questions.length - 1 ? (
                  <button
                    onClick={goToNextQuestion}
                    disabled={answers[step] === null}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={
                      submitting ||
                      answers.some((answerValue) => answerValue === null)
                    }
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Finish Quiz"}
                  </button>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Tip: Select an option to proceed.
              </div>
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
