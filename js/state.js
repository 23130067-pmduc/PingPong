export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");

export const menuScreen = document.getElementById("menuScreen");
export const gameScreen = document.getElementById("gameScreen");
export const resultScreen = document.getElementById("resultScreen");
export const levelSelectScreen = document.getElementById("levelSelectScreen");
export const levelButton = document.getElementById("levelButton");
export const levelBackButton = document.getElementById("levelBackButton");
export const levelButtons = document.querySelectorAll(".level-button");
export const playButton = document.getElementById("playButton");
export const restartButton = document.getElementById("restartButton");
export const nextButton = document.getElementById("nextButton");
export const homeButton = document.getElementById("homeButton");
export const resultTitle = document.getElementById("resultTitle");
export const resultText = document.getElementById("resultText");
export const scoreElement = document.getElementById("score");
export const levelElement = document.getElementById("level");
export const exitGameButton = document.getElementById("exitGameButton");
export const maxImplementedLevel = 10;

export const paddle = { x: 390, previousX: 390, y: 550, width: 100, height: 14, speed: 550 };
export const brickConfig = { rows: 4, columns: 6, width: 100, height: 24, gap: 16, top: 70,
    colors: ["#f87171", "#fb923c", "#facc15", "#4ade80"] };
export const bricks = [];
export const bubbles = [];
export const balls = [];
export const bossProjectiles = [];
export const bossPortals = [];
export const pressedKeys = new Set();
export const MAX_BALLS = 12;

export const state = {
    gameState: "menu", currentLevel: 1, score: 0, bossState: null,
    bossPlayerHp: 5, bossPlayerHitCooldown: 0, levelGuideVisible: false,
    isPaused: false, guideDismissKey: null, lastHorizontalDirection: 0
};

export const levelGuides = {
    1: "Phá hết gạch để qua màn. Dùng A/D hoặc phím mũi tên để đỡ bóng, Space để thả bóng.",
    2: "Hai hàng trên cùng và dưới cùng di chuyển lên xuống, các hàng giữa di chuyển trái phải.",
    3: "Gạch xám không thể phá. Hãy đưa bóng vòng qua chúng để phá những gạch còn lại.",
    4: "Hai tường tím vừa ẩn hiện vừa đổi vị trí trên quãng đường dài. Canh thời điểm để đưa bóng qua.",
    5: "Phá gạch để nhận +2, +3 hoặc ×2 bóng. Các tường tím cũng sẽ di chuyển và ẩn hiện.",
    6: "Gạch LAVA làm mất 1 HP của bóng khi chạm vào. Bóng hết HP sẽ bị phá.",
    7: "Phá gạch có dấu + để ngăn hồi sinh gạch. Né LAVA và các khối xám không thể phá.",
    8: "Đánh bóng vào S để mở cổng 5 giây. Hàng trên và dưới di chuyển lên xuống, chú ý LAVA.",
    9: "Dùng Portal A và B để đưa bóng vào khu vực chứa gạch. Cổng sẽ đổi vị trí theo thời gian.",
    10: "Boss có 3 Phase. Đạn đỏ gây sát thương, vàng có thể đánh trả, tím nảy tường. Phase 3 có khiên."
};
