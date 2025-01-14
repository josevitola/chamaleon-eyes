import { Theme } from '../styles';
import { setAlphaToHex } from '../utils/styles';
import { Point } from './Point';
import { Rect } from './Rect';

const { BLACK, WHITE, PINK } = Theme.Colors;

export enum ContainLevels {
  MARGIN_CONTAIN = 'MARGIN',
  INNER_CONTAIN = 'INNER',
  NO_CONTAIN = 'NONE',
}

export class ControlBox extends Rect {
  static DEFAULT_MARGIN = 20;

  drawBoundaries(ctx: CanvasRenderingContext2D) {
    ctx.save();
    super.draw(ctx, { fillColor: BLACK, strokeColor: WHITE, dashed: true });
    ctx.restore();
    this.drawCorners(ctx);
  }

  getMargin(): Rect {
    return this.toExpanded(ControlBox.DEFAULT_MARGIN, ControlBox.DEFAULT_MARGIN);
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

  detailedContains(point: Point): ContainLevels {
    return super.contains(point)
      ? ContainLevels.INNER_CONTAIN
      : this.getMargin().contains(point)
      ? ContainLevels.MARGIN_CONTAIN
      : ContainLevels.NO_CONTAIN;
  }

  contains(point: Point): boolean {
    return this.getMargin().contains(point) || super.contains(point);
  }
}
