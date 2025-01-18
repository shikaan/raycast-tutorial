// Maps
import {Drawable} from "./types";

export enum Tile { Wall = 1, Empty = 2 }

// To make the map look nicer
const W = Tile.Wall;
const _ = Tile.Empty;

export class Map implements Drawable {
  // Every tile will be a square of TILE_SIZExTILE_SIZE pixels
  static readonly TILE_SIZE = 64;
  // How many horizontal tiles the map features
  static readonly WIDTH = 8;
  // How many vertical tiles the map features
  static readonly HEIGHT = 8;
  // How how tall is a wall
  static readonly WALL_HEIGHT = 64;

  // Representation of the map.
  // For best results keep it in a WIDTH * HEIGHT grid
  private readonly TILES = [
    W, W, W, W, W, W, W, W,
    W, _, W, _, _, _, _, W,
    W, _, W, _, _, _, _, W,
    W, _, W, _, _, _, _, W,
    W, _, _, _, _, _, _, W,
    W, _, _, _, _, W, _, W,
    W, _, _, _, _, _, _, W,
    W, W, W, W, W, W, W, W,
  ]

  // Returns the tile at a given world coordinate
  // Given the top-left corner of a tile C: (Cx, Cy), a point will yield
  // the given tile if both:
  // * x in [Cx, Cx+Map.TILE_SIZE)
  // * y in [Cy, Cy+Map.TILE_SIZE)
  // are true
  getTileAt(worldX: number, worldY: number): Tile | undefined {
    const x = Math.floor(worldX / Map.TILE_SIZE);
    const y = Math.floor(worldY / Map.TILE_SIZE);
    return this.TILES[x + y * Map.WIDTH];
  }

  private static readonly GAP = 2;

  // Draws the map with a little gap in between the tiles
  draw(gfx) {
    for (let i = 0; i < this.TILES.length; i++) {
      const color = this.TILES[i] == Tile.Empty ? "#000000" : "#fafafa";
      const x = (i % Map.WIDTH) * Map.TILE_SIZE + Map.GAP / 2;
      const y = Math.floor(i / Map.WIDTH) * Map.TILE_SIZE + Map.GAP / 2;
      gfx.drawRect(x, y, Map.TILE_SIZE - Map.GAP, Map.TILE_SIZE - Map.GAP, color)
    }
  }
}