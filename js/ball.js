import { canvas, paddle, balls, bubbles, MAX_BALLS, state } from "./state.js";
import { checkBrickCollisions, ejectBallFromPortalRoom } from "./bricks.js";
import { loseGame } from "./game.js";

export function createBall(x, y, vx = 0, vy = 0, launched = false) {
    return {
        x: x,
        y: y,
        radius: 9,
        speed: 360,
        vx: vx,
        vy: vy,
        launched: launched,
        hp: 3,
        destroyed: false,
        lavaCooldown: 0,
        switchCooldown: 0,
        portalCooldown: 0,
        inPortalRoom: false,
        portalRoomTimer: 0
    };
}

export function resetBall() {
    balls.length = 0;
    balls.push(createBall(paddle.x + paddle.width / 2, paddle.y - 9));
}

export function updateBall(ball, deltaTime) {
    if (ball.lavaCooldown > 0) {
        ball.lavaCooldown = Math.max(0, ball.lavaCooldown - deltaTime);
    }

    if (ball.switchCooldown > 0) {
        ball.switchCooldown = Math.max(0, ball.switchCooldown - deltaTime);
    }

    if (ball.portalCooldown > 0) {
        ball.portalCooldown = Math.max(0, ball.portalCooldown - deltaTime);
    }

    if (ball.inPortalRoom) {
        ball.portalRoomTimer -= deltaTime;

        if (ball.portalRoomTimer <= 0) {
            ejectBallFromPortalRoom(ball);
        }
    }

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

    checkBrickCollisions(ball);

    if (ball.destroyed || state.gameState !== "playing") {
        return;
    }

    const paddleLeft = Math.min(paddle.previousX, paddle.x);
    const paddleRight = Math.max(paddle.previousX + paddle.width, paddle.x + paddle.width);
    const crossedPaddleTop = previousY + ball.radius <= paddle.y && ball.y + ball.radius >= paddle.y;
    const touchesPaddleHeight = ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height;
    const overlapsPaddle = ball.x + ball.radius >= paddleLeft && ball.x - ball.radius <= paddleRight;

    if (ball.vy > 0 && overlapsPaddle && (crossedPaddleTop || touchesPaddleHeight)) {
        ball.y = paddle.y - ball.radius;

        const currentPaddleOverlap = ball.x + ball.radius >= paddle.x && ball.x - ball.radius <= paddle.x + paddle.width;
        const previousPaddleOverlap = ball.x + ball.radius >= paddle.previousX && ball.x - ball.radius <= paddle.previousX + paddle.width;

        let paddleCenter;

        if (currentPaddleOverlap) {
            paddleCenter = paddle.x + paddle.width / 2;
        } else if (previousPaddleOverlap) {
            paddleCenter = paddle.previousX + paddle.width / 2;
        } else {
            paddleCenter = ball.x;
        }

        const hitPosition = Math.max(-1, Math.min((ball.x - paddleCenter) / (paddle.width / 2), 1));
        const maxAngle = Math.PI / 3;
        const bounceAngle = hitPosition * maxAngle;

        ball.vx = ball.speed * Math.sin(bounceAngle);
        ball.vy = -ball.speed * Math.cos(bounceAngle);
    }
}

export function updateBalls(deltaTime) {
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        updateBall(ball, deltaTime);
        if (state.gameState !== "playing") {
            return;
        }
        if (ball.destroyed || ball.y - ball.radius > canvas.height) {
            balls.splice(i, 1);
        }
    }
    if (balls.length === 0 && state.gameState === "playing") {
        loseGame();
    }
}

export function updateBubbles(deltaTime) {
    const paddleLeft = Math.min(paddle.previousX, paddle.x);
    const paddleRight = Math.max(paddle.previousX + paddle.width, paddle.x + paddle.width);

    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.y += bubble.speed * deltaTime;
        const touchesPaddle = bubble.y + bubble.radius >= paddle.y && bubble.y - bubble.radius <=
            paddle.y + paddle.height && bubble.x + bubble.radius >= paddleLeft && bubble.x - bubble.radius <=
            paddleRight;

        if (touchesPaddle) {
            applyBubbleEffect(bubble.type);
            bubbles.splice(i, 1);
            continue;
        }

        if (bubble.y - bubble.radius > canvas.height) {
            bubbles.splice(i, 1);
        }
    }
}

export function applyBubbleEffect(type) {
    if (type === "add2") {
        addBallsFromPaddle(2);
    } else if (type === "add3") {
        addBallsFromPaddle(3);
    } else if (type === "multiply") {
        multiplyBalls();
    }
}

export function addBallsFromPaddle(amount) {
    const availableSlots = MAX_BALLS - balls.length;
    const count = Math.min(amount, availableSlots);

    if (count <= 0) {
        return;
    }

    const startX = paddle.x + paddle.width / 2;
    const startY = paddle.y - 9;

    for (let i = 0; i < count; i++) {
        let angle = 0;

        if (count > 1) {
            angle = -0.3 + (0.6 * i) / (count - 1);
        }

        const speed = 360;
        const vx = speed * Math.sin(angle);
        const vy = -speed * Math.cos(angle);

        balls.push(createBall(startX, startY, vx, vy, true));
    }
}

export function multiplyBalls() {
    const originalBalls = [...balls];
    const availableSlots = MAX_BALLS - balls.length;
    const cloneCount = Math.min(originalBalls.length, availableSlots);

    for (let i = 0; i < cloneCount; i++) {
        const source = originalBalls[i];
        const angleOffset = i % 2 === 0 ? 0.18 : -0.18;
        const cos = Math.cos(angleOffset);
        const sin = Math.sin(angleOffset);
        const newVx = source.vx * cos - source.vy * sin;
        const newVy = source.vx * sin + source.vy * cos;

        const clone = createBall(source.x, source.y, newVx, newVy, true);
        clone.hp = source.hp;
        clone.lavaCooldown = source.lavaCooldown;
        clone.switchCooldown = source.switchCooldown;
        clone.portalCooldown = source.portalCooldown;
        clone.inPortalRoom = source.inPortalRoom;
        clone.portalRoomTimer = source.portalRoomTimer;

        balls.push(clone);
    }
}
