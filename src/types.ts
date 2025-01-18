import {Graphics} from "./graphics";

export interface Drawable {
  draw(gfx: Graphics): void;
}