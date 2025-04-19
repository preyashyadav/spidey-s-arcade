"use client";

import { useState } from "react";
import type { RiddleStage } from "../lib/gameData";

type MCQ = {
  type: "mcq";
  question: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  answer: string;
  hint: string;
};
type Short = {
  type: "short";
  question: string;
  answer: string;
  hint: string;
};
type Question = MCQ | Short;

type Props = {
  description: string;
  questions: Question[];
  onComplete: () => void;
  onWrong: () => void;
  onUseHint: () => void;
  hintsRemaining: number;
};

export default function Quiz({
  description,
  questions,
  onComplete,
  onWrong,
  onUseHint,
  hintsRemaining,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);

  const q = questions[idx];

  const handleAnswer = (choice: string) => {
    const correct =
      q.type === "mcq"
        ? choice === (q as MCQ).answer
        : choice.trim().toLowerCase() === (q as Short).answer.toLowerCase();

    if (correct) {
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        if (idx + 1 === questions.length) onComplete();
        else {
          setIdx(idx + 1);
          setInput("");
          setShowHint(false);
        }
      }, 800);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        onWrong();
      }, 800);
    }
  };

  const handleHint = () => {
    if (hintsRemaining > 0 && !showHint) {
      onUseHint();
      setShowHint(true);
    }
  };

  return (
    <div className="riddle-container">
      {/* Description + Question */}
      <section className="panel blue">
        <div className="inner stack">
          <div className="comics-thought">
            <p>{description}</p>
            <br />
            <h4>{`Q${idx + 1}: ${q.question}`}</h4>
          </div>

          {/* MCQ Choices */}
          {q.type === "mcq" ? (
            <div className="answers-grid">
              {Object.entries((q as MCQ).options).map(([key, opt]) => (
                <div
                  key={String(key)}
                  className="comics-dialog comics-dialog-answer"
                  onClick={() => handleAnswer(key)}
                  role="button"
                >
                  <h4>
                    <strong className="pink">{key}.</strong>{" "}
                    <span className="orange">{opt}</span>
                  </h4>
                </div>
              ))}
            </div>
          ) : (
            /* Short‑answer input */
            <div className="comics-dialog">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAnswer(input);
                }}
                placeholder="Type your answer…"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  fontFamily: "var(--comic-font)",
                }}
              />
              <button
                className="comics-button"
                onClick={() => handleAnswer(input)}
                style={{ marginTop: "0.5rem" }}
              >
                Submit
              </button>
            </div>
          )}

          {/* Hint Button */}
          <div style={{ textAlign: "right" }}>
            <button
              onClick={handleHint}
              disabled={hintsRemaining <= 0 || showHint}
              className="comics-button"
            >
              {showHint ? "Hint Used" : `Use Hint (${hintsRemaining})`}
            </button>
            {showHint && (
              <p
                style={{ fontStyle: "italic", marginTop: "0.5rem" }}
                className="comics-hint"
              >
                Hint: {(q as MCQ | Short).hint}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Feedback Overlay */}
      {feedback && (
        <div className="feedback-overlay">
          {feedback === "correct" ? (
            <svg viewBox="0 0 160 60">
              <defs>
                <filter id="outline">
                  <feMorphology
                    operator="dilate"
                    in="SourceAlpha"
                    radius="1.5"
                  />
                  <feComposite in="SourceGraphic" />
                </filter>
              </defs>
              <text
                x="20"
                y="50"
                filter="url(#outline)"
                fill="yellow"
                fontFamily="BadaboomBB"
                fontSize="60"
              >
                GG!!
              </text>
            </svg>
          ) : (
            <svg viewBox="0 0 160 60">
              <defs>
                <filter id="shadow">
                  <feConvolveMatrix
                    order="4,4"
                    kernelMatrix="
                      1 0 0 0
                      0 1 0 0
                      0 0 1 0
                      0 0 0 1"
                    in="SourceAlpha"
                    result="bevel"
                  />
                  <feOffset dx="1" dy="1" in="bevel" result="offset" />
                  <feMerge>
                    <feMergeNode in="offset" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <text
                x="30"
                y="50"
                fontFamily="BadaboomBB"
                fontSize="50"
                filter="url(#shadow)"
                fill="red"
              >
                OOPS!!
              </text>
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
