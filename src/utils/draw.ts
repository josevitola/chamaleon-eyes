export const arc = (
  context: CanvasRenderingContext2D,
  ...params: Parameters<CanvasPath['arc']>
) => {
  context.beginPath();
  context.arc(...params);
  context.stroke();
  context.closePath();
};
