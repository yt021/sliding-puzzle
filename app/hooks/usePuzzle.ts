import { useCallback, useEffect, useMemo, useState } from "react";
import { playRandomMoveSound, playWinSounds } from "../lib/audio";
import {
  createInitialBoard,
  formatTime,
  getNeighbors,
  isSolved,
  shuffleSolvable,
  solveBoard,
  WIN_FLASH_CLASSES
} from "../lib/puzzle";
import { useInterval } from "./useInterval";

const MOVE_ANIMATION_MS = 60;

export function usePuzzle(gridSize: number) {
  const initialBoard = useMemo(() => createInitialBoard(gridSize), [gridSize]);
  const [board, setBoard] = useState<number[]>(initialBoard);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerFlashing, setIsTimerFlashing] = useState(false);
  const [winFlashIndex, setWinFlashIndex] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [solutionMoves, setSolutionMoves] = useState<number[]>([]);
  // Allow the solver up through 5x5; larger boards would be too slow for the current heuristic.
  const canAutoSolve = gridSize <= 5;

  const emptyIndex = useMemo(() => board.indexOf(0), [board]);
  const movableIndexes = useMemo(() => getNeighbors(emptyIndex, gridSize), [emptyIndex, gridSize]);
  const winClass = hasWon ? WIN_FLASH_CLASSES[winFlashIndex] : "";
  const timeLabel = formatTime(secondsElapsed);

  useInterval(() => setSecondsElapsed((prev) => prev + 1), running ? 1000 : null);
  useInterval(() => setIsTimerFlashing((prev) => !prev), running ? 1000 : null);
  useInterval(() => setWinFlashIndex((prev) => (prev + 1) % WIN_FLASH_CLASSES.length), hasWon ? 333 : null);

  useEffect(() => {
    if (!running) setIsTimerFlashing(false);
  }, [running]);

  useEffect(() => {
    if (!hasWon) setWinFlashIndex(0);
  }, [hasWon]);

  useEffect(() => {
    setBoard(initialBoard);
    setSecondsElapsed(0);
    setStarted(false);
    setRunning(false);
    setHasWon(false);
    setIsTimerFlashing(false);
    setIsSolving(false);
    setSolutionMoves([]);
    setIsThinking(false);
  }, [initialBoard]);

  useEffect(() => {
    if (!isSolving) return;
    if (solutionMoves.length === 0) {
      setIsSolving(false);
      return;
    }

    const timeout = setTimeout(() => {
      const nextMove = solutionMoves[0];
      let solved = false;
      setBoard((prev) => {
        const emptyPos = prev.indexOf(0);
        const nextBoard = [...prev];
        [nextBoard[emptyPos], nextBoard[nextMove]] = [nextBoard[nextMove], nextBoard[emptyPos]];
        solved = isSolved(nextBoard);
        return nextBoard;
      });
      setSolutionMoves((moves) => moves.slice(1));
      if (solved) {
        setHasWon(true);
        setRunning(false);
        setIsSolving(false);
        playWinSounds();
      }
    }, MOVE_ANIMATION_MS);

    return () => clearTimeout(timeout);
  }, [isSolving, solutionMoves]);

  useEffect(() => {
    if (!started || hasWon) return;
    if (!isSolved(board)) return;
    setHasWon(true);
    setRunning(false);
    setIsSolving(false);
    setSolutionMoves([]);
    playWinSounds();
  }, [board, hasWon, started]);

  const moveTile = useCallback(
    (index: number) => {
      if (!started || hasWon || isSolving || isThinking) return;
      let didMove = false;
      let solved = false;

      setBoard((prev) => {
        const emptyPos = prev.indexOf(0);
        const neighbors = getNeighbors(emptyPos, gridSize);
        if (!neighbors.includes(index)) return prev;

        const nextBoard = [...prev];
        [nextBoard[emptyPos], nextBoard[index]] = [nextBoard[index], nextBoard[emptyPos]];
        didMove = true;
        solved = isSolved(nextBoard);
        return nextBoard;
      });

      if (!didMove) return;
      playRandomMoveSound();
      if (solved) {
        setHasWon(true);
        setRunning(false);
        setIsSolving(false);
        playWinSounds();
      }
    },
    [gridSize, hasWon, isSolving, isThinking, started]
  );

  const handleStartReset = useCallback(() => {
    if (!started) {
      const shuffled = shuffleSolvable(gridSize);
      setBoard(shuffled);
      setSecondsElapsed(0);
      setStarted(true);
      setRunning(true);
      setHasWon(false);
      setIsSolving(false);
      setSolutionMoves([]);
      return;
    }

    setBoard(initialBoard);
    setSecondsElapsed(0);
    setStarted(false);
    setRunning(false);
    setHasWon(false);
    setIsTimerFlashing(false);
    setIsSolving(false);
    setSolutionMoves([]);
  }, [gridSize, initialBoard, started]);

  const handleSolve = useCallback(() => {
    if (!started || hasWon || isSolving || !canAutoSolve) return;
    setIsThinking(true);
    const solution = solveBoard(board, gridSize);
    setIsThinking(false);
    if (!solution) return;
    if (solution.length === 0) {
      setHasWon(true);
      setRunning(false);
      playWinSounds();
      return;
    }
    setSolutionMoves(solution);
    setIsSolving(true);
    setRunning(true);
  }, [board, canAutoSolve, gridSize, hasWon, isSolving, started]);

  const handleDirectionalMove = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!started || hasWon || isSolving) return;
      const row = Math.floor(emptyIndex / gridSize);
      const col = emptyIndex % gridSize;
      let target: number | null = null;
      if (direction === "up" && row < gridSize - 1) target = emptyIndex + gridSize;
      if (direction === "down" && row > 0) target = emptyIndex - gridSize;
      if (direction === "left" && col < gridSize - 1) target = emptyIndex + 1;
      if (direction === "right" && col > 0) target = emptyIndex - 1;
      if (target !== null) moveTile(target);
    },
    [emptyIndex, gridSize, hasWon, moveTile, started]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "w"].includes(key)) {
        event.preventDefault();
        handleDirectionalMove("up");
      }
      if (["arrowdown", "s"].includes(key)) {
        event.preventDefault();
        handleDirectionalMove("down");
      }
      if (["arrowleft", "a"].includes(key)) {
        event.preventDefault();
        handleDirectionalMove("left");
      }
      if (["arrowright", "d"].includes(key)) {
        event.preventDefault();
        handleDirectionalMove("right");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDirectionalMove]);

  return {
    board,
    started,
    hasWon,
    isTimerFlashing,
    winClass,
    timeLabel,
    movableIndexes,
    moveTile,
    handleStartReset
  };
}
