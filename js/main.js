const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const levelSelectScreen = document.getElementById("levelSelectScreen");

const levelButton = document.getElementById("levelButton");
const levelBackButton = document.getElementById("levelBackButton");

const levelButtons = document.querySelectorAll(".level-button");

const guideScreen = document.getElementById("guideScreen");

const guideButton = document.getElementById("guideButton");
const guideBackButton = document.getElementById("guideBackButton");

const playButton = document.getElementById("playButton");
const restartButton = document.getElementById("restartButton");
const nextButton = document.getElementById("nextButton");
const homeButton = document.getElementById("homeButton");

const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");


let gameState = "menu";

let currentLevel = 1;
const maxImplementedLevel = 4;

const exitGameButton = document.getElementById("exitGameButton");

exitGameButton.addEventListener("click", () => {
    showMenu();
});

const paddle = {
    x: 390,
    y: 550,
    width: 100,
    height: 14,
    speed: 550
};

let score = 0;
scoreElement.textContent = score;

const brickConfig = {
    rows: 4,
    columns: 6,
    width: 100,
    height: 24,
    gap: 16,
    top: 70,
    colors: ["#f87171", "#fb923c", "#facc15", "#4ade80"]
};

const bricks = [];

function createLevel1() {
    bricks.length = 0;

    const totalWidth = brickConfig.columns * brickConfig.width + (brickConfig.columns - 1) * brickConfig.gap;

    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < brickConfig.rows; row++) {
        for (let column = 0; column < brickConfig.columns; column++) {
            bricks.push({
                x: startX + column * (brickConfig.width + brickConfig.gap),
                y: brickConfig.top + row * (brickConfig.height + brickConfig.gap),
                width: brickConfig.width,
                height: brickConfig.height,
                color: brickConfig.colors[row],
                active: true,
                moving: false
            });
        }
    }
}

function createLevel2() {
    bricks.length = 0;

    const totalWidth =
        brickConfig.columns * brickConfig.width +
        (brickConfig.columns - 1) * brickConfig.gap;

    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < brickConfig.rows; row++) {
        for (let column = 0; column < brickConfig.columns; column++) {
            const x =
                startX +
                column * (brickConfig.width + brickConfig.gap);

            bricks.push({
                x: x,
                y: brickConfig.top + row * (brickConfig.height + brickConfig.gap),
                width: brickConfig.width,
                height: brickConfig.height,
                color: brickConfig.colors[row],
                active: true,

                moving: true,
                moveSpeed: 80,
                moveDirection: row % 2 === 0 ? 1 : -1,
                minX: x - 40,
                maxX: x + 40
            });
        }
    }
}

function createLevel3() {
    bricks.length = 0;

    const levelConfig = {
        ...brickConfig,
        width: 90,
        height: 22,
        gap: 18
    };

    const totalWidth = levelConfig.columns * levelConfig.width + (levelConfig.columns - 1) * levelConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;
    const moveRange = 30;

    for (let row = 0; row < levelConfig.rows; row++) {
        for (let column = 0; column < levelConfig.columns; column++) {
            const x = startX + column * (levelConfig.width + levelConfig.gap);

            const unbreakable =
                (row === 1 && (column === 0 || column === 4)) ||
                (row === 2 && (column === 2 || column === 5));

            const moving = row === 0 || row === 3;

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: unbreakable ? "#475569" : levelConfig.colors[row],
                active: true,
                moving: moving && !unbreakable,
                moveSpeed: 80,
                moveDirection: row === 0 ? 1 : -1,
                minX: x - moveRange,
                maxX: x + moveRange,
                type: unbreakable ? "unbreakable" : "normal",
                breakable: !unbreakable
            });
        }
    }
}

