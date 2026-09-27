const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Trạng thái của thanh đỡ.
const paddle = {
    x: 390,
    y: 550,
    width: 120,
    height: 14,
    speed: 550
};

// Khi 1 phím đang được giữ.
const keys = {
    left: false,
    right: false
};
let controlMode = null;
let lastMouseMoveTime = -Infinity;

const MOUSE_IDLE_TIME = 200;

// Giữ thanh đỡ nằm trong vùng chơi.
function clampPaddle() {
    paddle.x = Math.max(
        0,
        Math.min(paddle.x, canvas.width - paddle.width)
    );
}

window.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
    }

    event.preventDefault();

    // Chuột vẫn đang được sử dụng thì chưa nhận bàn phím.
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

    // Chỉ nhường quyền khi đã thả cả hai phím.
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
canvas.addEventListener("mousemove", (event) => {
    // Bàn phím đang giữ quyền thì bỏ qua chuột.
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

    const mouseX =
        (event.clientX - rect.left - borderLeft)
        * (canvas.width / displayWidth);

    paddle.x = mouseX - paddle.width / 2;
    clampPaddle();
});
function update(deltaTime) {
    if (keys.left) {
        paddle.x -= paddle.speed * deltaTime;
    }

    if (keys.right) {
        paddle.x += paddle.speed * deltaTime;
    }

    clampPaddle();
}

function draw() {
    // Xóa hình cũ.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
    );

    //Trạng thái bóng lúc đầu.
    ctx.beginPath();
    ctx.arc(
        paddle.x + paddle.width / 2,
        paddle.y - 9,
        9,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

let lastTime = null;

function gameLoop(currentTime) {
    //giữ thanh ngang khi chuyển tab.
    const deltaTime = lastTime === null
        ? 0
        : Math.min((currentTime - lastTime) / 1000, 0.05);

    lastTime = currentTime;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);