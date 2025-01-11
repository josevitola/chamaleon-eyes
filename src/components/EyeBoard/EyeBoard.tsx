import { useCallback, useEffect, useState } from "react";
import { Canvas } from "../Canvas";
import {
  DEFAULT_BLINK_PROB,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
} from "./EyeBoard.constants";
import { Point } from "../../classes/Point";
import { Eye } from "../../classes/Eye";

interface EyeBoardProps {
  initialEyes?: Eye[];
  width: number;
  height: number;
  animated?: boolean;
  debug?: boolean;
}

export const EyeBoard = ({
  animated,
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
  debug,
}: EyeBoardProps) => {
  const [mousePos, setMousePos] = useState<Point>(() =>
    new Point(width / 2, height / 2)
  );

  const [eyes, setEyes] = useState<Eye[]>([]);

  const drawEyes = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      ctx.fillStyle = "#242424";
      ctx.fillRect(0, 0, width, height);

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

        if (debug) eye.drawBox(ctx, { mousePos });
      });

      if (debug && mousePos) {
        mousePos.label(ctx);
      }
    },
    [mousePos, eyes]
  );

  const addToEyes = useCallback((newEye: Eye) => {
    setEyes([...eyes, newEye]);
  }, [eyes])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

    setMousePos(p);
  }, []);

  const onClick = useCallback(({ clientX, clientY }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    addToEyes(new Eye(clientX, clientY));
  }, []);

  return (
    <div style={{ border: "1px solid darkgray" }}>
      <Canvas
        animated={animated}
        width={width}
        height={height}
        draw={drawEyes}
        onMouseMove={onMouseMove}
        onClick={onClick}
      />
    </div>
  );
};
