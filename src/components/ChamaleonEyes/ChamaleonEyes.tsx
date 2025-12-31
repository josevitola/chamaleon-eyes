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
  const { animation, dragAndDrop } = useContext(AppContext);
  const [mousePos, setMousePos] = useState<Point>(
    new Point(width / 2, height / 2)
  );

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

        if (dragAndDrop) {
          eye.drawBox(ctx, { mousePos });
        }
      });
    },
    [mousePos, dragAndDrop]
  );

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

    setMousePos(p);
  }, []);

  return (
    <div style={{ border: "1px solid darkgray" }}>
      <Canvas
        animation={animation}
        width={width}
        height={height}
        draw={drawEyes}
        onMouseMove={onMouseMove}
      />
    </div>
  );
};

export default ChamaleonEyes;
