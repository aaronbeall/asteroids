import Stats from "stats.js";

setTimeout(create);

function create() {
  const container = createContainerElement();
  container.style.overflow = "hidden";
  document.body.appendChild(container);

  const game = new Game(container);
}

class Game {
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
    
    const frameTime = 1 // (time - this.lastUpdateTime) / Game.FRAME_TIME;
    this.lastUpdateTime = time;
    this.objects.forEach(obj => {
      obj.update(frameTime);
      obj.render();
    });

    this.stats.end();

    this.animationFrameHandle = requestAnimationFrame(this.update)
  };

  stop() {
    this.animationFrameHandle && cancelAnimationFrame(this.animationFrameHandle);
  }

  addRocks(count: number, source?: { x: number; y: number; iteration: number; }) {
    while (count--)
      this.addObject(this.createRock(source));
  }

  createRock(source?: { x: number; y: number; iteration: number; }) {
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

  addBullet(args: { x: number; y: number; degrees: number; vector: { x: number; y: number; } }) {
    this.addObject(this.createBullet(args));
  }

  createBullet({ x, y, degrees, vector }: { x: number; y: number; degrees: number; vector: { x: number; y: number; } }) {
    const bullet = new Bullet(this, degrees, vector);
    bullet.x = x;
    bullet.y = y;
    return bullet;
  }

  addParticles(count: number, source: { x: number; y: number; angleDegrees?: number; spreadDegrees?: number; }) {
    const { x, y, angleDegrees = 0, spreadDegrees = 360 } = source;
    while (count--) {
      const degrees = angleDegrees - spreadDegrees / 2 + spreadDegrees * Math.random();
      this.addObject(this.createParticle({ x, y, degrees }));
    }
  }

  createParticle({ x, y, degrees }: { x: number; y: number; degrees: number; }) {
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

  getObjectsIntersectingCircle<T extends GameObject = GameObject>({ radius, ...point }: { x: number; y: number; radius: number }, type?: { new(...args: any[]): T }): T[] {
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

abstract class GameObject {
  x: number = 0;
  y: number = 0;
  radius: number = 0;
  rotation: number = 0;
  friction: number = 0;
  vector: { x: number; y: number } = { x: 0, y: 0 };
  graphics = createContainerElement();

  constructor(public game: Game) { }

  abstract draw(): void;

  createCanvas() {
    const canvas = createRadialCanvasElement(this.radius);
    this.graphics.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(`Context not ready`);
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
  }

  loop() {
    const viewport = this.game.viewport;
    if (this.x > viewport.width + this.radius) this.x -= viewport.width + this.radius * 2;
    else if (this.x < -this.radius) this.x += viewport.width + this.radius * 2;
    if (this.y > viewport.height + this.radius) this.y -= viewport.height + this.radius * 2;
    else if (this.y < -this.radius) this.y += viewport.height + this.radius * 2;
  }
}

class Rock extends GameObject {
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

class Player extends GameObject {
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
      this.game.addParticles(1, { x: this.x + offset.x, y: this.y + offset.y, angleDegrees: this.rotation - 180, spreadDegrees: 35 })
    }
    this.refire -= 1 * frameTime;
    if (this.keyboard.isDown("Space") && this.refire <= 0) {
      this.refire = this.refireDelay;
      const offset = vector({ length: this.radius, degrees: this.rotation });
      this.game.addBullet({ x: this.x + offset.x, y: this.y + offset.y, degrees: this.rotation, vector: this.vector });
    }
  }
}

class Bullet extends GameObject {
  speed = 10;
  life = 120;
  impactDepth = 3;

  constructor(game: Game, degrees: number, initVector: { x: number; y: number; }) {
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
    } else {
      const collidedRocks = this.game.getObjectsIntersectingCircle({
        x: this.x,
        y: this.y,
        radius: -this.impactDepth
      }, Rock);
      if (collidedRocks.length) {
        this.game.addParticles(5, { x: this.x, y: this.y });
        this.game.removeObject(this);
        collidedRocks.forEach(rock => rock.hit())
      }
    }
  }
}

class Particle extends GameObject {
  canvas!: HTMLCanvasElement;
  color = "gray";
  minSpeed = 10;
  maxSpeed = 50;
  maxScale = 15;

  constructor(game: Game, degrees: number) {
    super(game);
    this.radius = 2;
    this.rotation = degrees;
    const speed = this.minSpeed + (this.maxSpeed - this.minSpeed) * Math.random();
    this.vector = vector({ length: speed, degrees });
    this.friction = .88;
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

// class UFO extends GameObject {
//  
// }

class KeyboardController {
  keys: { [code: string]: boolean; } = {};

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    // console.log("keyDown", e.code);
    this.keys[e.code] = true;
  };
  handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  isDown(key: string): boolean {
    return !!this.keys[key];
  }
}

function createContainerElement() {
  const elem = document.createElement("div");
  elem.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0;`;
  return elem;
}

function createRadialCanvasElement(radius: number) {
  const elem = document.createElement("canvas");
  elem.style.cssText = `position: absolute; top: -${radius}px; left: -${radius}px`;
  elem.width = radius * 2;
  elem.height = radius * 2;
  return elem;
}

const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);
const radiansToDegrees = (radians: number) => radians * (180 / Math.PI);

function vector(args: { length: number; degrees: number }): { x: number; y: number; }
function vector(args: { length: number; radians: number }): { x: number; y: number; }
function vector({ length, ...radiansOrDegrees }: ({ radians: number; } | { degrees: number; }) & { length: number; }): { x: number; y: number; } {
  const radians = "radians" in radiansOrDegrees
    ? radiansOrDegrees.radians
    : degreesToRadians(radiansOrDegrees.degrees);
  return {
    x: Math.cos(radians) * length,
    y: Math.sin(radians) * length
  }
}

function vectorLength({ x, y }: { x: number; y: number; }): number {
  return Math.sqrt((x * x) + (y * y));
}

function distanceBetween(from: { x: number; y: number; }, to: { x: number; y: number; }): number {
  const deltaX = from.x - to.x;
  const deltaY = from.y - to.y;
  return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
}