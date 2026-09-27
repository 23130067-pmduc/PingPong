const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Thanh đỡ.
const paddle = {
    x: 390,
    y: 550,
    width: 120,
    height: 14,
    speed: 550
};

// Bóng.
const ball = {
    x: paddle.x + paddle.width / 2,
    y: paddle.y - 9,
    radius: 9,
    speed: 360,
    vx: 0,
    vy: 0,
    launched: false
};

// Trạng thái phím điều hướng.
const keys = {
    left: false,
    right: false
};

// Phần điều khiển đang giữ quyền.
let controlMode = null;
let lastMouseMoveTime = -Infinity;

const MOUSE_IDLE_TIME = 200;

// Giữ thanh đỡ trong vùng chơi.
function clampPaddle() {
    paddle.x = Math.max(
        0,
        Math.min(paddle.x, canvas.width - paddle.width)
    );
}

// Đặt bóng về trên thanh đỡ.
function resetBall() {
    ball.launched = false;
    ball.vx = 0;
    ball.vy = 0;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
}

// Nhấn phím.
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();

        if (!ball.launched && !event.repeat) {
            // Đồng bộ vị trí trước khi phóng.
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

    // Chuột đang di chuyển thì chưa nhận bàn phím.
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

// Thả phím.
window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") {
        keys.left = false;
    }

    if (event.key === "ArrowRight") {
        keys.right = false;
    }

    // Thả cả hai phím mới nhường quyền cho chuột.
    if (controlMode === "keyboard" && !keys.left && !keys.right) {
        controlMode = null;
    }
});

// Tránh kẹt phím khi chuyển cửa sổ.
window.addEventListener("blur", () => {
    keys.left = false;
    keys.right = false;
    controlMode = null;
    lastMouseMoveTime = -Infinity;
});

// Điều khiển bằng chuột.
canvas.addEventListener("mousemove", (event) => {
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

    // Quy đổi tọa độ chuột sang kích thước gốc của Canvas.
    const mouseX =
        (event.clientX - rect.left - borderLeft) *
        (canvas.width / displayWidth);

    paddle.x = mouseX - paddle.width / 2;
    clampPaddle();
});

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

    // Tường trái.
    if (ball.x - ball.radius <= 0 && ball.vx < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx;
    }

    // Tường phải.
    if (
        ball.x + ball.radius >= canvas.width &&
        ball.vx > 0
    ) {
        ball.x = canvas.width - ball.radius;
        ball.vx = -ball.vx;
    }

    // Trần.
    if (ball.y - ball.radius <= 0 && ball.vy < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy;
    }

    // Bóng đi từ trên xuống và vượt qua mặt thanh đỡ.
    const crossedPaddleTop =
        previousY + ball.radius <= paddle.y &&
        ball.y + ball.radius >= paddle.y;

    const overlapsPaddle =
        ball.x + ball.radius >= paddle.x &&
        ball.x - ball.radius <= paddle.x + paddle.width;

    if (ball.vy > 0 && crossedPaddleTop && overlapsPaddle) {
        ball.y = paddle.y - ball.radius;

        const paddleCenter = paddle.x + paddle.width / 2;

        // -1: mép trái; 0: chính giữa; 1: mép phải.
        const hitPosition = Math.max(
            -1,
            Math.min(
                (ball.x - paddleCenter) / (paddle.width / 2),
                1
            )
        );

        // Góc bật tối đa 60 độ so với phương thẳng đứng.
        const maxAngle = Math.PI / 3;
        const bounceAngle = hitPosition * maxAngle;

        ball.vx = ball.speed * Math.sin(bounceAngle);
        ball.vy = -ball.speed * Math.cos(bounceAngle);
    }

    // Bóng rơi hoàn toàn khỏi màn hình thì đặt lại.
    // Chưa trừ mạng ở mốc này.
    if (ball.y - ball.radius > canvas.height) {
        resetBall();
    }
}

// Cập nhật trạng thái game.
function update(deltaTime) {
    // Chia nhỏ bước cập nhật để xử lý va chạm ổn định hơn.
    const steps = Math.max(
        1,
        Math.ceil(deltaTime / (1 / 120))
    );

    const stepTime = deltaTime / steps;

    for (let i = 0; i < steps; i++) {
        if (keys.left) {
            paddle.x -= paddle.speed * stepTime;
        }

        if (keys.right) {
            paddle.x += paddle.speed * stepTime;
        }

        clampPaddle();
        updateBall(stepTime);
    }
}

// Vẽ khung hình.
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Thanh đỡ.
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
    );

    // Bóng.
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

// Vòng lặp game.
function gameLoop(currentTime) {
    // Đổi sang giây và giới hạn thời gian mỗi khung hình.
    const deltaTime = lastTime === null
        ? 0
        : Math.min((currentTime - lastTime) / 1000, 0.05);

    lastTime = currentTime;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);