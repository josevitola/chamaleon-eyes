import { Theme } from '../styles';
import { setAlphaToHex } from '../utils/styles';
import { Rect } from './Rect';

const { BLACK, WHITE, PINK } = Theme.Colors;

export class ControlBox {
  plane: Rect;

  static DEFAULT_MARGIN = 10;

  constructor(plane: Rect) {
    this.plane = plane;
  }

  drawBoundaries(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.plane.draw(ctx, { fillColor: BLACK, strokeColor: WHITE, dashed: true });
    ctx.restore();

    this.plane.drawCorners(ctx);
  }

  getMargin(): Rect {
    return this.plane.toExpanded(ControlBox.DEFAULT_MARGIN, ControlBox.DEFAULT_MARGIN);
  }

  drawMargin(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.getMargin().draw(ctx, {
      fillColor: setAlphaToHex(PINK, 0.3),
      withStroke: false,
      dashed: false,
    });
    ctx.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawMargin(ctx);
    this.drawBoundaries(ctx);
  }
}
