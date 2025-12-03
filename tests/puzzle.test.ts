import { describe, expect, it } from "vitest";
import {
  createInitialBoard,
  DEFAULT_GRID_SIZE,
  countInversions,
  getNeighbors,
  INITIAL_BOARD,
  isSolvable,
  isSolved,
  shuffleSolvable,
  solveBoard
} from "../app/lib/puzzle";

describe("puzzle helpers", () => {
  it("detects solved board", () => {
    expect(isSolved(INITIAL_BOARD)).toBe(true);
  });

  it("builds correct initial boards for selectable sizes", () => {
    expect(createInitialBoard(3)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    const initial5 = createInitialBoard(5);
    expect(initial5).toHaveLength(25);
    expect(initial5.at(-1)).toBe(0);
  });

  it("counts inversions correctly", () => {
    const board = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 0];
    expect(countInversions(board)).toBe(1);
  });

  it("computes neighbors within grid bounds", () => {
    expect(getNeighbors(0, DEFAULT_GRID_SIZE).sort()).toEqual([1, 4]);
    expect(getNeighbors(5, DEFAULT_GRID_SIZE).sort()).toEqual([1, 4, 6, 9]);
    expect(getNeighbors(15, DEFAULT_GRID_SIZE).sort()).toEqual([11, 14]);
  });

  it("creates solvable shuffled boards", () => {
    const attempts = Array.from({ length: 10 }, () => shuffleSolvable(4));
    attempts.forEach((board) => {
      expect(board).toHaveLength(16);
      expect(isSolvable(board, 4)).toBe(true);
      expect(isSolved(board)).toBe(false);
    });
  });

  it("shuffles solvable boards for other grid sizes", () => {
    [3, 5].forEach((size) => {
      const board = shuffleSolvable(size);
      expect(board).toHaveLength(size * size);
      expect(isSolvable(board, size)).toBe(true);
      expect(isSolved(board)).toBe(false);
    });
  });

  it("computes a path that solves the puzzle", () => {
    const almostSolved = [...INITIAL_BOARD];
    [almostSolved[14], almostSolved[15]] = [almostSolved[15], almostSolved[14]];
    const solution = solveBoard(almostSolved);
    expect(solution && solution.length).toBeTruthy();

    const finalBoard = solution!.reduce((state, moveIndex) => {
      const empty = state.indexOf(0);
      const next = [...state];
      [next[empty], next[moveIndex]] = [next[moveIndex], next[empty]];
      return next;
    }, almostSolved);

    expect(isSolved(finalBoard)).toBe(true);
  });
});
