import React, { useRef, useEffect, useState } from "react";

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
  animation?: boolean;
}

const Canvas = ({ draw, animation, ...rest }: CanvasProps) => {
  const [frame, setFrame] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") as CanvasRenderingContext2D;

    let animationFrameId: number;

    const render = () => {
      if (animation) {
        draw(context, frame);
        animationFrameId = globalThis.requestAnimationFrame(render);
        setFrame(() => frame + 1);
      }
    };

    render();

    return () => {
      globalThis.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, animation]);

  return <canvas ref={canvasRef} {...rest} />;
};

export default Canvas;
