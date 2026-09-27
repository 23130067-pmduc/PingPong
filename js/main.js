const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const playButton = document.getElementById("playButton");

let gameState = "menu";

const paddle = {
    x: 390,
    y: 550,
    width: 120,
    height: 14,
    speed: 550
};

let score = 0;

const scoreElement = document.getElementById("score");
scoreElement.textContent = score;

const brickConfig = {
    rows: 4,
    columns: 6,
    width: 120,
    height: 24,
    gap: 12,
    top: 70,
    colors: ["#f87171", "#fb923c", "#facc15", "#4ade80"]
};

const bricks = [];

function createBricks() {
    bricks.length = 0;

    const totalWidth =
        brickConfig.columns * brickConfig.width +
        (brickConfig.columns - 1) * brickConfig.gap;

    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < brickConfig.rows; row++) {
        for (let column = 0; column < brickConfig.columns; column++) {
            bricks.push({
                x: startX + column * (brickConfig.width + brickConfig.gap),
                y: brickConfig.top + row * (brickConfig.height + brickConfig.gap),
                width: brickConfig.width,
                height: brickConfig.height,
                color: brickConfig.colors[row],
                active: true
            });
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
    paddle.x = Math.max(
        0,
        Math.min(paddle.x, canvas.width - paddle.width)
    );
}

function resetBall() {
    ball.launched = false;
    ball.vx = 0;
    ball.vy = 0;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
}

// Bắt đầu và đặt lại màn chơi.
function startGame() {
    gameState = "playing";

    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    score = 0;
    scoreElement.textContent = score;

    paddle.x = (canvas.width - paddle.width) / 2;

    keys.left = false;
    keys.right = false;
    controlMode = null;

    createBricks();
    resetBall();
}

playButton.addEventListener("click", startGame);

// Điều khiển bàn phím.
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

    const mouseIsActive =
        controlMode === "mouse" &&
        performance.now() - lastMouseMoveTime < MOUSE_IDLE_TIME;

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
    keys.left = false;
    keys.right = false;
    controlMode = null;
    lastMouseMoveTime = -Infinity;
});

// Điều khiển bằng chuột.
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

        const mouseX =
            (event.clientX - rect.left - borderLeft) *
            (canvas.width / displayWidth);

        paddle.x = mouseX - paddle.width / 2;

        clampPaddle();
    }

);

function drawBricks() {
    for (const brick of bricks) {
        if (!brick.active) {
            continue;
        }

        ctx.fillStyle = brick.color;
        ctx.fillRect(
            brick.x,
            brick.y,
            brick.width,
            brick.height
        );

        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(
            brick.x + 2,
            brick.y + 2,
            brick.width - 4,
            4
        );
    }
}

// Va chạm giữa bóng và gạch.
function checkBrickCollisions() {
    for (const brick of bricks) {
        if (!brick.active) {
            continue;
        }

        const closestX = Math.max(
            brick.x,
            Math.min(ball.x, brick.x + brick.width)
        );

        const closestY = Math.max(
            brick.y,
            Math.min(ball.y, brick.y + brick.height)
        );

        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > ball.radius * ball.radius) {
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

            const nearestFace = faces.reduce(
                (nearest, face) =>
                    face.depth < nearest.depth
                        ? face
                        : nearest
            );

            normalX = nearestFace.nx;
            normalY = nearestFace.ny;
            penetration = ball.radius + nearestFace.depth;
        }

        ball.x += normalX * (penetration + 0.01);
        ball.y += normalY * (penetration + 0.01);

        const velocityAlongNormal =
            ball.vx * normalX +
            ball.vy * normalY;

        if (velocityAlongNormal < 0) {
            ball.vx -=
                2 * velocityAlongNormal * normalX;

            ball.vy -=
                2 * velocityAlongNormal * normalY;
        }

        brick.active = false;

        score += 1;
        scoreElement.textContent = score;

        break;
    }
}

// Cập nhật bóng và xử lý va chạm.
function updateBall(deltaTime) {
    if (!ball.launched) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
        return;
    }

    const previousY = ball.y;

    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;

    if (
        ball.x - ball.radius <= 0 &&
        ball.vx < 0
    ) {
        ball.x = ball.radius;
        ball.vx = -ball.vx;
    }

    if (
        ball.x + ball.radius >= canvas.width &&
        ball.vx > 0
    ) {
        ball.x = canvas.width - ball.radius;
        ball.vx = -ball.vx;
    }

    if (
        ball.y - ball.radius <= 0 &&
        ball.vy < 0
    ) {
        ball.y = ball.radius;
        ball.vy = -ball.vy;
    }

    checkBrickCollisions();

    const crossedPaddleTop =
        previousY + ball.radius <= paddle.y &&
        ball.y + ball.radius >= paddle.y;

    const overlapsPaddle =
        ball.x + ball.radius >= paddle.x &&
        ball.x - ball.radius <= paddle.x + paddle.width;

    if (
        ball.vy > 0 &&
        crossedPaddleTop &&
        overlapsPaddle
    ) {
        ball.y = paddle.y - ball.radius;

        const paddleCenter =
            paddle.x + paddle.width / 2;

        const hitPosition = Math.max(
            -1,
            Math.min(
                (ball.x - paddleCenter) /
                (paddle.width / 2),
                1
            )
        );

        const maxAngle = Math.PI / 3;
        const bounceAngle =
            hitPosition * maxAngle;

        ball.vx =
            ball.speed * Math.sin(bounceAngle);

        ball.vy =
            -ball.speed * Math.cos(bounceAngle);
    }

    if (
        ball.y - ball.radius >
        canvas.height
    ) {
        resetBall();
    }
}

function update(deltaTime) {
    if (gameState !== "playing") {
        return;
    }

    const steps = Math.max(
        1,
        Math.ceil(deltaTime / (1 / 120))
    );

    const stepTime =
        deltaTime / steps;

    for (let i = 0; i < steps; i++) {
        if (keys.left) {
            paddle.x -=
                paddle.speed * stepTime;
        }

        if (keys.right) {
            paddle.x +=
                paddle.speed * stepTime;
        }

        clampPaddle();
        updateBall(stepTime);
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

// Vòng lặp chính của game.
function gameLoop(currentTime) {
    const deltaTime =
        lastTime === null
            ? 0
            : Math.min(
                (currentTime - lastTime) / 1000,
                0.05
            );

    lastTime = currentTime;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);