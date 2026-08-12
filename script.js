/* =========================================
   CYBER ARENA
   GAME ENGINE
========================================= */


// =========================================
// CANVAS
// =========================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// =========================================
// UI
// =========================================

const menu =
    document.getElementById("menu");

const gameOver =
    document.getElementById("gameOver");

const scoreElement =
    document.getElementById("score");

const waveElement =
    document.getElementById("wave");

const comboElement =
    document.getElementById("combo");

const healthBar =
    document.getElementById("healthBar");

const healthText =
    document.getElementById("healthText");

const levelText =
    document.getElementById("levelText");

const finalScore =
    document.getElementById("finalScore");

const finalWave =
    document.getElementById("finalWave");

const restartButton =
    document.getElementById("restartButton");

const attackButton =
    document.getElementById("attackButton");


// =========================================
// CANVAS SIZE
// =========================================

function resizeCanvas() {

    canvas.width =
        canvas.clientWidth;

    canvas.height =
        canvas.clientHeight;

}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


// =========================================
// DIFFICULTY
// =========================================

const difficulties = {

    easy: {

        name: "DỄ",

        enemyCount: 5,

        enemySpeed: 0.7,

        enemyHealth: 1,

        damage: 8,

        spawnDelay: 1500

    },

    normal: {

        name: "BÌNH THƯỜNG",

        enemyCount: 8,

        enemySpeed: 1.05,

        enemyHealth: 2,

        damage: 12,

        spawnDelay: 1100

    },

    hard: {

        name: "KHÓ",

        enemyCount: 12,

        enemySpeed: 1.4,

        enemyHealth: 3,

        damage: 18,

        spawnDelay: 750

    }

};


let difficulty = difficulties.normal;


// =========================================
// GAME VARIABLES
// =========================================

let gameRunning = false;

let score = 0;

let wave = 1;

let combo = 1;

let lastKillTime = 0;

let enemies = [];

let particles = [];

let bullets = [];

let keys = {};

let lastTime = 0;

let spawnTimer = 0;


// =========================================
// PLAYER
// =========================================

const player = {

    x: 0,

    y: 0,

    size: 28,

    speed: 4.5,

    health: 100,

    maxHealth: 100,

    attackCooldown: 0,

    invincible: 0

};


// =========================================
// START GAME
// =========================================

function startGame(level) {

    difficulty =
        difficulties[level];

    gameRunning = true;

    score = 0;

    wave = 1;

    combo = 1;

    enemies = [];

    particles = [];

    bullets = [];

    spawnTimer = 0;

    player.health =
        player.maxHealth;

    player.x =
        canvas.width / 2;

    player.y =
        canvas.height / 2;

    menu.classList.add("hidden");

    gameOver.classList.add("hidden");

    updateUI();

    lastTime =
        performance.now();

    requestAnimationFrame(gameLoop);

}


// =========================================
// START BUTTONS
// =========================================

document
    .querySelectorAll(".difficulty")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                startGame(
                    button.dataset.level
                );

            }
        );

    });


// =========================================
// RESTART
// =========================================

restartButton.addEventListener(
    "click",
    () => {

        menu.classList.remove(
            "hidden"
        );

        gameOver.classList.add(
            "hidden"
        );

    }
);


// =========================================
// KEYBOARD
// =========================================

document.addEventListener(
    "keydown",
    event => {

        keys[event.key.toLowerCase()] =
            true;

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            attack();

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.key.toLowerCase()] =
            false;

    }
);


// =========================================
// MOBILE MOVEMENT BUTTONS
// =========================================

document
    .querySelectorAll(".move-button")
    .forEach(button => {

        const key =
            button.dataset.key.toLowerCase();


        button.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                keys[key] = true;

            }
        );


        button.addEventListener(
            "pointerup",
            event => {

                event.preventDefault();

                keys[key] = false;

            }
        );


        button.addEventListener(
            "pointerleave",
            () => {

                keys[key] = false;

            }
        );

    });


// =========================================
// MOBILE ATTACK
// =========================================

attackButton.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        attack();

    }
);


// =========================================
// PLAYER MOVEMENT
// =========================================

function movePlayer() {

    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy -= 1;

    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy += 1;

    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx -= 1;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx += 1;

    }


    // Normalize diagonal movement

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        dx /= length;

        dy /= length;

    }


    player.x +=
        dx * player.speed;

    player.y +=
        dy * player.speed;


    // Keep player inside arena

    const half =
        player.size / 2;


    player.x =
        Math.max(
            half,
            Math.min(
                canvas.width - half,
                player.x
            )
        );


    player.y =
        Math.max(
            half,
            Math.min(
                canvas.height - half,
                player.y
            )
        );

}


// =========================================
// ATTACK
// =========================================

