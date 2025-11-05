import React from "react";

const features = [
  {
    icon: "",
    title: "AI-Powered Career Guidance",
    desc: "Personalized insights and suggestions based on your profile.",
  },
  {
    icon: "",
    title: "Interview Preparation",
    desc: "Mock interviews with explanations to boost confidence.",
  },
  {
    icon: "",
    title: "Industry Insights",
    desc: "Charts for salaries, demand levels, and key trends.",
  },
  {
    icon: "",
    title: "ATS-Smart Documents",
    desc: "Generate ATS-friendly resumes and tailored cover letters.",
  },
];

export default function Features() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-center text-2xl font-bold mb-6">
        Powerful Features for Your Career Growth
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((featureItem) => (
          <div
            key={featureItem.title}
            className="rounded-2xl border p-6 shadow bg-white border-gray-200 dark:bg-gray-900/60 dark:border-gray-800"
          >
            <div className="text-3xl">{featureItem.icon}</div>
            <div className="mt-3 font-semibold">{featureItem.title}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {featureItem.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
