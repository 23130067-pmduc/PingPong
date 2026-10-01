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
const maxImplementedLevel = 9;

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

    const portalAPositions = [
        {x: 70, y: 365},
        {x: 205, y: 415},
        {x: 660, y: 365},
        {x: 790, y: 415}
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
        width: 36,
        height: 70,
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
        width: 36,
        height: 48,
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

    ball.x = targetPortal.x + targetPortal.width / 2;
    ball.y = targetPortal.y + targetPortal.height / 2;
    ball.portalCooldown = 0.5;

    if (portal.portalId === "A") {
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
    balls.length = 0;
    bubbles.length = 0;
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
    const hasBreakableBrick =
        bricks.some((brick) => brick.active && brick.breakable !== false);

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
