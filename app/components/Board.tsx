import { Tile } from "./Tile";

type BoardProps = {
  board: number[];
  gridSize: number;
  movableIndexes: number[];
  onTileClick: (index: number) => void;
};

export function Board({ board, gridSize, movableIndexes, onTileClick }: BoardProps) {
  return (
    <div className="board" aria-label="Sliding puzzle">
      {board.map((value, idx) => {
        const row = Math.floor(idx / gridSize);
        const col = idx % gridSize;
        const movable = movableIndexes.includes(idx);
        return <Tile key={value} value={value} row={row} col={col} movable={movable} onClick={() => onTileClick(idx)} />;
      })}
    </div>
  );
}
