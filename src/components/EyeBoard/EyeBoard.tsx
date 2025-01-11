import { useCallback, useState } from 'react';
import { Canvas } from '../Canvas';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from './EyeBoard.constants';
import { Point } from '../../classes/Point';
import { Eye } from '../../classes/Eye';

interface EyeBoardProps {
  width: number;
  height: number;
  eyes: Eye[];
  animated?: boolean;
  debug?: boolean;
  addToEyes: (newEye: Eye) => void;
}

export const EyeBoard = ({
  animated,
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
  debug,
  eyes,
  addToEyes,
}: EyeBoardProps) => {
  const [mousePos, setMousePos] = useState<Point>(() => new Point(width / 2, height / 2));

  const drawEyes = useCallback((ctx: CanvasRenderingContext2D, frame: number) => {
    eyes.forEach((eye) => {
      if (frame > 50) {
        eye.blinkRandomly();
      }

      eye.draw(ctx, {
        point: mousePos,
        windowHeight: height,
        windowWidth: width,
      });

      // if (debug) {
      if (eye.contains(mousePos)) {
        eye.drawDebug(ctx);
      }
    });
  }, [eyes, mousePos, debug])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      ctx.fillStyle = '#242424';
      ctx.fillRect(0, 0, width, height);

      drawEyes(ctx, frame);

      if (debug && mousePos) {
        mousePos.label(ctx);
      }
    },
    [mousePos, debug, drawEyes],
  );

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

    setMousePos(p);
  }, []);

  const onClick = useCallback(
    ({ clientX, clientY }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      addToEyes(new Eye(clientX, clientY));
    },
    [addToEyes],
  );

  return (
    <div style={{ border: '1px solid darkgray' }}>
      <Canvas
        animated={animated}
        width={width}
        height={height}
        draw={draw}
        onMouseMove={onMouseMove}
        onClick={onClick}
      />
    </div>
  );
};
