import { Point } from './Point';

type DrawConfig = Partial<{
  dashed: boolean;
  fillColor: string;
  strokeColor: string;
  withCorners: boolean;
  withStroke: boolean;
}>;

export class Rect {
  startPoint: Point;
  endPoint: Point;

  static DEFAULT_DRAW_CONFIG: Required<DrawConfig> = {
    dashed: true,
    withCorners: false,
    withStroke: true,
    fillColor: 'white',
    strokeColor: 'white',
  };

  constructor(startPoint: Point, endPoint: Point) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
  }

  contains(point: Point): boolean {
    const containsX = point.x >= this.startPoint.x && point.x <= this.endPoint.x;
    const containsY = point.y >= this.startPoint.y && point.y <= this.endPoint.y;
    return containsX && containsY;
  }

  draw(ctx: CanvasRenderingContext2D, config?: DrawConfig) {
    const distX = this.endPoint.x - this.startPoint.x,
      distY = this.endPoint.y - this.startPoint.y;

    const { dashed, fillColor, strokeColor, withCorners, withStroke } = {
      ...Rect.DEFAULT_DRAW_CONFIG,
      ...config,
    };

    ctx.beginPath();
    if (dashed) ctx.setLineDash([7, 7]);
    ctx.rect(this.startPoint.x, this.startPoint.y, distX, distY);

    ctx.strokeStyle = strokeColor;

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    if (dashed || withStroke) {
      ctx.stroke();
    }

    if (withCorners) this.drawCorners(ctx);

    ctx.closePath();
  }

  drawCorners(ctx: CanvasRenderingContext2D) {
    this.startPoint.label(ctx);
    this.endPoint.label(ctx);
  }

  copy(): Rect {
    return new Rect(this.startPoint.copy(), this.endPoint.copy());
  }

  toExpanded(x: number, y: number): Rect {
    return new Rect(this.startPoint.toMoved(-x, -y), this.endPoint.toMoved(x, y));
  }
}
