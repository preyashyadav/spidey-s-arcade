"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import Link from "next/link";
import { auth } from "../lib/firebase";

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const onStart = () => setTimerActive(true);
    window.addEventListener("game:start", onStart);
    if (sessionStorage.getItem("gameStart")) setTimerActive(true);
    return () => window.removeEventListener("game:start", onStart);
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    const start = +sessionStorage.getItem("gameStart")!;
    const tick = () => {
      const end = sessionStorage.getItem("gameEnd");
      const now = end ? +end : Date.now();
      setElapsed(formatElapsed(now - start));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const handleHomeClick = () => {
    sessionStorage.removeItem("gameStart");
    sessionStorage.removeItem("gameEnd");
    sessionStorage.removeItem("gameId");
    setTimerActive(false);
  };

  return (
    <nav className="navbar panel dkgrey">
      <div className="inner nav-inner">
        <Link href="/" onClick={handleHomeClick}>
          <div className="comics-button logo-btn">PY</div>
        </Link>

        {timerActive && (
          <div className="comics-hint">
            <span>⏱ {elapsed}</span>
          </div>
        )}

        <div className="auth-area">
          {user ? (
            <>
              <img
                src={user.photoURL || "/avatar_placeholder.png"}
                alt="Profile"
                className="avatar"
              />
              <div className="comics-user user-name">
                {user.displayName || user.email}
              </div>
              <button
                className="comics-button"
                onClick={() => auth && signOut(auth)}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="comics-button">Sign In</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