function attack() {

    if (!gameRunning)
        return;


    if (player.attackCooldown > 0)
        return;


    player.attackCooldown =
        250;


    // Find nearest enemy

    let nearest = null;

    let nearestDistance =
        Infinity;


    enemies.forEach(enemy => {

        const distance =
            Math.hypot(
                enemy.x - player.x,
                enemy.y - player.y
            );


        if (
            distance < nearestDistance &&
            distance < 220
        ) {

            nearest = enemy;

            nearestDistance =
                distance;

        }

    });


    // If enemy found

    if (nearest) {

        bullets.push({

            x: player.x,

            y: player.y,

            target: nearest,

            speed: 12

        });

    } else {

        // Attack effect without target

        createExplosion(
            player.x,
            player.y,
            "#00ffff",
            8
        );

    }

}


// =========================================
// SPAWN ENEMY
// =========================================

function spawnEnemy() {

    if (
        enemies.length >=
        difficulty.enemyCount +
        wave * 2
    ) {

        return;

    }


    const side =
        Math.floor(
            Math.random() * 4
        );


    let x;
    let y;


    if (side === 0) {

        x = -30;

        y =
            Math.random() *
            canvas.height;

    }

    else if (side === 1) {

        x =
            canvas.width + 30;

        y =
            Math.random() *
            canvas.height;

    }

    else if (side === 2) {

        x =
            Math.random() *
            canvas.width;

        y = -30;

    }

    else {

        x =
            Math.random() *
            canvas.width;

        y =
            canvas.height + 30;

    }


    enemies.push({

        x,

        y,

        size: 22,

        speed:
            difficulty.enemySpeed +
            wave * 0.04,

        health:
            difficulty.enemyHealth,

        maxHealth:
            difficulty.enemyHealth,

        damage:
            difficulty.damage

    });

}


// =========================================
// UPDATE ENEMIES
// =========================================

function updateEnemies(delta) {

    enemies.forEach(enemy => {

        const dx =
            player.x - enemy.x;

        const dy =
            player.y - enemy.y;


        const distance =
            Math.hypot(dx, dy);


        if (distance > 0) {

            enemy.x +=
                (dx / distance) *
                enemy.speed *
                delta;

            enemy.y +=
                (dy / distance) *
                enemy.speed *
                delta;

        }


        // Enemy reaches player

        if (
            distance <
            enemy.size +
            player.size / 2
        ) {

            damagePlayer(
                enemy.damage
            );

        }

    });

}


// =========================================
// PLAYER DAMAGE
// =========================================

function damagePlayer(amount) {

    if (
        player.invincible > 0
    ) {

        return;

    }


    player.health -= amount;

    player.invincible =
        800;


    createExplosion(
        player.x,
        player.y,
        "#ff0055",
        15
    );


    updateUI();


    if (
        player.health <= 0
    ) {

        endGame();

    }

}


// =========================================
// BULLETS
// =========================================

function updateBullets(delta) {

    bullets.forEach(
        (bullet, index) => {

            const target =
                bullet.target;


            if (
                !target ||
                !enemies.includes(target)
            ) {

                bullets.splice(
                    index,
                    1
                );

                return;

            }


            const dx =
                target.x -
                bullet.x;

            const dy =
                target.y -
                bullet.y;


            const distance =
                Math.hypot(dx, dy);


            if (distance < 15) {

                hitEnemy(
                    target
                );

                bullets.splice(
                    index,
                    1
                );

                return;

            }


            bullet.x +=
                (dx / distance) *
                bullet.speed *
                delta;

            bullet.y +=
                (dy / distance) *
                bullet.speed *
                delta;

        }
    );

}


// =========================================
// HIT ENEMY
// =========================================

function hitEnemy(enemy) {

    enemy.health--;


    createExplosion(
        enemy.x,
        enemy.y,
        "#ff00ff",
        10
    );


    if (
        enemy.health <= 0
    ) {

        const index =
            enemies.indexOf(enemy);


        if (index !== -1) {

            enemies.splice(
                index,
                1
            );

        }


        const now =
            Date.now();


        // Combo

        if (
            now - lastKillTime <
            2500
        ) {

            combo++;

        } else {

            combo = 1;

        }


        lastKillTime = now;


        score +=
            100 * combo;


        updateUI();


        // Check wave

        if (
            score >=
            wave * 1000
        ) {

            wave++;

            createExplosion(
                player.x,
                player.y,
                "#00ffff",
                30
            );

        }

    }

}


// =========================================
// PARTICLES
// =========================================

function createExplosion(
    x,
    y,
    color,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            Math.random() *
            4 +
            1;


        particles.push({

            x,

            y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life: 1,

            color

        });

    }

}


// =========================================
// UPDATE PARTICLES
// =========================================

function updateParticles(delta) {

    particles.forEach(
        particle => {

            particle.x +=
                particle.vx *
                delta;

            particle.y +=
                particle.vy *
                delta;

            particle.life -=
                0.025 *
                delta;

        }
    );


    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );

}


// =========================================
// DRAW BACKGROUND
// =========================================

