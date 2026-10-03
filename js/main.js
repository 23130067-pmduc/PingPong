const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const levelSelectScreen = document.getElementById("levelSelectScreen");

const levelButton = document.getElementById("levelButton");
const levelBackButton = document.getElementById("levelBackButton");

const levelButtons = document.querySelectorAll(".level-button");

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
const maxImplementedLevel = 10;

const exitGameButton = document.getElementById("exitGameButton");

exitGameButton.addEventListener("click", () => {
    showMenu();
});

const paddle = {
    x: 390,
    previousX: 390,
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
const bubbles = [];

let bossState = null;
const bossProjectiles = [];
const bossPortals = [];
let bossPlayerHp = 5;
let bossPlayerHitCooldown = 0;
let levelGuideVisible = false;

const levelGuides = {
    1: "Phá hết gạch để qua màn và đừng để bóng rơi khỏi thanh đỡ.",
    2: "Các viên gạch sẽ di chuyển qua lại, hãy canh hướng bóng để phá hết chúng.",
    3: "Gạch màu xám không thể phá, hãy đưa bóng vòng qua chúng để phá các gạch còn lại.",
    4: "Tường màu tím sẽ ẩn hiện liên tục, hãy canh thời điểm để đưa bóng vượt qua.",
    5: "Phá gạch có thể làm rơi +2, +3 hoặc ×2, hứng chúng bằng thanh đỡ để tạo thêm bóng.",
    6: "Gạch LAVA làm bóng mất 1 HP mỗi lần chạm, bóng hết HP sẽ bị phá.",
    7: "Gạch có dấu + sẽ hồi sinh những viên gạch đã bị phá, hãy phá nó càng sớm càng tốt.",
    8: "Đánh bóng vào công tắc S để mở cổng trong 5 giây, cẩn thận với gạch LAVA.",
    9: "Dùng Portal A và B để đưa bóng vào khu vực chứa gạch, các Portal sẽ đổi vị trí theo thời gian.",
    10: "Boss có 3 Phase: đạn đỏ gây sát thương, đạn vàng có thể phản lại Boss, đạn tím nảy tường và Phase 3 có Shield."
};
function createBubble(x, y) {
    const types = ["add2", "add3", "multiply"];
    const type = types[Math.floor(Math.random() * types.length)];

    bubbles.push({
        x: x,
        y: y,
        radius: 12,
        speed: 120,
        type: type,
        active: true
    });
}

function createLevel1() {
    bricks.length = 0;

    const totalWidth = brickConfig.columns * brickConfig.width + (brickConfig.columns - 1) * brickConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < brickConfig.rows; row++) {
        for (
            let column = 0;
            column < brickConfig.columns;
            column++
        ) {
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

function movePortalToRandomPosition(portal) {
    if (!portal.spawnPositions || portal.spawnPositions.length === 0) {
        return;
    }

    let newIndex = Math.floor(Math.random() * portal.spawnPositions.length);

    if (newIndex === portal.spawnIndex) {
        newIndex = (newIndex + 1) % portal.spawnPositions.length;
    }

    portal.spawnIndex = newIndex;
    portal.x = portal.spawnPositions[newIndex].x;
    portal.y = portal.spawnPositions[newIndex].y;
}

function createLevel2() {
    bricks.length = 0;

    const totalWidth = brickConfig.columns * brickConfig.width + (brickConfig.columns - 1) * brickConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;
    for (let row = 0; row < brickConfig.rows; row++) {
        for (let column = 0; column < brickConfig.columns; column++) {
            const x = startX + column * (brickConfig.width + brickConfig.gap);
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
            const unbreakable = (row === 1 && (column === 0 || column === 4)) ||
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
            const unbreakable = row === 1 && (column === 0 || column === 4);
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

function createLevel5() {
    bricks.length = 0;
    bubbles.length = 0;

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
            const unbreakable = row === 1 && (column === 1 || column === 4);
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
                breakable: !unbreakable,
                canDropBubble: !unbreakable
            });
        }
    }

    const walls = [{
        x: canvas.width / 2 - 150,
        visible: true,
        timer: 0
    },
        {
            x: canvas.width / 2 + 130,
            visible: false,
            timer: 2
        }
    ];

    for (const wall of walls) {
        bricks.push({
            x: wall.x,
            y: 230,
            width: 18,
            height: 100,
            color: "#a855f7",
            active: true,
            moving: false,
            type: "disappearing",
            breakable: false,
            visible: wall.visible,
            timer: wall.timer,
            visibleTime: 2,
            hiddenTime: 2,
            opacity: wall.visible ? 1 : 0
        });
    }
}

function createLevel6() {
    bricks.length = 0;
    bubbles.length = 0;

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
            const lava =
                (row === 1 && column === 2) ||
                (row === 2 && column === 4);

            const unbreakable = !lava && row === 1 && (column === 1 || column === 4);
            const moving = !lava && !unbreakable && (row === 0 || row === 3);
            let type = "normal";

            if (lava) {
                type = "lava";
            } else if (unbreakable) {
                type = "unbreakable";
            }

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: lava ? "#dc2626" : unbreakable ? "#475569" : levelConfig.colors[row],
                active: true,
                moving: moving,
                moveSpeed: 70,
                moveDirection: row === 0 ? 1 : -1,
                minX: x - moveRange,
                maxX: x + moveRange,
                type: type,
                breakable: !unbreakable && !lava,
                canDropBubble: !unbreakable && !lava
            });
        }
    }

    const walls = [{x: canvas.width / 2 - 150, visible: true, timer: 0},
        {
            x: canvas.width / 2 + 130,
            visible: false,
            timer: 2
        }];

    for (const wall of walls) {
        bricks.push({
            x: wall.x,
            y: 230,
            width: 18,
            height: 100,
            color: "#a855f7",
            active: true,
            moving: false,
            type: "disappearing",
            breakable: false,
            visible: wall.visible,
            timer: wall.timer,
            visibleTime: 2,
            hiddenTime: 2,
            opacity: wall.visible ? 1 : 0
        });
    }
}

