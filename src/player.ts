/// Player
import {Drawable} from "./types";
import {normalize} from "./utils";

export class Player implements Drawable {
  public static readonly FIELD_OF_VIEW = Math.PI / 3;
  private static readonly STEP_LENGTH = 10;
  private static readonly TURN_ANGLE = 0.1;

  private dx: number;
  private dy: number;
  private _angle: number;
  set angle(a: number) {
    this._angle = normalize(a);
    this.dx = Player.STEP_LENGTH * Math.cos(a);
    this.dy = Player.STEP_LENGTH * Math.sin(a);
  }

  get angle() {
    return this._angle;
  }

  constructor(public x: number, public y: number, angle: number) {
    this.angle = angle;
  }

  move(steps: number) {
    this.x += steps * this.dx;
    this.y += steps * this.dy;
  }

  turn(steps: number) {
    this.angle += steps * Player.TURN_ANGLE;
  }

  draw(gfx) {
    gfx.drawPoint(this.x, this.y, 8, "#ff0000");
    gfx.drawLine(this.x, this.y, this.x + 5 * this.dx, this.y + 5 * this.dy, "#eecc11")
  }
}