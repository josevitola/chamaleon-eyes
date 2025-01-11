type PointLabelConfig = {
  label: string;
  fontSize?: number;
};

const DEFAULT_CONFIG = { label: '', fontSize: 10 };

export class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other = { x: 0, y: 0 }) {
    const dx = this.x - other.x,
      dy = this.y - other.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  label(ctx: CanvasRenderingContext2D, config?: PointLabelConfig) {
    const { x, y } = this;
    const { fontSize, label } = { ...DEFAULT_CONFIG, ...config };

    ctx.save();
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, Math.floor(fontSize / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`${label ? `${label}:` : ''}(${~~x}, ${~~y})`, x + fontSize, y + fontSize);
    ctx.restore();
  }
}
