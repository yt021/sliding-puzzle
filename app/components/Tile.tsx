type TileProps = {
  value: number;
  row: number;
  col: number;
  movable: boolean;
  onClick: () => void;
};

export function Tile({ value, row, col, movable, onClick }: TileProps) {
  const isEmpty = value === 0;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!movable || isEmpty) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const positionStyle: React.CSSProperties = {
    ["--tile-x" as string]: `calc(${col} * (var(--size) + var(--gap)))`,
    ["--tile-y" as string]: `calc(${row} * (var(--size) + var(--gap)))`
  };

  return (
    <div
      className={`tile ${isEmpty ? "empty" : ""} ${movable && !isEmpty ? "movable" : ""}`}
      onClick={movable && !isEmpty ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={isEmpty ? "Empty tile" : `Tile ${value}`}
      aria-disabled={!movable || isEmpty}
      tabIndex={movable && !isEmpty ? 0 : -1}
      style={positionStyle}
    >
      {!isEmpty && <span>{value}</span>}
    </div>
  );
}
