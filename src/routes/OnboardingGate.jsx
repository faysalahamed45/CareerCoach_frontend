import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJSON } from "../lib/api.js";
import Navbar from "../components/Navbar.jsx";
import SiteFooter from "..
/components/SiteFooter.jsx";

export default function OnboardingGate({ children }) {
  const nav = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }

    (async () => {
      try {
        const s = await getJSON("/onboarding/status");
        if (!s?.isOnboarded) {
          nav("/onboarding");
          return;
        }
        setOk(true);
      } catch {
        try {
          await getJSON("/insights");
          setOk(true);
        } catch (e) {
          if (e.status === 404) nav("/onboarding");
          else if (e.status === 401) nav("/login");
          else nav("/onboarding");
        }
      }
    })();
  }, [nav]);

  if (!ok) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] grid place-items-center text-sm opacity-70">
          Checking your profile…
        </div>
        <SiteFooter />
      </>
    );
  }

  return children;
}
