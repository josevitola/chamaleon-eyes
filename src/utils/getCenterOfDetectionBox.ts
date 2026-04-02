import { FaceDetection } from 'face-api.js';
import { Point } from '@/models';

export const getCenterOfDetectionBox = (detection: FaceDetection | undefined) => {
  if (!detection) {
    return new Point(-1, -1);
  }

  const { x, y, width, height } = detection.box;
  return new Point(x + width / 2, y + height / 2);
};
