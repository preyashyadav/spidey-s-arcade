export type RiddleStage = {
  type: "riddle";
  description: string;
  question: string;
  options: Record<"A" | "B" | "C", string>;
  answer: "A" | "B" | "C";
};

export type ShapeStage = {
  type: "shape";
  description: string;
  shapes: string[];
  targets: string[];
};

export type MazeStage = {
  type: "maze";
  description: string;
  grid: number[][];
  start: [number, number];
  exit: [number, number];
  hint: string;
};

export type QuizStage = {
  type: "quiz";
  description: string;
  questions: Array<
    | {
        type: "mcq";
        question: string;
        options: Record<"A" | "B" | "C" | "D", string>;
        answer: string;
        hint: string;
      }
    | {
        type: "short";
        question: string;
        answer: string;
        hint: string;
      }
  >;
};

export type Stage = RiddleStage | ShapeStage | MazeStage | QuizStage;

// Hard‑coded maze
export const staticMazeStage: MazeStage = {
  type: "maze",
  description:
    "Before we test your knowledge, you must first navigate the maze. The walls are lined with ancient runes, and the air is thick with the scent of magic. Beware of hidden traps and secret passages!",
  grid: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 2, 0],
    [0, 2, 0, 0, 0, 1, 0],
    [0, 0, 0, 2, 0, 2, 0],
    [1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 2, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 2],
  ],
  start: [5, 0],
  exit: [0, 6],
  hint: "Reveal mines for assistance.",
};
