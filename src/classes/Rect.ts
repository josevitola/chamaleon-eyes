import { Point } from './Point';

type DrawConfig = Partial<{
  dashed: boolean;
  fillColor: string;
  strokeColor: string;
  withCorners: boolean;
  withStroke: boolean;
}>;

export class Rect {
  center: Point;
  a: number;
  b: number;

  static DEFAULT_DRAW_CONFIG: Required<DrawConfig> = {
    dashed: true,
    withCorners: false,
    withStroke: true,
    fillColor: 'white',
    strokeColor: 'white',
  };

  constructor(center: Point, a: number, b: number) {
    this.center = center;
    this.a = Math.abs(a);
    this.b = Math.abs(b);
  }

  contains(point: Point): boolean {
    const containsX = Math.abs(point.x - this.center.x) <= this.a / 2;
    const containsY = Math.abs(point.y - this.center.y) <= this.b / 2;
    return containsX && containsY;
  }

  draw(ctx: CanvasRenderingContext2D, config?: DrawConfig) {
    const { dashed, fillColor, strokeColor, withCorners, withStroke } = {
      ...Rect.DEFAULT_DRAW_CONFIG,
      ...config,
    };

    ctx.beginPath();
    if (dashed) ctx.setLineDash([7, 7]);
    ctx.rect(this.getUpperLeft().x, this.getUpperLeft().y, this.a, this.b);

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
    this.getUpperLeft().label(ctx);
    this.getDownRight().label(ctx);
  }

  copy(): Rect {
    return new Rect(this.center.copy(), this.a, this.b);
  }

  toExpanded(da: number, db: number): Rect {
    return new Rect(this.center, this.a + da, this.b + db);
  }

  moveX(dx: number): Rect {
    this.center.moveX(dx);
    return this;
  }

  moveY(dy: number): Rect {
    this.center.moveY(dy);
    return this;
  }

  toMoved(dx: number, dy: number): Rect {
    return this.copy().move(dx, dy);
  }

  move(dx: number, dy: number): Rect {
    return this.moveX(dx).moveY(dy);
  }

  getUpperLeft(): Point {
    return new Point(this.center.x - this.a / 2, this.center.y - this.b / 2);
  }

  getDownRight(): Point {
    return new Point(this.center.x + this.a / 2, this.center.y + this.b / 2);
  }

  changeWidth(newA: number): Rect {
    this.a = newA;
    return this;
  }

  scaleY(factor: number) {
    this.b *= factor;
  }
}
