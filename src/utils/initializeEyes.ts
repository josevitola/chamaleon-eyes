import { Eye } from '../classes/Eye';

const RADIUS = 25;
const ROWS = 1,
  COLS = 1;
const LINE_WIDTH = 2;

export function initializeEyes(width: number, height: number) {
  const eyes: Eye[] = [];

  for (let i = 1; i < ROWS + 1; i++) {
    for (let j = 1; j < COLS + 1; j++) {
      const x = ((2 * i - 1) * width) / (2 * ROWS),
        y = ((2 * j - 1) * height) / (2 * COLS);

      eyes.push(
        new Eye(x, y, RADIUS, { lineWidth: LINE_WIDTH, debugMode: false })
      );
    }
  }

  return eyes;
}
