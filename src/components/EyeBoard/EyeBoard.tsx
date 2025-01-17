import { useCallback, useRef, useState } from 'react';
import { Canvas } from '../Canvas';
import { CONTAIN_LEVEL_TO_CURSOR, DEFAULT_HEIGHT, DEFAULT_WIDTH } from './EyeBoard.constants';
import { Point } from '../../classes/Point';
import { Eye } from '../../classes/Eye';
import { setCanvasCursor } from '../../utils/draw';
import { ContainLevels } from '../../classes/ControlBox';

const { NO_CONTAIN } = ContainLevels;

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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<Point>(() => new Point(width / 2, height / 2));
  const [currentEye, setCurrentEye] = useState<Eye>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculateCurrentEye = useCallback(() => {
    // if there is already a current eye, avoid looping through eye list
    if (currentEye?.contains(mousePos)) return currentEye;

    // else, loop through eye list
    const foundEye = eyes.find((eye) => eye.contains(mousePos));
    setCurrentEye(foundEye);
  }, [mousePos, eyes, currentEye])

  const drawDebugView = useCallback((ctx: CanvasRenderingContext2D) => {
    calculateCurrentEye();
    currentEye?.drawControlBox(ctx);
    setCanvasCursor(ctx, CONTAIN_LEVEL_TO_CURSOR[currentEye?.detailedContains(mousePos) ?? NO_CONTAIN])
  }, [calculateCurrentEye, mousePos, currentEye])

  const drawEyes = useCallback((ctx: CanvasRenderingContext2D, frame: number) => {
    if (debug) {
      drawDebugView(ctx);
    }

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

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const newMousePos = new Point(e.clientX - rect.left, e.clientY - rect.top);

    if (isMouseDown) {
      setIsDragging(true);
      currentEye?.handleDrag(newMousePos)
    }

    setMousePos(newMousePos);
  }, [isMouseDown, currentEye, mousePos]);

  const onMouseDown = useCallback(() => {
    setIsMouseDown(true);
    currentEye?.handleMouseDown(mousePos);
  }, [currentEye, mousePos]);

  const onMouseUp = useCallback(({ clientX, clientY }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDragging && !currentEye) {
      const rect = canvasRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
      addToEyes(new Eye(new Point(clientX - rect.left, clientY - rect.top)));
    }

    currentEye?.handleMouseUp();
    setIsMouseDown(false);
    setIsDragging(false);
  }, [addToEyes, currentEye, isDragging, canvasRef.current]);

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
      />
    </div>
  );
};
