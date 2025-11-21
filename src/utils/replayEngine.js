// src/utils/replayEngine.js
export function createSimpleReplay(series = [], stepMs = 600, onStep = () => {}) {
  let idx = 0;
  let timer = null;
  let speed = stepMs;

  function start() {
    if (!series || series.length === 0) {
      onStep([]);
      return;
    }
    stop();
    timer = setInterval(() => {
      idx++;
      if (idx > series.length) {
        stop();
        return;
      }
      onStep(series.slice(0, idx));
    }, speed);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function reset() {
    stop();
    idx = 0;
    onStep([]);
  }

  function setSpeed(ms) {
    speed = ms;
    if (timer) {
      stop();
      start();
    }
  }

  return { start, stop, reset, setSpeed };
}
