import { useCallback, useContext, useState } from 'react';
import { Box, Canvas } from '@/components';
import {
  DEFAULT_BLINK_PROB,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
} from './ChamaleonEyes.constants';
import { Eye, Point } from '@/classes';
import { AppContext } from '@/App.context';

interface ChamaleonEyesProps {
  eyes: Eye[];
  width: number;
  height: number;
}

const ChamaleonEyes = ({
  eyes,
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
}: ChamaleonEyesProps) => {
  const { isAnimationEnabled, isDebugEnabled } = useContext(AppContext);
  const [mouseDown, setMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState<Point>(
    new Point(width / 2, height / 2)
  );

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#242424';
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
        }
      } else if (eye.dragMode) {
        setIsDragging(false);
        eye.onDragEnd();
      }

      return isHovered;
    },
    [isDebugEnabled, mouseDown, mousePos]
  );

  const drawEyes = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      let hovered = false;

      eyes.forEach((eye) => {
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
    [eyes, mousePos, height, width, isDebugEnabled]
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

  const onMouseDown = useCallback(() => {
    setMouseDown(true);
  }, [eyes]);

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
      />
    </Box>
  );
};

export default ChamaleonEyes;
