import React, { useEffect, useState } from "react";

export default function Testimonials({ items = [] }) {
  if (!items.length) return null;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(
      () =>
        setCurrentIndex((previousIndex) => (previousIndex + 1) % items.length),
      4000,
    );
    return () => clearInterval(intervalId);
  }, [items.length]);

  const currentTestimonial = items[currentIndex];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-center text-2xl font-bold mb-6">
        What Our Users Say
      </h2>
      <div className="rounded-2xl border p-6 bg-white border-gray-200 dark:bg-gray-900/60 dark:border-gray-800">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-gray-800 dark:text-gray-200 text-lg">
              “{currentTestimonial.quote}”
            </div>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-300">
                {currentTestimonial.name}
              </span>{" "}
              — {currentTestimonial.role}
            </div>
          </div>
          <div className="shrink-0 flex gap-2">
            <button
              className="px-3 py-1.5 rounded-xl border border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
              onClick={() =>
                setCurrentIndex(
                  (previousIndex) =>
                    (previousIndex - 1 + items.length) % items.length,
                )
              }
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
              onClick={() =>
                setCurrentIndex(
                  (previousIndex) => (previousIndex + 1) % items.length,
                )
              }
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-1.5">
          {items.map((item, itemIndex) => (
            <span
              key={itemIndex}
              className={`h-1.5 w-4 rounded-full ${
                currentIndex === itemIndex
                  ? "bg-cyan-600"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
