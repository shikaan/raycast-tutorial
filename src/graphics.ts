/// Graphics
export type Color = string;

export class Graphics {
  private readonly context: CanvasRenderingContext2D;
  private static readonly BACKGROUND = "#555555";
  private static readonly CANVAS_WIDTH = 1024
  private static readonly CANVAS_HEIGHT = 512

  constructor(private readonly $canvas: HTMLCanvasElement) {
    this.context = this.$canvas.getContext('2d')
    this.$canvas.width = Graphics.CANVAS_WIDTH;
    this.$canvas.height = Graphics.CANVAS_HEIGHT;
  }

  // Draws a point at (x,y) as a square of size `size` and color `color`
  drawPoint(x: number, y: number, size: number, color: Color = '#000000') {
    this.context.fillStyle = color;
    this.context.fillRect(x - size / 2, y - size / 2, size, size);
    this.context.fillStyle = undefined;
  }

  // Draws a square at (x,y) with width `w`, height `h`, and color `color`
  drawRect(x: number, y: number, w: number, h: number, color: Color = '#000000') {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, w, h);
    this.context.fillStyle = undefined;
  }

  // Draws a segment from (x0,y0) to (x1,y1) and color `color`
  drawLine(x0: number, y0: number, x1: number, y1: number, color: Color = '#000000') {
    this.context.beginPath();
    this.context.strokeStyle = color;
    this.context.lineTo(x0, y0);
    this.context.lineTo(x1, y1);
    this.context.stroke();
  }

  // Clears the current canvas fills it with a background color
  clear() {
    this.context.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
    this.context.fillStyle = Graphics.BACKGROUND;
    this.context.fillRect(0, 0, this.$canvas.width, this.$canvas.height);
    this.context.fillStyle = undefined
  }
}
