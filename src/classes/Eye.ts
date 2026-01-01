import { arc } from "../utils/draw";
import { mapRange } from "../utils/mapRange";
import { Point } from "./Point";

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
  IDLE = "IDLE",
  OPENING = "OPENING",
  CLOSING = "CLOSING",
}

enum LidDirections {
  UP = "UP",
  DOWN = "DOWN",
}

type EyelidConfig = {
  dir: LidDirections;
};

export class Eye {
  center: Point;
  r: number;

  color: string;
  lineWidth: number;

  startPoint: Point;
  arcPoint: Point;
  endPoint: Point;

  blinking: BlinkingModes;

  static readonly THETA = Math.PI / 2;
  static readonly BLINK_SPEED = 2;
  static readonly NUM_PUPILS = 3;

  static readonly DEFAULT_CONFIG: Required<EyeConfig> = {
    lineWidth: 5,
    color: "orange",
  };

  static readonly DEFAULT_EYELID_CONFIG: EyelidConfig = {
    dir: LidDirections.UP,
  };

  /** Eyelids need an additional angle in order to actually intersect.
   * Not sure why. */
  static readonly MAGIC_EYELID_RADIUS_FACTOR = 0.93;
  static readonly MAGIC_CORNER_FACTOR = 1.05;

  constructor(x: number, y: number, r: number, config: EyeConfig) {
    const { color, lineWidth } = {
      ...Eye.DEFAULT_CONFIG,
      ...config,
    };

    this.center = new Point(x, y);
    this.r = r;

    this.color = color;
    this.lineWidth = lineWidth;

    const eyeCornerDist =
      this.contourRadius * Math.sin(Eye.THETA / 2) * Eye.MAGIC_CORNER_FACTOR;

    this.startPoint = new Point(-eyeCornerDist, 0);
    this.arcPoint = new Point(0, r * -2);
    this.endPoint = new Point(eyeCornerDist, 0);

    this.blinking = BlinkingModes.IDLE;
  }

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.translate(this.center.x, this.center.y);
  }

  private get contourRadius() {
    return Math.round((3 * this.r) / (1 - Math.cos(Eye.THETA)));
  }

  private drawContourArc(ctx: CanvasRenderingContext2D) {
    const { startPoint, arcPoint, endPoint, contourRadius } = this;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.arcTo(
      arcPoint.x,
      arcPoint.y,
      endPoint.x,
      endPoint.y,
      contourRadius * Eye.MAGIC_EYELID_RADIUS_FACTOR
    );
    ctx.lineTo(endPoint.x, endPoint.y);
  }

  drawContour(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    this.drawContourArc(ctx);
    ctx.rotate(Math.PI);
    this.drawContourArc(ctx);
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
    ctx.translate(this.center.x, this.center.y);

    const mapX =
      -1 *
      mapRange(
        x - this.center.x,
        [0, followConfig.windowWidth],
        [0, startPoint.x]
      );

    const mapY = mapRange(
      y - this.center.y,
      [0, followConfig.windowHeight],
      [0, this.r]
    );

    // draw concentric circles
    [...new Array(Eye.NUM_PUPILS).keys()].forEach((i) => {
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

  get boxPath() {
    const boxPath = new Path2D();
    boxPath.rect(
      this.center.x + this.startPoint.x,
      this.center.y - this.r,
      this.endPoint.x - this.startPoint.x,
      2 * this.r
    );
    return boxPath;
  }

  drawBox(ctx: CanvasRenderingContext2D, mousePos: Point) {
    const boxPath = this.boxPath;

    ctx.save();
    ctx.setLineDash([7, 7]);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.stroke(boxPath);

    this.corners.forEach((corner) => {
      corner.draw(ctx, mousePos, { coordinates: false });
    });

    ctx.restore();
  }

  updateCursor(ctx: CanvasRenderingContext2D, mousePos: Point) {
    if (this.upperLeftCorner.isBeingHovered(mousePos)) {
      ctx.canvas.style.cursor = "nw-resize";
    } else if (this.upperRightCorner.isBeingHovered(mousePos)) {
      ctx.canvas.style.cursor = "ne-resize";
    } else if (this.lowerLeftCorner.isBeingHovered(mousePos)) {
      ctx.canvas.style.cursor = "sw-resize";
    } else if (this.lowerRightCorner.isBeingHovered(mousePos)) {
      ctx.canvas.style.cursor = "se-resize";
    } else if (this.isBeingHovered(ctx, mousePos)) {
      ctx.canvas.style.cursor = "grab";
    } else {
      ctx.canvas.style.cursor = "";
    }
  }

  updateCenter(newCenter: Point) {
    this.center = newCenter;
  }

  isBeingHovered(ctx: CanvasRenderingContext2D, mousePos: Point) {
    const boxPath = this.boxPath;
    return ctx.isPointInPath(boxPath, mousePos.x, mousePos.y);
  }

  get corners() {
    return [
      this.upperLeftCorner,
      this.upperRightCorner,
      this.lowerLeftCorner,
      this.lowerRightCorner,
    ];
  }

  get upperLeftCorner() {
    return this.center.clone().add(new Point(this.startPoint.x, -this.r));
  }

  get upperRightCorner() {
    return this.center.clone().add(new Point(this.endPoint.x, -this.r));
  }

  get lowerLeftCorner() {
    return this.center.clone().add(new Point(this.startPoint.x, this.r));
  }

  get lowerRightCorner() {
    return this.center.clone().add(new Point(this.endPoint.x, this.r));
  }
}
