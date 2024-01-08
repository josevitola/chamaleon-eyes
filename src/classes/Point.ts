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

  label(ctx: CanvasRenderingContext2D, label = '', offset = { x: 0, y: -10 }) {
    console.log(':(');
    const { x, y } = this;
    const { x: offsetX, y: offsetY } = offset;

    ctx.save();
    ctx.font = '10px Arial';
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(
      `${label ? `${label}:` : ''}(${~~x}, ${~~y})`,
      x + offsetX,
      y + offsetY
    );
    ctx.restore();
  }
}
