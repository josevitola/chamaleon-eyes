import { arc } from '../utils/draw';
import { mapRange } from '../utils/mapRange';
import { Point } from './Point';

type EyeConfig = {
  lineWidth?: number;
  color?: string;
  debugMode?: boolean;
};

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

export class Eye {
  x: number;
  y: number;
  r: number;
  R: number;

  color: string;
  lineWidth: number;
  debugMode: boolean;

  startPoint: Point;
  arcPoint: Point;
  endPoint: Point;

  blinking: BlinkingModes;

  static THETA = Math.PI / 2;
  static BLINK_SPEED = 2;
  static NUM_PUPILS = 3;

  static DEFAULT_CONFIG = {
    lineWidth: 5,
    color: 'orange',
    debugMode: false,
  };

  /** Eyelids need an additional angle in order to actually intersect.
   * Not sure why. */
  static MAGIC_EYELID_RADIUS_FACTOR = 0.93;
  static MAGIC_CORNER_FACTOR = 1.05;

  constructor(x: number, y: number, r: number, config: EyeConfig) {
    const { color, debugMode, lineWidth } = {
      ...Eye.DEFAULT_CONFIG,
      ...config,
    };

    this.x = x;
    this.y = y;
    this.r = r;

    this.color = color;
    this.lineWidth = lineWidth;
    this.debugMode = debugMode;

    this.R = Math.round((3 * r) / (1 - Math.cos(Eye.THETA)));

    const eyeCornerDist =
      this.R * Math.sin(Eye.THETA / 2) * Eye.MAGIC_CORNER_FACTOR;

    this.startPoint = new Point(-eyeCornerDist, 0);
    this.arcPoint = new Point(0, r * -2);
    this.endPoint = new Point(eyeCornerDist, 0);

    this.blinking = BlinkingModes.IDLE;
  }

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.translate(this.x, this.y);
  }

  drawPupils(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig) {
    const { r, startPoint } = this;
    const { x, y } = followConfig.point ?? new Point();

    const mapX =
      -1 *
      (mapRange(x, [0, followConfig.windowWidth], [0, 2 * startPoint.x]) -
        startPoint.x);

    const mapY =
      mapRange(y, [0, followConfig.windowHeight], [0, 2 * this.r]) - this.r;

    // draw concentric circles
    [...Array(Eye.NUM_PUPILS).keys()].forEach((i) => {
      const logFactor = Math.log(i + 2) / Math.log(Eye.NUM_PUPILS + 1);
      arc(ctx, mapX, mapY, r * logFactor, 0, Math.PI * 2);
    });

    arc(ctx, mapX, mapY, r * 0.1, 0, 2 * Math.PI);
  }

  fillEyelid(ctx: CanvasRenderingContext2D, dir = LidDirections.UP) {
    const { arcPoint, startPoint, endPoint, lineWidth, r, R } = this;

    const iy = r + lineWidth * 3;
    const dirFactor = dir === LidDirections.UP ? -1 : 1;

    ctx.beginPath();
    ctx.moveTo(arcPoint.x, iy * dirFactor);
    ctx.lineTo(startPoint.x, iy * dirFactor);
    ctx.lineTo(startPoint.x, startPoint.y);

    if (this.debugMode) ctx.fillStyle = 'blue';

    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.arcTo(
      arcPoint.x,
      arcPoint.y * dirFactor * -1,
      endPoint.x,
      endPoint.y,
      R * Eye.MAGIC_EYELID_RADIUS_FACTOR
    );
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.lineTo(endPoint.x, iy * dirFactor);
    ctx.lineTo(arcPoint.x, iy * dirFactor);
    ctx.fill();
  }

  drawEyelidArc(ctx: CanvasRenderingContext2D, dir = LidDirections.UP) {
    const { arcPoint, startPoint, endPoint, R } = this;

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.arcTo(
      arcPoint.x,
      arcPoint.y * (dir === LidDirections.UP ? 1 : -1),
      endPoint.x,
      endPoint.y,
      R * Eye.MAGIC_EYELID_RADIUS_FACTOR
    );
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
  }

  drawEyelids(ctx: CanvasRenderingContext2D) {
    const { debugMode } = this;

    ctx.save();

    // different colors in case of debugging
    if (debugMode) {
      ctx.strokeStyle = 'lightblue';
      ctx.fillStyle = 'lightgreen';
    }

    // draw upper eyelid
    this.fillEyelid(ctx, LidDirections.UP);
    this.drawEyelidArc(ctx, LidDirections.UP);

    // draw lower eyelid
    this.fillEyelid(ctx, LidDirections.DOWN);
    this.drawEyelidArc(ctx, LidDirections.DOWN);

    // draw arc point
    if (debugMode) {
      ctx.fillStyle = 'lightblue';
      this.arcPoint.label(ctx);
    }

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

    this.drawPupils(ctx, {
      point: new Point(0, 0),
      windowHeight: 2,
      windowWidth: 2,
      ...followConfig,
    });
    this.drawEyelids(ctx);

    ctx.restore();
  }
}
