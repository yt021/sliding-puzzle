import { SettingsMenu } from "./SettingsMenu";

type ControlsProps = {
  started: boolean;
  gridSize: number;
  onStartReset: () => void;
  onChangeGridSize: (size: number) => void;
};

export function Controls({ started, gridSize, onStartReset, onChangeGridSize }: ControlsProps) {
  return (
    <div className="controls" aria-label="Game controls">
      <button className="btn" onClick={onStartReset}>
        {started ? "Reset" : "Start"}
      </button>
      <div className="controls-settings">
        <SettingsMenu gridSize={gridSize} onChangeGridSize={onChangeGridSize} />
      </div>
    </div>
  );
}
