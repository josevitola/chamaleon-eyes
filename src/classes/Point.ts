export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other = { x: 0, y: 0 }) {
    const dx = this.x - other.x,
      dy = this.y - other.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  label(ctx: CanvasRenderingContext2D, i = 'p', offset = { x: 0, y: -20 }) {
    const { x, y } = this;
    const { x: offsetX, y: offsetY } = offset;
    ctx.font = '20px Arial';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`${i}:(${~~x}, ${~~y})`, x + offsetX, y + offsetY);
  }
}
