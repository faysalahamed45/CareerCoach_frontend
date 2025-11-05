import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postJSON } from "../../../lib/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
	
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (form.password.length < 6) {
      return setErrorMessage("Password must be at least 6 characters.");
    }
    if (form.password !== form.confirm) {
      return setErrorMessage("Passwords do not match.");
    }

    setIsLoading(true);
    try {
      await postJSON("/auth/register", {
        email: form.email,
        password: form.password,
        name: form.name,
      });
      navigate("/login");
    } catch (e) {
      setErrorMessage(e.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen grid place-items-center overflow-hidden
                    bg-gradient-to-b from-fuchsia-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950"
    >
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="w-full max-w-md">
        <div
          className="rounded-3xl border border-gray-200/70 bg-white/80 backdrop-blur-xl shadow-xl
                        dark:border-gray-800/80 dark:bg-gray-900/70"
        >
          <div className="px-8 pt-8 text-center">
            <div className="inline-flex items-center gap-2 text-2xl font-extrabold">
              <span className="text-gray-900 dark:text-white">
                Join CareerCoach
              </span>
              <span className="px-2 py-0.5 rounded-md bg-fuchsia-600 text-white">
                AI
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your account to unlock AI-powered career tools.
            </p>
          </div>

          <form className="px-8 py-8 space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                className="peer w-full rounded-2xl border border-gray-300 bg-white/70 px-4 pb-2 pt-5 text-sm outline-none transition
                           focus:border-fuchsia-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-fuchsia-500"
                value={form.name}
                onChange={updateField("name")}
                placeholder=" "
                required
              />
              <label
                className="pointer-events-none absolute left-4 top-2 text-[11px] text-gray-500 transition-all
                                 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                                 peer-focus:top-2 peer-focus:text-[11px]"
              >
                Full name
              </label>
            </div>

            <div className="relative">
              <input
                className="peer w-full rounded-2xl border border-gray-300 bg-white/70 px-4 pb-2 pt-5 text-sm outline-none transition
                           focus:border-fuchsia-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-fuchsia-500"
                value={form.email}
                onChange={updateField("email")}
                placeholder=" "
                type="email"
                required
              />
              <label
                className="pointer-events-none absolute left-4 top-2 text-[11px] text-gray-500 transition-all
                                 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                                 peer-focus:top-2 peer-focus:text-[11px]"
              >
                Email address
              </label>
            </div>

            <div className="relative">
              <input
                className="peer w-full rounded-2xl border border-gray-300 bg-white/70 px-4 pb-2 pt-5 text-sm outline-none transition
                           focus:border-fuchsia-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-fuchsia-500"
                value={form.password}
                onChange={updateField("password")}
                placeholder=" "
                type={showPassword ? "text" : "password"}
                required
              />
              <label
                className="pointer-events-none absolute left-4 top-2 text-[11px] text-gray-500 transition-all
                                 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                                 peer-focus:top-2 peer-focus:text-[11px]"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-2 text-xs text-gray-600 hover:bg-gray-100
                           dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="relative">
              <input
                className="peer w-full rounded-2xl border border-gray-300 bg-white/70 px-4 pb-2 pt-5 text-sm outline-none transition
                           focus:border-fuchsia-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-fuchsia-500"
                value={form.confirm}
                onChange={updateField("confirm")}
                placeholder=" "
                type={showConfirmPassword ? "text" : "password"}
                required
              />
              <label
                className="pointer-events-none absolute left-4 top-2 text-[11px] text-gray-500 transition-all
                                 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                                 peer-focus:top-2 peer-focus:text-[11px]"
              >
                Confirm password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-2 text-xs text-gray-600 hover:bg-gray-100
                           dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errorMessage && (
              <div
                className="rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700
                              dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-2.5 text-sm font-semibold text-white
                         shadow-lg shadow-fuchsia-600/30 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-60"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-fuchsia-700 hover:underline dark:text-fuchsia-400"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
