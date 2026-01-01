import { useCallback, useContext, useState } from 'react';
import { Box, Canvas } from '@/atoms';
import {
  DEFAULT_BLINK_PROB,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
} from './EyesCanvas.constants';
import { Eye, Point } from '@/models';
import { AppContext } from '@/App.context';
import { Colors } from '@/styles';

interface EyesCanvasProps {
  eyesById: Map<string, Eye>;
  width: number;
  height: number;
  onEyeChange: (eye: Eye) => void;
}

const EyesCanvas = ({
  eyesById,
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
  onEyeChange,
}: EyesCanvasProps) => {
  const { isAnimationEnabled, isDebugEnabled, selectEye } =
    useContext(AppContext);
  const [mouseDown, setMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState<Point>(
    new Point(width / 2, height / 2)
  );

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = Colors.BACKGROUND;
      ctx.fillRect(0, 0, width, height);
    },
    [width, height]
  );

  const shouldApplyMouseEventsToEye = useCallback(
    (ctx: CanvasRenderingContext2D, eye: Eye): boolean => {
      if (!isDebugEnabled) {
        return false;
      }

      let isHovered = eye.isHovered(ctx, mousePos);

      if (isHovered) {
        eye.updateCursor(ctx, mousePos);
        eye.drawBox(ctx, mousePos);
      }

      if (mouseDown) {
        if (isHovered && !isDragging) {
          eye.onDragStart(ctx, mousePos);
          setIsDragging(true);
        }

        if (eye.dragMode) {
          eye.onDrag(mousePos);
          onEyeChange(eye);
        }
      } else if (eye.dragMode) {
        setIsDragging(false);
        eye.onDragEnd();
        onEyeChange(eye);
      }

      return isHovered;
    },
    [isDebugEnabled, mouseDown, mousePos, onEyeChange]
  );

  const drawEyes = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      let hovered = false;

      eyesById.forEach((eye) => {
        if (frame > 50) {
          if (Math.random() < DEFAULT_BLINK_PROB) {
            eye.startBlinking();
          }

          eye.updateBlink();
        }

        eye.draw(ctx, {
          point: mousePos,
          windowHeight: height,
          windowWidth: width,
        });

        hovered = shouldApplyMouseEventsToEye(ctx, eye) || hovered;
      });

      if (!hovered) {
        ctx.canvas.style.cursor = '';
      }
    },
    [eyesById, mousePos, height, width, isDebugEnabled]
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      drawBackground(ctx);
      drawEyes(ctx, frame);
    },
    [drawBackground, drawEyes]
  );

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

    setMousePos(p);
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setMouseDown(true);
      const canvas = e.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

      let selectedEye = null;

      eyesById.forEach((eye) => {
        if (eye.isHovered(canvas.getContext('2d')!, p)) {
          selectedEye = eye;
        }
      });

      selectEye(selectedEye);
    },
    [eyesById, selectEye]
  );

  const onMouseUp = useCallback(() => {
    setMouseDown(false);
  }, []);

  return (
    <Box>
      <Canvas
        animation={isAnimationEnabled}
        width={width}
        height={height}
        draw={draw}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      ></Canvas>
    </Box>
  );
};

export default EyesCanvas;
