import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { Rock } from "./Rock";
import { UFO } from "./UFO";
import { vector } from "./math-utils";

export class Bullet extends GameObject {
  speed = 10;
  life = 120;
  impactDepth = 3;

  constructor(game: Game, degrees: number, initVector: {
    x: number;
    y: number;
  }) {
    super(game);
    this.radius = 3;
    this.rotation = degrees;
    this.vector = vector({ length: this.speed, degrees });
    this.vector.x += initVector.x;
    this.vector.y += initVector.y;
  }

  draw() {
    const { canvas, ctx } = this.createCanvas();
    ctx.beginPath();
    ctx.moveTo(this.radius * 2, this.radius);
    ctx.lineTo(this.radius * 1.5, this.radius * 2);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(this.radius * 1.5, 0);
    ctx.closePath();
    ctx.fill();
    canvas.style.transform = `scaleX(3)`;
  }
  
  update(frameTime: number) {
    super.update(frameTime);
    this.life -= frameTime;
    if (this.life <= 0) {
      this.game.removeObject(this);
    }
    else {
      const collidedRocks = this.game.getObjectsIntersectingCircle({
        x: this.x,
        y: this.y,
        radius: -this.impactDepth
      }, Rock);
      if (collidedRocks.length) {
        this.game.addParticles(5, { x: this.x, y: this.y });
        this.game.removeObject(this);
        collidedRocks.forEach(rock => rock.hit());
      }
      else {
        const ufoHits = this.game.getObjectsIntersectingCircle({ x: this.x, y: this.y, radius: -this.impactDepth }, UFO);
        if (ufoHits.length) {
          // damage UFO
          try { (ufoHits[0] as UFO).hit(1); } catch (e) {}
          this.game.addParticles(8, { x: this.x, y: this.y }, { color: 'orange', minSpeed: 2, maxSpeed: 12 });
          this.game.removeObject(this);
        }
      }
    }
  }
}
