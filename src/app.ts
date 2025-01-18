import {Map} from "./map";
import {Player} from "./player";
import {Camera} from "./camera";
import {Graphics} from "./graphics";

(function main() {
  const map = new Map();
  const gfx = new Graphics(document.getElementById("canvas") as HTMLCanvasElement);
  const player = new Player(300, 300, Math.PI);
  const camera = new Camera(player, map);

  let t = 0, delta = 0;
  const loop = () => {
    requestAnimationFrame((time) => {
      delta = time - t;
      t = time;
      gfx.clear();
      map.draw(gfx);
      camera.draw(gfx);
      player.draw(gfx);
      setTimeout(loop, Math.max(33 - delta, 0));
    })
  }
  loop();

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

})();
