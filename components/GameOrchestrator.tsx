"use client";

import { useState, useEffect } from "react";
import type {
  Stage,
  RiddleStage,
  ShapeStage,
  MazeStage,
  QuizStage,
} from "../lib/gameData";
import RiddleMCQ from "./RiddleMCQ";
import ShapeMatcher from "./ShapeMatcher";
import Maze from "./Maze";
import Quiz from "./Quiz";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

function computeScore(
  livesLeft: number,
  hintsLeft: number,
  timeSeconds: number
): number {
  const maxLives = 3,
    maxHints = 2,
    maxTime = 3000,
    minTimeFactor = 0.1;
  const lifeScore = livesLeft / maxLives;
  const hintScore = hintsLeft / maxHints;
  const rawTime = Math.min(timeSeconds, maxTime);
  const timeScore =
    minTimeFactor + (1 - minTimeFactor) * (1 - rawTime / maxTime);

  const wLives = 0.5,
    wHints = 0.2,
    wTime = 0.3;
  return Math.round(
    (lifeScore * wLives + hintScore * wHints + timeScore * wTime) * 1000
  );
}

function getAuraLabel(livesLeft: number, hintsLeft: number): string {
  if (livesLeft === 3 && hintsLeft === 2) return "in God Mode";
  if (livesLeft === 3 && hintsLeft === 1) return "Resourceful Adept";
  if (livesLeft === 3 && hintsLeft === 0) return "a Master Scout";
  if (livesLeft === 2 && hintsLeft === 2) return "an Efficient Pathfinder";
  if (livesLeft === 2 && hintsLeft === 1) return "a Seasoned Explorer";
  if (livesLeft === 2 && hintsLeft === 0) return "a Veteran Wanderer";
  if (livesLeft === 1 && hintsLeft === 2) return "a Risk Taker";
  if (livesLeft === 1 && hintsLeft === 1) return "Fearless Adventurer";
  if (livesLeft === 1 && hintsLeft === 0) return "a Brave Survivor";
  return "Adventurer";
}

function getAuraReason(livesLeft: number, hintsLeft: number): string {
  const lost = 3 - livesLeft;
  const used = 2 - hintsLeft;
  if (lost === 0 && used === 0) {
    return "You lost no lives and used no hints—you mastered every challenge flawlessly.";
  }
  const parts = [];
  if (lost > 0) parts.push(`lost ${lost} ${lost === 1 ? "life" : "lives"}`);
  if (used > 0) parts.push(`used ${used} ${used === 1 ? "hint" : "hints"}`);
  return `You ${parts.join(" and ")}, earning you this aura.`;
}

interface Props {
  initialStages: Stage[];
}

