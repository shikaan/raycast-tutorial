import {Map} from "./map";
import {Player} from "./player";
import {Camera} from "./camera";
import {Graphics} from "./graphics";

(function main() {
  // Welcome to this tiny ray casting tutorial!
  // If you have no idea what ray casting is, take a quick read here first
  //
  //    https://en.wikipedia.org/wiki/Ray_casting
  //
  // First, we will look at high level what these components do.
  // Then we will set up some event listeners to control the player.
  // And finally, we start the graphics loop, where the magic happens.

  // Map represents the map of the game. Nothing to do with hashmaps.
  // It will be drawn on the left-hand side of the canvas
  const map = new Map();

  // This object takes care of rendering hiding details about canvas.
  // Kind of leaky right now, but can be adjusted to use other renderers such
  // as WebGL or WebGPU.
  const gfx = new Graphics(document.getElementById("canvas") as HTMLCanvasElement);

  // Represents the player in the game. It's initialised with a position and
  // a direction.
  const player = new Player(300, 300, Math.PI);

  // Camera takes care casting the rays from the player to the walls and will
  // render the projection on the right-hand side of the canvas.
  const camera = new Camera(player, map);

  // This is an uninteresting keydown event listener: each arrow will move
  // the player in different ways. Go check Player.move and Player.turn to
  // see how.
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        player.move(1);
        break;
      case "ArrowDown":
        player.move(-1);
        break;
      case "ArrowLeft":
        player.turn(-1);
        break;
      case "ArrowRight":
        player.turn(1);
        break;
    }
  })

  // This is the graphics loop. We do some bookkeeping to draw more or less
  // at 30fps. Please don't copy this code for timing, it's bad.
  let lastTick = 0, delta = 0;
  const loop = () => {
    requestAnimationFrame((currentTick) => {
      delta = currentTick - lastTick;
      lastTick = currentTick;
      gfx.clear();
      map.draw(gfx);
      camera.draw(gfx);
      player.draw(gfx);
      // Again, don't copy this code for timing, it's awful.
      setTimeout(loop, Math.max(33 - delta, 0));
    })
  }
  loop();

})();
