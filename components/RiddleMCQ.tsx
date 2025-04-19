"use client";
import { useState } from "react";
import type { RiddleStage } from "../lib/gameData";

type Props = RiddleStage & {
  onComplete: () => void;
  onWrong: () => void;
};

export default function RiddleMCQ({
  description,
  question,
  options,
  answer,
  onComplete,
  onWrong,
}: Props) {
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const handle = (k: "A" | "B" | "C") => {
    if (k === answer) {
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        onComplete();
      }, 800);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        onWrong();
      }, 800);
    }
  };

  return (
    <div className="riddle-container">
      <section className="panel blue">
        <div className="inner stack">
          <div className="comics-thought">
            <p>{description}</p>
            <br />
            <h4>{question}</h4>
          </div>
          <div className="answers-grid">
            {(["A", "B", "C"] as const).map((k) => (
              <div
                key={k}
                className="comics-dialog comics-dialog-answer"
                onClick={() => handle(k)}
                role="button"
              >
                <h4>
                  <strong className="pink">{k}.</strong>{" "}
                  <span className="orange">{options[k]}</span>
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

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
