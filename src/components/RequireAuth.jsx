import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getJSON } from "../lib/api";

export default function RequireAuthRoute() {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (alive) {
          setOk(false);
          setReady(true);
        }
        return;
      }
      try {
        await getJSON("/auth/me");
        if (alive) {
          setOk(true);
          setReady(true);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        if (alive) {
          setOk(false);
          setReady(true);
        }
      }
    };
    check();
    const onAuth = () => check();
    window.addEventListener("auth:changed", onAuth);
    return () => {
      alive = false;
      window.removeEventListener("auth:changed", onAuth);
    };
  }, []);

  if (!ready) return null;
  if (!ok) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Outlet />;
}
