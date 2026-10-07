import { canvas, ctx, bricks, bubbles, scoreElement, state } from "./state.js";
import { checkWinCondition } from "./game.js";

export function createBubble(x, y) {
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

export function movePortalToRandomPosition(portal) {
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

export function updateMovingBricks(deltaTime) {
    for (const brick of bricks) {
        if (!brick.moving) continue;

        if (brick.randomTravel) {
            const step = brick.moveSpeed * deltaTime;
            const distance = brick.targetX - brick.x;
            if (Math.abs(distance) <= step) {
                brick.x = brick.targetX;
                let newTarget = brick.x;
                for (let i = 0; i < 8 && Math.abs(newTarget - brick.x) < 85; i++) {
                    newTarget = brick.minX + Math.random() * (brick.maxX - brick.minX);
                }
                brick.targetX = Math.abs(newTarget - brick.x) >= 85 ? newTarget
                    : (brick.x < (brick.minX + brick.maxX) / 2 ? brick.maxX : brick.minX);
            } else {
                brick.x += Math.sign(distance) * step;
            }
            continue;
        }

        if (brick.moveAxis === "y") {
            brick.y += brick.moveSpeed * brick.moveDirection * deltaTime;
            if (brick.y <= brick.minY) { brick.y = brick.minY; brick.moveDirection = 1; }
            else if (brick.y >= brick.maxY) { brick.y = brick.maxY; brick.moveDirection = -1; }
        } else {
            brick.x += brick.moveSpeed * brick.moveDirection * deltaTime;
            if (brick.x <= brick.minX) { brick.x = brick.minX; brick.moveDirection = 1; }
            else if (brick.x >= brick.maxX) { brick.x = brick.maxX; brick.moveDirection = -1; }
        }
    }
}

export function updateDisappearingWalls(deltaTime) {
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

export function updateRepairBricks(deltaTime) {
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

export function openGates() {
    for (const brick of bricks) {
        if (brick.type !== "gate") {
            continue;
        }

        brick.open = true;
        brick.openTimer = brick.openDuration;
    }
}

export function updateGates(deltaTime) {
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

export function updatePortals(deltaTime) {
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

export function teleportBall(ball, portal) {
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

    if (state.currentLevel === 9 && portal.portalId === "A") {
        ball.inPortalRoom = true;
        ball.portalRoomTimer = 10;
    } else if (state.currentLevel === 9 && portal.portalId === "B") {
        ball.inPortalRoom = false;
        ball.portalRoomTimer = 0;
    }
}

export function ejectBallFromPortalRoom(ball) {
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

export function drawBricks() {
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

export function checkBrickCollisions(ball) {
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

        if (state.currentLevel === 10 && brick.bossPart) {
            if (state.bossState && state.bossState.phase === 3 && state.bossState.shieldActive) {
                break;
            }

            if (brick.type === "bossArmor" && (!state.bossState || state.bossState.chargedTimer <= 0)) {
                break;
            }

            const destroyedX = brick.x + brick.width / 2;
            const destroyedY = brick.y + brick.height / 2;

            brick.active = false;
            state.score += brick.type === "bossArmor" ? 2 : 1;
            scoreElement.textContent = state.score;

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
        state.score += 1;
        scoreElement.textContent = state.score;

        if (brick.canDropBubble && Math.random() < 0.2) {
            createBubble(destroyedX, destroyedY);
        }

        checkWinCondition();
        break;
    }
}
