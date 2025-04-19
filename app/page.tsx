"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { staticMazeStage } from "../lib/gameData";
import type {
  RiddleStage,
  ShapeStage,
  QuizStage,
  MazeStage,
} from "../lib/gameData";

type TopPlayer = { displayName: string; score: number; photoURL?: string };
type MyPerformance = { aura: string; score: number };

type GeneratedStage = RiddleStage | ShapeStage | QuizStage;
type FullStage = GeneratedStage | MazeStage;

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [myPerformances, setMyPerformances] = useState<MyPerformance[]>([]);
  const [theme, setTheme] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    async function loadGlobal() {
      const q = query(
        collection(db, "games"),
        orderBy("score", "desc"),
        limit(3)
      );
      const snap = await getDocs(q);
      setTopPlayers(
        snap.docs.map((d) => {
          const data = d.data() as {
            displayName?: string;
            uid?: string;
            score?: number;
            photoURL?: string;
          };
          return {
            displayName: data.displayName?.trim() || data.uid || "Unknown",
            score: data.score ?? 0,
            photoURL: data.photoURL,
          };
        })
      );
    }
    loadGlobal();
  }, []);

  useEffect(() => {
    if (!user) {
      setMyPerformances([]);
      return;
    }
    const uid = user.uid;

    async function loadMine() {
      const q = query(collection(db, "games"), where("uid", "==", uid));
      const snap = await getDocs(q);
      const best = snap.docs
        .map((d) => {
          const data = d.data() as {
            aura?: string;
            score?: number;
          };
          return {
            aura: data.aura || "Unknown Aura",
            score: data.score ?? 0,
          };
        })
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      setMyPerformances(best);
    }
    loadMine();
  }, [user]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Auth unavailable");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Sign‑in failed");
    } finally {
      setLoading(false);
    }
  };

  const startQuest = async () => {
    if (!theme) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      if (!res.ok) throw new Error(await res.text());
      const generated = (await res.json()) as GeneratedStage[];

      const customStages: FullStage[] = [
        generated[0], // riddle
        generated[1], // shape
        staticMazeStage, // hard‑coded maze
        generated[2], // quiz
      ];

      console.log("🔍 Final stages:", customStages);
      sessionStorage.setItem("dynamicStages", JSON.stringify(customStages));
      router.push("/game");
    } catch (err) {
      const e = err as Error;
      console.error(e);
      setError("Failed to craft quest");
    } finally {
      setGenerating(false);
    }
  };

  if (!user) {
    return (
      <section className="panel blue full-screen">
        <div className="inner stack" style={{ textAlign: "center" }}>
          <h1 className="big">Spidey&apos;s Arcade</h1>
          <p>Welcome to Spidey&apos;s Arcade, let&apos;s play!</p>
          <button
            className="comics-button sign-in"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in with Google"}
          </button>
          {error && <div className="comics-dialog">{error}</div>}
        </div>
      </section>
    );
  }

  return (
    <div className="whole-container panel blue compact">
      <section>
        <div className="inner stack">
          <div className="comics-dialog">
            <p>
              Welcome back, {user.displayName || user.email}!<br />
              Type your favorite show, movie, or anime to generate a quest:
            </p>
          </div>
          <input
            type="text"
            className="comics-input"
            placeholder="e.g. Naruto, Marvel, One Piece…"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            disabled={generating}
            autoFocus
          />
          <button
            className="comics-button begin-btn"
            onClick={startQuest}
            disabled={!theme || generating}
          >
            {generating ? "Crafting Quest…" : "Begin Your Quest"}
          </button>
          {error && <div className="comics-dialog">{error}</div>}
        </div>
      </section>

      <br />

      <section>
        <div className="inner leaderboard-container">
          <div className="leaderboard">
            <h3>🏅 Top Players</h3>
            <ol style={{ listStyle: "none", padding: 0 }}>
              {topPlayers.map((p, i) => (
                <li
                  key={i}
                  className="comics-dialog comics-dialog-li"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {p.photoURL && (
                    <Image
                      src={p.photoURL}
                      alt={p.displayName}
                      width={32}
                      height={32}
                      className="rounded-full"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <span>{p.displayName}</span>
                  <strong style={{ marginLeft: "auto" }}>{p.score}</strong>
                </li>
              ))}
            </ol>
          </div>
          <div className="leaderboard">
            <h3>🔥 Your Aura Levels</h3>
            <ol style={{ listStyle: "none", padding: 0 }}>
              {myPerformances.map((m, i) => (
                <li
                  key={i}
                  className="comics-dialog comics-dialog-li"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span>{m.aura}</span>
                  <strong style={{ marginLeft: "auto" }}>{m.score}</strong>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
