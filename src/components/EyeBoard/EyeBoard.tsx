import { useCallback, useRef, useState } from 'react';
import { Canvas } from '../Canvas';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from './EyeBoard.constants';
import { Point } from '../../classes/Point';
import { ContainLevels, Eye } from '../../classes/Eye';
import { setCanvasCursor } from '../../utils/draw';

const { INNER_CONTAIN, MARGIN_CONTAIN, NO_CONTAIN } = ContainLevels;

interface EyeBoardProps {
  width: number;
  height: number;
  eyes: Eye[];
  animated?: boolean;
  debug?: boolean;
  addToEyes: (newEye: Eye) => void;
}

const CONTAIN_LEVEL_TO_CURSOR: Record<ContainLevels, string> = {
  [INNER_CONTAIN]: 'grab',
  [MARGIN_CONTAIN]: 'col-resize',
  [NO_CONTAIN]: 'default',
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

  const updateCurrentEye = useCallback((): Eye | undefined => {
    // if there is already a current eye, avoid looping through eye list
    if (currentEye?.contains(mousePos)) return currentEye;

    // else, loop through eye list
    const foundEye = eyes.find((eye) => eye.contains(mousePos));
    setCurrentEye(foundEye);
    return foundEye;
  }, [mousePos, eyes, currentEye])

  const drawDebugView = useCallback((ctx: CanvasRenderingContext2D) => {
    const currentEye = updateCurrentEye();
    currentEye?.debug(ctx);
    setCanvasCursor(ctx, CONTAIN_LEVEL_TO_CURSOR[currentEye?.detailedContains(mousePos) ?? NO_CONTAIN])
  }, [updateCurrentEye, mousePos])

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

    setMousePos(newMousePos);

    if (!isMouseDown) return;

    const containLevel = currentEye?.detailedContains(mousePos);
    if (containLevel === MARGIN_CONTAIN) {
      currentEye?.resize(newMousePos)
    } else if (containLevel === INNER_CONTAIN) {
      currentEye?.move(newMousePos);
    }

  }, [isMouseDown, currentEye, mousePos]);

  const onClick = useCallback(
    ({ clientX, clientY }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!isMouseDown && !currentEye) {
        const rect = canvasRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
        addToEyes(new Eye(new Point(clientX - rect.left, clientY - rect.top)));
      }
    },
    [addToEyes, currentEye, isMouseDown, canvasRef.current],
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
