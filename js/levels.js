import { canvas, bricks, bubbles, brickConfig, state } from "./state.js";
import { createLevel10 } from "./boss.js";

export function createLevel1() {
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

export function createLevel2() {
    bricks.length = 0;
    const totalWidth = brickConfig.columns * brickConfig.width + (brickConfig.columns - 1) * brickConfig.gap;
    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < brickConfig.rows; row++) {
        for (let column = 0; column < brickConfig.columns; column++) {
            const x = startX + column * (brickConfig.width + brickConfig.gap);
            const y = brickConfig.top + row * (brickConfig.height + brickConfig.gap);
            const moveVertical = row === 0 || row === brickConfig.rows - 1;
            bricks.push({
                x: x, y: y, width: brickConfig.width, height: brickConfig.height,
                color: brickConfig.colors[row], active: true, moving: true,
                moveAxis: moveVertical ? "y" : "x", moveSpeed: moveVertical ? 48 : 65,
                moveDirection: row < 2 ? 1 : -1,
                minX: x - 28, maxX: x + 28, minY: y - 8, maxY: y + 8
            });
        }
    }
}

export function createLevel3() {
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

export function createLevel4() {
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

    createMovingDisappearingWalls(265, 105);
}

export function createLevel5() {
    bricks.length = 0;
    bubbles.length = 0;
    const config = {rows: 6, columns: 10, width: 65, height: 20, gap: 10, rowGap: 12, top: 55,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa"]};
    const totalWidth = config.columns * config.width + (config.columns - 1) * config.gap;
    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < config.rows; row++) {
        for (let column = 0; column < config.columns; column++) {
            const unbreakable = (row === 2 && column === 1) || (row === 3 && column === 8);
            bricks.push({
                x: startX + column * (config.width + config.gap), y: config.top + row * (config.height + config.rowGap),
                width: config.width, height: config.height, color: unbreakable ? "#475569" : config.colors[row],
                active: true, moving: false, type: unbreakable ? "unbreakable" : "normal",
                breakable: !unbreakable, canDropBubble: !unbreakable
            });
        }
    }
    createMovingDisappearingWalls(280, 95);
}

export function createLevel6() {
    bricks.length = 0;
    bubbles.length = 0;
    const config = {rows: 6, columns: 10, width: 62, height: 20, gap: 11, rowGap: 12, top: 55,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa"]};
    const totalWidth = config.columns * config.width + (config.columns - 1) * config.gap;
    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < config.rows; row++) {
        for (let column = 0; column < config.columns; column++) {
            const lava = (row === 1 && column === 3) || (row === 3 && column === 6) || (row === 4 && column === 1);
            const unbreakable = !lava && ((row === 2 && column === 1) || (row === 2 && column === 8));
            const type = lava ? "lava" : unbreakable ? "unbreakable" : "normal";
            bricks.push({
                x: startX + column * (config.width + config.gap), y: config.top + row * (config.height + config.rowGap),
                width: config.width, height: config.height,
                color: lava ? "#dc2626" : unbreakable ? "#475569" : config.colors[row],
                active: true, moving: false, type: type, breakable: !lava && !unbreakable,
                canDropBubble: !lava && !unbreakable
            });
        }
    }
    createMovingDisappearingWalls(280, 95);
}

export function createLevel7() {
    bricks.length = 0;
    bubbles.length = 0;
    const config = {rows: 7, columns: 10, width: 60, height: 20, gap: 10, rowGap: 10, top: 55,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa", "#f472b6"]};
    const totalWidth = config.columns * config.width + (config.columns - 1) * config.gap;
    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < config.rows; row++) {
        for (let column = 0; column < config.columns; column++) {
            if (row === 3 && (column === 4 || column === 5)) continue;
            const lava = (row === 1 && column === 2) || (row === 4 && column === 7);
            const unbreakable = !lava && ((row === 1 && column === 7) || (row === 2 && column === 1) ||
                (row === 4 && column === 3) || (row === 5 && column === 8));
            const type = lava ? "lava" : unbreakable ? "unbreakable" : "normal";
            bricks.push({
                x: startX + column * (config.width + config.gap), y: config.top + row * (config.height + config.rowGap),
                width: config.width, height: config.height,
                color: lava ? "#dc2626" : unbreakable ? "#475569" : config.colors[row],
                active: true, moving: false, type: type, breakable: !lava && !unbreakable,
                repairable: type === "normal", canDropBubble: type === "normal"
            });
        }
    }

    bricks.push({
        x: canvas.width / 2 - 30, y: config.top + 3 * (config.height + config.rowGap),
        width: 60, height: 20, color: "#22c55e", active: true, moving: false,
        type: "repair", breakable: true, repairable: false,
        canDropBubble: false, repairTimer: 0, repairInterval: 5
    });
}

export function createLevel8() {
    bricks.length = 0;
    bubbles.length = 0;
    const config = {rows: 6, columns: 10, width: 60, height: 20, gap: 10, rowGap: 10, top: 55,
        colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa"]};
    const totalWidth = config.columns * config.width + (config.columns - 1) * config.gap;
    const startX = (canvas.width - totalWidth) / 2;

    for (let row = 0; row < config.rows; row++) {
        for (let column = 0; column < config.columns; column++) {
            const x = startX + column * (config.width + config.gap);
            const y = config.top + row * (config.height + config.rowGap);
            const lava = row === 2 && (column === 2 || column === 7);
            const moving = row === 0 || row === config.rows - 1;
            bricks.push({
                x: x, y: y, width: config.width, height: config.height,
                color: lava ? "#dc2626" : config.colors[row], active: true,
                moving: moving, moveAxis: "y", moveSpeed: 40,
                moveDirection: row === 0 ? 1 : -1, minY: y - 5, maxY: y + 5,
                type: lava ? "lava" : "normal", breakable: !lava,
                repairable: false, canDropBubble: !lava
            });
        }
    }

    bricks.push({
        x: 0, y: 285, width: canvas.width, height: 16, color: "#0284c7",
        active: true, moving: false, type: "gate", breakable: false, repairable: false,
        open: false, openTimer: 0, openDuration: 5
    });
    bricks.push({
        x: canvas.width / 2 - 35, y: 385, width: 70, height: 24, color: "#eab308",
        active: true, moving: false, type: "switch", breakable: false, repairable: false
    });
}

export function createLevel9() {
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

export function createMovingDisappearingWalls(y = 275, height = 100) {
    const corridors = [{minX: 48, maxX: 305, x: 85}, {minX: 575, maxX: 832, x: 790}];
    for (let i = 0; i < corridors.length; i++) {
        const wall = corridors[i];
        bricks.push({
            x: wall.x, y: y, width: 18, height: height, color: "#a855f7",
            active: true, moving: true, moveAxis: "x", moveSpeed: 88,
            randomTravel: true, targetX: wall.maxX, minX: wall.minX, maxX: wall.maxX,
            type: "disappearing", breakable: false, visible: i === 0,
            timer: i === 0 ? 0 : 2, visibleTime: 2.5, hiddenTime: 1.5,
            opacity: i === 0 ? 1 : 0
        });
    }
}

export function createBricks() {
    if (state.currentLevel === 1) {
        createLevel1();
    } else if (state.currentLevel === 2) {
        createLevel2();
    } else if (state.currentLevel === 3) {
        createLevel3();
    } else if (state.currentLevel === 4) {
        createLevel4();
    } else if (state.currentLevel === 5) {
        createLevel5();
    } else if (state.currentLevel === 6) {
        createLevel6();
    } else if (state.currentLevel === 7) {
        createLevel7();
    } else if (state.currentLevel === 8) {
        createLevel8();
    } else if (state.currentLevel === 9) {
        createLevel9();
    } else if (state.currentLevel === 10) {
        createLevel10();
    }
}
