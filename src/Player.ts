import { Game } from "./Game";
import { GameObject } from "./GameObject";
import { vector } from "./math-utils";
import { KeyboardController } from "./KeyboardController";
import { Particle } from "./Particle";
import { Rock } from "./Rock";

export class Player extends GameObject {
  rotationSpeed = 3;
  thrustSpeed = .15;
  refireDelay = 10;
  keyboard = new KeyboardController();
  refire = 0;
  health = 4;
  maxHealth = 4;
  dead = false;
  invulnerable = false;
  invulnerableUntil = 0;
  flashInterval = 80; // ms
  color = 'black';
  private lastFlashPhase: number | null = null;

  constructor(game: Game) {
    super(game);
    this.radius = 12;
    this.friction = .99;
  }

  draw() {
    // if dead, don't draw the ship anymore
    if (this.dead) {
      // clear any existing canvas so the ship disappears
      const existing = this.graphics.querySelector('canvas') as HTMLCanvasElement | null;
      if (existing) {
        const ctx = existing.getContext('2d')!;
        ctx.clearRect(0, 0, existing.width, existing.height);
      }
      return;
    }

    // reuse existing canvas if present to avoid appending multiple canvases
    let canvas = this.graphics.querySelector('canvas') as HTMLCanvasElement | null;
    let ctx: CanvasRenderingContext2D;
    if (canvas) {
      ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      const res = this.createCanvas();
      canvas = res.canvas;
      ctx = res.ctx;
    }

    ctx.beginPath();
    ctx.moveTo(this.radius * 2, this.radius);
    ctx.lineTo(0, this.radius * 2);
    ctx.lineTo(this.radius / 2, this.radius);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  
  update(frameTime: number) {
    // if dead, ignore input and movement
    if (this.dead) return;

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

    // handle invulnerability timing and flashing
    const now = performance.now();
    if (this.invulnerable) {
      if (now >= this.invulnerableUntil) {
        this.invulnerable = false;
        this.color = 'black';
        this.lastFlashPhase = null;
        this.draw();
      } else {
        // flash effect: toggle color between red and black
        const phase = Math.floor(now / this.flashInterval) % 2;
        if (this.lastFlashPhase !== phase) {
          this.lastFlashPhase = phase;
          this.color = phase ? 'red' : 'black';
          this.draw();
        }
      }
    }

    // collision detection with rocks
    if (!this.invulnerable) {
      const hits = this.game.getObjectsIntersectingCircle({ x: this.x, y: this.y, radius: this.radius }, Rock);
      if (hits.length > 0) {
          // break the rock we collided with
          hits.forEach(rock => rock.kill());

          // take one hit
          this.health -= 1;

          // spawn red sparks via game helper
          this.game.addParticles(16, { x: this.x, y: this.y, angleDegrees: 0, spreadDegrees: 360 }, { color: 'red', minSpeed: 2, maxSpeed: 12, maxScale: 12, friction: .92 });

          // if health dropped to zero or below, spawn a massive red burst and mark dead
          if (this.health <= 0) {
            // big dramatic burst
            this.game.addParticles(64, { x: this.x, y: this.y, angleDegrees: 0, spreadDegrees: 360 }, { color: 'red', minSpeed: 2, maxSpeed: 24, maxScale: 24, friction: .92 });
            this.game.addParticles(64, { x: this.x, y: this.y, angleDegrees: 0, spreadDegrees: 360 }, { color: 'red', minSpeed: 1, maxSpeed: 24, maxScale: 24, friction: .98 });
            this.dead = true;
            // hide the ship's graphics immediately
            this.graphics.style.display = 'none';
          }

          // set invulnerability
          this.invulnerable = true;
          this.invulnerableUntil = now + 1000;
      }
    }
  }
}
