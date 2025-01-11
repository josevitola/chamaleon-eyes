import { Point } from './Point';

export class Area {
  startPoint: Point;
  endPoint: Point;

  constructor(startPoint: Point, endPoint: Point) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
  }

  contains(point: Point): boolean {
    const containsX = point.x <= this.startPoint.x && point.x >= this.endPoint.x;
    const containsY = point.y <= this.startPoint.y && point.y >= this.endPoint.y;
    console.log(point.x - this.startPoint.x);
    return containsX && containsY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const distX = this.endPoint.x - this.startPoint.x,
      distY = this.endPoint.y - this.startPoint.y;

    ctx.beginPath();
    ctx.setLineDash([7, 7]);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.rect(this.startPoint.x, this.startPoint.y, distX, distY);
    ctx.stroke();
    this.startPoint.label(ctx);
    this.endPoint.label(ctx);

    ctx.closePath();
  }
}