function createLevel4() {
    bricks.length = 0;

    const levelConfig = {
        rows: 4,
        columns: 6,
        width: 85,
        height: 22,
        gap: 18,
        top: 65,
        colors: brickConfig.colors
    };

    const totalWidth = levelConfig.columns * levelConfig.width + (levelConfig.columns - 1) * levelConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;
    const moveRange = 25;

    for (let row = 0; row < levelConfig.rows; row++) {
        for (let column = 0; column < levelConfig.columns; column++) {
            const x = startX + column * (levelConfig.width + levelConfig.gap);

            const unbreakable =
                (row === 1 && (column === 0 || column === 4));
            const moving = !unbreakable && (row === 0 || row === 3);

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: unbreakable ? "#475569" : levelConfig.colors[row],
                active: true,
                moving: moving,
                moveSpeed: 70,
                moveDirection: row === 0 ? 1 : -1,
                minX: x - moveRange,
                maxX: x + moveRange,
                type: unbreakable ? "unbreakable" : "normal",
                breakable: !unbreakable
            });
        }
    }

    const wallWidth = 18;
    const wallHeight = 110;
    const wallY = 230;
    const wallOffset = 140;

    const leftWallX = canvas.width / 2 - wallOffset - wallWidth / 2;
    const rightWallX = canvas.width / 2 + wallOffset - wallWidth / 2;

    bricks.push({
        x: leftWallX,
        y: wallY,
        width: wallWidth,
        height: wallHeight,
        color: "#a855f7",
        active: true,
        moving: false,
        type: "disappearing",
        breakable: false,
        visible: true,
        timer: 0,
        visibleTime: 2,
        hiddenTime: 2,
        opacity: 1
    });

    bricks.push({
        x: rightWallX,
        y: wallY,
        width: wallWidth,
        height: wallHeight,
        color: "#a855f7",
        active: true,
        moving: false,
        type: "disappearing",
        breakable: false,
        visible: false,
        timer: 2,
        visibleTime: 2,
        hiddenTime: 2,
        opacity: 0
    });
}

function createBricks() {
    if (currentLevel === 1) {
        createLevel1();
    } else if (currentLevel === 2) {
        createLevel2();
    } else if (currentLevel === 3) {
        createLevel3();
    } else if (currentLevel === 4) {
        createLevel4();
    }
}

function updateMovingBricks(deltaTime) {
    for (const brick of bricks) {
        if (!brick.active || !brick.moving) {
            continue;
        }

        brick.x +=
            brick.moveSpeed *
            brick.moveDirection *
            deltaTime;

        if (brick.x <= brick.minX) {
            brick.x = brick.minX;
            brick.moveDirection = 1;
        } else if (brick.x >= brick.maxX) {
            brick.x = brick.maxX;
            brick.moveDirection = -1;
        }
    }
}

function updateDisappearingWalls(deltaTime) {
    for (const brick of bricks) {
        if (brick.type !== "disappearing") {
            continue;
        }

        const cycleTime = brick.visibleTime + brick.hiddenTime;
        brick.timer = (brick.timer + deltaTime) % cycleTime;
        brick.visible = brick.timer < brick.visibleTime;

        if (!brick.visible) {
            brick.opacity = 0;
            continue;
        }

        const remainingTime = brick.visibleTime - brick.timer;

        if (remainingTime <= 0.5) {
            brick.opacity = 0.35 + (remainingTime / 0.5) * 0.65;
        } else {
            brick.opacity = 1;
        }
    }
}

createBricks();

const ball = {
    x: paddle.x + paddle.width / 2,
    y: paddle.y - 9,
    radius: 9,
    speed: 360,
    vx: 0,
    vy: 0,
    launched: false
};

const keys = {
    left: false,
    right: false
};

let controlMode = null;
let lastMouseMoveTime = -Infinity;

const MOUSE_IDLE_TIME = 200;

function clampPaddle() {
    paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
}

function resetBall() {
    ball.launched = false;
    ball.vx = 0;
    ball.vy = 0;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
}

function resetControls() {
    keys.left = false;
    keys.right = false;
    controlMode = null;
    lastMouseMoveTime = -Infinity;
}

/* Chuyển trạng thái màn hình */

function startGame() {
    gameState = "playing";

    menuScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    guideScreen.classList.add("hidden");
    levelSelectScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    score = 0;
    scoreElement.textContent = score;
    levelElement.textContent = currentLevel;

    paddle.x = (canvas.width - paddle.width) / 2;

    resetControls();
    createBricks();
    resetBall();
}

function showLevelSelect() {
    gameState = "levelSelect";

    menuScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    guideScreen.classList.add("hidden");

    levelSelectScreen.classList.remove("hidden");

    levelButtons.forEach((button) => {
        const level = Number(button.dataset.level);

        button.disabled = level > maxImplementedLevel;
    });
}

function showGuide() {
    gameState = "guide";

    menuScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    guideScreen.classList.remove("hidden");
}

levelButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedLevel = Number(button.dataset.level);

        if (selectedLevel > maxImplementedLevel) {
            return;
        }

        currentLevel = selectedLevel;
        startGame();
    });
});

function showMenu() {
    gameState = "menu";

    gameScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    guideScreen.classList.add("hidden");
    levelSelectScreen.classList.add("hidden");

    menuScreen.classList.remove("hidden");

    resetControls();
    resetBall();
}
levelButton.addEventListener("click", () => {
    showLevelSelect();
});
levelBackButton.addEventListener("click", () => {
    showMenu();
});
guideButton.addEventListener("click", () => {
    showGuide();
});

