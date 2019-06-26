import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { vector, vectorLength } from "./math-utils";

export class Particle extends GameObject {
  canvas!: HTMLCanvasElement;
  color = "gray";
  minSpeed = 10;
  maxSpeed = 50;
  maxScale = 15;

  constructor(game: Game, degrees: number) {
    super(game);
    this.radius = 2;
    this.rotation = degrees;
    const speed = this.minSpeed + (this.maxSpeed - this.minSpeed) * Math.random();
    this.vector = vector({ length: speed, degrees });
    this.friction = .88;
  }

  draw() {
    const { canvas, ctx } = this.createCanvas();
    this.canvas = canvas;
    ctx.beginPath();
    ctx.moveTo(this.radius * 2, 0);
    ctx.lineTo(this.radius * 2, this.radius * 2);
    ctx.lineTo(0, this.radius);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update(frameTime: number) {
    super.update(frameTime);
    const speed = vectorLength(this.vector);
    if (speed < 1) {
      this.game.removeObject(this);
    }
  }
  
  render() {
    super.render();
    const speed = vectorLength(this.vector);
    const scale = this.maxScale * (speed / this.maxSpeed);
    this.canvas.style.transform = `scaleX(${scale})`;
  }
}
