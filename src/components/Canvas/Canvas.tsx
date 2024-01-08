import React, { useRef, useEffect } from 'react';

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
  animated?: boolean;
}

const Canvas = ({ draw, animated, ...rest }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d') as CanvasRenderingContext2D;

    let frameCount = 0;
    let animationFrameId: number;

    const render = () => {
      if (animated) frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, animated]);

  return <canvas ref={canvasRef} {...rest} />;
};

export default Canvas;
