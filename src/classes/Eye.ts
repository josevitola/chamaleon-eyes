import { arc } from '../utils/draw';
import { mapRange } from '../utils/mapRange';
import { Point } from './Point';

type EyeConfig = {
  lineWidth?: number;
  color?: string;
  id?: string;
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

enum DragModes {
  UPPER_CENTER = 'UPPER_CENTER',
  LEFT_CENTER = 'LEFT_CENTER',
  RIGHT_CENTER = 'RIGHT_CENTER',
  BODY = 'BODY',
}

enum LidDirections {
  UP = 'UP',
  DOWN = 'DOWN',
}

type EyelidConfig = {
  dir: LidDirections;
};

export class Eye {
  center: Point;
  r: number;

  id: string;
  color: string;
  lineWidth: number;

  startPoint: Point;
  arcPoint: Point;
  endPoint: Point;

  blinking: BlinkingModes;

  dragMode?: DragModes;

  static readonly THETA = Math.PI / 2;
  static readonly BLINK_SPEED = 2;
  static readonly NUM_PUPILS = 3;
  static readonly DEFAULT_CONTOUR_RADIUS = 90;

  static readonly DEFAULT_CONFIG: Required<EyeConfig> = {
    lineWidth: 5,
    color: 'orange',
    id: 'default',
  };

  static readonly DEFAULT_EYELID_CONFIG: EyelidConfig = {
    dir: LidDirections.UP,
  };

  /** Eyelids need an additional angle in order to actually intersect.
   * Not sure why. */
  static readonly MAGIC_EYELID_RADIUS_FACTOR = 0.93;
  static readonly MAGIC_CORNER_FACTOR = 1.05;

  constructor(x: number, y: number, r: number, config: EyeConfig) {
    const { color, lineWidth, id } = {
      ...Eye.DEFAULT_CONFIG,
      ...config,
    };

    this.center = new Point(x, y);
    this.r = r;

    this.id = id;
    this.color = color;
    this.lineWidth = lineWidth;

    const eyeCornerDist =
      Eye.DEFAULT_CONTOUR_RADIUS *
      Math.sin(Eye.THETA / 2) *
      Eye.MAGIC_CORNER_FACTOR;

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

  onDrag(mousePos: Point) {
    switch (this.dragMode) {
      case DragModes.UPPER_CENTER:
        this.r -= mousePos.subY(this.upperCenter);
        break;
      case DragModes.LEFT_CENTER:
        this.center.x = mousePos.x;
        break;
      case DragModes.RIGHT_CENTER:
        this.center.x = mousePos.x;
        break;
      case DragModes.BODY:
        this.center = mousePos;
        break;
    }
  }

  onDragStart(ctx: CanvasRenderingContext2D, mousePos: Point) {
    if (this.upperCenter.isHovered(mousePos)) {
      this.dragMode = DragModes.UPPER_CENTER;
    } else if (this.leftCenter.isHovered(mousePos)) {
      this.dragMode = DragModes.LEFT_CENTER;
    } else if (this.rightCenter.isHovered(mousePos)) {
      this.dragMode = DragModes.RIGHT_CENTER;
    } else if (this.isHovered(ctx, mousePos)) {
      this.dragMode = DragModes.BODY;
    }
  }

  onDragEnd() {
    this.dragMode = undefined;
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

  drawBox(ctx: CanvasRenderingContext2D, mousePos: Point) {
    ctx.save();
    ctx.setLineDash([7, 7]);

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.stroke(this.boxPath);

    this.vectors.forEach((corner) => {
      corner.draw(ctx, mousePos, { coordinates: false });
    });

    ctx.restore();
  }

  updateCursor(ctx: CanvasRenderingContext2D, mousePos: Point) {
    if (this.upperCenter.isHovered(mousePos)) {
      ctx.canvas.style.cursor = 'n-resize';
    } else if (this.leftCenter.isHovered(mousePos)) {
      ctx.canvas.style.cursor = 'w-resize';
    } else if (this.rightCenter.isHovered(mousePos)) {
      ctx.canvas.style.cursor = 'e-resize';
    } else if (this.isHovered(ctx, mousePos)) {
      ctx.canvas.style.cursor = 'grab';
    } else {
      ctx.canvas.style.cursor = '';
    }
  }

  isHovered(ctx: CanvasRenderingContext2D, mousePos: Point) {
    return ctx.isPointInPath(this.boxPath, mousePos.x, mousePos.y);
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

  private get vectors() {
    return [this.upperCenter, this.leftCenter, this.rightCenter];
  }

  private get upperCenter() {
    return this.center.addY(-this.r);
  }

  private get leftCenter() {
    return this.center.add(this.startPoint);
  }

  private get rightCenter() {
    return this.center.add(this.endPoint);
  }

  private drawPupils(
    ctx: CanvasRenderingContext2D,
    followConfig: EyeFollowConfig
  ) {
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

  private drawContour(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    this.drawContourArc(ctx);
    ctx.rotate(Math.PI);
    this.drawContourArc(ctx);
    ctx.clip();
    ctx.stroke();
    ctx.closePath();
    ctx.rotate(Math.PI);
  }

  private drawContourArc(ctx: CanvasRenderingContext2D) {
    const { startPoint, arcPoint, endPoint } = this;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.arcTo(
      arcPoint.x,
      arcPoint.y,
      endPoint.x,
      endPoint.y,
      Eye.DEFAULT_CONTOUR_RADIUS * Eye.MAGIC_EYELID_RADIUS_FACTOR
    );
    ctx.lineTo(endPoint.x, endPoint.y);
  }
}
