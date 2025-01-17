import { CONTAIN_LEVEL_TO_CURSOR } from '../constants';
import { Theme } from '../styles';
import { arc, setCanvasCursor } from '../utils/draw';
import { mapRange } from '../utils/mapRange';
import { ContainLevels, ControlBox } from './ControlBox';
import { Point } from './Point';

const { PINK } = Theme.Colors;

type EyeConfig = Partial<{
  lineWidth: number;
  color: string;
  pupilRadius: number;
}>;

type EyeFollowConfig = {
  point: Point;
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

enum EyeActions {
  RESIZING = 'RESIZING',
  MOVING = 'MOVING',
  NONE = 'RESIZING',
}

type DrawConfig = EyeFollowConfig & { debug: boolean };

const CONTAIN_TO_ACTION_DICT: Record<ContainLevels, EyeActions> = {
  [ContainLevels.INNER_CONTAIN]: EyeActions.MOVING,
  [ContainLevels.MARGIN_CONTAIN]: EyeActions.RESIZING,
  [ContainLevels.NO_CONTAIN]: EyeActions.NONE,
};

export class Eye {
  center: Point;
  pupilRadius: number;
  arcPoint: Point;
  controlBox: ControlBox;
  action: EyeActions;

  color: string;
  lineWidth: number;
  blinking: BlinkingModes;

  static THETA = Math.PI / 2;
  static BLINK_SPEED = 2;
  static NUM_PUPILS = 4;

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
    this.pupilRadius = pupilRadius;
    this.color = color;
    this.lineWidth = lineWidth;
    this.action = EyeActions.NONE;

    this.arcPoint = new Point(0, this.pupilRadius * -2);
    this.blinking = BlinkingModes.IDLE;
    this.controlBox = Eye.calculateControlBox(
      this.center,
      this.getEyelidRadius(),
      this.pupilRadius,
    );
  }

  static calculateEyelidRadius(pupilRadius: number) {
    return Math.round((3 * pupilRadius) / (1 - Math.cos(Eye.THETA)));
  }

  static distanceToEyeCorner(eyelidRadius: number): number {
    return eyelidRadius * Math.sin(Eye.THETA / 2) * Eye.MAGIC_CORNER_FACTOR;
  }

  static calculateControlBox(center: Point, eyelidRadius: number, pupilRadius: number): ControlBox {
    return new ControlBox(center, Eye.distanceToEyeCorner(eyelidRadius) * 2, pupilRadius * 2);
  }

  getEyelidRadius() {
    return Math.round((3 * this.pupilRadius) / (1 - Math.cos(Eye.THETA)));
  }

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.translate(this.center.x, this.center.y);
  }

  draw(ctx: CanvasRenderingContext2D, config: DrawConfig) {
    if (config.debug) {
      this.drawControlBox(ctx);
    }
    this._drawEye(ctx, config);
  }

  startBlinking() {
    const { IDLE, OPENING } = BlinkingModes;

    if (this.blinking === IDLE) this.blinking = OPENING;
  }

  updateBlink() {
    const { pupilRadius: r } = this;
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

  detailedContains(point: Point): ContainLevels {
    return this.controlBox.detailedContains(point);
  }

  contains(point: Point): boolean {
    return this.controlBox.contains(point);
  }

  blinkRandomly() {
    if (Math.random() < Eye.DEFAULT_BLINK_PROB) {
      this.startBlinking();
    }

    this.updateBlink();
  }

  drawControlBox(ctx: CanvasRenderingContext2D) {
    this.controlBox.draw(ctx);
  }

  debug(ctx: CanvasRenderingContext2D) {
    this.drawControlBox(ctx);
  }

  move(newPos: Point) {
    this.center.x = newPos.x;
    this.center.y = newPos.y;
  }

  resize(newPos: Point) {
    const dx = newPos.x - this.center.x;
    this.controlBox.changeWidth(dx * 2);
  }

  handleMouseDown(mousePos: Point) {
    const containLevel = this.detailedContains(mousePos);
    this.action = CONTAIN_TO_ACTION_DICT[containLevel];
  }

  handleDrag(newPos: Point) {
    if (this.action === EyeActions.MOVING) {
      this.move(newPos);
    } else if (this.action === EyeActions.RESIZING) {
      this.resize(newPos);
    }
  }

  handleMouseUp() {
    this.action = EyeActions.NONE;
  }

  handleHover(ctx: CanvasRenderingContext2D, mousePos: Point) {
    setCanvasCursor(
      ctx,
      CONTAIN_LEVEL_TO_CURSOR[this.detailedContains(mousePos) ?? ContainLevels.NO_CONTAIN],
    );
  }

  _drawEye(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig) {
    ctx.save();

    this.setupContext(ctx);

    this._drawContour(ctx);
    this._drawPupils(ctx, followConfig);

    ctx.restore();
  }

  _drawPupils(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig) {
    const { pupilRadius: r, center } = this;
    const { x, y } = followConfig.point ?? new Point();
    const eyelidRadius = this.getEyelidRadius();
    const dist = Eye.distanceToEyeCorner(eyelidRadius);

    ctx.save();
    ctx.resetTransform();
    ctx.translate(center.x, center.y);

    const mapX = -1 * mapRange(x - center.x, [0, followConfig.windowWidth], [0, -dist]),
      mapY = mapRange(y - center.y, [0, followConfig.windowHeight], [0, this.pupilRadius]);

    // draw concentric circles
    [...Array(Eye.NUM_PUPILS).keys()].forEach((i) => {
      const logFactor = Math.log(i + 2) / Math.log(Eye.NUM_PUPILS + 1);
      arc(ctx, mapX, mapY, r * logFactor, 0, Math.PI * 2);
    });

    arc(ctx, mapX, mapY, r * 0.1, 0, 2 * Math.PI);
    ctx.restore();
  }

  _drawContourArc(ctx: CanvasRenderingContext2D) {
    const { arcPoint } = this;
    const eyelidRadius = this.getEyelidRadius();
    const dist = Eye.distanceToEyeCorner(this.getEyelidRadius());
    ctx.moveTo(-dist, 0);
    ctx.arcTo(arcPoint.x, arcPoint.y, dist, 0, eyelidRadius * Eye.MAGIC_EYELID_RADIUS_FACTOR);
    ctx.lineTo(dist, 0);
  }

  _drawContour(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    this._drawContourArc(ctx);
    ctx.rotate(Math.PI);
    this._drawContourArc(ctx);
    ctx.clip();
    ctx.stroke();
    ctx.closePath();
    ctx.rotate(Math.PI);
  }
}
