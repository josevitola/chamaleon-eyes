import { useCallback, useContext, useState } from "react";
import { Canvas } from "../Canvas";
import {
  DEFAULT_BLINK_PROB,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
} from "./ChamaleonEyes.constants";
import { Point } from "../../classes/Point";
import { Eye } from "../../classes/Eye";
import { AppContext } from "../../App.context";

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
      ctx.fillStyle = "#242424";
      ctx.fillRect(0, 0, width, height);
    },
    [width, height]
  );

  const updateEyeByDragging = useCallback((ctx: CanvasRenderingContext2D, eye: Eye) => {
    if (isDebugEnabled) {
      eye.drawBox(ctx, mousePos);
      eye.updateCursor(ctx, mousePos);

      if (mouseDown) {
        if (eye.isHovered(ctx, mousePos) && !isDragging) {
          eye.onDragStart(ctx, mousePos);
          setIsDragging(true);
        }
        if (eye.dragMode) {
          eye.onDrag(mousePos);
          setIsDragging(true);
        }
      } else if (!mouseDown && eye.dragMode) {
        setIsDragging(false);
        eye.onDragEnd();
      }
    }
  }, [isDebugEnabled, mouseDown, mousePos]);

  const drawEyes = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
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

        updateEyeByDragging(ctx, eye);
      });
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
    <div style={{ border: "1px solid darkgray" }}>
      <Canvas
        animation={isAnimationEnabled}
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

export default ChamaleonEyes;
