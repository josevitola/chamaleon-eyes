import { useCallback, useRef, useState } from 'react';
import { Canvas } from '../Canvas';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from './EyeBoard.constants';
import { Point } from '../../classes/Point';
import { Eye } from '../../classes/Eye';
import { setCanvasCursor } from '../../utils/draw';

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
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<Point>(() => new Point(width / 2, height / 2));
  const [currentEye, setCurrentEye] = useState<Eye>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    });

    if (debug) {
      const currentEye = getCurrentEye();

      if (currentEye) {
        getCurrentEye()?.debug(ctx);
        setCanvasCursor(ctx, 'move');
      } else {
        setCanvasCursor(ctx, 'default');
      }
    }
  }, [eyes, mousePos, debug]);

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

  const getCurrentEye = useCallback((): Eye | undefined => {
    // if there is already a current eye, avoid looping through eye list --
    // check if it still contains the mouse position
    if (currentEye?.contains(mousePos)) return currentEye;

    // else, loop through eye list
    const foundEye = eyes.find((eye) => eye.contains(mousePos));
    setCurrentEye(foundEye);
    return foundEye;
  }, [mousePos, eyes, currentEye])

  const moveCurrentEye = useCallback((newPos: Point) => {
    if (isMouseDown) {
      currentEye?.move(newPos);
    }
  }, [isMouseDown, currentEye])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

    setMousePos(p);
    moveCurrentEye(p);
  }, [moveCurrentEye]);

  const onClick = useCallback(
    ({ clientX, clientY }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!currentEye) {
        const rect = canvasRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
        addToEyes(new Eye(new Point(clientX - rect.left, clientY - rect.top)));
      }
    },
    [addToEyes, currentEye, canvasRef.current],
  );

  const onMouseDown = useCallback(() => {
    setIsMouseDown(true);
  }, []);

  const onMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  return (
    <div style={{ border: '1px solid darkgray' }}>
      <Canvas
        canvasRef={canvasRef}
        animated={animated}
        width={width}
        height={height}
        draw={draw}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onClick={onClick}
      />
    </div>
  );
};
