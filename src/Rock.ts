import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { vector } from "./math-utils";

export class Rock extends GameObject {
  spin: number;
  health: number;
  static maxIteration = 3;
  static rocksSpawnedOnDeath = 3;

  constructor(game: Game, public iteration: number = 1) {
    super(game);
    this.iteration = iteration;
    this.health = 12 - iteration * 2;
    this.spin = Math.random() * iteration;
    this.radius = 75 / iteration;
    this.vector = vector({ length: iteration, degrees: Math.random() * 360 });
  }

  draw() {
    const { ctx } = this.createCanvas();
    ctx.beginPath();
    ctx.translate(this.radius, this.radius);
    const edges = 12, noise = .44;
    for (let i = 0; i < edges; i++) {
      const degrees = ((360 / edges) * i) + ((360 / edges) * noise * Math.random());
      const length = this.radius - (this.radius * noise * Math.random());
      const { x, y } = vector({ length, degrees });
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  update(frameTime: number) {
    super.update(frameTime);
    this.rotation += this.spin * frameTime;
  }
  
  hit() {
    if (--this.health <= 0) {
      this.game.removeObject(this);
      this.game.addParticles(25, { x: this.x, y: this.y });
      if (this.iteration < Rock.maxIteration) {
        const iteration = this.iteration + 1;
        this.game.addRocks(Rock.rocksSpawnedOnDeath, { x: this.x, y: this.y, iteration });
      }
    }
  }
}
