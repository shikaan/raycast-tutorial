(() => {
  // src/map.ts
  var W = 1 /* Wall */;
  var _ = 2 /* Empty */;
  var Map = class _Map {
    // Every tile will be a square of TILE_SIZExTILE_SIZE pixels
    static TILE_SIZE = 64;
    // How many horizontal tiles the map features
    static WIDTH = 8;
    // How many vertical tiles the map features
    static HEIGHT = 8;
    // How how tall is a wall
    static WALL_HEIGHT = 64;
    // Representation of the map.
    // For best results keep it in a WIDTH * HEIGHT grid
    TILES = [
      W,
      W,
      W,
      W,
      W,
      W,
      W,
      W,
      W,
      _,
      W,
      _,
      _,
      _,
      _,
      W,
      W,
      _,
      W,
      _,
      _,
      _,
      _,
      W,
      W,
      _,
      W,
      _,
      _,
      _,
      _,
      W,
      W,
      _,
      _,
      _,
      _,
      _,
      _,
      W,
      W,
      _,
      _,
      _,
      _,
      W,
      _,
      W,
      W,
      _,
      _,
      _,
      _,
      _,
      _,
      W,
      W,
      W,
      W,
      W,
      W,
      W,
      W,
      W
    ];
    // Returns the tile at a given world coordinate
    // Given the top-left corner of a tile C: (Cx, Cy), a point will yield
    // the given tile if both:
    // * x in [Cx, Cx+Map.TILE_SIZE)
    // * y in [Cy, Cy+Map.TILE_SIZE)
    // are true
    getTileAt(worldX, worldY) {
      const x = Math.floor(worldX / _Map.TILE_SIZE);
      const y = Math.floor(worldY / _Map.TILE_SIZE);
      return this.TILES[x + y * _Map.WIDTH];
    }
    static GAP = 2;
    // Draws the map with a little gap in between the tiles
    draw(gfx) {
      for (let i = 0; i < this.TILES.length; i++) {
        const color = this.TILES[i] == 2 /* Empty */ ? "#000000" : "#fafafa";
        const x = i % _Map.WIDTH * _Map.TILE_SIZE + _Map.GAP / 2;
        const y = Math.floor(i / _Map.WIDTH) * _Map.TILE_SIZE + _Map.GAP / 2;
        gfx.drawRect(x, y, _Map.TILE_SIZE - _Map.GAP, _Map.TILE_SIZE - _Map.GAP, color);
      }
    }
  };

  // src/utils.ts
  var TWO_PI = Math.PI * 2;
  var normalize = (a) => a < 0 ? a + TWO_PI : a >= TWO_PI ? a - TWO_PI : a;
  var lineLength = (x0, y0, x1, y1) => Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);

  // src/player.ts
  var Player = class _Player {
    constructor(x, y, angle) {
      this.x = x;
      this.y = y;
      this.angle = angle;
    }
    // How many pixels the player moves when moving in a given direction
    static STEP_LENGTH = 10;
    // How many radiants the player turns when turning
    static TURN_ANGLE = 0.1;
    // Angle is computed with getter and setter for two reasons:
    // 1. always normalize the angle when it's set
    // 2. calculate horizontal and vertical projections only when the angle
    //    changes, so they can be reused
    deltaX;
    deltaY;
    _angle;
    set angle(a) {
      this._angle = normalize(a);
      this.deltaX = _Player.STEP_LENGTH * Math.cos(a);
      this.deltaY = _Player.STEP_LENGTH * Math.sin(a);
    }
    get angle() {
      return this._angle;
    }
    // Moves the player `steps` steps in the current direction dictate by `angle`
    move(steps) {
      this.x += steps * this.deltaX;
      this.y += steps * this.deltaY;
    }
    // Changes the player direction by turning the angle by `steps`
    turn(steps) {
      this.angle += steps * _Player.TURN_ANGLE;
    }
    // Draws the player position on the map and its direction
    draw(gfx) {
      gfx.drawPoint(this.x, this.y, 8, "#ff0000");
      gfx.drawLine(this.x, this.y, this.x + 5 * this.deltaX, this.y + 5 * this.deltaY, "#eecc11");
    }
  };

  // src/camera.ts
  var Camera = class _Camera {
    constructor(player, map) {
      this.player = player;
      this.map = map;
    }
    // Size of the projection plane on the right-hand side of the Canvas.
    // It's the half that looks like a 90's video game.
    //
    // In the simulation we will pretend there is a projection plane in the world
    // and we are looking at the world through the lens of that projection.
    // You can imagine is as a picture: a 2D representation of a 3D world.
    static PROJECTION_PLANE_HEIGHT = 512;
    static PROJECTION_PLANE_WIDTH = 512;
    // Position of the projection plane from the left side of the canvas
    static PROJECTION_PLANE_X = 512;
    // How many degrees of the world does the camera cover?
    static FIELD_OF_VIEW = Math.PI / 3;
    // How many rays to cast per frame?
    static RAYS = _Camera.PROJECTION_PLANE_WIDTH;
    // Height of the camera in the world
    static HEIGHT = 32;
    // The following value are needed on every frame, and are then cached here
    // We divide the field of view in rays we want to cast.
    // Each ray is DELTA_ANGLE radiants apart from the previous
    DELTA_ANGLE = _Camera.FIELD_OF_VIEW / _Camera.RAYS;
    // Distance of the player
    DISTANCE_FROM_PROJECTION = Math.floor(_Camera.PROJECTION_PLANE_WIDTH / 2 / Math.tan(_Camera.FIELD_OF_VIEW / 2));
    // The projection will be drawn vertically, one column of pixels at a time.
    // That's what we will call column from now on.
    COLUMN_WIDTH = _Camera.PROJECTION_PLANE_WIDTH / _Camera.RAYS;
    // Calculates the horizontal intersection point for a ray cast from the
    // player's position at a given angle.
    // The angle is expected in radians and it is measured clockwise from the
    // positive x-axis.
    // Returns a tuple containing coordinates of the intersection point
    // with a wall. Returns [Infinity, Infinity] if no wall is found.
    getHorizontalIntersection(angle) {
      const cot = 1 / Math.tan(angle);
      const isLookingUp = angle > Math.PI;
      let intersectionY = this.player.y - this.player.y % Map.TILE_SIZE;
      intersectionY += isLookingUp ? 0 : Map.TILE_SIZE;
      let intersectionX = this.player.x + (intersectionY - this.player.y) * cot;
      for (let i = 0; i < Map.HEIGHT; i++) {
        const tile = this.map.getTileAt(intersectionX, isLookingUp ? intersectionY - Map.TILE_SIZE : intersectionY);
        if (!tile) return [Infinity, Infinity];
        if (tile === 1 /* Wall */) return [intersectionX, intersectionY];
        intersectionY += isLookingUp ? -Map.TILE_SIZE : Map.TILE_SIZE;
        intersectionX = this.player.x + (intersectionY - this.player.y) * cot;
      }
      return [Infinity, Infinity];
    }
    // Calculates the vertical intersection point for a ray cast from the
    // player's position at a given angle.
    // The angle is expected in radians and it is measured clockwise from the
    // positive x-axis.
    // Returns a tuple containing coordinates of the intersection point
    // with a wall. Returns [Infinity, Infinity] if no wall is found.
    getVerticalIntersection(angle) {
      const tan = Math.tan(angle);
      const isLookingRight = angle < Math.PI / 2 || angle > 3 * Math.PI / 2;
      let intersectionX = this.player.x - this.player.x % Map.TILE_SIZE;
      intersectionX += isLookingRight ? Map.TILE_SIZE : 0;
      let intersectionY = this.player.y + (intersectionX - this.player.x) * tan;
      for (let i = 0; i < Map.WIDTH; i++) {
        const tile = this.map.getTileAt(isLookingRight ? intersectionX : intersectionX - Map.TILE_SIZE, intersectionY);
        if (!tile) return [Infinity, Infinity];
        if (tile === 1 /* Wall */) return [intersectionX, intersectionY];
        intersectionX += isLookingRight ? Map.TILE_SIZE : -Map.TILE_SIZE;
        intersectionY = this.player.y + (intersectionX - this.player.x) * tan;
      }
      return [Infinity, Infinity];
    }
    draw(gfx) {
      let angle = normalize(this.player.angle - _Camera.FIELD_OF_VIEW / 2);
      for (let i = 0; i < _Camera.RAYS; i++) {
        const [hIntersectionX, hIntersectionY] = this.getHorizontalIntersection(angle);
        const hLength = lineLength(this.player.x, this.player.y, hIntersectionX, hIntersectionY);
        const [vIntersectionX, vIntersectionY] = this.getVerticalIntersection(angle);
        const vLength = lineLength(this.player.x, this.player.y, vIntersectionX, vIntersectionY);
        const isShortestVertical = vLength < hLength;
        const [x, y] = isShortestVertical ? [vIntersectionX, vIntersectionY] : [hIntersectionX, hIntersectionY];
        gfx.drawLine(this.player.x, this.player.y, x, y, "#00FF00");
        const shortest = Math.min(vLength, hLength) * Math.cos(this.player.angle - angle);
        const topHalf = (Map.WALL_HEIGHT - _Camera.HEIGHT) * this.DISTANCE_FROM_PROJECTION / shortest;
        const topOffset = _Camera.PROJECTION_PLANE_HEIGHT / 2 - topHalf;
        const bottomHalf = _Camera.HEIGHT * this.DISTANCE_FROM_PROJECTION / shortest;
        const columnX = _Camera.PROJECTION_PLANE_X + i * this.COLUMN_WIDTH;
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
  };

  // src/graphics.ts
  var Graphics = class _Graphics {
    constructor($canvas) {
      this.$canvas = $canvas;
      this.context = this.$canvas.getContext("2d");
      this.$canvas.width = _Graphics.CANVAS_WIDTH;
      this.$canvas.height = _Graphics.CANVAS_HEIGHT;
    }
    context;
    static BACKGROUND = "#555555";
    static CANVAS_WIDTH = 1024;
    static CANVAS_HEIGHT = 512;
    // Draws a point at (x,y) as a square of size `size` and color `color`
    drawPoint(x, y, size, color = "#000000") {
      this.context.fillStyle = color;
      this.context.fillRect(x - size / 2, y - size / 2, size, size);
      this.context.fillStyle = void 0;
    }
    // Draws a square at (x,y) with width `w`, height `h`, and color `color`
    drawRect(x, y, w, h, color = "#000000") {
      this.context.fillStyle = color;
      this.context.fillRect(x, y, w, h);
      this.context.fillStyle = void 0;
    }
    // Draws a segment from (x0,y0) to (x1,y1) and color `color`
    drawLine(x0, y0, x1, y1, color = "#000000") {
      this.context.beginPath();
      this.context.strokeStyle = color;
      this.context.lineTo(x0, y0);
      this.context.lineTo(x1, y1);
      this.context.stroke();
    }
    // Clears the current canvas fills it with a background color
    clear() {
      this.context.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
      this.context.fillStyle = _Graphics.BACKGROUND;
      this.context.fillRect(0, 0, this.$canvas.width, this.$canvas.height);
      this.context.fillStyle = void 0;
    }
  };

  // src/app.ts
  (function main() {
    const map = new Map();
    const gfx = new Graphics(document.getElementById("canvas"));
    const player = new Player(300, 300, Math.PI);
    const camera = new Camera(player, map);
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
    });
    let lastTick = 0, delta = 0;
    const loop = () => {
      requestAnimationFrame((currentTick) => {
        delta = currentTick - lastTick;
        lastTick = currentTick;
        gfx.clear();
        map.draw(gfx);
        camera.draw(gfx);
        player.draw(gfx);
        setTimeout(loop, Math.max(33 - delta, 0));
      });
    };
    loop();
  })();
})();
