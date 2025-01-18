/// Graphics
export type Color = string;

export class Graphics {
  private readonly context: CanvasRenderingContext2D;
  private static readonly BACKGROUND = "#555555";

  constructor(private readonly $canvas: HTMLCanvasElement) {
    this.context = this.$canvas.getContext('2d')
    this.$canvas.width = 1024;
    this.$canvas.height = 512;
  }

  drawPoint(x: number, y: number, size: number, color: Color = '#000000') {
    this.context.fillStyle = color;
    this.context.fillRect(x - size / 2, y - size / 2, size, size);
    this.context.fillStyle = undefined;
  }

  drawRect(x: number, y: number, w: number, h: number, color: Color = '#000000') {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, w, h);
    this.context.fillStyle = undefined;
  }

  drawLine(x0: number, y0: number, x1: number, y1: number, color: Color = '#000000') {
    this.context.beginPath();
    this.context.strokeStyle = color;
    this.context.lineTo(x0, y0);
    this.context.lineTo(x1, y1);
    this.context.stroke();
  }

  clear() {
    this.context.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
    this.context.fillStyle = Graphics.BACKGROUND;
    this.context.fillRect(0, 0, this.$canvas.width, this.$canvas.height);
    this.context.fillStyle = undefined
  }
}
