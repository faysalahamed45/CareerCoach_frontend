import React from "react";
import Navbar from "../../components/Navbar.jsx";
import About from "../../components/About.jsx";
import Features from "../../components/Features.jsx";
import Testimonials from "../../components/Testimonials.jsx";
import FAQ from "../../components/FAQ.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";

import { faqs } from "../../data/faq.js";
import { testimonials } from "../../data/testimonials.js";

export default function HeroPage() {
  return (
    <>
      <Navbar />
      <About />
      <Features />
      <Testimonials items={testimonials} />
      <FAQ items={faqs} />
      <SiteFooter />
    </>
  );
}
