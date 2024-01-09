import { useCallback, useMemo, useState } from "react";
import { Canvas } from "../Canvas";
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "./ChamaleonEyes.constants";
import { Point } from "../../classes/Point";
import { initializeEyes } from "../../utils/initializeEyes";

interface ChamaleonEyesProps {
  width: number;
  height: number;
  animated?: boolean;
}

const ChamaleonEyes = ({
  animated,
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
}: ChamaleonEyesProps) => {
  const eyes = useMemo(() => initializeEyes(width, height), [width, height]);

  const [mousePos, setMousePos] = useState<Point>(
    new Point(width / 2, height / 2)
  );

  const drawEyes = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      ctx.fillStyle = "#242424";
      ctx.fillRect(0, 0, width, height);

      eyes.forEach((eye) => {
        if (frame > 50) {
          if (Math.random() < 0.003) {
            eye.startBlinking();
          }

          eye.updateBlink();
        }

        eye.draw(ctx, {
          point: mousePos,
          windowHeight: height,
          windowWidth: width,
        });
      });

      if (mousePos) {
        mousePos.label(ctx);
      }
    },
    [mousePos]
  );

  const debugDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "orange";
  }, []);

  const drawCover = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#242424";
    ctx.fillRect(0, 0, width, height);

    eyes.forEach((eye) => {
      eye.drawEyelids(ctx);
    });

    if (mousePos) {
      mousePos.label(ctx);
    }
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

    setMousePos(p);
  }, []);

  return (
    <div
      style={{
        border: "1px solid darkgray",
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <Canvas
        style={{ position: "absolute", zIndex: 1, top: 0, left: 0 }}
        animated={animated}
        width={width}
        height={height}
        draw={drawEyes}
        onMouseMove={onMouseMove}
      />

      <Canvas
        style={{ position: "absolute", zIndex: 0, top: 0, left: 0 }}
        animated={animated}
        width={width}
        height={height}
        draw={drawCover}
        onMouseMove={onMouseMove}
      />
    </div>
  );
};

export default ChamaleonEyes;