function createLevel7() {
    bricks.length = 0;
    bubbles.length = 0;

    const levelConfig = {
        rows: 6,
        columns: 8,
        width: 60,
        height: 20,
        gap: 10,
        top: 55,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa"]
    };

    const totalWidth = levelConfig.columns * levelConfig.width + (levelConfig.columns - 1) * levelConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;
    const moveRange = 24;

    for (let row = 0; row < levelConfig.rows; row++) {
        for (let column = 0; column < levelConfig.columns; column++) {
            const centerGap = row === 2 && (column === 3 || column === 4);

            if (centerGap) {
                continue;
            }

            const x = startX + column * (levelConfig.width + levelConfig.gap);
            const moving = row === 0;

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: levelConfig.colors[row],
                active: true,
                moving: moving,
                moveSpeed: 45,
                moveDirection: 1,
                minX: x - moveRange,
                maxX: x + moveRange,
                type: "normal",
                breakable: true,
                repairable: true,
                canDropBubble: true
            });
        }
    }

    bricks.push({
        x: canvas.width / 2 - 30,
        y: levelConfig.top + 2 * (levelConfig.height + levelConfig.gap),
        width: 60,
        height: 20,
        color: "#22c55e",
        active: true,
        moving: false,
        type: "repair",
        breakable: true,
        repairable: false,
        canDropBubble: false,
        repairTimer: 0,
        repairInterval: 5
    });
}

function createLevel8() {
    bricks.length = 0;
    bubbles.length = 0;

    const levelConfig = {
        rows: 5,
        columns: 8,
        width: 60,
        height: 20,
        gap: 8,
        top: 55,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"]
    };

    const totalWidth = levelConfig.columns * levelConfig.width + (levelConfig.columns - 1) * levelConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;
    const moveRange = 16;

    for (let row = 0; row < levelConfig.rows; row++) {
        for (let column = 0; column < levelConfig.columns; column++) {
            const x = startX + column * (levelConfig.width + levelConfig.gap);

            // Chỉ có 2 Lava Brick để tăng độ khó, không làm màn quá rối.
            const lava = row === 2 && (column === 1 || column === 6);

            // Hàng đầu di chuyển đồng bộ để không chồng brick lên nhau.
            const moving = !lava && row === 0;

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: lava ? "#dc2626" : levelConfig.colors[row],
                active: true,
                moving: moving,
                moveSpeed: 50,
                moveDirection: 1,
                minX: x - moveRange,
                maxX: x + moveRange,
                type: lava ? "lava" : "normal",
                breakable: !lava,
                repairable: false,
                canDropBubble: !lava
            });
        }
    }

    // Gate chính của Level 8.
    bricks.push({
        x: 0,
        y: 285,
        width: canvas.width,
        height: 16,
        color: "#0284c7",
        active: true,
        moving: false,
        type: "gate",
        breakable: false,
        repairable: false,
        open: false,
        openTimer: 0,
        openDuration: 5
    });

    // Switch mở Gate.
    bricks.push({
        x: canvas.width / 2 - 35,
        y: 385,
        width: 70,
        height: 24,
        color: "#eab308",
        active: true,
        moving: false,
        type: "switch",
        breakable: false,
        repairable: false
    });
}

function createLevel9() {
    bricks.length = 0;
    bubbles.length = 0;

    const levelConfig = {
        rows: 5,
        columns: 8,
        width: 58,
        height: 20,
        gap: 8,
        top: 65,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee"]
    };

    const totalWidth = levelConfig.columns * levelConfig.width + (levelConfig.columns - 1) * levelConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < levelConfig.rows; row++) {
        for (let column = 0; column < levelConfig.columns; column++) {
            const x = startX + column * (levelConfig.width + levelConfig.gap);

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: levelConfig.colors[row],
                active: true,
                moving: false,
                type: "normal",
                breakable: true,
                repairable: false,
                canDropBubble: true
            });
        }
    }

    // Portal Maze: khu brick chỉ có thể vào bằng Portal A -> B.
    const roomLeft = 150;
    const roomTop = 35;
    const roomWidth = 600;
    const roomHeight = 290;
    const wallThickness = 18;

    const roomWalls = [
        {x: roomLeft, y: roomTop, width: roomWidth, height: wallThickness},
        {x: roomLeft, y: roomTop, width: wallThickness, height: roomHeight},
        {x: roomLeft + roomWidth - wallThickness, y: roomTop, width: wallThickness, height: roomHeight},
        {x: roomLeft, y: roomTop + roomHeight - wallThickness, width: roomWidth, height: wallThickness}
    ];

    const mazeWalls = [
        {x: 240, y: 220, width: 100, height: 16},
        {x: 560, y: 220, width: 100, height: 16},
        {x: 400, y: 275, width: 100, height: 16}
    ];

    for (const wall of [...roomWalls, ...mazeWalls]) {
        bricks.push({
            x: wall.x,
            y: wall.y,
            width: wall.width,
            height: wall.height,
            color: "#334155",
            active: true,
            moving: false,
            type: "unbreakable",
            breakable: false,
            repairable: false,
            canDropBubble: false
        });
    }

    const portalAPositions = [
        {x: 80, y: 365},
        {x: 250, y: 390},
        {x: 625, y: 390},
        {x: 794, y: 365}
    ];

    const portalBPositions = [
        {x: 190, y: 250},
        {x: 365, y: 238},
        {x: 510, y: 238},
        {x: 685, y: 250}
    ];

    const firstAPosition = Math.floor(Math.random() * portalAPositions.length);
    const firstBPosition = Math.floor(Math.random() * portalBPositions.length);

    bricks.push({
        x: portalAPositions[firstAPosition].x,
        y: portalAPositions[firstAPosition].y,
        width: 26,
        height: 48,
        color: "#7c3aed",
        active: true,
        moving: false,
        type: "portal",
        portalId: "A",
        targetPortalId: "B",
        breakable: false,
        repairable: false,
        visible: true,
        timer: 0,
        visibleTime: 4,
        hiddenTime: 8,
        spawnPositions: portalAPositions,
        spawnIndex: firstAPosition
    });

    bricks.push({
        x: portalBPositions[firstBPosition].x,
        y: portalBPositions[firstBPosition].y,
        width: 26,
        height: 38,
        color: "#0891b2",
        active: true,
        moving: false,
        type: "portal",
        portalId: "B",
        targetPortalId: "A",
        breakable: false,
        repairable: false,
        visible: true,
        timer: 0,
        visibleTime: 4,
        hiddenTime: 8,
        spawnPositions: portalBPositions,
        spawnIndex: firstBPosition
    });
}


