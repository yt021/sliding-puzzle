'use client';

const difficultyOptions = [
  { value: 3, label: "3 x 3" },
  { value: 4, label: "4 x 4" },
  { value: 5, label: "5 x 5" }
];

type SettingsMenuProps = {
  gridSize: number;
  onChangeGridSize: (size: number) => void;
};

export function SettingsMenu({ gridSize, onChangeGridSize }: SettingsMenuProps) {
  return (
    <div className="settings always-open" role="region" aria-label="Game settings">
      <div className="settings-panel" aria-label="Game settings panel">
        <div className="settings-row">
          <span className="settings-label">Difficulty</span>
          <div className="pill-group" aria-label="Difficulty options">
            {difficultyOptions.map((option) => (
              <button
                key={option.label}
                className={`pill ${gridSize === option.value ? "active" : ""}`}
                onClick={() => onChangeGridSize(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
