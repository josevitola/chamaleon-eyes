import { DEFAULT_EYE_RADIUS } from '../constants';
import { arc } from '../utils/draw';
import { mapRange } from '../utils/mapRange';
import { Plane } from './Plane';
import { Point } from './Point';

type EyeConfig = {
  lineWidth?: number;
  color?: string;
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

type EyelidConfig = {
  dir: LidDirections;
};

export class Eye {
  x: number;
  y: number;
  r: number;
  R: number;

  color: string = 'orange';
  lineWidth: number;

  startPoint: Point;
  arcPoint: Point;
  endPoint: Point;

  blinking: BlinkingModes;

  static THETA = Math.PI / 2;
  static BLINK_SPEED = 2;
  static NUM_PUPILS = 3;

  static DEFAULT_CONFIG: EyeConfig = {
    lineWidth: 5,
    color: 'orange',
  };

  static DEFAULT_EYELID_CONFIG: EyelidConfig = {
    dir: LidDirections.UP,
  };

  /** Eyelids need an additional angle in order to actually intersect.
   * Not sure why. */
  static MAGIC_EYELID_RADIUS_FACTOR = 0.93;
  static MAGIC_CORNER_FACTOR = 1.05;
  static DEFAULT_BLINK_PROB = 0.003;

  constructor(x: number, y: number, r = DEFAULT_EYE_RADIUS, config = Eye.DEFAULT_CONFIG) {
    const { color, lineWidth } = {
      ...Eye.DEFAULT_CONFIG,
      ...config,
    } as Required<EyeConfig>;

    this.x = x;
    this.y = y;
    this.r = r;

    this.color = color;
    this.lineWidth = lineWidth;

    this.R = Math.round((3 * r) / (1 - Math.cos(Eye.THETA)));

    const eyeCornerDist = this.R * Math.sin(Eye.THETA / 2) * Eye.MAGIC_CORNER_FACTOR;

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

  __drawContourArc(ctx: CanvasRenderingContext2D) {
    const { startPoint, arcPoint, endPoint, R } = this;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.arcTo(arcPoint.x, arcPoint.y, endPoint.x, endPoint.y, R * Eye.MAGIC_EYELID_RADIUS_FACTOR);
    ctx.lineTo(endPoint.x, endPoint.y);
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
    const { r, startPoint } = this;
    const { x, y } = followConfig.point ?? new Point();

    ctx.save();
    ctx.resetTransform();
    ctx.translate(this.x, this.y);

    const mapX = -1 * mapRange(x - this.x, [0, followConfig.windowWidth], [0, startPoint.x]);

    const mapY = mapRange(y - this.y, [0, followConfig.windowHeight], [0, this.r]);

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

  getPlane(): Plane {
    const refPoint = new Point(this.x, this.y);
    return new Plane(
      this.startPoint.translate(refPoint).translateY(-this.r),
      this.endPoint.translate(refPoint).translateY(this.r),
    );
  }

  contains(point: Point) {
    return this.getPlane().contains(point);
  }

  drawRect(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.getPlane().draw(ctx);
    ctx.restore();
  }

  blinkRandomly() {
    if (Math.random() < Eye.DEFAULT_BLINK_PROB) {
      this.startBlinking();
    }

    this.updateBlink();
  }

  debug(ctx: CanvasRenderingContext2D) {
    this.drawRect(ctx);
    // new Point(this.x, this.y).label(ctx, { fillColor: 'red', showText: false });
  }

  move(newPos: Point) {
    this.x = newPos.x;
    this.y = newPos.y;
  }
}