guideBackButton.addEventListener("click", () => {
    showMenu();
});
function winGame() {
    if (gameState !== "playing") {
        return;
    }

    gameState = "won";

    resetControls();

    ball.launched = false;
    ball.vx = 0;
    ball.vy = 0;

    gameScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    resultTitle.textContent = "THẮNG";
    resultText.textContent = `Bạn đã hoàn thành màn ${currentLevel} với ${score} điểm.`;

    restartButton.classList.add("hidden");

    if (currentLevel < maxImplementedLevel) {
        nextButton.classList.remove("hidden");
    } else {
        nextButton.classList.add("hidden");
    }
}

function loseGame() {
    if (gameState !== "playing") {
        return;
    }

    gameState = "lost";

    resetControls();

    ball.launched = false;
    ball.vx = 0;
    ball.vy = 0;

    gameScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    resultTitle.textContent = "THUA";
    resultText.textContent = `Bạn đạt được ${score} điểm.`;

    restartButton.classList.remove("hidden");
    nextButton.classList.add("hidden");
}

playButton.addEventListener("click", () => {
    currentLevel = 1;
    startGame();
});

restartButton.addEventListener("click", () => {
    startGame();
});

nextButton.addEventListener("click", () => {
    if (currentLevel >= maxImplementedLevel) {
        return;
    }

    currentLevel += 1;
    startGame();
});

homeButton.addEventListener("click", () => {
    showMenu();
});

/* Điều khiển */

window.addEventListener("keydown", (event) => {
    if (gameState !== "playing") {
        return;
    }

    if (event.code === "Space") {
        event.preventDefault();

        if (!ball.launched && !event.repeat) {
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius;

            ball.launched = true;

            const angle = Math.PI / 12;

            ball.vx = ball.speed * Math.sin(angle);
            ball.vy = -ball.speed * Math.cos(angle);
        }

        return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
    }

    event.preventDefault();

    const mouseIsActive = controlMode === "mouse" && performance.now() - lastMouseMoveTime < MOUSE_IDLE_TIME;
    if (mouseIsActive) {
        return;
    }

    controlMode = "keyboard";

    if (event.key === "ArrowLeft") {
        keys.left = true;
    }

    if (event.key === "ArrowRight") {
        keys.right = true;
    }
});

window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") {
        keys.left = false;
    }

    if (event.key === "ArrowRight") {
        keys.right = false;
    }

    if (controlMode === "keyboard" && !keys.left && !keys.right) {
        controlMode = null;
    }
});

window.addEventListener("blur", () => {
    resetControls();
});

canvas.addEventListener("mousemove", (event) => {
    if (gameState !== "playing") {
        return;
    }

    if (controlMode === "keyboard") {
        return;
    }

    controlMode = "mouse";
    lastMouseMoveTime = performance.now();

    const rect = canvas.getBoundingClientRect();
    const style = getComputedStyle(canvas);

    const borderLeft = parseFloat(style.borderLeftWidth) || 0;
    const borderRight = parseFloat(style.borderRightWidth) || 0;

    const displayWidth = rect.width - borderLeft - borderRight;

    if (displayWidth <= 0) {
        return;
    }

    const mouseX = (event.clientX - rect.left - borderLeft) * (canvas.width / displayWidth);
    paddle.x = mouseX - paddle.width / 2;
    clampPaddle();
});

function drawBricks() {
    for (const brick of bricks) {
        if (!brick.active) {
            continue;
        }

        if (
            brick.type === "disappearing" &&
            !brick.visible
        ) {
            continue;
        }

        if (brick.type === "disappearing") {
            ctx.save();

            ctx.globalAlpha = brick.opacity;

            ctx.fillStyle = brick.color;
            ctx.fillRect(
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );

            ctx.strokeStyle = "#e9d5ff";
            ctx.lineWidth = 2;

            ctx.strokeRect(
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );

            ctx.restore();

            continue;
        }

        ctx.fillStyle = brick.color;

        ctx.fillRect(
            brick.x,
            brick.y,
            brick.width,
            brick.height
        );

        if (brick.type === "unbreakable") {
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 2;

            ctx.strokeRect(
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );

            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(
                brick.x + 4,
                brick.y + 4,
                brick.width - 8,
                3
            );
        } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(
                brick.x + 2,
                brick.y + 2,
                brick.width - 4,
                4
            );
        }
    }
}

/* Va chạm bóng với gạch */

