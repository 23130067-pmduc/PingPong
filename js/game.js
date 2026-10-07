import { canvas, menuScreen, gameScreen, resultScreen, levelSelectScreen, levelButtons, resultTitle, resultText, restartButton, nextButton, scoreElement, levelElement, paddle, bricks, bubbles, balls, bossProjectiles, bossPortals, pressedKeys, maxImplementedLevel, state } from "./state.js";
import { resetControls, clampPaddle } from "./controls.js";
import { resetBall, updateBalls, updateBubbles } from "./ball.js";
import { createBricks } from "./levels.js";
import { updateMovingBricks, updateDisappearingWalls, updateRepairBricks, updateGates, updatePortals } from "./bricks.js";
import { updateBoss, updateBossPortals, updateBossProjectiles } from "./boss.js";

export function startGame() {
    state.gameState = "playing";
    menuScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    levelSelectScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    state.score = 0;
    scoreElement.textContent = state.score;
    levelElement.textContent = state.currentLevel;
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.previousX = paddle.x;
    resetControls();
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    state.bossState = null;
    state.bossPlayerHp = 5;
    state.bossPlayerHitCooldown = 0;
    state.levelGuideVisible = true;
    state.isPaused = false;
    state.guideDismissKey = null;
    createBricks();
    resetBall();
}

export function showLevelSelect() {
    state.gameState = "levelSelect";
    menuScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    levelSelectScreen.classList.remove("hidden");
    levelButtons.forEach((button) => {
            const level = Number(button.dataset.level);
            button.disabled = level > maxImplementedLevel;
        }
    );
}

export function showMenu() {
    state.gameState = "menu";
    gameScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    levelSelectScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    resetControls();
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    state.bossState = null;
    state.levelGuideVisible = false;
    state.isPaused = false;
    state.guideDismissKey = null;
    resetBall();
}

export function winGame() {
    if (state.gameState !== "playing") {
        return;
    }

    state.gameState = "won";
    resetControls();
    balls.length = 0;
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    gameScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    if (state.currentLevel === 10) {
        resultTitle.textContent = "HOÀN THÀNH GAME";
        resultText.textContent = `Bạn đã đánh bại Turtle Boss với ${state.score} điểm.`;
    } else {
        resultTitle.textContent = "THẮNG";
        resultText.textContent = `Bạn đã hoàn thành màn ${state.currentLevel} với ${state.score} điểm.`;
    }

    restartButton.classList.add("hidden");

    if (state.currentLevel < maxImplementedLevel) {
        nextButton.classList.remove("hidden");
    } else {
        nextButton.classList.add("hidden");
    }
}

export function loseGame() {
    if (state.gameState !== "playing") {
        return;
    }

    state.gameState = "lost";
    resetControls();
    balls.length = 0;
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    gameScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");
    resultTitle.textContent = "THUA";
    resultText.textContent = `Bạn đạt được ${state.score} điểm.`;
    restartButton.classList.remove("hidden");
    nextButton.classList.add("hidden");
}

export function checkWinCondition() {
    if (state.currentLevel === 10) {
        const hasBossPart = bricks.some((brick) => brick.active && brick.bossPart);

        if (!hasBossPart) {
            winGame();
        }

        return;
    }

    const hasBreakableBrick = bricks.some((brick) => brick.active && brick.breakable !== false);

    if (!hasBreakableBrick) {
        winGame();
    }
}

export function update(deltaTime) {
    if (state.gameState !== "playing") {
        return;
    }

    if (state.levelGuideVisible || state.isPaused) return;

    const steps = Math.max(1, Math.ceil(deltaTime / (1 / 120)));
    const stepTime = deltaTime / steps;

    for (let i = 0; i < steps; i++) {
        const leftPressed = pressedKeys.has("ArrowLeft") || pressedKeys.has("KeyA");
        const rightPressed = pressedKeys.has("ArrowRight") || pressedKeys.has("KeyD");

        if (leftPressed || rightPressed) {
            paddle.previousX = paddle.x;
        }

        if (leftPressed && !rightPressed) {
            paddle.x -= paddle.speed * stepTime;
        } else if (rightPressed && !leftPressed) {
            paddle.x += paddle.speed * stepTime;
        } else if (leftPressed && rightPressed) {
            paddle.x += paddle.speed * state.lastHorizontalDirection * stepTime;
        }
        clampPaddle();

        updateMovingBricks(stepTime);
        updateDisappearingWalls(stepTime);
        updateGates(stepTime);
        updatePortals(stepTime);
        updateRepairBricks(stepTime);
        updateBoss(stepTime);
        updateBossPortals(stepTime);
        updateBossProjectiles(stepTime);

        if (state.gameState !== "playing") {
            break;
        }

        updateBubbles(stepTime);
        updateBalls(stepTime);

        paddle.previousX = paddle.x;

        if (state.gameState !== "playing") {
            break;
        }
    }
}
