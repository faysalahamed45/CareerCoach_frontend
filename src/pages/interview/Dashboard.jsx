import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter.jsx";
import { getJSON } from "../../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function InterviewDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewErrorMessage, setReviewErrorMessage] = useState("");
  const [reviewData, setReviewData] = useState(null);

  const navigate = useNavigate();

  const loadSummary = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const responseData = await getJSON("/interview/summary");
      setSummary(responseData);
    } catch (e) {
      setErrorMessage(e.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const openReview = async (quizId) => {
    setReviewOpen(true);
    setReviewErrorMessage("");
    setReviewLoading(true);
    setReviewData(null);
    try {
      const quizReview = await getJSON(`/interview/quiz/${quizId}`);
      setReviewData(quizReview);
    } catch (e) {
      setReviewErrorMessage(e.message || "Failed to load review");
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setReviewOpen(false);
    setReviewData(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Interview Preparation
            </h1>
            <button
              onClick={() => navigate("/interview/quiz")}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Start Quiz
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-800 dark:bg-red-900/20">
              {errorMessage}
            </div>
          )}

          {loading || !summary ? (
            <div className="py-12 text-center text-sm opacity-70">Loading…</div>
          ) : (
            <>
              {/* stat cards */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Stat title="Average Score" value={`${summary.avgPercent}%`} />
                <Stat
                  title="Questions Practiced"
                  value={summary.totalQuestions}
                />
                <Stat
                  title="Latest Score"
                  value={`${summary.latestPercent}%`}
                />
              </div>

              <div className="mt-6 rounded-2xl border p-4 dark:border-gray-800">
                <div className="font-semibold mb-2">Performance Trend</div>
                {summary.trend.length === 0 ? (
                  <div className="text-sm opacity-70">No quizzes yet.</div>
                ) : (
                  <div className="flex gap-2 items-end h-40">
                    {summary.trend.map((trendPoint, trendIndex) => (
                      <div
                        key={trendIndex}
                        className="w-8 bg-indigo-500/70 dark:bg-indigo-400/70 rounded"
                        style={{ height: `${Math.max(6, trendPoint.y)}%` }}
                        title={`${new Date(trendPoint.x).toLocaleDateString()} — ${trendPoint.y}%`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl border p-4 dark:border-gray-800">
                <div className="font-semibold mb-2">Recent Quizzes</div>
                <div className="grid gap-3">
                  {summary.recent.length === 0 ? (
                    <div className="text-sm opacity-70">No attempts yet.</div>
                  ) : (
                    summary.recent.map((recentQuizItem) => (
                      <button
                        key={recentQuizItem.id}
                        onClick={() => openReview(recentQuizItem.id)}
                        className="text-left rounded-xl border px-4 py-3 text-sm hover:bg-white/40 dark:border-gray-800 dark:hover:bg-gray-900/40"
                      >
                        <div className="font-medium">
                          {new Date(recentQuizItem.createdAt).toLocaleString()}
                        </div>
                        <div className="text-xs opacity-80">
                          Score: {recentQuizItem.percent}% (click to review)
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {reviewOpen && (
        <Modal onClose={closeReview} title="Quiz Review">
          {reviewLoading ? (
            <div className="py-10 text-center text-sm opacity-70">
              Loading review…
            </div>
          ) : reviewErrorMessage ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-800 dark:bg-red-900/20">
              {reviewErrorMessage}
            </div>
          ) : reviewData ? (
            <ReviewBody data={reviewData} />
          ) : null}
        </Modal>
      )}

      <SiteFooter />
    </>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border p-4 dark:border-gray-800">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-2xl border bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="rounded-lg border px-3 py-1 text-sm dark:border-gray-700"
            >
              Close
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto custom-scroll">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewBody({ data }) {
  return (
    <div>
      <div className="rounded-2xl border p-4 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs text-gray-500">Overall Score</div>
            <div className="text-3xl font-extrabold tracking-tight">
              {data.percent}/100
            </div>
            <div className="text-xs text-gray-500">
              Correct: {data.score} of {data.review.length}
            </div>
          </div>
          <div className="w-full sm:w-96">
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-3 ${
                  data.percent >= 70 ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${data.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {data.review.map((reviewItem, reviewIndex) => {
          const isCorrect = reviewItem.correctIndex === reviewItem.userIndex;
          return (
            <div
              key={reviewIndex}
              className="rounded-2xl border p-4 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  Q{reviewIndex + 1}. {reviewItem.question}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isCorrect ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <ul className="mt-2 text-sm space-y-1">
                {reviewItem.options.map((optionText, optionIndex) => (
                  <li
                    key={optionIndex}
                    className={`rounded-lg px-2 py-1 ${
                      optionIndex === reviewItem.correctIndex
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : ""
                    } ${
                      optionIndex === reviewItem.userIndex && !isCorrect
                        ? "bg-rose-50 dark:bg-rose-900/20"
                        : ""
                    }`}
                  >
                    <span className="mr-2 font-medium">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {optionText}
                  </li>
                ))}
              </ul>
              {reviewItem.explanation && (
                <div className="mt-2 text-sm opacity-80">
                  <span className="font-medium">Explanation:</span>{" "}
                  {reviewItem.explanation}
                </div>
              )}
              {reviewItem.tips?.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium">Improvement Tips:</div>
                  <ul className="text-sm list-disc pl-5">
                    {reviewItem.tips.map((tipText, tipIndex) => (
                      <li key={tipIndex}>{tipText}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
