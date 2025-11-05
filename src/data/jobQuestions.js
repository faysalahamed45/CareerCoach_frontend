import { careerDomains } from "./domains.js";

export const jobQuestions = [
  {
    key: "workStyle",
    type: "single",
    question: "Which describes your favorite work style?",
    options: [
      "Individual contributor",
      "Small collaborative team",
      "Leading teams",
      "Client-facing consulting",
    ],
  },

  {
    key: "domainInterests",
    type: "domain",
    question: "Which areas interest you the most? (choose any)",
    domains: careerDomains,
  },
  {
    key: "companySize",
    type: "single",
    question: "Preferred company size?",
    options: [
      "Startup (1-50)",
      "Scale-up (50-300)",
      "Mid-size (300-1000)",
      "Enterprise (1000+)",
    ],
  },
  {
    key: "peopleVsTech",
    type: "scale",
    question: "Do you prefer people-oriented vs. technical/deep-work tasks?",
    minLabel: "People",
    maxLabel: "Deep Tech",
    min: 1,
    max: 5,
    defaultValue: 3,
  },
  {
    key: "strengths",
    type: "multi",
    question: "What are your top strengths?",
    options: [
      "Analytical thinking",
      "Creative design",
      "Problem solving",
      "Communication",
      "Leadership",
      "Attention to detail",
    ],
  },
  {
    key: "learningGoal",
    type: "text",
    question: "What is one career goal for the next 6 months?",
  },
];
