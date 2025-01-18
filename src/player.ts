/// Player
import {Drawable} from "./types";
import {normalize} from "./utils";

export class Player implements Drawable {
  // How many pixels the player moves when moving in a given direction
  private static readonly STEP_LENGTH = 10;
  // How many radiants the player turns when turning
  private static readonly TURN_ANGLE = 0.1;

  // Angle is computed with getter and setter for two reasons:
  // 1. always normalize the angle when it's set
  // 2. calculate horizontal and vertical projections only when the angle
  //    changes, so they can be reused
  private deltaX: number;
  private deltaY: number;
  private _angle: number;
  set angle(a: number) {
    this._angle = normalize(a);
    this.deltaX = Player.STEP_LENGTH * Math.cos(a);
    this.deltaY = Player.STEP_LENGTH * Math.sin(a);
  }

  get angle() {
    return this._angle;
  }

  constructor(public x: number, public y: number, angle: number) {
    this.angle = angle;
  }

  // Moves the player `steps` steps in the current direction dictate by `angle`
  move(steps: number) {
    this.x += steps * this.deltaX;
    this.y += steps * this.deltaY;
  }

  // Changes the player direction by turning the angle by `steps`
  turn(steps: number) {
    this.angle += steps * Player.TURN_ANGLE;
  }

  // Draws the player position on the map and its direction
  draw(gfx) {
    gfx.drawPoint(this.x, this.y, 8, "#ff0000");
    gfx.drawLine(this.x, this.y, this.x + 5 * this.deltaX, this.y + 5 * this.deltaY, "#eecc11")
  }
}