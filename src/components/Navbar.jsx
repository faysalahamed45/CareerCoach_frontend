import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();

  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const initial = (name || "").trim().charAt(0).toUpperCase() || "U";

  const [acctOpen, setAcctOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const acctRef = useRef(null);
  const toolsRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      setAuthed(!!localStorage.getItem("token"));
      setName(localStorage.getItem("userName") || "");
      setEmail(localStorage.getItem("userEmail") || "");
    };
    window.addEventListener("auth:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !name) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload) => {
          if (payload?.user?.name) {
            localStorage.setItem("userName", payload.user.name);
            localStorage.setItem("userEmail", payload.user.email || "");
            setName(payload.user.name);
            setEmail(payload.user.email || "");
          }
        })
        .catch(() => {});
    }
  }, [name]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!acctRef.current?.contains(e.target)) setAcctOpen(false);
      if (!toolsRef.current?.contains(e.target)) setToolsOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setAuthed(false);
    setName("");
    setEmail("");
    setAcctOpen(false);
    setToolsOpen(false);
    nav("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-gray-950/80 border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold">
          CareerCoach<span className="text-cyan-600">AI</span>
        </Link>

        <nav className="flex items-center gap-3">
          {authed && (
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen((s) => !s)}
                className="px-3 py-1.5 rounded-xl border text-sm border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
              >
                Career Hub ▾
              </button>

              {toolsOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-white p-1 shadow-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                  <MenuLink
                    to="/skills"
                    label="Skill Tracker"
                    onClick={() => setToolsOpen(false)}
                  />
                  <MenuLink
                    to="/jobs"
                    label="Job Matching"
                    onClick={() => setToolsOpen(false)}
                  />
                  <MenuLink
                    to="/ats"
                    label="ATS Check"
                    onClick={() => setToolsOpen(false)}
                  />
                  <MenuLink
                    to="/resume"
                    label="Resume Builder"
                    onClick={() => setToolsOpen(false)}
                  />
                  <MenuLink
                    to="/cover-letter"
                    label="Cover Letter Generator"
                    onClick={() => setToolsOpen(false)}
                  />
                  <MenuLink
                    to="/insights"
                    label="Industry Insights"
                    onClick={() => setToolsOpen(false)}
                  />
                  <MenuLink
                    to="/interview"
                    label="Interview Preparation"
                    onClick={() => setToolsOpen(false)}
                  />
                </div>
              )}
            </div>
          )}

          {!authed ? (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500"
            >
              Sign in
            </Link>
          ) : (
            <div className="relative" ref={acctRef}>
              <button
                onClick={() => setAcctOpen((s) => !s)}
                className="grid h-9 w-9 place-items-center rounded-full bg-cyan-600 text-white font-semibold"
                title={name || "Account"}
              >
                {initial}
              </button>

              {acctOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                  <div className="border-b px-3 pb-2 text-sm dark:border-gray-800">
                    <div className="font-semibold">{name || "User"}</div>
                    <div className="text-xs text-gray-500">{email}</div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={signOut}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function MenuLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {label}
    </Link>
  );
}