function createLevel10() {
    bricks.length = 0;
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    bossPlayerHp = 5;
    bossPlayerHitCooldown = 0;

    bossState = {
        x: 195,
        y: 55,
        minX: 80,
        maxX: 370,
        direction: 1,
        speed: 60,
        phase: 1,
        attackTimer: 0,
        attackInterval: Infinity,
        attackCounter: 0,
        maxParts: 0,
        maxTotalParts: 0,
        maxArmor: 0,
        shieldActive: false,
        shieldHits: 0,
        shieldRequiredHits: 3,
        shieldDownTimer: 0,
        shieldDownDuration: 7,
        chargedTimer: 0,
        portalMoveTimer: 0
    };

    const partWidth = 64;
    const partHeight = 30;
    const shellPositions = [
        {x: 64, y: 0}, {x: 128, y: 0}, {x: 192, y: 0}, {x: 256, y: 0}, {x: 320, y: 0},
        {x: 0, y: 34}, {x: 64, y: 34}, {x: 128, y: 34}, {x: 192, y: 34}, {x: 256, y: 34}, {x: 320, y: 34}, {x: 384, y: 34},
        {x: 0, y: 68}, {x: 64, y: 68}, {x: 128, y: 68}, {x: 192, y: 68}, {x: 256, y: 68}, {x: 320, y: 68}, {x: 384, y: 68},
        {x: 64, y: 102}, {x: 128, y: 102}, {x: 192, y: 102}, {x: 256, y: 102}, {x: 320, y: 102}
    ];

    const armorPositions = new Set(["64,34", "320,34", "64,68", "320,68"]);

    function addBossPart(offsetX, offsetY, section, armor = false, eye = false) {
        bricks.push({
            x: bossState.x + offsetX,
            y: bossState.y + offsetY,
            offsetX: offsetX,
            offsetY: offsetY,
            width: partWidth,
            height: partHeight,
            color: armor ? "#14532d" : "#16a34a",
            active: true,
            moving: false,
            type: armor ? "bossArmor" : "boss",
            bossPart: true,
            bossSection: section,
            eye: eye,
            breakable: !armor,
            repairable: false,
            canDropBubble: !armor
        });
    }

    for (const position of shellPositions) {
        const armor = armorPositions.has(`${position.x},${position.y}`);
        addBossPart(position.x, position.y, "shell", armor);
    }

    addBossPart(448, 34, "head", false, true);
    addBossPart(448, 68, "head");
    addBossPart(-64, 68, "tail");
    addBossPart(64, 136, "leg");
    addBossPart(128, 136, "leg");
    addBossPart(320, 136, "leg");
    addBossPart(384, 136, "leg");

    bossState.maxParts = bricks.filter((brick) => brick.type === "boss").length;
    bossState.maxArmor = bricks.filter((brick) => brick.type === "bossArmor").length;
    bossState.maxTotalParts = bricks.filter((brick) => brick.bossPart).length;

    createBossPortals();
}

function updateBossPhase() {
    if (currentLevel !== 10 || !bossState) {
        return;
    }

    const remainingTotal = bricks.filter((brick) => brick.active && brick.bossPart).length;
    const hpRatio = bossState.maxTotalParts > 0 ? remainingTotal / bossState.maxTotalParts : 0;
    let newPhase = 1;

    if (hpRatio <= 0.3) {
        newPhase = 3;
    } else if (hpRatio <= 0.5) {
        newPhase = 2;
    }

    newPhase = Math.max(newPhase, bossState.phase);

    if (newPhase !== bossState.phase) {
        bossState.phase = newPhase;
        bossState.attackTimer = 0;
        bossState.attackCounter = 0;

        if (newPhase === 3) {
            bossState.shieldActive = true;
            bossState.shieldHits = 0;
            bossState.shieldDownTimer = 0;
            bossState.chargedTimer = 0;
        }
    }

    if (bossState.phase === 1) {
        bossState.speed = 60;
        bossState.attackInterval = Infinity;
    } else if (bossState.phase === 2) {
        bossState.speed = 80;
        bossState.attackInterval = 1.9;
    } else {
        bossState.speed = 95;
        bossState.attackInterval = 1.45;
    }
}

