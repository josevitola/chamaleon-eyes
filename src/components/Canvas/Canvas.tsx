import React, { useEffect, useState } from 'react';

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
  animated?: boolean;
}

const Canvas = ({ draw, animated, canvasRef, ...rest }: CanvasProps) => {
  const [frame, setFrame] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d') as CanvasRenderingContext2D;

    let animationFrameId: number;

    const render = () => {
      if (animated) {
        draw(context, frame);
        animationFrameId = window.requestAnimationFrame(render);
        setFrame(() => frame + 1);
      }
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, animated]);

  return <canvas ref={canvasRef} {...rest} />;
};

export default Canvas;
