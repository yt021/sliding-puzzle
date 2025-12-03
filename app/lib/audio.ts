const tilesPath = "/Assets/sounds/tiles";
const winPath = "/Assets/sounds/win";
let masterVolume = 0.5;

function tryPlay(src: string, volume: number) {
  if (typeof Audio === "undefined") return;
  const audio = new Audio(src);
  audio.volume = Math.min(1, Math.max(0, volume));
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function setMasterVolume(volume: number) {
  masterVolume = Math.min(1, Math.max(0, volume));
}

export function getMasterVolume() {
  return masterVolume;
}

export function playRandomMoveSound() {
  const soundIndex = Math.floor(Math.random() * 9) + 1;
  tryPlay(`${tilesPath}/t${soundIndex}.wav`, masterVolume);
}

export function playWinSounds() {
  tryPlay(`${winPath}/w1.mp3`, masterVolume);
  tryPlay(`${winPath}/w2.mp3`, masterVolume * 0.8);
  // Chain the last hit after the first finishes for a nicer cadence.
  if (typeof Audio === "undefined") return;
  const final = new Audio(`${winPath}/w3.mp3`);
  final.volume = masterVolume;
  final.currentTime = 0;
  const starter = new Audio(`${winPath}/w1.mp3`);
  starter.volume = masterVolume;
  starter.onended = () => void final.play().catch(() => {});
  void starter.play().catch(() => {});
}