function createBossProjectile(type = "fire", targetOffset = 0, usePortal = false) {
    if (!bossState) {
        return;
    }

    const head = bricks.find((brick) => brick.active && brick.type === "boss" && brick.bossSection === "head");
    const startX = head ? head.x + head.width / 2 : bossState.x + 240;
    const startY = head ? head.y + head.height : bossState.y + 140;

    let targetX = paddle.x + paddle.width / 2 + targetOffset;
    let targetY = paddle.y;

    if (usePortal && bossPortals.length >= 2) {
        const entrance = bossPortals[0];
        targetX = entrance.x + entrance.width / 2;
        targetY = entrance.y + entrance.height / 2;
    }

    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy) || 1;
    let speed = 235;

    if (type === "energy") {
        speed = 220;
    } else if (type === "ricochet") {
        speed = 250;
    } else if (bossState.phase === 3) {
        speed = 265;
    }

    bossProjectiles.push({
        x: startX,
        y: startY,
        radius: type === "ricochet" ? 10 : 9,
        vx: speed * dx / distance,
        vy: speed * dy / distance,
        speed: speed,
        type: type,
        reflected: false,
        portalCooldown: 0,
        usePortal: usePortal,
        teleported: false,
        bounceCount: 0,
        maxBounces: type === "ricochet" ? 2 : 0,
        targetOffset: targetOffset
    });
}

function createBossAttack() {
    if (!bossState || bossState.phase === 1) {
        return;
    }

    bossState.attackCounter += 1;

    if (bossState.phase === 2) {
        if (bossState.attackCounter % 2 === 0) {
            createBossProjectile("energy", 0, false);
        } else {
            createBossProjectile("fire", 0, true);
        }

        return;
    }

    createBossProjectile("energy", 0, false);

    if (bossState.attackCounter % 2 === 0) {
        createBossProjectile("ricochet", bossState.direction > 0 ? 150 : -150, true);
    } else {
        createBossProjectile("fire", bossState.direction > 0 ? -90 : 90, true);
    }
}

function updateBoss(deltaTime) {
    if (currentLevel !== 10 || !bossState) {
        return;
    }

    updateBossPhase();

    bossState.x += bossState.speed * bossState.direction * deltaTime;

    if (bossState.x <= bossState.minX) {
        bossState.x = bossState.minX;
        bossState.direction = 1;
    } else if (bossState.x >= bossState.maxX) {
        bossState.x = bossState.maxX;
        bossState.direction = -1;
    }

    for (const brick of bricks) {
        if (!brick.bossPart) {
            continue;
        }

        brick.x = bossState.x + brick.offsetX;
        brick.y = bossState.y + brick.offsetY;
    }

    if (bossState.phase === 3 && !bossState.shieldActive) {
        if (bossState.shieldDownTimer > 0) {
            bossState.shieldDownTimer = Math.max(0, bossState.shieldDownTimer - deltaTime);
        }

        if (bossState.chargedTimer > 0) {
            bossState.chargedTimer = Math.max(0, bossState.chargedTimer - deltaTime);
        }

        if (bossState.shieldDownTimer <= 0 && bricks.some((brick) => brick.active && brick.bossPart)) {
            bossState.shieldActive = true;
            bossState.shieldHits = 0;
            bossState.chargedTimer = 0;
        }
    }

    if (bossState.phase === 1) {
        return;
    }

    bossState.attackTimer += deltaTime;

    if (bossState.attackTimer >= bossState.attackInterval) {
        bossState.attackTimer = 0;
        createBossAttack();
    }
}

function createBossPortals() {
    bossPortals.length = 0;

    bossPortals.push({
        id: "A",
        targetId: "B",
        x: 190,
        y: 305,
        width: 34,
        height: 66,
        color: "#7c3aed",
        spawnPositions: [
            {x: 150, y: 295},
            {x: 245, y: 330},
            {x: 345, y: 290}
        ],
        spawnIndex: 0
    });

    bossPortals.push({
        id: "B",
        targetId: "A",
        x: 665,
        y: 345,
        width: 34,
        height: 66,
        color: "#0891b2",
        spawnPositions: [
            {x: 620, y: 330},
            {x: 710, y: 295},
            {x: 540, y: 355}
        ],
        spawnIndex: 0
    });
}

function updateBossPortals(deltaTime) {
    if (currentLevel !== 10 || !bossState || bossState.phase < 2 || bossPortals.length < 2) {
        return;
    }

    bossState.portalMoveTimer += deltaTime;

    if (bossState.portalMoveTimer < 6) {
        return;
    }

    bossState.portalMoveTimer = 0;

    for (const portal of bossPortals) {
        let newIndex = Math.floor(Math.random() * portal.spawnPositions.length);

        if (newIndex === portal.spawnIndex) {
            newIndex = (newIndex + 1) % portal.spawnPositions.length;
        }

        portal.spawnIndex = newIndex;
        portal.x = portal.spawnPositions[newIndex].x;
        portal.y = portal.spawnPositions[newIndex].y;
    }
}

