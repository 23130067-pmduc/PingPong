import { canvas, paddle, balls, pressedKeys, state } from "./state.js";

export function clampPaddle() {
    paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
}

export function resetControls() {
    pressedKeys.clear();
    state.lastHorizontalDirection = 0;
}

export function bindControls() {
    window.addEventListener("keydown", (event) => {
        if (state.gameState !== "playing") {
            return;
        }

        if (state.levelGuideVisible) {
            event.preventDefault();
            if (!event.repeat) { state.levelGuideVisible = false; state.guideDismissKey = event.code; resetControls(); }
            return;
        }

        if (event.code === state.guideDismissKey) { event.preventDefault(); return; }

        if (event.code === "Escape") {
            event.preventDefault();
            if (!event.repeat) { state.isPaused = !state.isPaused; resetControls(); }
            return;
        }

        if (state.isPaused) return;

        if (event.code === "Space") {
            event.preventDefault();

            if (!event.repeat) {
                const ball = balls[0];

                if (ball && !ball.launched) {
                    ball.x = paddle.x + paddle.width / 2;
                    ball.y = paddle.y - ball.radius;
                    ball.launched = true;

                    const angle = Math.PI / 12;
                    ball.vx = ball.speed * Math.sin(angle);
                    ball.vy = -ball.speed * Math.cos(angle);
                }
            }

            return;
        }

        const isLeft = event.code === "ArrowLeft" || event.code === "KeyA";
        const isRight = event.code === "ArrowRight" || event.code === "KeyD";

        if (!isLeft && !isRight) {
            return;
        }

        event.preventDefault();
        pressedKeys.add(event.code);

        if (!event.repeat) {
            if (isLeft) {
                state.lastHorizontalDirection = -1;
            }

            if (isRight) {
                state.lastHorizontalDirection = 1;
            }
        }
    });

    window.addEventListener("keyup", (event) => {
        if (event.code === state.guideDismissKey) state.guideDismissKey = null;
        if (event.code === "ArrowLeft" || event.code === "ArrowRight" ||
            event.code === "KeyA" || event.code === "KeyD") {
            pressedKeys.delete(event.code);
        }
    });

    window.addEventListener("blur", () => {
        resetControls();
    });
}
