/// Camera
import {Drawable} from "./types";
import {Player} from "./player";
import {Map, Tile} from "./map";
import {lineLength, normalize} from "./utils";

export class Camera implements Drawable {
  static readonly PROJECTION_PLANE_HEIGHT = 512;
  static readonly PROJECTION_PLANE_WIDTH = 512;
  static readonly PROJECTION_PLANE_X = 512;
  static readonly RAYS = Camera.PROJECTION_PLANE_WIDTH;
  static readonly HEIGHT = 32;

  constructor(private player: Player, private map: Map) {
  }

  getHorizontalIntersection(angle: number) {
    const cot = 1 / Math.tan(angle)
    const isLookingUp = angle > Math.PI;
    let intersectionY = this.player.y - (this.player.y % Map.TILE_SIZE);
    intersectionY += isLookingUp ? 0 : Map.TILE_SIZE;
    let intersectionX = this.player.x + (intersectionY - this.player.y) * cot;

    // Look for next intersection
    for (let i = 0; i < Map.HEIGHT; i++) {
      const tile = this.map.getTileAt(intersectionX, isLookingUp ? intersectionY - Map.TILE_SIZE : intersectionY);
      if (!tile) return [Infinity, Infinity] // We're out of bounds, drop the ray
      if (tile === Tile.Wall) return [intersectionX, intersectionY]; // found the wall!

      intersectionY += isLookingUp ? -Map.TILE_SIZE : Map.TILE_SIZE;
      intersectionX = this.player.x + (intersectionY - this.player.y) * cot;
    }

    return [Infinity, Infinity] // Cannot find a wall, drop the ray
  }

  getVerticalIntersection(angle: number) {
    const tan = Math.tan(angle);
    const isLookingRight = angle < Math.PI / 2 || angle > 3 * Math.PI / 2;
    let intersectionX = this.player.x - (this.player.x % Map.TILE_SIZE);
    intersectionX += isLookingRight ? Map.TILE_SIZE : 0;
    let intersectionY = this.player.y + (intersectionX - this.player.x) * tan;

    // Look for next intersection
    for (let i = 0; i < Map.WIDTH; i++) {
      const tile = this.map.getTileAt(isLookingRight ? intersectionX : intersectionX - Map.TILE_SIZE, intersectionY);
      if (!tile) return [Infinity, Infinity] // We're out of bounds, drop the ray
      if (tile === Tile.Wall) return [intersectionX, intersectionY]; // found the wall!

      intersectionX += isLookingRight ? Map.TILE_SIZE : -Map.TILE_SIZE;
      intersectionY = this.player.y + (intersectionX - this.player.x) * tan;
    }

    return [Infinity, Infinity] // Cannot find a wall, drop the ray
  }

  draw(gfx): void {
    const angleIncrement = Player.FIELD_OF_VIEW / Camera.RAYS;
    const distanceFromProjectionPlane = Math.floor((Camera.PROJECTION_PLANE_WIDTH / 2) / Math.tan(Player.FIELD_OF_VIEW / 2));
    const columnWidth = Camera.PROJECTION_PLANE_WIDTH / Camera.RAYS;

    let angle = normalize(this.player.angle - Player.FIELD_OF_VIEW / 2);
    for (let i = 0; i < Camera.RAYS; i++) {
      const [hIntersectionX, hIntersectionY] = this.getHorizontalIntersection(angle);
      const hLength = lineLength(this.player.x, this.player.y, hIntersectionX, hIntersectionY);
      const [vIntersectionX, vIntersectionY] = this.getVerticalIntersection(angle);
      const vLength = lineLength(this.player.x, this.player.y, vIntersectionX, vIntersectionY);
      const isShortestVertical = vLength < hLength
      const [x, y] = isShortestVertical
        ? [vIntersectionX, vIntersectionY]
        : [hIntersectionX, hIntersectionY];
      gfx.drawLine(this.player.x, this.player.y, x, y, "#00FF00"); // draw ray

      const shortest = Math.min(vLength, hLength) * Math.cos(this.player.angle - angle);
      const topHalf = (Map.WALL_HEIGHT - Camera.HEIGHT) * distanceFromProjectionPlane / shortest;
      const topOffset = Camera.PROJECTION_PLANE_HEIGHT / 2 - topHalf;
      const bottomHalf = Camera.HEIGHT * distanceFromProjectionPlane / shortest;
      const columnX = Camera.PROJECTION_PLANE_X + i * columnWidth;
      gfx.drawLine(
        columnX,
        topOffset,
        columnX,
        topOffset + topHalf + bottomHalf,
        isShortestVertical ? "#00ff00" : "#00aa11"
      ); // draw projection

      angle = normalize(angle + angleIncrement);
    }
  }
}