import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { Player } from "./Player";

export class Powerup extends GameObject {
  lifetime = 3600;
  blinkThreshold = 900;
  hitRadius = 30;

  constructor(game: Game) {
    super(game);
    this.radius = 10;
    // give a small random drift so the powerup slowly floats
    const angle = Math.random() * 360;
    const speed = 0.15 + Math.random() * 0.2;
    this.vector = { x: Math.cos(angle * Math.PI / 180) * speed, y: Math.sin(angle * Math.PI / 180) * speed };
    this.friction = 0.995;
  }

  draw() {
    const { canvas, ctx } = this.createCanvas();
    ctx.save();

    // draw a filled circle
    ctx.beginPath();
    ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#2e7d32';
    ctx.fill();
    // draw white plus
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', this.radius, this.radius + 1);
    ctx.restore();
  }

  update(frameTime: number) {
    super.update(frameTime);
    this.lifetime -= frameTime;
    // enable blinking when near expiry
    if (this.lifetime <= this.blinkThreshold) {
      this.blinking = true;
    } else {
      this.blinking = false;
    }

    if (this.lifetime <= 0) {
      this.game.removeObject(this);
      return;
    }

    // collide with player (use a larger hit radius so pickup feels forgiving)
    const players = this.game.getObjectsIntersectingCircle({ x: this.x, y: this.y, radius: this.hitRadius }, Player);
    if (players.length) {
      const p = players[0] as Player;
      p.health = Math.min(p.maxHealth, p.health + 1);
      // spawn a small green burst
      this.game.addParticles(10, { x: this.x, y: this.y }, { color: '#4caf50', minSpeed: 2, maxSpeed: 12, maxScale: 10 });
      this.game.removeObject(this);
      return;
    }
  }
}
