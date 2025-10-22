import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { vector, vectorLength } from "./math-utils";

export interface ParticleOptions {
  color?: string;
  minSpeed?: number;
  maxSpeed?: number;
  maxScale?: number;
  friction?: number;
  radius?: number;
}

export class Particle extends GameObject {
  canvas!: HTMLCanvasElement;
  color = "gray";
  minSpeed = 10;
  maxSpeed = 50;
  maxScale = 15;
  friction = 0.88;
  radius = 2;

  constructor(game: Game, degrees: number, opts: ParticleOptions = {}) {
    super(game);
    this.rotation = degrees;

    // apply options with defaults
    Object.assign(this, opts);

    const speed = this.minSpeed + (this.maxSpeed - this.minSpeed) * Math.random();
    this.vector = vector({ length: speed, degrees });
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