function drawBackground() {

    ctx.fillStyle =
        "#030612";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Grid

    ctx.strokeStyle =
        "rgba(0,255,255,0.08)";

    ctx.lineWidth = 1;


    const gridSize = 40;


    for (
        let x = 0;
        x < canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }


    // Cyber center

    const gradient =
        ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            20,
            canvas.width / 2,
            canvas.height / 2,
            350
        );


    gradient.addColorStop(
        0,
        "rgba(0,255,255,0.08)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


// =========================================
// DRAW PLAYER
// =========================================

function drawPlayer() {

    ctx.save();


    // Glow

    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "#00ffff";


    // Body

    ctx.fillStyle =
        player.invincible > 0
            ? "#ffffff"
            : "#00ffff";


    ctx.beginPath();

    ctx.moveTo(
        player.x,
        player.y - 20
    );

    ctx.lineTo(
        player.x + 18,
        player.y + 15
    );

    ctx.lineTo(
        player.x,
        player.y + 8
    );

    ctx.lineTo(
        player.x - 18,
        player.y + 15
    );

    ctx.closePath();

    ctx.fill();


    // Core

    ctx.fillStyle =
        "#ff00ff";

    ctx.shadowColor =
        "#ff00ff";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


// =========================================
// DRAW ENEMIES
// =========================================

function drawEnemies() {

    enemies.forEach(
        enemy => {

            ctx.save();


            ctx.shadowBlur =
                20;

            ctx.shadowColor =
                "#ff0055";


            ctx.fillStyle =
                "#ff0055";


            ctx.beginPath();

            ctx.arc(
                enemy.x,
                enemy.y,
                enemy.size,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Eye

            ctx.fillStyle =
                "#ffffff";

            ctx.shadowColor =
                "#ffffff";


            ctx.beginPath();

            ctx.arc(
                enemy.x,
                enemy.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Health bar

            const width = 35;

            const healthPercent =
                enemy.health /
                enemy.maxHealth;


            ctx.fillStyle =
                "rgba(255,255,255,0.2)";

            ctx.fillRect(
                enemy.x - width / 2,
                enemy.y - 30,
                width,
                4
            );


            ctx.fillStyle =
                "#ff0055";

            ctx.fillRect(
                enemy.x - width / 2,
                enemy.y - 30,
                width *
                healthPercent,
                4
            );


            ctx.restore();

        }
    );

}


// =========================================
// DRAW BULLETS
// =========================================

function drawBullets() {

    bullets.forEach(
        bullet => {

            ctx.save();

            ctx.shadowBlur = 20;

            ctx.shadowColor =
                "#00ffff";

            ctx.fillStyle =
                "#00ffff";


            ctx.beginPath();

            ctx.arc(
                bullet.x,
                bullet.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.restore();

        }
    );

}


// =========================================
// DRAW PARTICLES
// =========================================

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.save();

            ctx.globalAlpha =
                particle.life;

            ctx.fillStyle =
                particle.color;

            ctx.shadowBlur = 15;

            ctx.shadowColor =
                particle.color;


            ctx.fillRect(
                particle.x,
                particle.y,
                4,
                4
            );


            ctx.restore();

        }
    );

}


// =========================================
// UI
// =========================================

function updateUI() {

    scoreElement.textContent =
        score;

    waveElement.textContent =
        wave;

    comboElement.textContent =
        "x" + combo;

    healthText.textContent =
        Math.max(
            0,
            Math.floor(
                player.health
            )
        );


    healthBar.style.width =
        Math.max(
            0,
            player.health
        ) + "%";


    levelText.textContent =
        "LEVEL " +
        wave;

}


// =========================================
// GAME OVER
// =========================================

function endGame() {

    gameRunning = false;


    finalScore.textContent =
        score;

    finalWave.textContent =
        wave;


    gameOver.classList.remove(
        "hidden"
    );

}


// =========================================
// MAIN GAME LOOP
// =========================================

function gameLoop(time) {

    if (!gameRunning)
        return;


    const delta =
        Math.min(
            (time - lastTime) /
            16.67,
            2
        );


    lastTime = time;


    // Cooldowns

    if (
        player.attackCooldown >
        0
    ) {

        player.attackCooldown -=
            16.67 * delta;

    }


    if (
        player.invincible >
        0
    ) {

        player.invincible -=
            16.67 * delta;

    }


    // Movement

    movePlayer();


    // Spawn enemies

    spawnTimer +=
        16.67 * delta;


    if (
        spawnTimer >=
        difficulty.spawnDelay /
        Math.min(wave, 5)
    ) {

        spawnEnemy();

        spawnTimer = 0;

    }


    // Update

    updateEnemies(delta);

    updateBullets(delta);

    updateParticles(delta);


    // Draw

    drawBackground();

    drawParticles();

    drawBullets();

    drawEnemies();

    drawPlayer();


    // Next frame

    requestAnimationFrame(
        gameLoop
    );

}


// =========================================
// INITIAL STATE
// =========================================

updateUI();