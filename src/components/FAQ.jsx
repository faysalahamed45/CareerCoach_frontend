import React, { useState } from "react";

export default function FAQ({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);
  if (!items.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-14">
      <h2 className="text-center text-2xl font-bold mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {items.map((faqItem, index) => (
          <div
            key={index}
            className="rounded-xl border overflow-hidden bg-white border-gray-200 dark:bg-gray-900/60 dark:border-gray-800"
          >
            <button
              className="w-full text-left px-4 py-3 flex items-center justify-between"
              onClick={() =>
                setOpenIndex((previousOpenIndex) =>
                  previousOpenIndex === index ? -1 : index,
                )
              }
            >
              <span className="font-medium">{faqItem.q}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {openIndex === index ? "–" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                {faqItem.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