function circleHitsRect(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function teleportBossProjectile(projectile, portal) {
    const target = bossPortals.find((item) => item.id === portal.targetId);

    if (!target) {
        return;
    }

    projectile.x = target.x + target.width / 2;
    projectile.y = target.y + target.height + projectile.radius + 4;
    projectile.portalCooldown = 0.45;
    projectile.teleported = true;

    const targetX = paddle.x + paddle.width / 2 + projectile.targetOffset;
    const targetY = paddle.y;
    const dx = targetX - projectile.x;
    const dy = targetY - projectile.y;
    const distance = Math.hypot(dx, dy) || 1;

    projectile.vx = projectile.speed * dx / distance;
    projectile.vy = projectile.speed * dy / distance;
}

function reflectEnergyProjectile(projectile) {
    const paddleCenter = paddle.x + paddle.width / 2;
    const hitPosition = Math.max(-1, Math.min((projectile.x - paddleCenter) / (paddle.width / 2), 1));
    const maxAngle = Math.PI / 3;
    const bounceAngle = hitPosition * maxAngle;
    const speed = 360;

    projectile.y = paddle.y - projectile.radius - 1;
    projectile.vx = speed * Math.sin(bounceAngle);
    projectile.vy = -speed * Math.cos(bounceAngle);
    projectile.speed = speed;
    projectile.reflected = true;
    projectile.usePortal = false;
    projectile.portalCooldown = 0.5;
}

function breakBossShield() {
    if (!bossState || bossState.phase !== 3) {
        return;
    }

    bossState.shieldActive = false;
    bossState.shieldHits = bossState.shieldRequiredHits;
    bossState.shieldDownTimer = bossState.shieldDownDuration;
    bossState.chargedTimer = bossState.shieldDownDuration;
}

function drawBossPortals() {
    if (currentLevel !== 10 || !bossState || bossState.phase < 2) {
        return;
    }

    for (const portal of bossPortals) {
        ctx.save();
        ctx.fillStyle = portal.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = portal.color;
        ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(portal.x, portal.y, portal.width, portal.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(portal.x + 6, portal.y + 7, portal.width - 12, portal.height - 14);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(portal.id, portal.x + portal.width / 2, portal.y + portal.height / 2);
        ctx.restore();
    }
}

function drawBossShield() {
    if (currentLevel !== 10 || !bossState || bossState.phase !== 3 || !bossState.shieldActive) {
        return;
    }

    ctx.save();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.8;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#22d3ee";
    ctx.beginPath();
    ctx.ellipse(bossState.x + 224, bossState.y + 82, 300, 108, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function updateBossProjectiles(deltaTime) {
    if (currentLevel !== 10 || !bossState) {
        return;
    }

    if (bossPlayerHitCooldown > 0) {
        bossPlayerHitCooldown = Math.max(0, bossPlayerHitCooldown - deltaTime);
    }

    const paddleLeft = Math.min(paddle.previousX, paddle.x);
    const paddleRight = Math.max(paddle.previousX + paddle.width, paddle.x + paddle.width);

    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const projectile = bossProjectiles[i];

        if (projectile.portalCooldown > 0) {
            projectile.portalCooldown = Math.max(0, projectile.portalCooldown - deltaTime);
        }

        projectile.x += projectile.vx * deltaTime;
        projectile.y += projectile.vy * deltaTime;

        if (projectile.type === "ricochet") {
            let bounced = false;

            if (projectile.x - projectile.radius <= 0 && projectile.vx < 0) {
                projectile.x = projectile.radius;
                projectile.vx = -projectile.vx;
                bounced = true;
            } else if (projectile.x + projectile.radius >= canvas.width && projectile.vx > 0) {
                projectile.x = canvas.width - projectile.radius;
                projectile.vx = -projectile.vx;
                bounced = true;
            }

            if (bounced) {
                projectile.bounceCount += 1;

                if (projectile.bounceCount > projectile.maxBounces) {
                    bossProjectiles.splice(i, 1);
                    continue;
                }
            }
        }

        if (projectile.usePortal && !projectile.teleported && !projectile.reflected &&
            projectile.portalCooldown <= 0 && bossState.phase >= 2) {
            const portal = bossPortals.find((item) => circleHitsRect(projectile, item));

            if (portal) {
                teleportBossProjectile(projectile, portal);
            }
        }

        if (projectile.reflected && projectile.type === "energy") {
            const hitBossPart = bricks.find((brick) => brick.active && brick.bossPart && circleHitsRect(projectile, brick));

            if (hitBossPart) {
                if (bossState.phase === 3 && bossState.shieldActive) {
                    bossState.shieldHits += 1;

                    if (bossState.shieldHits >= bossState.shieldRequiredHits) {
                        breakBossShield();
                    }

                    bossProjectiles.splice(i, 1);
                    continue;
                }

                if (hitBossPart.type === "boss" || (hitBossPart.type === "bossArmor" && bossState.chargedTimer > 0)) {
                    hitBossPart.active = false;
                    score += 2;
                    scoreElement.textContent = score;

                    if (hitBossPart.canDropBubble && Math.random() < 0.2) {
                        createBubble(hitBossPart.x + hitBossPart.width / 2, hitBossPart.y + hitBossPart.height / 2);
                    }

                    checkWinCondition();
                }

                bossProjectiles.splice(i, 1);
                continue;
            }
        }

        const hitsPaddle = projectile.x + projectile.radius >= paddleLeft && projectile.x - projectile.radius <= paddleRight &&
            projectile.y + projectile.radius >= paddle.y && projectile.y - projectile.radius <= paddle.y + paddle.height;

        if (hitsPaddle && projectile.vy > 0) {
            if (projectile.type === "energy") {
                reflectEnergyProjectile(projectile);
                continue;
            }

            bossProjectiles.splice(i, 1);

            if (bossPlayerHitCooldown > 0) {
                continue;
            }

            bossPlayerHp -= 1;
            bossPlayerHitCooldown = 0.65;

            if (bossPlayerHp <= 0) {
                bossPlayerHp = 0;
                loseGame();
                return;
            }

            continue;
        }

        if (projectile.x + projectile.radius < -20 || projectile.x - projectile.radius > canvas.width + 20 ||
            projectile.y + projectile.radius < -30 || projectile.y - projectile.radius > canvas.height + 30) {
            bossProjectiles.splice(i, 1);
        }
    }
}

function drawBossProjectiles() {
    if (currentLevel !== 10) {
        return;
    }

    for (const projectile of bossProjectiles) {
        ctx.save();

        if (projectile.type === "fire") {
            ctx.fillStyle = "#ef4444";
        } else if (projectile.type === "energy") {
            ctx.fillStyle = projectile.reflected ? "#22d3ee" : "#facc15";
        } else {
            ctx.fillStyle = "#a855f7";
        }

        ctx.shadowBlur = 12;
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, Math.max(2, projectile.radius - 5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawBossHUD() {
    if (currentLevel !== 10 || !bossState || gameState !== "playing") {
        return;
    }

    const remainingTotal = bricks.filter((brick) => brick.active && brick.bossPart).length;
    const remainingArmor = bricks.filter((brick) => brick.active && brick.type === "bossArmor").length;
    const hpPercent = bossState.maxTotalParts > 0 ? Math.ceil((remainingTotal / bossState.maxTotalParts) * 100) : 0;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`BOSS HP: ${hpPercent}%`, 18, 16);
    ctx.fillText(`PHASE: ${bossState.phase}`, 18, 38);
    ctx.fillText(`PADDLE HP: ${bossPlayerHp}`, 18, 60);
    ctx.fillText(`ARMOR: ${remainingArmor}/${bossState.maxArmor}`, 18, 82);

    if (bossState.phase === 3) {
        const shieldText = bossState.shieldActive
            ? `SHIELD: ${bossState.shieldHits}/${bossState.shieldRequiredHits}`
            : `SHIELD DOWN: ${bossState.shieldDownTimer.toFixed(1)}s`;

        ctx.fillText(shieldText, 18, 104);

        if (bossState.chargedTimer > 0) {
            ctx.fillStyle = "#22d3ee";
            ctx.fillText(`CHARGED BALL: ${bossState.chargedTimer.toFixed(1)}s`, 18, 126);
        }
    }

    ctx.restore();
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
    } else if (currentLevel === 5) {
        createLevel5();
    } else if (currentLevel === 6) {
        createLevel6();
    } else if (currentLevel === 7) {
        createLevel7();
    } else if (currentLevel === 8) {
        createLevel8();
    } else if (currentLevel === 9) {
        createLevel9();
    } else if (currentLevel === 10) {
        createLevel10();
    }
}

function updateMovingBricks(deltaTime) {
    for (const brick of bricks) {
        if (!brick.moving) {
            continue;
        }

        brick.x += brick.moveSpeed * brick.moveDirection * deltaTime;

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

function updateRepairBricks(deltaTime) {
    for (const repairBrick of bricks) {
        if (!repairBrick.active || repairBrick.type !== "repair") {
            continue;
        }

        repairBrick.repairTimer += deltaTime;

        if (repairBrick.repairTimer < repairBrick.repairInterval) {
            continue;
        }

        repairBrick.repairTimer = 0;

        const destroyedBricks = bricks.filter((brick) => !brick.active && brick.repairable === true);

        if (destroyedBricks.length === 0) {
            continue;
        }

        const randomIndex = Math.floor(Math.random() * destroyedBricks.length);
        const brickToRepair = destroyedBricks[randomIndex];

        brickToRepair.active = true;
    }
}

function openGates() {
    for (const brick of bricks) {
        if (brick.type !== "gate") {
            continue;
        }

        brick.open = true;
        brick.openTimer = brick.openDuration;
    }
}

function updateGates(deltaTime) {
    for (const brick of bricks) {
        if (brick.type !== "gate" || !brick.open) {
            continue;
        }

        brick.openTimer -= deltaTime;

        if (brick.openTimer <= 0) {
            brick.openTimer = 0;
            brick.open = false;
        }
    }
}

function updatePortals(deltaTime) {
    const portalA = bricks.find((brick) => brick.type === "portal" && brick.portalId === "A");
    const portalB = bricks.find((brick) => brick.type === "portal" && brick.portalId === "B");

    if (!portalA || !portalB) {
        return;
    }

    const wasVisible = portalA.visible;
    const cycleTime = portalA.visibleTime + portalA.hiddenTime;

    portalA.timer = (portalA.timer + deltaTime) % cycleTime;
    portalA.visible = portalA.timer < portalA.visibleTime;

    portalB.timer = portalA.timer;
    portalB.visible = portalA.visible;

    if (!wasVisible && portalA.visible) {
        movePortalToRandomPosition(portalA);
        movePortalToRandomPosition(portalB);
    }
}

function teleportBall(ball, portal) {
    const targetPortal = bricks.find((brick) => brick.type === "portal" && brick.portalId === portal.targetPortalId);

    if (!targetPortal) {
        return;
    }

    const speed = Math.hypot(ball.vx, ball.vy) || ball.speed || 1;
    const directionX = ball.vx / speed;
    const directionY = ball.vy / speed;
    const exitOffset = Math.max(targetPortal.width, targetPortal.height) / 2 + ball.radius + 6;

    ball.x = targetPortal.x + targetPortal.width / 2 + directionX * exitOffset;
    ball.y = targetPortal.y + targetPortal.height / 2 + directionY * exitOffset;
    ball.portalCooldown = 0.65;

    if (currentLevel === 9 && portal.portalId === "A") {
        ball.inPortalRoom = true;
        ball.portalRoomTimer = 10;
    } else if (currentLevel === 9 && portal.portalId === "B") {
        ball.inPortalRoom = false;
        ball.portalRoomTimer = 0;
    }
}

function ejectBallFromPortalRoom(ball) {
    const portalA = bricks.find((brick) => brick.type === "portal" && brick.portalId === "A");

    if (!portalA) {
        return;
    }

    ball.x = portalA.x + portalA.width / 2;
    ball.y = portalA.y + portalA.height + ball.radius + 10;

    if (ball.vy < 0) {
        ball.vy = Math.abs(ball.vy);
    }

    ball.inPortalRoom = false;
    ball.portalRoomTimer = 0;
    ball.portalCooldown = 0.65;
}

createBricks();

const balls = [];
const MAX_BALLS = 12;

function createBall(x, y, vx = 0, vy = 0, launched = false) {
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

const pressedKeys = new Set();
let lastHorizontalDirection = 0;
function clampPaddle() {
    paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
}

function resetBall() {
    balls.length = 0;
    balls.push(createBall(paddle.x + paddle.width / 2, paddle.y - 9));
}

function resetControls() {
    pressedKeys.clear();
    lastHorizontalDirection = 0;
}

/* Chuyển trạng thái màn hình */

function startGame() {
    gameState = "playing";
    menuScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    levelSelectScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    score = 0;
    scoreElement.textContent = score;
    levelElement.textContent = currentLevel;
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.previousX = paddle.x;
    resetControls();
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    bossState = null;
    bossPlayerHp = 5;
    bossPlayerHitCooldown = 0;
    levelGuideVisible = true;
    createBricks();
    resetBall();
}

function showLevelSelect() {
    gameState = "levelSelect";
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

levelButtons.forEach((button) => {
    button.addEventListener("click", () => {
            const selectedLevel = Number(button.dataset.level);
            if (selectedLevel > maxImplementedLevel) {
                return;
            }
            currentLevel = selectedLevel;
            startGame();
        }
    );
});

function showMenu() {
    gameState = "menu";
    gameScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    levelSelectScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    resetControls();
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    bossState = null;
    levelGuideVisible = false;
    resetBall();
}

levelButton.addEventListener("click", () => {showLevelSelect();});
levelBackButton.addEventListener("click", () => {showMenu();});

function winGame() {
    if (gameState !== "playing") {
        return;
    }

    gameState = "won";
    resetControls();
    balls.length = 0;
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    gameScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    if (currentLevel === 10) {
        resultTitle.textContent = "HOÀN THÀNH GAME";
        resultText.textContent = `Bạn đã đánh bại Turtle Boss với ${score} điểm.`;
    } else {
        resultTitle.textContent = "THẮNG";
        resultText.textContent = `Bạn đã hoàn thành màn ${currentLevel} với ${score} điểm.`;
    }

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
    balls.length = 0;
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    gameScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");
    resultTitle.textContent = "THUA";
    resultText.textContent = `Bạn đạt được ${score} điểm.`;
    restartButton.classList.remove("hidden");
    nextButton.classList.add("hidden");
}

playButton.addEventListener("click", () => {currentLevel = 1;startGame();});
restartButton.addEventListener("click", () => {startGame();});
nextButton.addEventListener("click", () => {
        if (currentLevel >= maxImplementedLevel) {
            return;
        }

        currentLevel += 1;
        startGame();
    }
);

homeButton.addEventListener("click", () => {showMenu();});

/* Điều khiển */

window.addEventListener("keydown", (event) => {
    if (gameState !== "playing") {
        return;
    }

    if (levelGuideVisible) {
        event.preventDefault();
        levelGuideVisible = false;
        resetControls();
        return;
    }

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
            lastHorizontalDirection = -1;
        }

        if (isRight) {
            lastHorizontalDirection = 1;
        }
    }
});

window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight" ||
        event.code === "KeyA" || event.code === "KeyD") {
        pressedKeys.delete(event.code);
    }
});

window.addEventListener("blur", () => {
    resetControls();
});

function drawBricks() {
    for (const brick of bricks) {
        if (!brick.active) {
            continue;
        }

        if (brick.type === "disappearing" && !brick.visible) {
            continue;
        }

        if (brick.type === "portal" && !brick.visible) {
            continue;
        }

        if (brick.type === "disappearing") {
            ctx.save();
            ctx.globalAlpha = brick.opacity;
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = "#e9d5ff";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            ctx.restore();
            continue;
        }

        if (brick.type === "gate") {
            ctx.save();
            ctx.globalAlpha = brick.open ? 0.18 : 1;
            ctx.fillStyle = brick.open ? "#38bdf8" : "#0284c7";
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = "#bae6fd";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            ctx.restore();
            continue;
        }

        if (brick.type === "switch") {
            ctx.fillStyle = "#eab308";
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("S", brick.x + brick.width / 2, brick.y + brick.height / 2);
            continue;
        }

        if (brick.type === "portal") {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = brick.portalId === "A" ? "#ddd6fe" : "#cffafe";
            ctx.lineWidth = 3;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillRect(brick.x + 6, brick.y + 6, brick.width - 12, brick.height - 12);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(brick.portalId, brick.x + brick.width / 2, brick.y + brick.height / 2);
            continue;
        }

        if (brick.type === "boss") {
            if (brick.bossSection === "head") {
                ctx.fillStyle = "#84cc16";
            } else if (brick.bossSection === "leg" || brick.bossSection === "tail") {
                ctx.fillStyle = "#65a30d";
            } else {
                ctx.fillStyle = "#16a34a";
            }

            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = "#bbf7d0";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

            if (brick.bossSection === "shell") {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.beginPath();
                ctx.moveTo(brick.x + 6, brick.y + brick.height - 5);
                ctx.lineTo(brick.x + brick.width - 6, brick.y + 5);
                ctx.stroke();
            }

            if (brick.eye) {
                ctx.beginPath();
                ctx.arc(brick.x + brick.width - 12, brick.y + 8, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(brick.x + brick.width - 11, brick.y + 8, 2, 0, Math.PI * 2);
                ctx.fillStyle = "#111827";
                ctx.fill();
            }

            continue;
        }

        if (brick.type === "bossArmor") {
            ctx.fillStyle = "#14532d";
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = "#d1fae5";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
            ctx.fillRect(brick.x + 5, brick.y + 5, brick.width - 10, 4);
            continue;
        }

        if (brick.type === "lava") {
            ctx.fillStyle = "#b91c1c";
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = "#f97316";
            ctx.fillRect(brick.x + 3, brick.y + 3, brick.width - 6, brick.height - 6);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(brick.x + 8, brick.y + brick.height / 2 - 2, brick.width - 16, 4);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("LAVA", brick.x + brick.width / 2, brick.y + brick.height / 2);
            continue;
        }

        if (brick.type === "repair") {
            ctx.fillStyle = "#16a34a";
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = "#bbf7d0";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("+", brick.x + brick.width / 2, brick.y + brick.height / 2);
            continue;
        }

        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        if (brick.type === "unbreakable") {
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(brick.x + 4, brick.y + 4, brick.width - 8, 3);
        } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 4);
        }
    }
}

/* Va chạm bóng với gạch */

function checkWinCondition() {
    if (currentLevel === 10) {
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

function checkBrickCollisions(ball) {
    for (const brick of bricks) {
        if (!brick.active) {
            continue;
        }

        if (brick.type === "disappearing" && !brick.visible) {
            continue;
        }

        if (brick.type === "portal" && !brick.visible) {
            continue;
        }

        if (brick.type === "gate" && brick.open) {
            continue;
        }

        const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
        const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > ball.radius * ball.radius) {
            continue;
        }

        if (brick.type === "portal") {
            if (ball.portalCooldown <= 0) {
                teleportBall(ball, brick);
            }

            return;
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
                {depth: ball.x - brick.x, nx: -1, ny: 0},
                {depth: brick.x + brick.width - ball.x, nx: 1, ny: 0},
                {depth: ball.y - brick.y, nx: 0, ny: -1},
                {depth: brick.y + brick.height - ball.y, nx: 0, ny: 1}
            ];

            const nearestFace = faces.reduce((nearest, face) => face.depth < nearest.depth ? face : nearest);
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

        if (brick.type === "switch") {
            if (ball.switchCooldown <= 0) {
                openGates();
                ball.switchCooldown = 0.3;
            }

            break;
        }

        if (brick.type === "lava") {
            if (ball.lavaCooldown <= 0) {
                ball.hp -= 1;
                ball.lavaCooldown = 0.3;

                if (ball.hp <= 0) {
                    ball.hp = 0;
                    ball.destroyed = true;
                }
            }

            break;
        }

        if (currentLevel === 10 && brick.bossPart) {
            if (bossState && bossState.phase === 3 && bossState.shieldActive) {
                break;
            }

            if (brick.type === "bossArmor" && (!bossState || bossState.chargedTimer <= 0)) {
                break;
            }

            const destroyedX = brick.x + brick.width / 2;
            const destroyedY = brick.y + brick.height / 2;

            brick.active = false;
            score += brick.type === "bossArmor" ? 2 : 1;
            scoreElement.textContent = score;

            if (brick.canDropBubble && Math.random() < 0.2) {
                createBubble(destroyedX, destroyedY);
            }

            checkWinCondition();
            break;
        }

        if (brick.breakable === false) {
            break;
        }

        const destroyedX = brick.x + brick.width / 2;
        const destroyedY = brick.y + brick.height / 2;

        brick.active = false;
        score += 1;
        scoreElement.textContent = score;

        if (brick.canDropBubble && Math.random() < 0.2) {
            createBubble(destroyedX, destroyedY);
        }

        checkWinCondition();
        break;
    }
}

/* Cập nhật bóng */

function updateBall(ball, deltaTime) {
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

    if (ball.destroyed || gameState !== "playing") {
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

function updateBalls(deltaTime) {
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        updateBall(ball, deltaTime);
        if (gameState !== "playing") {
            return;
        }
        if (ball.destroyed || ball.y - ball.radius > canvas.height) {
            balls.splice(i, 1);
        }
    }
    if (balls.length === 0 && gameState === "playing") {
        loseGame();
    }
}
function updateBubbles(deltaTime) {
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

function applyBubbleEffect(type) {
    if (type === "add2") {
        addBallsFromPaddle(2);
    } else if (type === "add3") {
        addBallsFromPaddle(3);
    } else if (type === "multiply") {
        multiplyBalls();
    }
}

function addBallsFromPaddle(amount) {
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

function multiplyBalls() {
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

function update(deltaTime) {
    if (gameState !== "playing") {
        return;
    }

    if (levelGuideVisible) {
        return;
    }

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
            paddle.x += paddle.speed * lastHorizontalDirection * stepTime;
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

        if (gameState !== "playing") {
            break;
        }

        updateBubbles(stepTime);
        updateBalls(stepTime);

        paddle.previousX = paddle.x;

        if (gameState !== "playing") {
            break;
        }
    }
}

function drawBubbles() {
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

function drawLevelGuide() {
    if (!levelGuideVisible || gameState !== "playing") {
        return;
    }

    const guideText = levelGuides[currentLevel];

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
    ctx.fillText(`LEVEL ${currentLevel}`, canvas.width / 2, 225);

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
    ctx.fillText("A/D hoặc ←/→: di chuyển     Space: thả bóng", canvas.width / 2, 330);
    ctx.fillText("Hãy tắt unikey trước khi dùng phím A/D", canvas.width / 2, 356);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.fillText("NHẤN PHÍM BẤT KỲ ĐỂ BẮT ĐẦU", canvas.width / 2, 385);

    ctx.restore();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();

    if (currentLevel === 10 && gameState === "playing") {
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

        if (currentLevel === 10 && bossState && bossState.chargedTimer > 0) {
            ctx.fillStyle = "#22d3ee";
            ctx.shadowBlur = 14;
            ctx.shadowColor = "#22d3ee";
        } else if (currentLevel === 6 || currentLevel === 8) {
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

        if (currentLevel === 6 || currentLevel === 8) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 11px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(`HP ${ball.hp}`, ball.x, ball.y - 13);
        }
    }

    if (currentLevel === 10 && gameState === "playing") {
        drawBossProjectiles();
        drawBossHUD();
    }

    drawLevelGuide();
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
