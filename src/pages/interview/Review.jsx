import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";
import { useLocation, useParams } from "react-router-dom";
import { getJSON } from "../../lib/api.js";

export default function InterviewReview() {
  const { id } = useParams();
  const locationState = useLocation().state;

  const [reviewData, setReviewData] = useState(locationState || null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      if (reviewData) return;
      try {
        const fetched = await getJSON(`/interview/quiz/${id}`);
        setReviewData(fetched);
      } catch (err) {
        setErrorMessage(err.message || "Failed to load review");
      }
    })();
  }, [id, reviewData]);

  const result = reviewData;

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Quiz Review</h1>

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-800 dark:bg-red-900/20">
              {errorMessage}
            </div>
          )}

          {!result ? (
            <div className="py-12 text-center text-sm opacity-70">Loading…</div>
          ) : (
            <>
              <div className="mt-4 rounded-3xl border bg-white/80 backdrop-blur p-6 dark:border-gray-800 dark:bg-gray-900/70">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs text-gray-500">Overall Score</div>
                    <div className="text-3xl font-extrabold tracking-tight">
                      {result.percent}/100
                    </div>
                    <div className="text-xs text-gray-500">
                      Correct: {result.score} of {result.review.length}
                    </div>
                  </div>
                  <div className="w-full sm:w-96">
                    <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-3 ${result.percent >= 70 ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${result.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {result.review.map((questionItem, questionIndex) => {
                  const isCorrect =
                    questionItem.correctIndex === questionItem.userIndex;
                  return (
                    <div
                      key={questionIndex}
                      className="rounded-2xl border p-4 dark:border-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">
                          Q{questionIndex + 1}. {questionItem.question}
                        </div>
                        <span
                          className={`text-xs font-medium ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>

                      <ul className="mt-2 text-sm space-y-1">
                        {questionItem.options.map((optionText, optionIndex) => (
                          <li
                            key={optionIndex}
                            className={`rounded-lg px-2 py-1 ${
                              optionIndex === questionItem.correctIndex
                                ? "bg-emerald-50 dark:bg-emerald-900/20"
                                : ""
                            } ${
                              optionIndex === questionItem.userIndex &&
                              !isCorrect
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

                      {questionItem.explanation && (
                        <div className="mt-2 text-sm opacity-80">
                          <span className="font-medium">Explanation:</span>{" "}
                          {questionItem.explanation}
                        </div>
                      )}

                      {questionItem.tips?.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium">
                            Improvement Tips:
                          </div>
                          <ul className="text-sm list-disc pl-5">
                            {questionItem.tips.map((tipText, tipIndex) => (
                              <li key={tipIndex}>{tipText}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
