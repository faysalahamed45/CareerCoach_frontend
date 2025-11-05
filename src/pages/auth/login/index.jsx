import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { postJSON, setAuth } from "../../../lib/api";

/* google SVG icons  */
const Google = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303C33.641 31.91 29.223 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.84 1.153 7.957 3.043l5.657-5.657C34.869 5.053 29.702 3 24 3 12.954 3 4 11.954 4 23s8.954 20 20 20 20-8.954 20-20c0-1.337-.138-2.64-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.391 16.222 18.835 13 24 13c3.059 0 5.84 1.153 7.957 3.043l5.657-5.657C34.869 5.053 29.702 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 43c5.167 0 9.86-1.983 13.409-5.223l-6.191-5.238C29.164 34.488 26.707 35 24 35c-5.202 0-9.605-3.07-11.292-7.463l-6.53 5.028C9.477 39.553 16.207 43 24 43z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-1.05 3.084-3.312 5.671-6.085 7.106l.001-.001 6.191 5.238C37.164 41.017 44 36 44 23c0-1.337-.138-2.64-.389-3.917z"
    />
  </svg>
);

/* github SVG icons  */
const Github = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 .5a11.5 11.5 0 0 0-3.636 22.414c.575.105.786-.248.786-.553 0-.273-.01-.997-.015-1.956-3.2.695-3.876-1.543-3.876-1.543-.523-1.327-1.277-1.68-1.277-1.68-1.044-.714.079-.699.079-.699 1.156.081 1.765 1.188 1.765 1.188 1.027 1.76 2.695 1.252 3.35.957.104-.744.402-1.252.731-1.54-2.555-.29-5.242-1.277-5.242-5.683 0-1.255.45-2.282 1.188-3.086-.119-.29-.515-1.457.113-3.037 0 0 .967-.31 3.17 1.179A10.99 10.99 0 0 1 12 6.83c.98.005 1.968.133 2.891.39 2.2-1.49 3.166-1.179 3.166-1.179.63 1.58.234 2.747.115 3.037.74.804 1.186 1.831 1.186 3.086 0 4.417-2.692 5.389-5.257 5.673.41.355.776 1.063.776 2.144 0 1.547-.014 2.797-.014 3.177 0 .308.207.665.793.552A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/"; // after-login target

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const { token, user } = await postJSON("/auth/login", {
        email: form.email,
        password: form.password,
      });
      if (!token) throw new Error("No token returned from server");

      setAuth({ token, user });
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setErrorMessage(e.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid place-items-center overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200/70 bg-white/80 backdrop-blur-xl shadow-xl dark:border-gray-800/80 dark:bg-gray-900/70">
          <div className="px-8 pt-8 text-center">
            <div className="inline-flex items-center gap-2 text-2xl font-extrabold">
              <span className="text-gray-900 dark:text-white">CareerCoach</span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-600 text-white">
                AI
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Welcome back! Sign in to continue.
            </p>
          </div>

          <div className="px-8 mt-6 flex gap-3">
            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-900">
              <Google /> Sign in with Google
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-900">
              <Github /> GitHub
            </button>
          </div>

          <div className="px-8 mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-500">or continue with</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>

          <form className="px-8 py-8 space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                className="peer w-full rounded-2xl border border-gray-300 bg-white/70 px-4 pb-2 pt-5 text-sm outline-none transition focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                value={form.email}
                onChange={updateField("email")}
                placeholder=" "
                type="email"
                required
              />
              <label className="pointer-events-none absolute left-4 top-2 text-[11px] text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px]">
                Email address
              </label>
            </div>

            <div className="relative">
              <input
                className="peer w-full rounded-2xl border border-gray-300 bg-white/70 px-4 pb-2 pt-5 text-sm outline-none transition focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500"
                value={form.password}
                onChange={updateField("password")}
                placeholder=" "
                type={showPassword ? "text" : "password"}
                required
              />
              <label className="pointer-events-none absolute left-4 top-2 text-[11px] text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-2 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={updateField("remember")}
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-xs text-cyan-700 hover:underline dark:text-cyan-400"
              >
                Forgot password?
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              New here?{" "}
              <Link
                to="/register"
                className="font-medium text-cyan-700 hover:underline dark:text-cyan-400"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
