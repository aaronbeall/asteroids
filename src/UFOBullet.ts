import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { Player } from "./Player";
import { Rock } from "./Rock";
import { vector } from "./math-utils";

export class UFOBullet extends GameObject {
  speed = 6;
  life = 180;
  // simple counter to throttle trail emission
  private trailTick = 0;

  constructor(game: Game, degrees: number, initVector: { x: number; y: number }) {
    super(game);
    this.radius = 4;
    this.rotation = degrees;
    this.vector = vector({ length: this.speed, degrees });
    this.vector.x += initVector.x;
    this.vector.y += initVector.y;
  }

  draw() {
    const { canvas, ctx } = this.createCanvas();
    ctx.beginPath();
    ctx.moveTo(this.radius * 2, this.radius);
    ctx.lineTo(this.radius * 1.2, this.radius * 2);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(this.radius * 1.2, 0);
    ctx.closePath();
    ctx.fillStyle = '#4caf50';
    ctx.fill();
    canvas.style.transform = `scaleX(2)`;
  }

  update(frameTime: number) {
    super.update(frameTime);
    this.life -= frameTime;
    if (this.life <= 0) {
      this.game.removeObject(this);
      return;
    }

    // emit a small green trail periodically
    this.trailTick += frameTime;
    if (this.trailTick >= 2) { // emit roughly every couple frames
      this.trailTick = 0;
      this.game.addParticles(1, { x: this.x, y: this.y }, { color: '#66bb6a', minSpeed: .5, maxSpeed: 3, maxScale: 12, friction: 0.9, radius: 1 });
    }

    // hit player
    const players = this.game.getObjectsIntersectingCircle({ x: this.x, y: this.y, radius: this.radius }, Player);
    if (players.length) {
      const p = players[0] as Player;
      p.hit(1);
      this.game.removeObject(this);
      return;
    }

    // hit rocks
    const rocks = this.game.getObjectsIntersectingCircle({ x: this.x, y: this.y, radius: this.radius }, Rock);
    if (rocks.length) {
      rocks.forEach(r => r.kill());
      this.game.addParticles(8, { x: this.x, y: this.y });
      this.game.removeObject(this);
      return;
    }
  }
}
