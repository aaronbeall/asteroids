import { Game } from "./Game";
import { createContainerElement } from "./dom-utils";

setTimeout(create);

function create() {
  const container = createContainerElement();
  container.style.overflow = "hidden";
  document.body.appendChild(container);

  const game = new Game(container);
}