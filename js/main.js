import { scoreElement, state } from "./state.js";
import { createBricks } from "./levels.js";
import { bindControls } from "./controls.js";
import { bindUiEvents, draw } from "./ui.js";
import { update } from "./game.js";

scoreElement.textContent = state.score;
bindControls();
bindUiEvents();
createBricks();

let lastTime = null;
function gameLoop(currentTime) {
    const deltaTime = lastTime === null ? 0 : Math.min((currentTime - lastTime) / 1000, 0.05);
    lastTime = currentTime;
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
