'use client';

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Board } from "./components/Board";
import { Controls } from "./components/Controls";
import { TimerHeader } from "./components/TimerHeader";
import { DEFAULT_GRID_SIZE } from "./lib/puzzle";
import { usePuzzle } from "./hooks/usePuzzle";

export default function Home() {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);

  const sizingVars = useMemo(
    () => ({
      ["--grid-size" as string]: gridSize
    }),
    [gridSize]
  ) as CSSProperties;

  const {
    board,
    started,
    hasWon,
    isTimerFlashing,
    winClass,
    timeLabel,
    movableIndexes,
    moveTile,
    handleStartReset
  } = usePuzzle(gridSize);

  return (
    <main className="page" style={sizingVars}>
      <TimerHeader timeLabel={timeLabel} hasWon={hasWon} winClass={winClass} isTimerFlashing={isTimerFlashing} />

      <Board board={board} gridSize={gridSize} movableIndexes={movableIndexes} onTileClick={moveTile} />

      <Controls
        started={started}
        gridSize={gridSize}
        onStartReset={handleStartReset}
        onChangeGridSize={setGridSize}
      />
    </main>
  );
}
