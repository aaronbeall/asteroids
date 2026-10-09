import { Game } from "./Game";
import { createRadialCanvasElement } from "./dom-utils";
import { createContainerElement } from "./dom-utils";

export abstract class GameObject {
  x: number = 0;
  y: number = 0;
  radius: number = 0;
  rotation: number = 0;
  friction: number = 0;
  vector: {
    x: number;
    y: number;
  } = { x: 0, y: 0 };
  graphics = createContainerElement();
  blinking = false;
  blinkPhase = 1000;

  constructor(public game: Game) { }

  abstract draw(): void;

  createCanvas() {
    const canvas = createRadialCanvasElement(this.radius);
    this.graphics.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error(`Context not ready`);
    return { canvas, ctx };
  }

  update(frameTime: number): void {
    if (this.friction) {
      this.vector.x *= this.friction;
      this.vector.y *= this.friction;
    }
    if (this.vector.x !== 0 || this.vector.x !== 0) {
      this.x += this.vector.x * frameTime;
      this.y += this.vector.y * frameTime;
      this.loop();
    }
  }

  render() {
    this.graphics.style.left = `${this.x}px`;
    this.graphics.style.top = `${this.y}px`;
    this.graphics.style.transform = `rotate(${this.rotation}deg)`;
    this.graphics.style.transformOrigin = `top left`;

    if (this.blinking) {
      const now = performance.now();
      // use blinkingPhase (ms) for the full fade-in/out period
      const phase = (Math.sin((now / this.blinkPhase) * Math.PI * 2) + 1) / 2;
      this.graphics.style.opacity = String(phase);
    } else {
      this.graphics.style.opacity = '1';
    }
  }

  loop() {
    const viewport = this.game.viewport;
    if (this.x > viewport.width + this.radius)
      this.x -= viewport.width + this.radius * 2;
    else if (this.x < -this.radius)
      this.x += viewport.width + this.radius * 2;
    if (this.y > viewport.height + this.radius)
      this.y -= viewport.height + this.radius * 2;
    else if (this.y < -this.radius)
      this.y += viewport.height + this.radius * 2;
  }
}
