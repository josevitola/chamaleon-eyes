type PointLabelConfig = Partial<{
  label: string;
  showText: boolean;
  fillColor: string;
  fontSize: number;
}>;

const DEFAULT_CONFIG: Required<PointLabelConfig> = {
  label: '',
  fillColor: 'white',
  fontSize: 10,
  showText: true,
};

export class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other = new Point()) {
    const dx = this.x - other.x,
      dy = this.y - other.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  moveX(dx: number): Point {
    this.x += dx;
    return this;
  }

  moveY(dy: number): Point {
    this.y += dy;
    return this;
  }

  toMoved(dx: number, dy: number): Point {
    return this.copy().move(dx, dy);
  }

  move(dx: number, dy: number): Point {
    return this.moveX(dx).moveY(dy);
  }

  label(ctx: CanvasRenderingContext2D, config?: PointLabelConfig) {
    const { x, y } = this;
    const { fontSize, showText, fillColor, label } = { ...DEFAULT_CONFIG, ...config };

    ctx.save();
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(x, y, Math.floor(fontSize / 2), 0, Math.PI * 2);
    ctx.fill();
    if (showText)
      ctx.fillText(`${label ? `${label}:` : ''}(${~~x}, ${~~y})`, x + fontSize, y + fontSize);
    ctx.restore();
  }

  copy(): Point {
    return new Point(this.x, this.y);
  }
}
