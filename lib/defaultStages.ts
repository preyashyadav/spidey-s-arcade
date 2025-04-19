import type { MazeStage } from "./gameData";

export const hardcodedMaze: MazeStage = {
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
