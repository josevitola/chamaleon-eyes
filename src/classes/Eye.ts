import { Theme } from '../styles';
import { arc } from '../utils/draw';
import { mapRange } from '../utils/mapRange';
import { ControlBox } from './ControlBox';
import { Rect } from './Rect';
import { Point } from './Point';

const { PINK } = Theme.Colors;

type EyeConfig = Partial<{
  lineWidth: number;
  color: string;
  pupilRadius: number;
}>;

type EyeFollowConfig = {
  point: Point | undefined;
  windowWidth: number;
  windowHeight: number;
};

enum BlinkingModes {
  IDLE = 'IDLE',
  OPENING = 'OPENING',
  CLOSING = 'CLOSING',
}

enum LidDirections {
  UP = 'UP',
  DOWN = 'DOWN',
}

type EyelidConfig = {
  dir: LidDirections;
};

export enum ContainLevels {
  MARGIN_CONTAIN = 'MARGIN',
  INNER_CONTAIN = 'INNER',
  NO_CONTAIN = 'NONE',
}

export class Eye {
  center: Point;
  r: number;
  R: number;

  color: string;
  lineWidth: number;

  leftCorner: Point;
  arcPoint: Point;
  rightCorner: Point;

  blinking: BlinkingModes;

  static THETA = Math.PI / 2;
  static BLINK_SPEED = 2;
  static NUM_PUPILS = 3;

  static DEFAULT_PUPIL_RADIUS = 30;

  static DEFAULT_CONFIG: Required<EyeConfig> = {
    lineWidth: 5,
    color: PINK,
    pupilRadius: Eye.DEFAULT_PUPIL_RADIUS,
  };

  static DEFAULT_EYELID_CONFIG: EyelidConfig = {
    dir: LidDirections.UP,
  };

  /** Eyelids need an additional angle in order to actually intersect.
   * Not sure why. */
  static MAGIC_EYELID_RADIUS_FACTOR = 0.93;
  static MAGIC_CORNER_FACTOR = 1.05;
  static DEFAULT_BLINK_PROB = 0.003;

  constructor(center: Point, config = Eye.DEFAULT_CONFIG) {
    const { color, pupilRadius, lineWidth } = {
      ...Eye.DEFAULT_CONFIG,
      ...config,
    } as Required<EyeConfig>;

    this.center = center;
    this.r = pupilRadius;
    this.color = color;
    this.lineWidth = lineWidth;

    this.R = Math.round((3 * this.r) / (1 - Math.cos(Eye.THETA)));

    const eyeCornerDist = this.R * Math.sin(Eye.THETA / 2) * Eye.MAGIC_CORNER_FACTOR;

    this.leftCorner = new Point(-eyeCornerDist, 0);
    this.arcPoint = new Point(0, this.r * -2);
    this.rightCorner = new Point(eyeCornerDist, 0);

    this.blinking = BlinkingModes.IDLE;
  }

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.translate(this.center.x, this.center.y);
  }

  __drawContourArc(ctx: CanvasRenderingContext2D) {
    const { leftCorner, arcPoint, rightCorner, R } = this;
    ctx.moveTo(leftCorner.x, leftCorner.y);
    ctx.arcTo(
      arcPoint.x,
      arcPoint.y,
      rightCorner.x,
      rightCorner.y,
      R * Eye.MAGIC_EYELID_RADIUS_FACTOR,
    );
    ctx.lineTo(rightCorner.x, rightCorner.y);
  }

  drawContour(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    this.__drawContourArc(ctx);
    ctx.rotate(Math.PI);
    this.__drawContourArc(ctx);
    ctx.clip();
    ctx.stroke();
    ctx.closePath();
    ctx.rotate(Math.PI);
  }

  drawPupils(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig) {
    const { r, center, leftCorner } = this;
    const { x, y } = followConfig.point ?? new Point();

    ctx.save();
    ctx.resetTransform();
    ctx.translate(center.x, center.y);

    const mapX = -1 * mapRange(x - center.x, [0, followConfig.windowWidth], [0, leftCorner.x]);

    const mapY = mapRange(y - center.y, [0, followConfig.windowHeight], [0, this.r]);

    // draw concentric circles
    [...Array(Eye.NUM_PUPILS).keys()].forEach((i) => {
      const logFactor = Math.log(i + 2) / Math.log(Eye.NUM_PUPILS + 1);
      arc(ctx, mapX, mapY, r * logFactor, 0, Math.PI * 2);
    });

    arc(ctx, mapX, mapY, r * 0.1, 0, 2 * Math.PI);
    ctx.restore();
  }

  startBlinking() {
    const { IDLE, OPENING } = BlinkingModes;

    if (this.blinking === IDLE) this.blinking = OPENING;
  }

  updateBlink() {
    const { r } = this;
    const { y } = this.arcPoint;
    const { CLOSING, IDLE, OPENING } = BlinkingModes;

    if (this.blinking === OPENING) {
      if (y < 0) this.arcPoint.y += Eye.BLINK_SPEED;
      else this.blinking = CLOSING;
    } else if (this.blinking === CLOSING) {
      if (Math.abs(y) <= r * 2) this.arcPoint.y -= Eye.BLINK_SPEED;
      else this.blinking = IDLE;
    }
  }

  draw(ctx: CanvasRenderingContext2D, followConfig?: EyeFollowConfig) {
    ctx.save();

    this.setupContext(ctx);

    this.drawContour(ctx);
    this.drawPupils(ctx, {
      point: new Point(0, 0),
      windowHeight: 2,
      windowWidth: 2,
      ...followConfig,
    });

    ctx.restore();
  }

  getPlane(): Rect {
    const { x, y } = this.center;
    return new Rect(
      this.leftCorner.toMoved(x, y).moveY(-this.r),
      this.rightCorner.toMoved(x, y).moveY(this.r),
    );
  }

  getMargin(): Rect {
    return this.getPlane().toExpanded(7, 7);
  }

  detailedContains(point: Point): ContainLevels {
    return this.getPlane().contains(point)
      ? ContainLevels.INNER_CONTAIN
      : this.getMargin().contains(point)
      ? ContainLevels.MARGIN_CONTAIN
      : ContainLevels.NO_CONTAIN;
  }

  contains(point: Point): boolean {
    return this.getMargin().contains(point) || this.getPlane().contains(point);
  }

  marginContains(point: Point) {
    return this.getMargin().contains(point) && !this.contains(point);
  }

  blinkRandomly() {
    if (Math.random() < Eye.DEFAULT_BLINK_PROB) {
      this.startBlinking();
    }

    this.updateBlink();
  }

  drawControlBox(ctx: CanvasRenderingContext2D) {
    new ControlBox(this.getPlane()).draw(ctx);
  }

  debug(ctx: CanvasRenderingContext2D) {
    this.drawControlBox(ctx);
  }

  move(newPos: Point) {
    this.center.x = newPos.x;
    this.center.y = newPos.y;
  }

  resize(newPos: Point) {
    console.log(newPos);
  }
}
