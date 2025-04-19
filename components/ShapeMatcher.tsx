"use client";
import React, { useState, useEffect } from "react";
import type { ShapeStage } from "../lib/gameData";

type Props = ShapeStage & {
  onComplete: () => void;
  onWrong: () => void;
};

export default function ShapeMatcher({
  description,
  shapes,
  targets,
  onComplete,
  onWrong,
}: Props) {
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);


  const [shuffledTargets, setShuffledTargets] = useState<string[]>([]);


  useEffect(() => {
    const arr = [...targets];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledTargets(arr);
  }, [targets]);


  useEffect(() => {
    if (
      Object.keys(placed).length === targets.length &&
      targets.every((t) => placed[t])
    ) {
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        onComplete();
      }, 800);
    }
  }, [placed, targets.length, onComplete]);

  const handleMatch = (target: string) => {
    if (!selected || feedback) return;


    const shapeIdx = shapes.indexOf(selected);
    const targetIdx = targets.indexOf(target);

    if (shapeIdx !== -1 && shapeIdx === targetIdx) {
      setPlaced((p) => ({ ...p, [target]: true }));
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        onWrong();
      }, 800);
    }
    setSelected(null);
  };

  return (
    <div className="shape-container" style={{ position: "relative" }}>
      <section className="panel blue">
        <div className="inner stack">
          <div className="comics-thought">
            <p>{description}</p>
          </div>


          <div className="answers-grid">
            {shapes.map((s) => {
              const isPlaced = !!placed[s];
              const isSelected = selected === s;
              return (
                <div
                  key={s}
                  className={`comics-dialog comics-dialog-answer ${
                    isPlaced ? "disabled" : isSelected ? "selected" : ""
                  }`}
                  onClick={() => !isPlaced && setSelected(s)}
                >
                  <h4>{s}</h4>
                </div>
              );
            })}
          </div>


          <div className="answers-grid">
            {shuffledTargets.map((t) => {
              const filled = placed[t];
              return (
                <div
                  key={t}
                  className="comics-dialog target-slot"
                  onClick={() => handleMatch(t)}
                >
                  <h4>{filled ? t : "?"}</h4>
                  <p className="target-name">{t}</p>
                </div>
              );
            })}
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
