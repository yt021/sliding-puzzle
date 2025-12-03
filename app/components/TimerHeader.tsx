type HeaderProps = {
  timeLabel: string;
  hasWon: boolean;
  winClass: string;
  isTimerFlashing: boolean;
};

export function TimerHeader({ timeLabel, hasWon, winClass, isTimerFlashing }: HeaderProps) {
  return (
    <div className="header" aria-live="polite" role="status">
      <h1 className={`yes ${!hasWon ? "hidden" : ""} ${winClass}`}>YES!</h1>
      <h1 className={`yes2 ${!hasWon ? "hidden" : ""} ${winClass}`}>You Win!</h1>
      <h1 className={`timer ${hasWon ? "small-timer" : ""} ${isTimerFlashing ? "timer-flashing" : ""}`}>
        {timeLabel}
      </h1>
    </div>
  );
}
