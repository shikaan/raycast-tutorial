/// Camera
import {Drawable} from "./types";
import {Player} from "./player";
import {Map, Tile} from "./map";
import {lineLength, normalize} from "./utils";

export class Camera implements Drawable {
  // Size of the projection plane on the right-hand side of the Canvas.
  // It's the half that looks like a 90's video game.
  //
  // In the simulation we will pretend there is a projection plane in the world
  // and we are looking at the world through the lens of that projection.
  // You can imagine is as a picture: a 2D representation of a 3D world.
  static readonly PROJECTION_PLANE_HEIGHT = 512;
  static readonly PROJECTION_PLANE_WIDTH = 512;
  // Position of the projection plane from the left side of the canvas
  static readonly PROJECTION_PLANE_X = 512;
  // How many degrees of the world does the camera cover?
  static readonly FIELD_OF_VIEW = Math.PI / 3;
  // How many rays to cast per frame?
  static readonly RAYS = Camera.PROJECTION_PLANE_WIDTH;
  // Height of the camera in the world
  static readonly HEIGHT = 32;

  // The following value are needed on every frame, and are then cached here

  // We divide the field of view in rays we want to cast.
  // Each ray is DELTA_ANGLE radiants apart from the previous
  private readonly DELTA_ANGLE = Camera.FIELD_OF_VIEW / Camera.RAYS;
  // Distance of the player
  private readonly DISTANCE_FROM_PROJECTION = Math.floor((Camera.PROJECTION_PLANE_WIDTH / 2) / Math.tan(Camera.FIELD_OF_VIEW / 2));
  // The projection will be drawn vertically, one column of pixels at a time.
  // That's what we will call column from now on.
  private readonly COLUMN_WIDTH = Camera.PROJECTION_PLANE_WIDTH / Camera.RAYS;

  constructor(private player: Player, private map: Map) {
  }


  // Calculates the horizontal intersection point for a ray cast from the
  // player's position at a given angle.
  // The angle is expected in radians and it is measured clockwise from the
  // positive x-axis.
  // Returns a tuple containing coordinates of the intersection point
  // with a wall. Returns [Infinity, Infinity] if no wall is found.
  private getHorizontalIntersection(angle: number): [number, number] {
    const cot = 1 / Math.tan(angle)
    // Angles are flipped horizontally compared to high-school math to
    // accommodate the HTML Canvas coordinate system.
    // When we cast rays upwards, we will look for intersections with horizontal
    // lines above the player position, else we look below.
    const isLookingUp = angle > Math.PI;

    // First thing we do is looking for the intersections with horizontal lines
    // closer to the player.
    //
    //     |       |      P: (Px, Py) player
    // ----+-----I-+----  I: (Ix, Iy) intersection to find
    //     |    /  |
    //     |   P   |
    //     |       |
    // ----+-------+----
    //     |       |
    //
    // The y coordinate of the intersection is given by snapping the player
    // position to the grid: upwards if we look up, downwards otherwise
    let intersectionY = this.player.y - (this.player.y % Map.TILE_SIZE);
    intersectionY += isLookingUp ? 0 : Map.TILE_SIZE;
    // This comes from:
    // * tan(x)  := sin(x)/cos(x) - definition of tangent
    // * ctan(x) := 1/tan(x)      - definition of cotangent
    // * sin(x) = (Iy - Py) / R - definition of sin radius `R`
    // * cos(x) = (Ix - Px) / R - definition of cos radius `R`
    // * R := distance(P, I)
    // (take pen and paper and do the math if it's not clear, it'll help!)
    let intersectionX = this.player.x + (intersectionY - this.player.y) * cot;

    // Up to this point we are ray-casting to the closest horizontal line
    // We now need to keep going until we find a wall.

    // There can only be at most Map.HEIGHT horizontal intersections.
    // This is why ray casting is so efficient: you only need a very little
    // number of checks, and it's all due to the fact we are working on a grid.
    // How cool is that?
    for (let i = 0; i < Map.HEIGHT; i++) {
      // See definition of Map.getTileAt to see why we adjust when we look up
      const tile = this.map.getTileAt(intersectionX, isLookingUp ? intersectionY - Map.TILE_SIZE : intersectionY);
      // If we're out of bounds and the wall was not found earlier, it won't
      // be found. Return the failure case.
      if (!tile) return [Infinity, Infinity]
      // If the tile we are hitting is a wall we are done. Joy!
      if (tile === Tile.Wall) return [intersectionX, intersectionY];

      // We did not find a wall, we keep searching by looking one row above, if
      // looking upwards, otherwise one row below.
      intersectionY += isLookingUp ? -Map.TILE_SIZE : Map.TILE_SIZE;
      // The player hasn't moved, x is still a derived from y, and it's done
      // exactly like above.
      intersectionX = this.player.x + (intersectionY - this.player.y) * cot;
    }

    // If we arrive here we haven't found a wall. Return the failure case.
    return [Infinity, Infinity]
  }

