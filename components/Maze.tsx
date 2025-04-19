"use client";
import React, { useState } from "react";

type Props = {
  description: string;
  grid: number[][]; 
  start: [number, number];
  exit: [number, number];
  hint: string;
  hintsRemaining: number;
  onComplete: () => void;
  onWrong: () => void;
  onUseHint: () => void;
};

export default function Maze({
  description,
  grid,
  start,
  exit,
  hint,
  hintsRemaining,
  onComplete,
  onWrong,
  onUseHint,
}: Props) {
  const [path, setPath] = useState<[number, number][]>([start]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showMines, setShowMines] = useState(false);

  const handleCellClick = (r: number, c: number) => {
    const [pr, pc] = path[path.length - 1];
    if (Math.abs(pr - r) + Math.abs(pc - c) !== 1 || feedback) return;

    const cell = grid[r][c];
    if (cell === 2) {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        onWrong();
        setPath([start]);
      }, 800);
      return;
    }
    if (cell === 1) {
      setPath([start]);
      return;
    }

    const newPath = [...path, [r, c] as [number, number]];
    setPath(newPath);

    if (r === exit[0] && c === exit[1]) {
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        onComplete();
      }, 800);
    }
  };

  const handleHint = () => {
    if (hintsRemaining > 0 && !showMines) {
      onUseHint();
      setShowMines(true);
      setTimeout(() => setShowMines(false), 2000);
    }
  };

  return (
    <div className="maze-container">
      <section className="panel blue">
        <div className="inner stack">
          <div className="comics-thought">
            <p>{description}</p>
            <p>
              <em>Hint:</em> {hint}
            </p>
          </div>
          <br />

          <div
            className="maze-grid"
            style={{ gridTemplateColumns: `repeat(${grid[0].length}, 48px)` }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isPath = path.some(([pr, pc]) => pr === r && pc === c);
                const isExit = r === exit[0] && c === exit[1];

                let cls = "";
                if (cell === 1) cls = "void-cell";
                if (isPath) cls = "path-cell";
                if (isExit) cls = "exit-cell";
                if (showMines && cell === 2) cls = "mine-cell";

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`maze-cell ${cls}`}
                    onClick={() => handleCellClick(r, c)}
                  >
                    {isExit}
                  </div>
                );
              })
            )}
          </div>

          <button
            className="comics-hint"
            onClick={handleHint}
            disabled={hintsRemaining === 0 || showMines}
          >
            Reveal Mines ({hintsRemaining})
          </button>
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
