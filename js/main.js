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
let bossPlayerHp = 5;
let bossPlayerHitCooldown = 0;

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
        rows: 7,
        columns: 8,
        width: 60,
        height: 20,
        gap: 8,
        top: 50,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa", "#818cf8"]
    };

    const totalWidth = levelConfig.columns * levelConfig.width + (levelConfig.columns - 1) * levelConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;
    const moveRange = 20;

    for (let row = 0; row < levelConfig.rows; row++) {
        for (let column = 0; column < levelConfig.columns; column++) {
            const x = startX + column * (levelConfig.width + levelConfig.gap);

            const repair = row === 4 && column === 3;

            const lava = !repair &&
                ((row === 2 && column === 1) || (row === 3 && column === 6));

            const unbreakable = !repair && !lava &&
                ((row === 4 && column === 0) || (row === 4 && column === 7));

            const moving = !repair && !lava && !unbreakable && (row === 0 || row === 6);

            let type = "normal";
            let color = levelConfig.colors[row];

            if (repair) {
                type = "repair";
                color = "#22c55e";
            } else if (lava) {
                type = "lava";
                color = "#dc2626";
            } else if (unbreakable) {
                type = "unbreakable";
                color = "#475569";
            }

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: color,
                active: true,
                moving: moving,
                moveSpeed: 60,
                moveDirection: row === 0 ? 1 : -1,
                minX: x - moveRange,
                maxX: x + moveRange,
                type: type,
                breakable: !unbreakable && !lava,
                repairable: type === "normal",
                canDropBubble: type === "normal",
                repairTimer: repair ? 0 : undefined,
                repairInterval: repair ? 5 : undefined
            });
        }
    }

    const walls = [
        {x: canvas.width / 2 - 150, visible: true, timer: 0},
        {x: canvas.width / 2 + 130, visible: false, timer: 2}
    ];

    for (const wall of walls) {
        bricks.push({
            x: wall.x,
            y: 275,
            width: 18,
            height: 90,
            color: "#a855f7",
            active: true,
            moving: false,
            type: "disappearing",
            breakable: false,
            repairable: false,
            visible: wall.visible,
            timer: wall.timer,
            visibleTime: 2,
            hiddenTime: 2,
            opacity: wall.visible ? 1 : 0
        });
    }
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
        top: 45,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"]
    };

    const totalWidth = levelConfig.columns * levelConfig.width + (levelConfig.columns - 1) * levelConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;
    const moveRange = 15;

    for (let row = 0; row < levelConfig.rows; row++) {
        for (let column = 0; column < levelConfig.columns; column++) {
            const x = startX + column * (levelConfig.width + levelConfig.gap);
            const repair = row === 1 && column === 3;
            const lava = !repair && row === 2 && (column === 1 || column === 6);
            const unbreakable = !repair && !lava && row === 3 && (column === 0 || column === 7);
            const moving = !repair && !lava && !unbreakable && row === 0;

            let type = "normal";
            let color = levelConfig.colors[row];

            if (repair) {
                type = "repair";
                color = "#22c55e";
            } else if (lava) {
                type = "lava";
                color = "#dc2626";
            } else if (unbreakable) {
                type = "unbreakable";
                color = "#475569";
            }

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: color,
                active: true,
                moving: moving,
                moveSpeed: 55,
                moveDirection: 1,
                minX: x - moveRange,
                maxX: x + moveRange,
                type: type,
                breakable: !unbreakable && !lava,
                repairable: type === "normal",
                canDropBubble: type === "normal",
                repairTimer: repair ? 0 : undefined,
                repairInterval: repair ? 5 : undefined
            });
        }
    }

    const gateY = 255;
    const gateSegments = 9;
    const gateWidth = canvas.width / gateSegments;

    for (let i = 0; i < gateSegments; i++) {
        bricks.push({
            x: i * gateWidth,
            y: gateY,
            width: gateWidth,
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
    }

    bricks.push({
        x: canvas.width / 2 - 35,
        y: 350,
        width: 70,
        height: 24,
        color: "#eab308",
        active: true,
        moving: false,
        type: "switch",
        breakable: false,
        repairable: false
    });

    const disappearingWalls = [
        {x: canvas.width / 2 - 190, timer: 0},
        {x: canvas.width / 2 + 172, timer: 2}
    ];

    for (const wall of disappearingWalls) {
        bricks.push({
            x: wall.x,
            y: 185,
            width: 18,
            height: 50,
            color: "#a855f7",
            active: true,
            moving: false,
            type: "disappearing",
            breakable: false,
            repairable: false,
            visible: wall.timer === 0,
            timer: wall.timer,
            visibleTime: 2,
            hiddenTime: 2,
            opacity: wall.timer === 0 ? 1 : 0
        });
    }
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
    const moveRange = 12;

    for (let row = 0; row < levelConfig.rows; row++) {
        for (let column = 0; column < levelConfig.columns; column++) {
            const centerGap = row === 2 && (column === 3 || column === 4);

            if (centerGap) {
                continue;
            }

            const x = startX + column * (levelConfig.width + levelConfig.gap);
            const lava = row === 2 && (column === 1 || column === 6);
            const moving = !lava && (row === 0 || row === 4);

            bricks.push({
                x: x,
                y: levelConfig.top + row * (levelConfig.height + levelConfig.gap),
                width: levelConfig.width,
                height: levelConfig.height,
                color: lava ? "#dc2626" : levelConfig.colors[row],
                active: true,
                moving: moving,
                moveSpeed: 50,
                moveDirection: row === 0 ? 1 : -1,
                minX: x - moveRange,
                maxX: x + moveRange,
                type: lava ? "lava" : "normal",
                breakable: !lava,
                repairable: !lava,
                canDropBubble: !lava
            });
        }
    }

    bricks.push({
        x: canvas.width / 2 - levelConfig.width / 2,
        y: levelConfig.top + 2 * (levelConfig.height + levelConfig.gap),
        width: levelConfig.width,
        height: levelConfig.height,
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

    for (const wall of roomWalls) {
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

    const disappearingWalls = [
        {x: 315, timer: 0},
        {x: 567, timer: 2}
    ];

    for (const wall of disappearingWalls) {
        bricks.push({
            x: wall.x,
            y: 230,
            width: 18,
            height: 65,
            color: "#a855f7",
            active: true,
            moving: false,
            type: "disappearing",
            breakable: false,
            repairable: false,
            visible: wall.timer === 0,
            timer: wall.timer,
            visibleTime: 2,
            hiddenTime: 2,
            opacity: wall.timer === 0 ? 1 : 0
        });
    }

    // Level 8 inheritance: một Gate gọn hơn + Switch trước khi tới Portal A.
    bricks.push({
        x: 170,
        y: 380,
        width: 560,
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

    bricks.push({
        x: canvas.width / 2 - 35,
        y: 465,
        width: 70,
        height: 24,
        color: "#eab308",
        active: true,
        moving: false,
        type: "switch",
        breakable: false,
        repairable: false
    });

    const portalAPositions = [
        {x: 70, y: 335},
        {x: 235, y: 335},
        {x: 630, y: 335},
        {x: 790, y: 335}
    ];

    const portalBPositions = [
        {x: 210, y: 230},
        {x: 380, y: 240},
        {x: 500, y: 240},
        {x: 650, y: 230},
        {x: 430, y: 255}
    ];

    const firstAPosition = Math.floor(Math.random() * portalAPositions.length);
    const firstBPosition = Math.floor(Math.random() * portalBPositions.length);

    bricks.push({
        x: portalAPositions[firstAPosition].x,
        y: portalAPositions[firstAPosition].y,
        width: 28,
        height: 54,
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
        width: 28,
        height: 40,
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
    bossPlayerHp = 5;
    bossPlayerHitCooldown = 0;

    bossState = {
        x: 180,
        y: 40,
        minX: 70,
        maxX: 350,
        direction: 1,
        speed: 65,
        phase: 1,
        attackTimer: 0,
        attackInterval: Infinity,
        maxParts: 0
    };

    // Level 1 + 2:
    // Cơ thể Boss được ghép từ các block phá được và toàn bộ Boss di chuyển ngang.
    const partWidth = 56;
    const partHeight = 28;

    const shellPositions = [
        {x: 60, y: 0}, {x: 120, y: 0}, {x: 180, y: 0}, {x: 240, y: 0}, {x: 300, y: 0},
        {x: 0, y: 32}, {x: 60, y: 32}, {x: 120, y: 32}, {x: 180, y: 32}, {x: 240, y: 32}, {x: 300, y: 32}, {x: 360, y: 32},
        {x: 0, y: 64}, {x: 60, y: 64}, {x: 120, y: 64}, {x: 180, y: 64}, {x: 240, y: 64}, {x: 300, y: 64}, {x: 360, y: 64},
        {x: 60, y: 96}, {x: 120, y: 96}, {x: 180, y: 96}, {x: 240, y: 96}, {x: 300, y: 96}
    ];

    // Level 3: các block giáp không thể phá.
    const armorPositions = new Set(["60,32", "300,32", "60,64", "300,64"]);

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
            repairable: !armor && section === "shell",
            canDropBubble: !armor
        });
    }

    for (const position of shellPositions) {
        const armor = armorPositions.has(`${position.x},${position.y}`);
        addBossPart(position.x, position.y, "shell", armor);
    }

    addBossPart(420, 32, "head", false, true);
    addBossPart(420, 64, "head");
    addBossPart(-60, 64, "tail");
    addBossPart(60, 128, "leg");
    addBossPart(120, 128, "leg");
    addBossPart(300, 128, "leg");
    addBossPart(360, 128, "leg");

    bossState.maxParts = bricks.filter((brick) => brick.type === "boss").length;

    // Level 2 + 3: Moving + Unbreakable obstacle.
    const movingObstacles = [
        {x: 220, y: 240, direction: 1},
        {x: 600, y: 240, direction: -1}
    ];

    for (const obstacle of movingObstacles) {
        bricks.push({
            x: obstacle.x,
            y: obstacle.y,
            width: 80,
            height: 18,
            color: "#475569",
            active: true,
            moving: true,
            moveSpeed: 55,
            moveDirection: obstacle.direction,
            minX: obstacle.x - 50,
            maxX: obstacle.x + 50,
            type: "unbreakable",
            breakable: false,
            repairable: false,
            canDropBubble: false
        });
    }

    // Level 6: Lava + Ball HP vẫn dùng cơ chế chung của game.
    const lavaPositions = [
        {x: 125, y: 255},
        {x: 715, y: 255}
    ];

    for (const lava of lavaPositions) {
        bricks.push({
            x: lava.x,
            y: lava.y,
            width: 60,
            height: 20,
            color: "#dc2626",
            active: true,
            moving: false,
            type: "lava",
            breakable: false,
            repairable: false,
            canDropBubble: false
        });
    }

    // Level 7: Repair Brick hồi lại các mảnh mai Boss đã bị phá.
    bricks.push({
        x: canvas.width / 2 - 30,
        y: 225,
        width: 60,
        height: 22,
        color: "#22c55e",
        active: true,
        moving: false,
        type: "repair",
        breakable: true,
        repairable: false,
        canDropBubble: false,
        repairTimer: 0,
        repairInterval: 7
    });

    // Level 8 kế thừa + cơ chế mới Level 10:
    // Switch mở Gate như cũ, hoặc đánh Gate đủ 10 lần để phá Gate trong 7 giây.
    bricks.push({
        x: 140,
        y: 310,
        width: 620,
        height: 18,
        color: "#0284c7",
        active: true,
        moving: false,
        type: "gate",
        breakable: false,
        repairable: false,
        open: false,
        openTimer: 0,
        openDuration: 5,
        hitCount: 0,
        maxHits: 10,
        broken: false,
        brokenTimer: 0,
        brokenDuration: 7,
        brokenByHits: false
    });

    bricks.push({
        x: canvas.width / 2 - 35,
        y: 440,
        width: 70,
        height: 24,
        color: "#eab308",
        active: true,
        moving: false,
        type: "switch",
        breakable: false,
        repairable: false
    });

    // Level 4: Disappearing Wall.
    const disappearingWalls = [
        {x: 315, timer: 0},
        {x: 567, timer: 2}
    ];

    for (const wall of disappearingWalls) {
        bricks.push({
            x: wall.x,
            y: 350,
            width: 18,
            height: 70,
            color: "#a855f7",
            active: true,
            moving: false,
            type: "disappearing",
            breakable: false,
            repairable: false,
            visible: wall.timer === 0,
            timer: wall.timer,
            visibleTime: 2,
            hiddenTime: 2,
            opacity: wall.timer === 0 ? 1 : 0
        });
    }

    // Level 5:
    // Các block Boss phá được có canDropBubble = true nên vẫn rơi +2 / +3 / ×2.

    // Level 9: Portal A/B cùng ẩn hiện và đổi vị trí sau mỗi chu kỳ.
    const portalAPositions = [
        {x: 75, y: 385},
        {x: 190, y: 455},
        {x: 675, y: 455},
        {x: 790, y: 385}
    ];

    const portalBPositions = [
        {x: 315, y: 250},
        {x: 515, y: 250}
    ];

    const firstAPosition = Math.floor(Math.random() * portalAPositions.length);
    const firstBPosition = Math.floor(Math.random() * portalBPositions.length);

    bricks.push({
        x: portalAPositions[firstAPosition].x,
        y: portalAPositions[firstAPosition].y,
        width: 28,
        height: 54,
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
        width: 28,
        height: 40,
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

function updateBossPhase() {
    if (currentLevel !== 10 || !bossState) {
        return;
    }

    const remainingParts = bricks.filter((brick) => brick.active && brick.type === "boss").length;
    const hpRatio = bossState.maxParts > 0 ? remainingParts / bossState.maxParts : 0;
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
    }

    if (bossState.phase === 1) {
        bossState.speed = 65;
        bossState.attackInterval = Infinity;
    } else if (bossState.phase === 2) {
        bossState.speed = 85;
        bossState.attackInterval = 2.2;
    } else {
        bossState.speed = 125;
        bossState.attackInterval = 1.1;
    }
}

function createBossProjectile(targetOffset = 0) {
    if (!bossState) {
        return;
    }

    const head = bricks.find((brick) => brick.active && brick.type === "boss" && brick.bossSection === "head");
    const startX = head ? head.x + head.width / 2 : bossState.x + 210;
    const startY = head ? head.y + head.height : bossState.y + 125;
    const targetX = paddle.x + paddle.width / 2 + targetOffset;
    const targetY = paddle.y;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy) || 1;
    const speed = bossState.phase === 3 ? 290 : 230;

    bossProjectiles.push({
        x: startX,
        y: startY,
        radius: bossState.phase === 3 ? 9 : 8,
        vx: speed * dx / distance,
        vy: speed * dy / distance
    });
}

function createBossAttack() {
    if (!bossState || bossState.phase === 1) {
        return;
    }

    if (bossState.phase === 2) {
        createBossProjectile();
    } else {
        createBossProjectile(-70);
        createBossProjectile(70);
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

    if (bossState.phase === 1) {
        return;
    }

    bossState.attackTimer += deltaTime;

    if (bossState.attackTimer >= bossState.attackInterval) {
        bossState.attackTimer = 0;
        createBossAttack();
    }
}

function updateBossProjectiles(deltaTime) {
    if (currentLevel !== 10) {
        return;
    }

    if (bossPlayerHitCooldown > 0) {
        bossPlayerHitCooldown = Math.max(0, bossPlayerHitCooldown - deltaTime);
    }

    const paddleLeft = Math.min(paddle.previousX, paddle.x);
    const paddleRight = Math.max(paddle.previousX + paddle.width, paddle.x + paddle.width);

    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const projectile = bossProjectiles[i];
        projectile.x += projectile.vx * deltaTime;
        projectile.y += projectile.vy * deltaTime;

        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y - projectile.radius > canvas.height) {
            bossProjectiles.splice(i, 1);
            continue;
        }

        const hitsPaddle = projectile.x + projectile.radius >= paddleLeft && projectile.x - projectile.radius <= paddleRight &&
            projectile.y + projectile.radius >= paddle.y && projectile.y - projectile.radius <= paddle.y + paddle.height;

        if (!hitsPaddle) {
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
    }
}

function drawBossProjectiles() {
    if (currentLevel !== 10) {
        return;
    }

    for (const projectile of bossProjectiles) {
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, Math.max(3, projectile.radius - 4), 0, Math.PI * 2);
        ctx.fillStyle = "#facc15";
        ctx.fill();
    }
}

function drawBossHUD() {
    if (currentLevel !== 10 || !bossState || gameState !== "playing") {
        return;
    }

    const remainingParts = bricks.filter((brick) => brick.active && brick.type === "boss").length;
    const hpPercent = bossState.maxParts > 0 ? Math.ceil((remainingParts / bossState.maxParts) * 100) : 0;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`BOSS HP: ${hpPercent}%`, 18, 16);
    ctx.fillText(`PHASE: ${bossState.phase}`, 18, 38);
    ctx.fillText(`PADDLE HP: ${bossPlayerHp}`, 18, 60);
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

        // Gate bị phá bằng 10 hit thì Switch tạm thời không có tác dụng.
        if (brick.broken) {
            continue;
        }

        brick.open = true;
        brick.openTimer = brick.openDuration;

        // Level 10: dùng Switch nghĩa là chọn cơ chế mở Gate cũ, reset số hit phá Gate.
        if (currentLevel === 10 && brick.maxHits) {
            brick.hitCount = 0;
        }
    }
}

function updateGates(deltaTime) {
    for (const brick of bricks) {
        if (brick.type !== "gate") {
            continue;
        }

        if (brick.broken) {
            brick.brokenTimer -= deltaTime;

            if (brick.brokenTimer <= 0) {
                brick.broken = false;
                brick.brokenByHits = false;
                brick.brokenTimer = 0;
                brick.hitCount = 0;
                brick.open = false;
                brick.openTimer = 0;
            }

            continue;
        }

        if (!brick.open) {
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

    ball.x = targetPortal.x + targetPortal.width / 2;
    ball.y = targetPortal.y + targetPortal.height / 2;
    ball.portalCooldown = 0.5;

    if ((currentLevel === 9 || currentLevel === 10) && portal.portalId === "A") {
        ball.inPortalRoom = true;
        ball.portalRoomTimer = 10;
    } else {
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
    ball.y = portalA.y + portalA.height + ball.radius + 8;
    ball.inPortalRoom = false;
    ball.portalRoomTimer = 0;
    ball.portalCooldown = 0.5;
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
        gateHitCooldown: 0,
        portalCooldown: 0,
        inPortalRoom: false,
        portalRoomTimer: 0
    };
}

const keys = {left: false, right: false};
let controlMode = null;
let lastMouseMoveTime = -Infinity;
const MOUSE_IDLE_TIME = 200;

function clampPaddle() {
    paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
}

function resetBall() {
    balls.length = 0;
    balls.push(createBall(paddle.x + paddle.width / 2, paddle.y - 9));
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
    paddle.previousX = paddle.x;
    resetControls();
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossState = null;
    bossPlayerHp = 5;
    bossPlayerHitCooldown = 0;
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
        }
    );
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
        }
    );
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

levelButton.addEventListener("click", () => {showLevelSelect();});
levelBackButton.addEventListener("click", () => {showMenu();});
guideButton.addEventListener("click", () => {showGuide();});
guideBackButton.addEventListener("click", () => {showMenu();});

function winGame() {
    if (gameState !== "playing") {
        return;
    }

    gameState = "won";
    resetControls();
    balls.length = 0;
    bubbles.length = 0;
    bossProjectiles.length = 0;
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

window.addEventListener(
    "keydown",
    (event) => {
        if (
            gameState !==
            "playing"
        ) {
            return;
        }

        if (
            event.code ===
            "Space"
        ) {
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
    }
);

window.addEventListener(
    "keyup",
    (event) => {
        if (event.key === "ArrowLeft") {
            keys.left = false;
        }

        if (event.key === "ArrowRight") {
            keys.right = false;
        }

        if (controlMode === "keyboard" && !keys.left && !keys.right) {
            controlMode = null;
        }
    }
);

window.addEventListener("blur", () => {
        resetControls();
    }
);

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
    }
);

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
            if (brick.broken) {
                continue;
            }

            ctx.save();
            ctx.globalAlpha = brick.open ? 0.18 : 1;
            ctx.fillStyle = brick.open ? "#38bdf8" : "#0284c7";
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = "#bae6fd";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

            if (currentLevel === 10 && brick.maxHits && !brick.open) {
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(`${brick.hitCount}/${brick.maxHits}`, brick.x + brick.width / 2, brick.y - 4);
            }

            ctx.restore();
            continue;
        }

        if (brick.type === "switch") {
            const level10Gate = currentLevel === 10 ? bricks.find((item) => item.type === "gate") : null;
            const disabled = level10Gate && level10Gate.brokenByHits;

            ctx.fillStyle = disabled ? "#64748b" : "#eab308";
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = disabled ? "#cbd5e1" : "#fef08a";
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(disabled ? "X" : "S", brick.x + brick.width / 2, brick.y + brick.height / 2);
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
        const hasBossPart = bricks.some((brick) => brick.active && brick.type === "boss");

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

        if (brick.type === "gate" && (brick.open || brick.broken)) {
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

        if (brick.type === "gate" && currentLevel === 10 && brick.maxHits && ball.gateHitCooldown <= 0) {
            brick.hitCount += 1;
            ball.gateHitCooldown = 0.18;

            if (brick.hitCount >= brick.maxHits) {
                brick.hitCount = brick.maxHits;
                brick.broken = true;
                brick.brokenByHits = true;
                brick.brokenTimer = brick.brokenDuration;
                brick.open = false;
                brick.openTimer = 0;
                return;
            }
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
            const gate = bricks.find((item) => item.type === "gate");

            if (currentLevel === 10 && gate && gate.brokenByHits) {
                break;
            }

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

    if (ball.gateHitCooldown > 0) {
        ball.gateHitCooldown = Math.max(0, ball.gateHitCooldown - deltaTime);
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
        clone.gateHitCooldown = source.gateHitCooldown;
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

    const steps = Math.max(1, Math.ceil(deltaTime / (1 / 120)));
    const stepTime = deltaTime / steps;

    for (let i = 0; i < steps; i++) {
        if (keys.left || keys.right) {
            paddle.previousX = paddle.x;
        }

        if (keys.left) {
            paddle.x -= paddle.speed * stepTime;
        }

        if (keys.right) {
            paddle.x += paddle.speed * stepTime;
        }

        clampPaddle();

        updateMovingBricks(stepTime);
        updateDisappearingWalls(stepTime);
        updateGates(stepTime);
        updatePortals(stepTime);
        updateRepairBricks(stepTime);
        updateBoss(stepTime);
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
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

        if (currentLevel >= 6) {
            if (ball.hp === 3) {
                ctx.fillStyle = "#ffffff";
            } else if (
                ball.hp === 2
            ) {
                ctx.fillStyle = "#facc15";
            } else {
                ctx.fillStyle = "#f87171";
            }
        } else {
            ctx.fillStyle = "#ffffff";
        }

        ctx.fill();

        if (currentLevel >= 6) {
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