export default function GameOrchestrator({ initialStages }: Props) {
  const [dynamicStages] = useState<Stage[]>(initialStages);
  const [stage, setStage] = useState(0);
  const [lives, setLives] = useState(3);
  const [hints, setHints] = useState(2);
  const [gameId, setGameId] = useState<string | null>(null);

  const [score, setScore] = useState<number | null>(null);
  const [aura, setAura] = useState<string | null>(null);
  const [scoreRecorded, setScoreRecorded] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("gameStart")) {
      sessionStorage.setItem("gameStart", Date.now().toString());
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    const user = auth.currentUser;
    if (!user) return;
    const id = `${user.uid}_${Date.now()}`;
    setGameId(id);
    setDoc(doc(db, "games", id), {
      uid: user.uid,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      startedAt: serverTimestamp(),
      currentStage: 0,
      lives: 3,
      hints: 2,
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (lives <= 0 || stage >= dynamicStages.length) {
      sessionStorage.setItem("gameEnd", Date.now().toString());
    }
  }, [lives, stage, dynamicStages.length]);

  useEffect(() => {
    if (gameId && stage >= dynamicStages.length && !scoreRecorded) {
      const startMs = parseInt(sessionStorage.getItem("gameStart") ?? "0", 10);
      const endMs = parseInt(
        sessionStorage.getItem("gameEnd") ?? Date.now().toString(),
        10
      );
      const timeSec = Math.max(0, (endMs - startMs) / 1000);

      const sc = computeScore(lives, hints, timeSec);
      const ar = getAuraLabel(lives, hints);

      setScore(sc);
      setAura(ar);

      updateDoc(doc(db, "games", gameId), {
        score: sc,
        aura: ar,
        finishedAt: serverTimestamp(),
      }).catch(console.error);

      setScoreRecorded(true);
    }
  }, [stage, gameId, lives, hints, scoreRecorded, dynamicStages.length]);

  const next = () => {
    setStage((s) => {
      const ns = s + 1;
      if (gameId) updateDoc(doc(db, "games", gameId), { currentStage: ns });
      return ns;
    });
  };
  const loseLife = () => {
    setLives((l) => {
      const nl = l - 1;
      if (gameId) updateDoc(doc(db, "games", gameId), { lives: nl });
      return nl;
    });
  };
  const useHint = () => {
    if (hints === 0) return;
    setHints((h) => {
      const nh = h - 1;
      if (gameId) updateDoc(doc(db, "games", gameId), { hints: nh });
      return nh;
    });
  };

  const clearSession = () => {
    sessionStorage.removeItem("gameStart");
    sessionStorage.removeItem("gameEnd");
    sessionStorage.removeItem("dynamicStages");
  };
  const restart = () => {
    clearSession();
    window.location.href = "/game";
  };
  const returnHome = () => {
    clearSession();
    window.location.href = "/";
  };

  if (lives <= 0) {
    return (
      <section className="panel red">
        <div className="inner stack" style={{ textAlign: "center" }}>
          <div className="comics-dialog">
            <h2 className="big">💥 Game Over</h2>
          </div>
          <div className="answers-grid">
            <div className="comics-button" onClick={restart}>
              Restart Quest
            </div>
            <div className="comics-button" onClick={returnHome}>
              Return Home
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (stage >= dynamicStages.length) {
    return (
      <section className="panel green">
        <div className="inner stack" style={{ textAlign: "center" }}>
          <div className="comics-dialog">
            <h2 className="big">GGWP!🙌</h2>
          </div>
          <div className="comics-hint">
            <p>
              You are <strong>{aura}</strong> (Aura +{score} 🐦‍🔥)
            </p>
            <p>
              <em>{getAuraReason(lives, hints)}</em>
            </p>
          </div>
          <div className="answers-grid">
            <div className="comics-button" onClick={returnHome}>
              Return Home
            </div>
          </div>
        </div>
      </section>
    );
  }

  const s = dynamicStages[stage];
  return (
    <section className="panel">
      <div className="inner" style={{ position: "relative" }}>
        <div className="small-nav">
          <div className="comics-hint live-hint">
            <span>❤️ {lives}</span>
          </div>
          <div className="comics-hint hint-button">
            <span>🧠 {hints}</span>
          </div>
        </div>
        <div className="stack" style={{ paddingTop: "2rem" }}>
          {s.type === "riddle" && (
            <RiddleMCQ
              {...(s as RiddleStage)}
              onComplete={next}
              onWrong={loseLife}
            />
          )}
          {s.type === "shape" && (
            <ShapeMatcher
              {...(s as ShapeStage)}
              onComplete={next}
              onWrong={loseLife}
            />
          )}
          {s.type === "maze" && (
            <Maze
              {...(s as MazeStage)}
              onComplete={next}
              onWrong={loseLife}
              hintsRemaining={hints}
              onUseHint={useHint}
            />
          )}
          {s.type === "quiz" && (
            <Quiz
              {...(s as QuizStage)}
              onComplete={next}
              onWrong={loseLife}
              onUseHint={useHint}
              hintsRemaining={hints}
            />
          )}
        </div>
      </div>
    </section>
  );
}
