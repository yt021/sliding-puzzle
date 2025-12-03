export const DEFAULT_GRID_SIZE = 4;
export const WIN_FLASH_CLASSES = ["win-flashing1", "win-flashing2", "win-flashing3"];

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const m = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const s = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${m}:${s}`;
}

export function createInitialBoard(gridSize: number = DEFAULT_GRID_SIZE) {
  const total = gridSize * gridSize;
  return Array.from({ length: total }, (_, idx) => (idx === total - 1 ? 0 : idx + 1));
}

export const INITIAL_BOARD = createInitialBoard();

export function getNeighbors(index: number, gridSize: number = DEFAULT_GRID_SIZE) {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const neighbors: number[] = [];
  if (col > 0) neighbors.push(index - 1);
  if (col < gridSize - 1) neighbors.push(index + 1);
  if (row > 0) neighbors.push(index - gridSize);
  if (row < gridSize - 1) neighbors.push(index + gridSize);
  return neighbors;
}

export function isSolved(board: number[]) {
  return board.every((value, idx) => (idx === board.length - 1 ? value === 0 : value === idx + 1));
}

export function countInversions(board: number[]) {
  const tiles = board.filter((n) => n !== 0);
  let inversions = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  return inversions;
}

export function isSolvable(board: number[], gridSize: number = DEFAULT_GRID_SIZE) {
  if (board.length !== gridSize * gridSize) return false;
  const inversions = countInversions(board);
  const emptyIndex = board.indexOf(0);
  const emptyRowFromTop = Math.floor(emptyIndex / gridSize);
  const emptyRowFromBottom = gridSize - emptyRowFromTop;
  const widthEven = gridSize % 2 === 0;

  if (!widthEven) {
    return inversions % 2 === 0;
  }

  const blankOnOddRowFromBottom = emptyRowFromBottom % 2 === 1;
  if (blankOnOddRowFromBottom) {
    return inversions % 2 === 0;
  }
  return inversions % 2 === 1;
}

export function shuffleBoard(gridSize: number = DEFAULT_GRID_SIZE): number[] {
  const arr = createInitialBoard(gridSize);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function shuffleSolvable(gridSize: number = DEFAULT_GRID_SIZE): number[] {
  let board = shuffleBoard(gridSize);
  // Reshuffle until solvable; this converges quickly for the supported sizes.
  while (!isSolvable(board, gridSize) || isSolved(board)) {
    board = shuffleBoard(gridSize);
  }
  return board;
}

function createGoalPositions(gridSize: number) {
  const total = gridSize * gridSize;
  const goalRows = Array.from({ length: total }, (_, value) =>
    value === 0 ? gridSize - 1 : Math.floor((value - 1) / gridSize)
  );
  const goalCols = Array.from({ length: total }, (_, value) => (value === 0 ? gridSize - 1 : (value - 1) % gridSize));
  return { goalRows, goalCols };
}

function manhattanDistance(board: number[], gridSize: number, goalRows: number[], goalCols: number[]) {
  let distance = 0;
  for (let i = 0; i < board.length; i++) {
    const value = board[i];
    if (value === 0) continue;
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    distance += Math.abs(row - goalRows[value]) + Math.abs(col - goalCols[value]);
  }
  return distance;
}

function canSwapWithEmpty(emptyIndex: number, delta: number, gridSize: number) {
  const row = Math.floor(emptyIndex / gridSize);
  const col = emptyIndex % gridSize;
  if (delta === -gridSize) return row > 0;
  if (delta === gridSize) return row < gridSize - 1;
  if (delta === -1) return col > 0;
  if (delta === 1) return col < gridSize - 1;
  return false;
}

/**
 * Returns the indexes (in order) that the empty slot should swap with to reach the solved state.
 * Uses IDA* with a Manhattan heuristic; tuned for up to 4x4 boards.
 */
function rowConflict(board: number[], row: number, gridSize: number, goalRows: number[], goalCols: number[]) {
  const start = row * gridSize;
  const tiles: number[] = [];
  for (let col = 0; col < gridSize; col++) {
    const value = board[start + col];
    if (value !== 0 && goalRows[value] === row) tiles.push(goalCols[value]);
  }
  let conflicts = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) conflicts++;
    }
  }
  return conflicts * 2; // each conflict adds two moves
}

function colConflict(board: number[], col: number, gridSize: number, goalRows: number[], goalCols: number[]) {
  const tiles: number[] = [];
  for (let row = 0; row < gridSize; row++) {
    const idx = row * gridSize + col;
    const value = board[idx];
    if (value !== 0 && goalCols[value] === col) tiles.push(goalRows[value]);
  }
  let conflicts = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) conflicts++;
    }
  }
  return conflicts * 2;
}

export function solveBoard(board: number[], gridSize: number = DEFAULT_GRID_SIZE, timeLimitMs: number = 5000): number[] | null {
  if (board.length !== gridSize * gridSize) return null;
  if (!isSolvable(board, gridSize)) return null;
  if (isSolved(board)) return [];

  const { goalRows, goalCols } = createGoalPositions(gridSize);
  const working = [...board];
  const path: number[] = [];
  const startEmpty = working.indexOf(0);
  let manhattan = manhattanDistance(working, gridSize, goalRows, goalCols);
  const rowConflicts = Array.from({ length: gridSize }, (_, row) => rowConflict(working, row, gridSize, goalRows, goalCols));
  const colConflicts = Array.from({ length: gridSize }, (_, col) => colConflict(working, col, gridSize, goalRows, goalCols));
  let conflicts = rowConflicts.reduce((sum, v) => sum + v, 0) + colConflicts.reduce((sum, v) => sum + v, 0);
  let bound = manhattan + conflicts;
  const deltas = [-gridSize, gridSize, -1, 1];
  const FOUND = -1;
  const TIMEOUT = -2;
  const deadline = (typeof performance !== "undefined" ? performance.now() : Date.now()) + timeLimitMs;

  const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  const search = (emptyIndex: number, g: number, prevDelta: number): number => {
    if (nowMs() > deadline) return TIMEOUT;
    const f = g + manhattan + conflicts;
    if (f > bound) return f;
    if (manhattan === 0 && conflicts === 0) return FOUND;

    let min = Number.POSITIVE_INFINITY;
    for (const delta of deltas) {
      if (delta === -prevDelta) continue; // don't undo the previous move
      if (!canSwapWithEmpty(emptyIndex, delta, gridSize)) continue;
      const swapIndex = emptyIndex + delta;

      const tile = working[swapIndex];
      const oldRow = Math.floor(swapIndex / gridSize);
      const oldCol = swapIndex % gridSize;
      const newRow = Math.floor(emptyIndex / gridSize);
      const newCol = emptyIndex % gridSize;
      const oldManhattan = Math.abs(oldRow - goalRows[tile]) + Math.abs(oldCol - goalCols[tile]);
      const newManhattan = Math.abs(newRow - goalRows[tile]) + Math.abs(newCol - goalCols[tile]);

      // Save conflict state for rows/cols we will recompute.
      const prevRowOld = rowConflicts[oldRow];
      const prevRowNew = rowConflicts[newRow];
      const prevColOld = colConflicts[oldCol];
      const prevColNew = colConflicts[newCol];

      [working[emptyIndex], working[swapIndex]] = [working[swapIndex], working[emptyIndex]];
      const rowsToUpdate = oldRow === newRow ? [oldRow] : [oldRow, newRow];
      const colsToUpdate = oldCol === newCol ? [oldCol] : [oldCol, newCol];

      manhattan = manhattan - oldManhattan + newManhattan;

      rowsToUpdate.forEach((row) => {
        conflicts -= rowConflicts[row];
        rowConflicts[row] = rowConflict(working, row, gridSize, goalRows, goalCols);
        conflicts += rowConflicts[row];
      });

      colsToUpdate.forEach((col) => {
        conflicts -= colConflicts[col];
        colConflicts[col] = colConflict(working, col, gridSize, goalRows, goalCols);
        conflicts += colConflicts[col];
      });

      path.push(swapIndex);
      const result = search(swapIndex, g + 1, delta);
      if (result === FOUND || result === TIMEOUT) return result;
      path.pop();

      // Restore heuristic state
      rowsToUpdate.forEach((row) => {
        conflicts -= rowConflicts[row];
      });
      colsToUpdate.forEach((col) => {
        conflicts -= colConflicts[col];
      });
      [working[emptyIndex], working[swapIndex]] = [working[swapIndex], working[emptyIndex]];
      rowConflicts[oldRow] = prevRowOld;
      colConflicts[oldCol] = prevColOld;
      if (newRow !== oldRow) rowConflicts[newRow] = prevRowNew;
      if (newCol !== oldCol) colConflicts[newCol] = prevColNew;
      conflicts += prevRowOld;
      if (newRow !== oldRow) conflicts += prevRowNew;
      conflicts += prevColOld;
      if (newCol !== oldCol) conflicts += prevColNew;
      manhattan = manhattan - newManhattan + oldManhattan;

      min = Math.min(min, result);
    }
    return min;
  };

  let result = startH;
  while (true) {
    result = search(startEmpty, 0, 0);
    if (result === FOUND) return [...path];
    if (result === TIMEOUT) return null;
    if (!Number.isFinite(result)) return null;
    bound = result;
    path.length = 0;
  }
}
