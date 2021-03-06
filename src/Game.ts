import Stats from "stats.js";
import { distanceBetween } from "./math-utils";
import { Particle } from "./Particle";
import { Bullet } from "./Bullet";
import { Player } from "./Player";
import { Rock } from "./Rock";
import { GameObject } from "./GameObject";

export class Game {
  static FRAME_TIME = 1000 / 60;
  objects: GameObject[] = [];
  animationFrameHandle?: number;
  lastUpdateTime?: number;
  stats = new Stats();

  constructor(public container: HTMLElement) {
    container.appendChild(this.stats.dom);
    this.addRocks(3);
    this.addPlayer();
    this.start();
  }

  start() {
    this.lastUpdateTime = performance.now();
    this.animationFrameHandle = requestAnimationFrame(this.update);
  }

  update = (time: number) => {
    this.stats.begin();
    const frameTime = 1; // (time - this.lastUpdateTime) / Game.FRAME_TIME;
    this.lastUpdateTime = time;
    this.objects.forEach(obj => {
      obj.update(frameTime);
      obj.render();
    });
    this.stats.end();
    this.animationFrameHandle = requestAnimationFrame(this.update);
  };

  stop() {
    this.animationFrameHandle && cancelAnimationFrame(this.animationFrameHandle);
  }

  addRocks(count: number, source?: {
    x: number;
    y: number;
    iteration: number;
  }) {
    while (count--)
      this.addObject(this.createRock(source));
  }

  createRock(source?: {
    x: number;
    y: number;
    iteration: number;
  }) {
    const rock = new Rock(this, source ? source.iteration : undefined);
    rock.x = source ? source.x : Math.random() * this.viewport.width;
    rock.y = source ? source.y : Math.random() * this.viewport.height;
    return rock;
  }

  addPlayer() {
    this.addObject(this.createPlayer());
  }

  createPlayer() {
    const player = new Player(this);
    player.x = this.viewport.width / 2;
    player.y = this.viewport.height / 2;
    return player;
  }

  addBullet(args: {
    x: number;
    y: number;
    degrees: number;
    vector: {
      x: number;
      y: number;
    };
  }) {
    this.addObject(this.createBullet(args));
  }

  createBullet({ x, y, degrees, vector }: {
    x: number;
    y: number;
    degrees: number;
    vector: {
      x: number;
      y: number;
    };
  }) {
    const bullet = new Bullet(this, degrees, vector);
    bullet.x = x;
    bullet.y = y;
    return bullet;
  }

  addParticles(count: number, source: {
    x: number;
    y: number;
    angleDegrees?: number;
    spreadDegrees?: number;
  }) {
    const { x, y, angleDegrees = 0, spreadDegrees = 360 } = source;
    while (count--) {
      const degrees = angleDegrees - spreadDegrees / 2 + spreadDegrees * Math.random();
      this.addObject(this.createParticle({ x, y, degrees }));
    }
  }

  createParticle({ x, y, degrees }: {
    x: number;
    y: number;
    degrees: number;
  }) {
    const particle = new Particle(this, degrees);
    particle.x = x;
    particle.y = y;
    return particle;
  }

  addObject(obj: GameObject) {
    this.objects.push(obj);
    obj.draw();
    obj.render();
    this.container.appendChild(obj.graphics);
  }

  removeObject(obj: GameObject) {
    this.objects.splice(this.objects.indexOf(obj), 1);
    this.container.removeChild(obj.graphics);
  }

  getObjectsIntersectingCircle<T extends GameObject = GameObject>({ radius, ...point }: {
    x: number;
    y: number;
    radius: number;
  }, type?: {
    new(...args: any[]): T;
  }): T[] {
    const objects = type
      ? this.objects.filter(obj => obj instanceof type) as T[]
      : this.objects as T[];
    return objects.filter(obj => {
      return distanceBetween(point, obj) <= obj.radius + radius;
    });
  }
  get viewport() {
    return this.container.getBoundingClientRect();
  }
}
