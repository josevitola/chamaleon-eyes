import { Eye } from '../models/Eye';

interface InitializeEyesParams {
  width: number;
  height: number;
  radius: number;
  rows: number;
  cols: number;
  lineWidth: number;
}

export function initializeEyes({
  cols,
  height,
  lineWidth,
  radius,
  rows,
  width,
}: InitializeEyesParams) {
  const eyes: Eye[] = [];

  for (let i = 1; i < rows + 1; i++) {
    for (let j = 1; j < cols + 1; j++) {
      const x = ((2 * i - 1) * width) / (2 * rows),
        y = ((2 * j - 1) * height) / (2 * cols);

      eyes.push(new Eye(x, y, radius, { lineWidth, id: `eye-${i}-${j}` }));
    }
  }

  return eyes;
}
