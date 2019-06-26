import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { vector } from "./math-utils";
import { KeyboardController } from "./KeyboardController";

export class Player extends GameObject {
  rotationSpeed = 3;
  thrustSpeed = .15;
  refireDelay = 5;
  keyboard = new KeyboardController();
  refire = 0;

  constructor(game: Game) {
    super(game);
    this.radius = 12;
    this.friction = .99;
  }

  draw() {
    const { ctx } = this.createCanvas();
    ctx.beginPath();
    ctx.moveTo(this.radius * 2, this.radius);
    ctx.lineTo(0, this.radius * 2);
    ctx.lineTo(this.radius / 2, this.radius);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  }
  
  update(frameTime: number) {
    super.update(frameTime);
    if (this.keyboard.isDown("ArrowLeft")) {
      this.rotation -= this.rotationSpeed * frameTime;
    }
    if (this.keyboard.isDown("ArrowRight")) {
      this.rotation += this.rotationSpeed * frameTime;
    }
    if (this.keyboard.isDown("ArrowUp")) {
      const { x, y } = vector({ length: this.thrustSpeed * frameTime, degrees: this.rotation });
      this.vector.x += x * frameTime;
      this.vector.y += y * frameTime;
      const offset = vector({ length: this.radius + this.radius * Math.random(), degrees: this.rotation - 180 });
      this.game.addParticles(1, { x: this.x + offset.x, y: this.y + offset.y, angleDegrees: this.rotation - 180, spreadDegrees: 35 });
    }
    this.refire -= 1 * frameTime;
    if (this.keyboard.isDown("Space") && this.refire <= 0) {
      this.refire = this.refireDelay;
      const offset = vector({ length: this.radius, degrees: this.rotation });
      this.game.addBullet({ x: this.x + offset.x, y: this.y + offset.y, degrees: this.rotation, vector: this.vector });
    }
  }
}