  // Calculates the vertical intersection point for a ray cast from the
  // player's position at a given angle.
  // The angle is expected in radians and it is measured clockwise from the
  // positive x-axis.
  // Returns a tuple containing coordinates of the intersection point
  // with a wall. Returns [Infinity, Infinity] if no wall is found.
  private getVerticalIntersection(angle: number) {
    const tan = Math.tan(angle);
    // Angles are flipped horizontally compared to high-school math to
    // accommodate the HTML Canvas coordinate system.
    // When we cast rays on the right, we look for intersections with vertical
    // lines on the right of the player position, else we look left.
    const isLookingRight = angle < Math.PI / 2 || angle > 3 * Math.PI / 2;

    // First thing we do is looking for the intersections with vertical lines
    // closer to the player.
    //
    //     |       |      P: (Px, Py) player
    // ----+-------+----  I: (Ix, Iy) intersection to find
    //     |       I
    //     |     / |
    //     |    P  |
    // ----+-------+----
    //     |       |
    //
    // The x coordinate of the intersection is given by snapping the player
    // position to the grid: right if we look right, left otherwise
    let intersectionX = this.player.x - (this.player.x % Map.TILE_SIZE);
    intersectionX += isLookingRight ? Map.TILE_SIZE : 0;
    // This comes from:
    // * tan(x)  := sin(x)/cos(x) - definition of tangent
    // * sin(x) = (Iy - Py) / R - definition of sin radius `R`
    // * cos(x) = (Ix - Px) / R - definition of cos radius `R`
    // * R := distance(P, I)
    // (take pen and paper and do the math if it's not clear, it'll help!)
    let intersectionY = this.player.y + (intersectionX - this.player.x) * tan;

    // Up to this point we are ray-casting to the closest vertical line
    // We now need to keep going until we find a wall.

    // There can only be at most Map.WIDTH vertical intersections.
    // This is why ray casting is so efficient: you only need a very little
    // number of checks, and it's all due to the fact we are working on a grid.
    // How cool is that?
    for (let i = 0; i < Map.WIDTH; i++) {
      // See definition of Map.getTileAt to see why we adjust when we look left
      const tile = this.map.getTileAt(isLookingRight ? intersectionX : intersectionX - Map.TILE_SIZE, intersectionY);
      // If we're out of bounds and the wall was not found earlier, it won't
      // be found. Return the failure case.
      if (!tile) return [Infinity, Infinity]
      // If the tile we are hitting is a wall we are done. Joy!
      if (tile === Tile.Wall) return [intersectionX, intersectionY];

      // We did not find a wall. Keep searching by looking one column left, if
      // looking left, otherwise one row right.
      intersectionX += isLookingRight ? Map.TILE_SIZE : -Map.TILE_SIZE;
      // The player hasn't moved, y is still a derived from x and it's done
      // exactly like above
      intersectionY = this.player.y + (intersectionX - this.player.x) * tan;
    }

    // If we arrive here we haven't found a wall. Return the failure case.
    return [Infinity, Infinity]
  }

  draw(gfx): void {
    let angle = normalize(this.player.angle - Camera.FIELD_OF_VIEW / 2);
    for (let i = 0; i < Camera.RAYS; i++) {
      // The ray to draw is the shortest from the player to the closest wall.
      // Let's get the shortest horizontal intersection
      const [hIntersectionX, hIntersectionY] = this.getHorizontalIntersection(angle);
      const hLength = lineLength(this.player.x, this.player.y, hIntersectionX, hIntersectionY);
      // Let's get the shortest vertical intersection
      const [vIntersectionX, vIntersectionY] = this.getVerticalIntersection(angle);
      const vLength = lineLength(this.player.x, this.player.y, vIntersectionX, vIntersectionY);
      const isShortestVertical = vLength < hLength
      const [x, y] = isShortestVertical
        ? [vIntersectionX, vIntersectionY]
        : [hIntersectionX, hIntersectionY];
      // Draw the shortest ray on the map
      gfx.drawLine(this.player.x, this.player.y, x, y, "#00FF00");

      // The cosine adjustment is to prevent the fishbowl effect.
      // Rays at the side of the field of view are longer than the ones in the
      // middle. For human eyes it's not a problem because eyes are round, on
      // flat screens this yields pictures distorted on the sides.
      const shortest = Math.min(vLength, hLength) * Math.cos(this.player.angle - angle);

      // We now need to project what we cast a ray upon.
      // The projection is just a collection of vertical lines very close to
      // each other that therefore look like a picture.

      // It goes like this:
      // * divide the projection plane in two parts
      // * identify the size of the upper part of projected segment
      // * use it to calculate the point from where to start drawing the line
      // * identify the size of the bottom part of the projected segment
      // * draw the line from top to bottom

      // +--A-------------------------------+
      // |                                  |  C : middle of projection plane
      // |  B                               |  AB: topOffset
      // |  +                               |  BC: topHalf
      // |  +                               |  CD: bottomHalf
      // |  C                               |  + : line we are drawing
      // |  +                               |
      // |  D                               |
      // +----------------------------------+

      // These values are coming from the following trigonometry problem
      //
      //        F    D     A : Player Position
      //        :  ' |     CG: Projected Wall
      //        C    |     DH: `Map.WALL_HEIGHT`
      //     '  |    |     FI: `Camera.PROJECTION_PLANE_HEIGHT`
      //  A-----B----E     FC: `topOffset`
      //     '  |    |     CB: `topHalf`
      //        G    |     AB: `DISTANCE_FROM_PROJECTION`
      //        :  ' |     AE: `shortest`
      //        I    H     AH: `Camera.HEIGHT`
      //
      // Whose solution can be found observing
      //   DE = tan(BAC)*AE
      //   BC = tan(BAC)*AB
      const topHalf = (Map.WALL_HEIGHT - Camera.HEIGHT) * this.DISTANCE_FROM_PROJECTION / shortest;
      const topOffset = Camera.PROJECTION_PLANE_HEIGHT / 2 - topHalf;
      const bottomHalf = Camera.HEIGHT * this.DISTANCE_FROM_PROJECTION / shortest;
      const columnX = Camera.PROJECTION_PLANE_X + i * this.COLUMN_WIDTH;
      gfx.drawLine(
        columnX,
        topOffset,
        columnX,
        topOffset + topHalf + bottomHalf,
        // Drawing one of the intersection types with a darker color creates
        // the illusion of shades with almost no effort
        isShortestVertical ? "#00ff00" : "#00aa11"
      );

      angle = normalize(angle + this.DELTA_ANGLE);
    }
  }
}