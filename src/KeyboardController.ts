export class KeyboardController {
  keys: {
    [code: string]: boolean;
  } = {};

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
