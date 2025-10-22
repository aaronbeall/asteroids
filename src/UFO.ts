import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { vector, angleBetween } from "./math-utils";
import { Player } from "./Player";
import { UFOBullet } from "./UFOBullet";
import { Powerup } from "./Powerup";

export class UFO extends GameObject {
  speed = 0.02;
  health = 6;
  fireCooldown = 0;

  constructor(game: Game) {
    super(game);
    this.radius = 22;
    this.friction = .995;
  }

  draw() {
    const { canvas, ctx } = this.createCanvas();
    ctx.beginPath();
    ctx.ellipse(this.radius, this.radius, this.radius, this.radius / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#616161';
    ctx.fill();
    ctx.fillStyle = '#81c784';
    ctx.fillRect(this.radius - 6, this.radius - 6, 12, 12);
  }

  update(frameTime: number) {
    super.update(frameTime);
    // pursue player
    const player = this.game.objects.find(o => o instanceof Player) as Player | undefined;
    if (player) {
      const angle = angleBetween(this, player);
      const v = vector({ length: this.speed, degrees: angle });
      this.vector.x += v.x * frameTime;
      this.vector.y += v.y * frameTime;

      // occasionally fire
      this.fireCooldown -= frameTime;
      if (this.fireCooldown <= 0) {
        this.fireCooldown = 120 + Math.random() * 240;
        const bullet = new UFOBullet(this.game, angle, this.vector);
        bullet.x = this.x;
        bullet.y = this.y;
        this.game.addObject(bullet);
      }
    }
  }

  hit(damage = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      // spawn powerup
      const p = new Powerup(this.game);
      p.x = this.x;
      p.y = this.y;
      this.game.addObject(p);
      // big explosion
      this.game.addParticles(32, { x: this.x, y: this.y }, { color: 'red', minSpeed: 2, maxSpeed: 24, maxScale: 20 });
      this.game.removeObject(this);
    }
  }
}

