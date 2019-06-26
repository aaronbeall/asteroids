export function createContainerElement() {
  const elem = document.createElement("div");
  elem.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0;`;
  return elem;
}

export function createRadialCanvasElement(radius: number) {
  const elem = document.createElement("canvas");
  elem.style.cssText = `position: absolute; top: -${radius}px; left: -${radius}px`;
  elem.width = radius * 2;
  elem.height = radius * 2;
  return elem;
}
