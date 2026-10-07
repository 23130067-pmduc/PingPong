import { canvas, ctx, gameScreen, levelButton, levelBackButton, levelButtons, playButton, restartButton, nextButton, homeButton, exitGameButton, paddle, balls, bubbles, state, levelGuides, maxImplementedLevel } from "./state.js";
import { drawBricks } from "./bricks.js";
import { drawBossPortals, drawBossShield, drawBossProjectiles, drawBossHUD } from "./boss.js";
import { startGame, showLevelSelect, showMenu } from "./game.js";

export function drawBubbles() {
    for (const bubble of bubbles) {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);

        if (bubble.type === "add2") {
            ctx.fillStyle = "#22c55e";
        } else if (bubble.type === "add3") {
            ctx.fillStyle = "#38bdf8";
        } else if (bubble.type === "multiply") {
            ctx.fillStyle = "#a855f7";
        }

        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (bubble.type === "add2") {
            ctx.fillText("+2", bubble.x, bubble.y);
        } else if (bubble.type === "add3") {
            ctx.fillText("+3", bubble.x, bubble.y);
        } else if (bubble.type === "multiply") {
            ctx.fillText("×2", bubble.x, bubble.y);
        }
    }
}

export function drawLevelGuide() {
    if (!state.levelGuideVisible || state.gameState !== "playing") {
        return;
    }

    const guideText = levelGuides[state.currentLevel];

    ctx.save();

    ctx.fillStyle = "rgba(2, 6, 23, 0.92)";
    ctx.fillRect(70, 185, 760, 230);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.strokeRect(70, 185, 760, 230);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 28px Arial";
    ctx.fillText(`LEVEL ${state.currentLevel}`, canvas.width / 2, 225);

    ctx.fillStyle = "#ffffff";

    let fontSize = 18;
    ctx.font = `${fontSize}px Arial`;

    while (ctx.measureText(guideText).width > 680 && fontSize > 13) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Arial`;
    }

    ctx.fillText(guideText, canvas.width / 2, 290);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "15px Arial";
    ctx.fillText("A/D hoặc ←/→: di chuyển     Space: thả bóng     Esc: tạm dừng", canvas.width / 2, 340);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.fillText("NHẤN PHÍM BẤT KỲ ĐỂ BẮT ĐẦU", canvas.width / 2, 385);

    ctx.restore();
}

export function drawPauseOverlay() {
    if (!state.isPaused || state.gameState !== "playing") return;
    ctx.save();
    ctx.fillStyle = "rgba(2, 6, 23, 0.86)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 34px Arial";
    ctx.fillText("TẠM DỪNG", canvas.width / 2, 272);
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.fillText("Nhấn Esc để tiếp tục", canvas.width / 2, 327);
    ctx.restore();
}

export function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();

    if (state.currentLevel === 10 && state.gameState === "playing") {
        drawBossPortals();
        drawBossShield();
    }

    drawBubbles();

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
    );

    for (const ball of balls) {
        ctx.beginPath();
        ctx.arc(
            ball.x,
            ball.y,
            ball.radius,
            0,
            Math.PI * 2
        );

        if (state.currentLevel === 10 && state.bossState && state.bossState.chargedTimer > 0) {
            ctx.fillStyle = "#22d3ee";
            ctx.shadowBlur = 14;
            ctx.shadowColor = "#22d3ee";
        } else if (state.currentLevel === 6 || state.currentLevel === 7 || state.currentLevel === 8) {
            if (ball.hp === 3) {
                ctx.fillStyle = "#ffffff";
            } else if (ball.hp === 2) {
                ctx.fillStyle = "#facc15";
            } else {
                ctx.fillStyle = "#f87171";
            }
        } else {
            ctx.fillStyle = "#ffffff";
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        if (state.currentLevel === 6 || state.currentLevel === 7 || state.currentLevel === 8) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 11px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(`HP ${ball.hp}`, ball.x, ball.y - 13);
        }
    }

    if (state.currentLevel === 10 && state.gameState === "playing") {
        drawBossProjectiles();
        drawBossHUD();
    }

    drawLevelGuide();
    drawPauseOverlay();
}

export function bindUiEvents() {
    exitGameButton.addEventListener("click", () => { showMenu(); });
    levelButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedLevel = Number(button.dataset.level);
            if (selectedLevel > maxImplementedLevel) return;
            state.currentLevel = selectedLevel;
            startGame();
        });
    });
    levelButton.addEventListener("click", () => { showLevelSelect(); });
    levelBackButton.addEventListener("click", () => { showMenu(); });
    playButton.addEventListener("click", () => { state.currentLevel = 1; startGame(); });
    restartButton.addEventListener("click", () => { startGame(); });
    nextButton.addEventListener("click", () => {
        if (state.currentLevel >= maxImplementedLevel) return;
        state.currentLevel += 1;
        startGame();
    });
    homeButton.addEventListener("click", () => { showMenu(); });
}
