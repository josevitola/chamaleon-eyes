export const arc = (
  context: CanvasRenderingContext2D,
  ...params: Parameters<CanvasPath['arc']>
) => {
  context.beginPath();
  context.arc(...params);
  context.stroke();
  context.closePath();
};

export const setCanvasCursor = (ctx: CanvasRenderingContext2D, newCursor: string) => {
  ctx.canvas.style.cursor = newCursor;
};