function checkWinCondition() {
    const hasBreakableBrick = bricks.some(
        (brick) =>
            brick.active &&
            brick.breakable !== false
    );

    if (!hasBreakableBrick) {
        winGame();
    }
}

function checkBrickCollisions() {
    for (const brick of bricks) {
        if (!brick.active) {
            continue;
        }

        if (
            brick.type === "disappearing" &&
            !brick.visible
        ) {
            continue;
        }

        const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
        const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));

        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        const distanceSquared = dx * dx + dy * dy;

        if (
            distanceSquared >
            ball.radius * ball.radius
        ) {
            continue;
        }

        const distance = Math.sqrt(distanceSquared);
        let normalX;
        let normalY;
        let penetration;

        if (distance > 0) {
            normalX = dx / distance;
            normalY = dy / distance;
            penetration = ball.radius - distance;
        } else {
            const faces = [
                {
                    depth: ball.x - brick.x,
                    nx: -1,
                    ny: 0
                },
                {
                    depth: brick.x + brick.width - ball.x,
                    nx: 1,
                    ny: 0
                },
                {
                    depth: ball.y - brick.y,
                    nx: 0,
                    ny: -1
                },
                {
                    depth: brick.y + brick.height - ball.y,
                    nx: 0,
                    ny: 1
                }
            ];

            const nearestFace = faces.reduce((nearest, face) =>
                face.depth < nearest.depth ? face : nearest);

            normalX = nearestFace.nx;
            normalY = nearestFace.ny;

            penetration = ball.radius + nearestFace.depth;
        }

        ball.x += normalX * (penetration + 0.01);
        ball.y += normalY * (penetration + 0.01);
        const velocityAlongNormal = ball.vx * normalX + ball.vy * normalY;

        if (velocityAlongNormal < 0) {
            ball.vx -= 2 * velocityAlongNormal * normalX;
            ball.vy -= 2 * velocityAlongNormal * normalY;
        }

        if (brick.breakable === false) {
            break;
        }

        brick.active = false;

        score += 1;
        scoreElement.textContent = score;

        checkWinCondition();

        break;
    }
}
/* Cập nhật bóng */

function updateBall(deltaTime) {
    if (!ball.launched) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
        return;
    }

    const previousY = ball.y;
    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;

    if (ball.x - ball.radius <= 0 && ball.vx < 0) {

        ball.x = ball.radius;
        ball.vx = -ball.vx;
    }

    if (ball.x + ball.radius >= canvas.width && ball.vx > 0) {

        ball.x = canvas.width - ball.radius;
        ball.vx = -ball.vx;
    }

    if (ball.y - ball.radius <= 0 && ball.vy < 0) {

        ball.y = ball.radius;
        ball.vy = -ball.vy;
    }

    checkBrickCollisions();
    if (gameState !== "playing") {
        return;
    }

    const crossedPaddleTop = previousY + ball.radius <= paddle.y && ball.y + ball.radius >= paddle.y;
    const overlapsPaddle = ball.x + ball.radius >= paddle.x && ball.x - ball.radius <= paddle.x + paddle.width;

    if (ball.vy > 0 && crossedPaddleTop && overlapsPaddle) {

        ball.y = paddle.y - ball.radius;
        const paddleCenter = paddle.x + paddle.width / 2;
        const hitPosition = Math.max(-1,
            Math.min((ball.x - paddleCenter) / (paddle.width / 2), 1));

        const maxAngle = Math.PI / 3;
        const bounceAngle = hitPosition * maxAngle;

        ball.vx = ball.speed * Math.sin(bounceAngle);
        ball.vy = -ball.speed * Math.cos(bounceAngle);
    }

    if (ball.y - ball.radius > canvas.height) {
        loseGame();
    }
}

function update(deltaTime) {
    if (gameState !== "playing") {
        return;
    }
    const steps = Math.max(1, Math.ceil(deltaTime / (1 / 120)));
    const stepTime = deltaTime / steps;

    for (let i = 0; i < steps; i++) {
        if (keys.left) {
            paddle.x -= paddle.speed * stepTime;
        }

        if (keys.right) {
            paddle.x += paddle.speed * stepTime;
        }

        clampPaddle();
        updateMovingBricks(stepTime);
        updateDisappearingWalls(stepTime);
        updateBall(stepTime);

        if (gameState !== "playing") {
            break;
        }
    }
}

function draw() {
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBricks();
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
    );

    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

let lastTime = null;

/* Vòng lặp chính */

function gameLoop(currentTime) {
    const deltaTime = lastTime === null ? 0 : Math.min((currentTime - lastTime) / 1000, 0.05);

    lastTime = currentTime;
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
