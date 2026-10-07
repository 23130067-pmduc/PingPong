import { canvas, ctx, paddle, bricks, bubbles, bossProjectiles, bossPortals, scoreElement, state } from "./state.js";
import { createBubble } from "./bricks.js";
import { checkWinCondition, loseGame } from "./game.js";

export function createLevel10() {
    bricks.length = 0;
    bubbles.length = 0;
    bossProjectiles.length = 0;
    bossPortals.length = 0;
    state.bossPlayerHp = 5;
    state.bossPlayerHitCooldown = 0;

    state.bossState = {
        x: 175,
        y: 55,
        minX: 60,
        maxX: 340,
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

    const partWidth = 46;
    const partHeight = 22;
    const shellPositions = [];
    for (let row = 0; row < 5; row++) {
        const firstColumn = row === 0 || row === 4 ? 1 : 0;
        const lastColumn = row === 0 || row === 4 ? 8 : 9;
        for (let column = firstColumn; column <= lastColumn; column++) {
            shellPositions.push({x: column * 49, y: row * 24});
        }
    }
    const armorPositions = new Set(["98,48", "343,48", "98,72", "343,72"]);

    function addBossPart(offsetX, offsetY, section, armor = false, eye = false) {
        bricks.push({
            x: state.bossState.x + offsetX,
            y: state.bossState.y + offsetY,
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

    addBossPart(490, 24, "head", false, true);
    addBossPart(490, 48, "head");
    addBossPart(-49, 48, "tail");
    addBossPart(49, 123, "leg");
    addBossPart(98, 123, "leg");
    addBossPart(343, 123, "leg");
    addBossPart(392, 123, "leg");

    state.bossState.maxParts = bricks.filter((brick) => brick.type === "boss").length;
    state.bossState.maxArmor = bricks.filter((brick) => brick.type === "bossArmor").length;
    state.bossState.maxTotalParts = bricks.filter((brick) => brick.bossPart).length;

    createBossPortals();
}

export function updateBossPhase() {
    if (state.currentLevel !== 10 || !state.bossState) {
        return;
    }

    const remainingTotal = bricks.filter((brick) => brick.active && brick.bossPart).length;
    const hpRatio = state.bossState.maxTotalParts > 0 ? remainingTotal / state.bossState.maxTotalParts : 0;
    let newPhase = 1;

    if (hpRatio <= 0.25) {
        newPhase = 3;
    } else if (hpRatio <= 0.4) {
        newPhase = 2;
    }

    newPhase = Math.max(newPhase, state.bossState.phase);

    if (newPhase !== state.bossState.phase) {
        state.bossState.phase = newPhase;
        state.bossState.attackTimer = 0;
        state.bossState.attackCounter = 0;

        if (newPhase === 3) {
            state.bossState.shieldActive = true;
            state.bossState.shieldHits = 0;
            state.bossState.shieldDownTimer = 0;
            state.bossState.chargedTimer = 0;
        }
    }

    if (state.bossState.phase === 1) {
        state.bossState.speed = 60;
        state.bossState.attackInterval = Infinity;
    } else if (state.bossState.phase === 2) {
        state.bossState.speed = 80;
        state.bossState.attackInterval = 2.1;
    } else {
        state.bossState.speed = 95;
        state.bossState.attackInterval = 1.45;
    }
}

export function createBossProjectile(type = "fire", targetOffset = 0, usePortal = false) {
    if (!state.bossState) {
        return;
    }

    const head = bricks.find((brick) => brick.active && brick.type === "boss" && brick.bossSection === "head");
    const startX = head ? head.x + head.width / 2 : state.bossState.x + 240;
    const startY = head ? head.y + head.height : state.bossState.y + 140;

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
    } else if (state.bossState.phase === 3) {
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

export function createBossAttack() {
    if (!state.bossState || state.bossState.phase === 1) {
        return;
    }

    state.bossState.attackCounter += 1;

    if (state.bossState.phase === 2) {
        if (state.bossState.attackCounter % 2 === 0) {
            createBossProjectile("energy", 0, false);
        } else {
            createBossProjectile("fire", 0, true);
        }

        return;
    }

    createBossProjectile("energy", 0, false);

    if (state.bossState.attackCounter % 2 === 0) {
        createBossProjectile("ricochet", state.bossState.direction > 0 ? 150 : -150, true);
    } else {
        createBossProjectile("fire", state.bossState.direction > 0 ? -90 : 90, true);
    }
}

export function updateBoss(deltaTime) {
    if (state.currentLevel !== 10 || !state.bossState) {
        return;
    }

    updateBossPhase();

    state.bossState.x += state.bossState.speed * state.bossState.direction * deltaTime;

    if (state.bossState.x <= state.bossState.minX) {
        state.bossState.x = state.bossState.minX;
        state.bossState.direction = 1;
    } else if (state.bossState.x >= state.bossState.maxX) {
        state.bossState.x = state.bossState.maxX;
        state.bossState.direction = -1;
    }

    for (const brick of bricks) {
        if (!brick.bossPart) {
            continue;
        }

        brick.x = state.bossState.x + brick.offsetX;
        brick.y = state.bossState.y + brick.offsetY;
    }

    if (state.bossState.phase === 3 && !state.bossState.shieldActive) {
        if (state.bossState.shieldDownTimer > 0) {
            state.bossState.shieldDownTimer = Math.max(0, state.bossState.shieldDownTimer - deltaTime);
        }

        if (state.bossState.chargedTimer > 0) {
            state.bossState.chargedTimer = Math.max(0, state.bossState.chargedTimer - deltaTime);
        }

        if (state.bossState.shieldDownTimer <= 0 && bricks.some((brick) => brick.active && brick.bossPart)) {
            state.bossState.shieldActive = true;
            state.bossState.shieldHits = 0;
            state.bossState.chargedTimer = 0;
        }
    }

    if (state.bossState.phase === 1) {
        return;
    }

    state.bossState.attackTimer += deltaTime;

    if (state.bossState.attackTimer >= state.bossState.attackInterval) {
        state.bossState.attackTimer = 0;
        createBossAttack();
    }
}

export function createBossPortals() {
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

export function updateBossPortals(deltaTime) {
    if (state.currentLevel !== 10 || !state.bossState || state.bossState.phase < 2 || bossPortals.length < 2) {
        return;
    }

    state.bossState.portalMoveTimer += deltaTime;

    if (state.bossState.portalMoveTimer < 6) {
        return;
    }

    state.bossState.portalMoveTimer = 0;

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

export function circleHitsRect(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
}

export function teleportBossProjectile(projectile, portal) {
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

export function reflectEnergyProjectile(projectile) {
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

export function breakBossShield() {
    if (!state.bossState || state.bossState.phase !== 3) {
        return;
    }

    state.bossState.shieldActive = false;
    state.bossState.shieldHits = state.bossState.shieldRequiredHits;
    state.bossState.shieldDownTimer = state.bossState.shieldDownDuration;
    state.bossState.chargedTimer = state.bossState.shieldDownDuration;
}

export function drawBossPortals() {
    if (state.currentLevel !== 10 || !state.bossState || state.bossState.phase < 2) {
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

export function drawBossShield() {
    if (state.currentLevel !== 10 || !state.bossState || state.bossState.phase !== 3 || !state.bossState.shieldActive) {
        return;
    }

    ctx.save();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.8;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#22d3ee";
    ctx.beginPath();
    ctx.ellipse(state.bossState.x + 224, state.bossState.y + 82, 300, 108, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

export function updateBossProjectiles(deltaTime) {
    if (state.currentLevel !== 10 || !state.bossState) {
        return;
    }

    if (state.bossPlayerHitCooldown > 0) {
        state.bossPlayerHitCooldown = Math.max(0, state.bossPlayerHitCooldown - deltaTime);
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
            projectile.portalCooldown <= 0 && state.bossState.phase >= 2) {
            const portal = bossPortals.find((item) => circleHitsRect(projectile, item));

            if (portal) {
                teleportBossProjectile(projectile, portal);
            }
        }

        if (projectile.reflected && projectile.type === "energy") {
            const hitBossPart = bricks.find((brick) => brick.active && brick.bossPart && circleHitsRect(projectile, brick));

            if (hitBossPart) {
                if (state.bossState.phase === 3 && state.bossState.shieldActive) {
                    state.bossState.shieldHits += 1;

                    if (state.bossState.shieldHits >= state.bossState.shieldRequiredHits) {
                        breakBossShield();
                    }

                    bossProjectiles.splice(i, 1);
                    continue;
                }

                if (hitBossPart.type === "boss" || (hitBossPart.type === "bossArmor" && state.bossState.chargedTimer > 0)) {
                    hitBossPart.active = false;
                    state.score += 2;
                    scoreElement.textContent = state.score;

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

            if (state.bossPlayerHitCooldown > 0) {
                continue;
            }

            state.bossPlayerHp -= 1;
            state.bossPlayerHitCooldown = 0.65;

            if (state.bossPlayerHp <= 0) {
                state.bossPlayerHp = 0;
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

export function drawBossProjectiles() {
    if (state.currentLevel !== 10) return;

    for (const projectile of bossProjectiles) {
        ctx.save();
        const color = projectile.type === "fire" ? "#ef4444" : projectile.type === "energy"
            ? (projectile.reflected ? "#22d3ee" : "#facc15") : "#a855f7";
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.48;
        ctx.beginPath();
        ctx.moveTo(projectile.x - projectile.vx * 0.065, projectile.y - projectile.vy * 0.065);
        ctx.lineTo(projectile.x, projectile.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.translate(projectile.x, projectile.y);
        ctx.fillStyle = color;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        if (projectile.type === "fire") {
            ctx.rotate(Math.atan2(projectile.vy, projectile.vx) + Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, -16); ctx.lineTo(10, 0); ctx.lineTo(0, 13); ctx.lineTo(-10, 0);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fef08a";
            ctx.fillRect(-3, -4, 6, 8);
        } else if (projectile.type === "energy") {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i - Math.PI / 2;
                const x = Math.cos(angle) * 13;
                const y = Math.sin(angle) * 13;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(2, -9); ctx.lineTo(-4, 1); ctx.lineTo(3, 1); ctx.lineTo(-2, 9);
            ctx.stroke();
        } else {
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-10, -10, 20, 20);
            ctx.strokeRect(-10, -10, 20, 20);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(6, -6); ctx.lineTo(-6, 6);
            ctx.stroke();
        }
        ctx.restore();
    }
}

export function drawBossHUD() {
    if (state.currentLevel !== 10 || !state.bossState || state.gameState !== "playing") {
        return;
    }

    const remainingTotal = bricks.filter((brick) => brick.active && brick.bossPart).length;
    const remainingArmor = bricks.filter((brick) => brick.active && brick.type === "bossArmor").length;
    const hpPercent = state.bossState.maxTotalParts > 0 ? Math.ceil((remainingTotal / state.bossState.maxTotalParts) * 100) : 0;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`BOSS HP: ${hpPercent}%`, 18, 16);
    ctx.fillText(`PHASE: ${state.bossState.phase}`, 18, 38);
    ctx.fillText(`PADDLE HP: ${state.bossPlayerHp}`, 18, 60);
    ctx.fillText(`ARMOR: ${remainingArmor}/${state.bossState.maxArmor}`, 18, 82);

    if (state.bossState.phase === 3) {
        const shieldText = state.bossState.shieldActive
            ? `SHIELD: ${state.bossState.shieldHits}/${state.bossState.shieldRequiredHits}`
            : `SHIELD DOWN: ${state.bossState.shieldDownTimer.toFixed(1)}s`;

        ctx.fillText(shieldText, 18, 104);

        if (state.bossState.chargedTimer > 0) {
            ctx.fillStyle = "#22d3ee";
            ctx.fillText(`CHARGED BALL: ${state.bossState.chargedTimer.toFixed(1)}s`, 18, 126);
        }
    }

    ctx.restore();
}
