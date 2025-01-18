// Maps
import {Drawable} from "./types";

export enum Tile { Wall = 1, Empty }

// To make the map look nicer
const W = Tile.Wall;
const _ = Tile.Empty;

export class Map implements Drawable {
  static readonly TILE_SIZE = 64;
  static readonly WIDTH = 8;
  static readonly HEIGHT = 8;
  static readonly WALL_HEIGHT = 64;

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

  get(x: number, y: number): Tile | undefined {
    return this.TILES[x + y * Map.WIDTH];
  }

  getTileAt(worldX: number, worldY: number): Tile | undefined {
    const x = Math.floor(worldX / Map.TILE_SIZE);
    const y = Math.floor(worldY / Map.TILE_SIZE);
    return this.get(x, y)
  }

  private static readonly GAP = 2;

  draw(gfx) {
    for (let i = 0; i < this.TILES.length; i++) {
      const color = this.TILES[i] == Tile.Empty ? "#000000" : "#fafafa";
      const x = (i % Map.WIDTH) * Map.TILE_SIZE + Map.GAP / 2;
      const y = Math.floor(i / Map.WIDTH) * Map.TILE_SIZE + Map.GAP / 2;
      gfx.drawRect(x, y, Map.TILE_SIZE - Map.GAP, Map.TILE_SIZE - Map.GAP, color)
    }
  }
}