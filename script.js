/* =========================================================
   CYBER ARENA
   VERSION 2.0 - SKILL DROP SYSTEM
   ========================================================= */


/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


/* =========================================================
   UI
========================================================= */

const menu = document.getElementById("menu");
const gameOver = document.getElementById("gameOver");

const scoreElement = document.getElementById("score");
const waveElement = document.getElementById("wave");
const comboElement = document.getElementById("combo");

const healthBar = document.getElementById("healthBar");
const healthText = document.getElementById("healthText");

const levelText = document.getElementById("levelText");

const finalScore = document.getElementById("finalScore");
const finalWave = document.getElementById("finalWave");

const restartButton =
    document.getElementById("restartButton");

const attackButton =
    document.getElementById("attackButton");


/* =========================================================
   DIFFICULTY
========================================================= */

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


/* =========================================================
   GAME VARIABLES
========================================================= */

let gameRunning = false;

let score = 0;
let wave = 1;
let combo = 1;

let lastKillTime = 0;

let enemies = [];
let bullets = [];
let particles = [];
let skills = [];
let lightning = [];

let keys = {};

let lastTime = 0;
let spawnTimer = 0;


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: 0,
    y: 0,

    size: 28,

    baseSpeed: 4.5,
    speed: 4.5,

    health: 100,
    maxHealth: 100,

    baseAttackCooldown: 250,
    attackCooldown: 0,

    invincible: 0,

    damage: 1,

    bulletCount: 1,

    bulletSpeed: 12,

    skillTimers: {

        speed: 0,
        rapidFire: 0,
        damage: 0,
        ultraGun: 0,
        doubleShot: 0,
        tripleShot: 0

    },

    elemental: null

};


/* =========================================================
   SKILL DEFINITIONS
========================================================= */

const SKILLS = [

    {
        id: "bomb",
        name: "BOM",
        icon: "💣",
        chance: 8,
        color: "#ff5500",
        description: "Nổ diện rộng"
    },

    {
        id: "missile",
        name: "TÊN LỬA",
        icon: "🚀",
        chance: 8,
        color: "#ff3333",
        description: "Tên lửa tự tìm địch"
    },

    {
        id: "clear",
        name: "QUÉT SẠCH",
        icon: "☢️",
        chance: 4,
        color: "#ff00ff",
        description: "Tiêu diệt toàn bộ địch"
    },

    {
        id: "speed",
        name: "TĂNG TỐC",
        icon: "⚡",
        chance: 12,
        color: "#00ffff",
        description: "Tăng tốc di chuyển"
    },

    {
        id: "rapid",
        name: "RAPID FIRE",
        icon: "🔥",
        chance: 18,
        color: "#ffff00",
        description: "Tăng tốc độ bắn"
    },

    {
        id: "double",
        name: "2 ĐƯỜNG ĐẠN",
        icon: "🔫",
        chance: 10,
        color: "#00ff88",
        description: "Bắn 2 viên"
    },

    {
        id: "triple",
        name: "3 ĐƯỜNG ĐẠN",
        icon: "🔫",
        chance: 7,
        color: "#00ff88",
        description: "Bắn 3 viên"
    },

    {
        id: "thunder",
        name: "SẤM SÉT",
        icon: "⚡",
        chance: 8,
        color: "#9d7cff",
        description: "Sét gây damage lớn"
    },

    {
        id: "fire",
        name: "LỬA",
        icon: "🔥",
        chance: 7,
        color: "#ff4400",
        description: "Đạn lửa"
    },

    {
        id: "ice",
        name: "BĂNG",
        icon: "❄️",
        chance: 6,
        color: "#66ddff",
        description: "Làm chậm địch"
    },

    {
        id: "ultra",
        name: "ULTRA GUN",
        icon: "👑",
        chance: 5,
        color: "#ff00ff",
        description: "Siêu tốc độ bắn"
    },

    {
        id: "damage",
        name: "SUPER DAMAGE",
        icon: "💥",
        chance: 7,
        color: "#ff0055",
        description: "Tăng damage"
    }

];


/* =========================================================
   SKILL UI
========================================================= */

function createSkillUI() {

    if (document.getElementById("skillPanel")) {
        return;
    }

    const panel =
        document.createElement("div");

    panel.id = "skillPanel";

    panel.innerHTML = `
        <div class="skill-title">
            ACTIVE SKILLS
        </div>

        <div id="activeSkills"></div>
    `;

    document.querySelector(".game-box")
        .appendChild(panel);


    const style =
        document.createElement("style");

    style.textContent = `

        #skillPanel {

            position: absolute;

            top: 55px;
            left: 20px;

            z-index: 15;

            min-width: 190px;

            pointer-events: none;

        }

        .skill-title {

            color: #00ffff;

            font-size: 9px;

            letter-spacing: 2px;

            margin-bottom: 5px;

            text-shadow:
                0 0 8px #00ffff;

        }

        #activeSkills {

            display: flex;

            gap: 5px;

            flex-wrap: wrap;

        }

        .active-skill {

            min-width: 48px;

            padding: 5px;

            text-align: center;

            border: 1px solid;

            background:
                rgba(2, 5, 20, 0.85);

            box-shadow:
                0 0 10px currentColor;

        }

        .active-skill-icon {

            display: block;

            font-size: 18px;

        }

        .active-skill-name {

            display: block;

            font-size: 6px;

            margin-top: 2px;

        }

        .skill-drop {

            position: absolute;

            width: 58px;

            height: 58px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 50%;

            background:
                rgba(2, 5, 20, 0.9);

            border: 2px solid;

            box-shadow:
                0 0 20px currentColor;

            font-size: 27px;

            z-index: 12;

            animation:
                skillPulse 0.8s infinite alternate;

        }

        @keyframes skillPulse {

            from {
                transform: scale(0.9);
            }

            to {
                transform: scale(1.1);
            }

        }

        .skill-pickup-text {

            position: absolute;

            z-index: 30;

            pointer-events: none;

            font-weight: bold;

            font-size: 13px;

            letter-spacing: 1px;

            text-shadow:
                0 0 8px currentColor;

            animation:
                pickupFloat 1s forwards;

        }

        @keyframes pickupFloat {

            from {
                opacity: 1;
                transform:
                    translateY(0);
            }

            to {
                opacity: 0;
                transform:
                    translateY(-50px);
            }

        }

    `;

    document.head.appendChild(style);

}


createSkillUI();


/* =========================================================
   SKILL DROP - RANDOM WEIGHT
========================================================= */

function getRandomSkill() {

    const random =
        Math.random() * 100;

    let current = 0;

    for (const skill of SKILLS) {

        current += skill.chance;

        if (random <= current) {

            return skill;

        }

    }

    return SKILLS[0];

}


/* =========================================================
   DROP SKILL
========================================================= */

function dropSkill(x, y) {

    const skill =
        getRandomSkill();


    const element =
        document.createElement("div");

    element.className =
        "skill-drop";

    element.textContent =
        skill.icon;

    element.style.left =
        (x - 29) + "px";

    element.style.top =
        (y - 29) + "px";

    element.style.color =
        skill.color;

    element.style.borderColor =
        skill.color;

    element.title =
        skill.name +
        " - " +
        skill.description;


    document.querySelector(".game-box")
        .appendChild(element);


    skills.push({

        type: skill,

        x: x,

        y: y,

        element: element,

        life: 9000

    });

}


/* =========================================================
   PICKUP SKILL
========================================================= */

function checkSkillPickup() {

    skills.forEach(
        (skill, index) => {

            const distance =
                Math.hypot(
                    player.x - skill.x,
                    player.y - skill.y
                );


            if (distance < 45) {

                activateSkill(
                    skill.type
                );


                showPickupText(
                    skill
                );


                skill.element.remove();

                skills.splice(
                    index,
                    1
                );

            }

        }
    );

}


/* =========================================================
   SHOW PICKUP TEXT
========================================================= */

function showPickupText(skill) {

    const text =
        document.createElement("div");

    text.className =
        "skill-pickup-text";

    text.textContent =
        skill.icon +
        " " +
        skill.name;

    text.style.left =
        player.x + "px";

    text.style.top =
        player.y + "px";

    text.style.color =
        skill.color;

    document.querySelector(".game-box")
        .appendChild(text);


    setTimeout(() => {

        text.remove();

    }, 1000);

}


/* =========================================================
   ACTIVATE SKILL
========================================================= */

function activateSkill(skill) {

    switch (skill.id) {


        /* --------------------------------
           BOMB
        -------------------------------- */

        case "bomb":

            enemies.forEach(
                enemy => {

                    enemy.health -= 5;

                    createExplosion(
                        enemy.x,
                        enemy.y,
                        "#ff5500",
                        15
                    );

                }
            );

            break;


        /* --------------------------------
           MISSILE
        -------------------------------- */

        case "missile":

            launchMissile();

            break;


        /* --------------------------------
           CLEAR
        -------------------------------- */

        case "clear":

            enemies.forEach(
                enemy => {

                    createExplosion(
                        enemy.x,
                        enemy.y,
                        "#ff00ff",
                        20
                    );

                }
            );

            score +=
                enemies.length * 150;

            enemies = [];

            break;


        /* --------------------------------
           SPEED
        -------------------------------- */

        case "speed":

            player.speed =
                player.baseSpeed * 1.8;

            player.skillTimers.speed =
                8000;

            break;


        /* --------------------------------
           RAPID FIRE
        -------------------------------- */

        case "rapid":

            player.skillTimers.rapidFire =
                10000;

            break;


        /* --------------------------------
           DOUBLE
        -------------------------------- */

        case "double":

            player.bulletCount = 2;

            player.skillTimers.doubleShot =
                12000;

            break;


        /* --------------------------------
           TRIPLE
        -------------------------------- */

        case "triple":

            player.bulletCount = 3;

            player.skillTimers.tripleShot =
                12000;

            break;


        /* --------------------------------
           THUNDER
        -------------------------------- */

        case "thunder":

            player.elemental =
                "thunder";

            player.skillTimers.damage =
                12000;

            break;


        /* --------------------------------
           FIRE
        -------------------------------- */

        case "fire":

            player.elemental =
                "fire";

            player.skillTimers.damage =
                12000;

            break;


        /* --------------------------------
           ICE
        -------------------------------- */

        case "ice":

            player.elemental =
                "ice";

            player.skillTimers.damage =
                12000;

            break;


        /* --------------------------------
           ULTRA
        -------------------------------- */

        case "ultra":

            player.skillTimers.ultraGun =
                12000;

            player.damage = 3;

            break;


        /* --------------------------------
           SUPER DAMAGE
        -------------------------------- */

        case "damage":

            player.damage = 4;

            player.skillTimers.damage =
                12000;

            break;

    }


    updateSkillUI();

}


/* =========================================================
   ACTIVE SKILL UI
========================================================= */

function updateSkillUI() {

    const container =
        document.getElementById(
            "activeSkills"
        );

    if (!container)
        return;


    container.innerHTML = "";


    const active = [];


    if (
        player.skillTimers.speed > 0
    ) {

        active.push({
            icon: "⚡",
            name: "SPEED"
        });

    }


    if (
        player.skillTimers.rapidFire > 0
    ) {

        active.push({
            icon: "🔥",
            name: "RAPID"
        });

    }


    if (
        player.bulletCount === 2
    ) {

        active.push({
            icon: "🔫",
            name: "DOUBLE"
        });

    }


    if (
        player.bulletCount === 3
    ) {

        active.push({
            icon: "🔫",
            name: "TRIPLE"
        });

    }


    if (
        player.elemental
    ) {

        active.push({

            icon:
                player.elemental ===
                "fire"
                    ? "🔥"
                    : player.elemental ===
                      "ice"
                        ? "❄️"
                        : "⚡",

            name:
                player.elemental
                    .toUpperCase()

        });

    }


    if (
        player.skillTimers.ultraGun > 0
    ) {

        active.push({
            icon: "👑",
            name: "ULTRA"
        });

    }


    if (
        player.damage > 1
    ) {

        active.push({
            icon: "💥",
            name: "DAMAGE"
        });

    }


    active.forEach(
        skill => {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "active-skill";

            element.innerHTML = `
                <span class="active-skill-icon">
                    ${skill.icon}
                </span>

                <span class="active-skill-name">
                    ${skill.name}
                </span>
            `;

            container.appendChild(
                element
            );

        }
    );

}


/* =========================================================
   START GAME
========================================================= */

function startGame(level) {

    difficulty =
        difficulties[level];


    gameRunning = true;

    score = 0;

    wave = 1;

    combo = 1;

    enemies = [];

    bullets = [];

    particles = [];

    skills = [];

    lightning = [];

    spawnTimer = 0;


    player.health =
        player.maxHealth;

    player.speed =
        player.baseSpeed;

    player.damage = 1;

    player.bulletCount = 1;

    player.elemental = null;


    Object.keys(
        player.skillTimers
    ).forEach(key => {

        player.skillTimers[key] = 0;

    });


    player.x =
        canvas.width / 2;

    player.y =
        canvas.height / 2;


    menu.classList.add(
        "hidden"
    );

    gameOver.classList.add(
        "hidden"
    );


    updateUI();

    updateSkillUI();


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   DIFFICULTY BUTTONS
========================================================= */

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


/* =========================================================
   RESTART
========================================================= */

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


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        keys[
            event.key.toLowerCase()
        ] = true;


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

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


/* =========================================================
   MOBILE CONTROLS
========================================================= */

document
    .querySelectorAll(".move-button")
    .forEach(button => {

        const key =
            button.dataset.key
                .toLowerCase();


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


attackButton.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        attack();

    }
);


/* =========================================================
   MOVE PLAYER
========================================================= */

function movePlayer() {

    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy--;

    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy++;

    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx--;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx++;

    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.hypot(dx, dy);


        dx /= length;

        dy /= length;

    }


    player.x +=
        dx * player.speed;

    player.y +=
        dy * player.speed;


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


/* =========================================================
   ATTACK
========================================================= */

function attack() {

    if (!gameRunning)
        return;


    if (
        player.attackCooldown > 0
    ) {

        return;

    }


    let cooldown =
        player.baseAttackCooldown;


    if (
        player.skillTimers.rapidFire > 0
    ) {

        cooldown *= 0.45;

    }


    if (
        player.skillTimers.ultraGun > 0
    ) {

        cooldown *= 0.2;

    }


    player.attackCooldown =
        cooldown;


    let nearest = null;

    let nearestDistance =
        Infinity;


    enemies.forEach(
        enemy => {

            const distance =
                Math.hypot(
                    enemy.x -
                    player.x,

                    enemy.y -
                    player.y
                );


            if (
                distance <
                nearestDistance
            ) {

                nearest =
                    enemy;

                nearestDistance =
                    distance;

            }

        }
    );


    if (
        !nearest
    ) {

        createExplosion(
            player.x,
            player.y,
            "#00ffff",
            8
        );

        return;

    }


    let count =
        player.bulletCount;


    if (
        player.skillTimers.tripleShot >
        0
    ) {

        count = 3;

    }

    else if (
        player.skillTimers.doubleShot >
        0
    ) {

        count = 2;

    }


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const spread =
            count === 1
                ? 0
                : (
                    i -
                    (count - 1) / 2
                ) * 0.18;


        const angle =
            Math.atan2(
                nearest.y -
                player.y,

                nearest.x -
                player.x
            ) + spread;


        bullets.push({

            x: player.x,

            y: player.y,

            vx:
                Math.cos(angle) *
                player.bulletSpeed,

            vy:
                Math.sin(angle) *
                player.bulletSpeed,

            damage:
                player.damage,

            elemental:
                player.elemental,

            life: 1000

        });

    }

}


/* =========================================================
   SPAWN ENEMY
========================================================= */

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
            difficulty.damage,

        slow: 1

    });

}


/* =========================================================
   UPDATE ENEMIES
========================================================= */

function updateEnemies(delta) {

    enemies.forEach(
        enemy => {

            const dx =
                player.x -
                enemy.x;

            const dy =
                player.y -
                enemy.y;


            const distance =
                Math.hypot(
                    dx,
                    dy
                );


            let speed =
                enemy.speed;


            if (
                enemy.slow < 1
            ) {

                speed *=
                    enemy.slow;

            }


            if (
                distance > 0
            ) {

                enemy.x +=
                    (dx / distance) *
                    speed *
                    delta;

                enemy.y +=
                    (dy / distance) *
                    speed *
                    delta;

            }


            if (
                distance <
                enemy.size +
                player.size / 2
            ) {

                damagePlayer(
                    enemy.damage
                );

            }

        }
    );

}


/* =========================================================
   DAMAGE PLAYER
========================================================= */

function damagePlayer(amount) {

    if (
        player.invincible > 0
    ) {

        return;

    }


    player.health -= amount;

    player.invincible = 800;


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


/* =========================================================
   UPDATE BULLETS
========================================================= */

function updateBullets(delta) {

    bullets.forEach(
        (bullet, index) => {

            bullet.x +=
                bullet.vx *
                delta;

            bullet.y +=
                bullet.vy *
                delta;


            bullet.life -=
                16.67 * delta;


            if (
                bullet.life <= 0 ||
                bullet.x < -50 ||
                bullet.x >
                    canvas.width + 50 ||
                bullet.y < -50 ||
                bullet.y >
                    canvas.height + 50
            ) {

                bullets.splice(
                    index,
                    1
                );

                return;

            }


            enemies.forEach(
                enemy => {

                    const distance =
                        Math.hypot(
                            bullet.x -
                            enemy.x,

                            bullet.y -
                            enemy.y
                        );


                    if (
                        distance <
                        enemy.size + 6
                    ) {

                        hitEnemy(
                            enemy,
                            bullet
                        );


                        bullet.life = 0;

                    }

                }
            );

        }
    );


    bullets =
        bullets.filter(
            bullet =>
                bullet.life > 0
        );

}


/* =========================================================
   HIT ENEMY
========================================================= */

function hitEnemy(
    enemy,
    bullet
) {

    let damage =
        bullet.damage;


    /* ELEMENTAL DAMAGE */

    if (
        bullet.elemental ===
        "thunder"
    ) {

        damage *= 2.5;

        createLightning(
            enemy.x,
            enemy.y
        );

    }


    if (
        bullet.elemental ===
        "fire"
    ) {

        damage *= 1.8;

        createExplosion(
            enemy.x,
            enemy.y,
            "#ff4400",
            10
        );

    }


    if (
        bullet.elemental ===
        "ice"
    ) {

        damage *= 1.2;

        enemy.slow = 0.45;

    }


    enemy.health -= damage;


    createExplosion(
        enemy.x,
        enemy.y,

        bullet.elemental ===
            "ice"
            ? "#66ddff"

            : bullet.elemental ===
              "fire"
                ? "#ff4400"

                : bullet.elemental ===
                  "thunder"
                    ? "#9d7cff"

                    : "#00ffff",

        8
    );


    if (
        enemy.health <= 0
    ) {

        killEnemy(
            enemy
        );

    }

}


/* =========================================================
   KILL ENEMY
========================================================= */

function killEnemy(enemy) {

    const index =
        enemies.indexOf(enemy);


    if (
        index !== -1
    ) {

        enemies.splice(
            index,
            1
        );

    }


    const now =
        Date.now();


    if (
        now - lastKillTime <
        2500
    ) {

        combo++;

    }

    else {

        combo = 1;

    }


    lastKillTime = now;


    score +=
        100 * combo;


    createExplosion(
        enemy.x,
        enemy.y,
        "#ff00ff",
        22
    );


    /* ==========================
       SKILL DROP
    ========================== */

    dropSkill(
        enemy.x,
        enemy.y
    );


    if (
        score >=
        wave * 1000
    ) {

        wave++;


        createExplosion(
            player.x,
            player.y,
            "#00ffff",
            35
        );

    }


    updateUI();

}


/* =========================================================
   MISSILE
========================================================= */

function launchMissile() {

    if (
        enemies.length === 0
    ) {

        return;

    }


    const targets =
        [...enemies]
            .sort(
                (a, b) =>
                    Math.hypot(
                        a.x -
                        player.x,

                        a.y -
                        player.y
                    )

                    -

                    Math.hypot(
                        b.x -
                        player.x,

                        b.y -
                        player.y
                    )
            )
            .slice(0, 3);


    targets.forEach(
        target => {

            missiles.push({

                x: player.x,

                y: player.y,

                target,

                speed: 6,

                damage: 10

            });

        }
    );

}


/* =========================================================
   MISSILES
========================================================= */

let missiles = [];


function updateMissiles(delta) {

    missiles.forEach(
        (missile, index) => {

            if (
                !enemies.includes(
                    missile.target
                )
            ) {

                missiles.splice(
                    index,
                    1
                );

                return;

            }


            const target =
                missile.target;


            const dx =
                target.x -
                missile.x;

            const dy =
                target.y -
                missile.y;


            const distance =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                distance < 15
            ) {

                target.health -=
                    missile.damage;


                createExplosion(
                    target.x,
                    target.y,
                    "#ff5500",
                    25
                );


                if (
                    target.health <= 0
                ) {

                    killEnemy(
                        target
                    );

                }


                missiles.splice(
                    index,
                    1
                );

                return;

            }


            missile.x +=
                (dx / distance) *
                missile.speed *
                delta;

            missile.y +=
                (dy / distance) *
                missile.speed *
                delta;

        }
    );

}


/* =========================================================
   PARTICLES
========================================================= */

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


/* =========================================================
   LIGHTNING
========================================================= */

function createLightning(
    x,
    y
) {

    lightning.push({

        x,

        y,

        life: 15

    });

}


function updateLightning() {

    lightning.forEach(
        bolt => {

            bolt.life--;

        }
    );


    lightning =
        lightning.filter(
            bolt =>
                bolt.life > 0
        );

}


/* =========================================================
   UPDATE PARTICLES
========================================================= */

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


/* =========================================================
   SKILL TIMER
========================================================= */

function updateSkills(delta) {

    Object.keys(
        player.skillTimers
    ).forEach(
        key => {

            if (
                player.skillTimers[key] >
                0
            ) {

                player.skillTimers[key] -=
                    16.67 * delta;

            }

        }
    );


    if (
        player.skillTimers.speed <=
        0
    ) {

        player.speed =
            player.baseSpeed;

    }


    if (
        player.skillTimers.damage <=
        0
    ) {

        player.damage = 1;

        player.elemental = null;

    }


    if (
        player.skillTimers.doubleShot <=
        0 &&
        player.skillTimers.tripleShot <=
        0
    ) {

        player.bulletCount = 1;

    }


    updateSkillUI();


    /* Remove old drops */

    skills.forEach(
        (skill, index) => {

            skill.life -=
                16.67 * delta;


            if (
                skill.life <= 0
            ) {

                skill.element.remove();

                skills.splice(
                    index,
                    1
                );

            }

        }
    );

}


/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawBackground() {

    ctx.fillStyle =
        "#030612";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* GRID */

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


    /* CENTER GLOW */

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


/* =========================================================
   DRAW PLAYER
========================================================= */

function drawPlayer() {

    ctx.save();


    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "#00ffff";


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


/* =========================================================
   DRAW ENEMIES
========================================================= */

function drawEnemies() {

    enemies.forEach(
        enemy => {

            ctx.save();


            ctx.shadowBlur = 20;

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


            /* HEALTH BAR */

            const width = 35;

            const hp =
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
                width * hp,
                4
            );


            ctx.restore();

        }
    );

}


/* =========================================================
   DRAW BULLETS
========================================================= */

function drawBullets() {

    bullets.forEach(
        bullet => {

            ctx.save();


            let color =
                "#00ffff";


            if (
                bullet.elemental ===
                "fire"
            ) {

                color =
                    "#ff4400";

            }

            else if (
                bullet.elemental ===
                "ice"
            ) {

                color =
                    "#66ddff";

            }

            else if (
                bullet.elemental ===
                "thunder"
            ) {

                color =
                    "#9d7cff";

            }


            ctx.shadowBlur = 20;

            ctx.shadowColor =
                color;

            ctx.fillStyle =
                color;


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


/* =========================================================
   DRAW MISSILES
========================================================= */

function drawMissiles() {

    missiles.forEach(
        missile => {

            ctx.save();


            ctx.shadowBlur = 20;

            ctx.shadowColor =
                "#ff5500";


            ctx.fillStyle =
                "#ff5500";


            ctx.beginPath();

            ctx.arc(
                missile.x,
                missile.y,
                7,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#ffff00";


            ctx.fillRect(
                missile.x - 3,
                missile.y + 5,
                6,
                12
            );


            ctx.restore();

        }
    );

}


/* =========================================================
   DRAW LIGHTNING
========================================================= */

function drawLightning() {

    lightning.forEach(
        bolt => {

            ctx.save();


            ctx.strokeStyle =
                "#9d7cff";

            ctx.lineWidth = 4;

            ctx.shadowBlur = 25;

            ctx.shadowColor =
                "#9d7cff";


            ctx.beginPath();

            ctx.moveTo(
                bolt.x,
                bolt.y - 60
            );

            ctx.lineTo(
                bolt.x - 12,
                bolt.y - 20
            );

            ctx.lineTo(
                bolt.x + 10,
                bolt.y - 5
            );

            ctx.lineTo(
                bolt.x - 5,
                bolt.y + 20
            );

            ctx.lineTo(
                bolt.x,
                bolt.y + 60
            );

            ctx.stroke();


            ctx.restore();

        }
    );

}


/* =========================================================
   DRAW PARTICLES
========================================================= */

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


/* =========================================================
   UPDATE UI
========================================================= */

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


/* =========================================================
   GAME OVER
========================================================= */

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


/* =========================================================
   MAIN GAME LOOP
========================================================= */

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


    /* COOLDOWNS */

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


    /* MOVEMENT */

    movePlayer();


    /* SPAWN */

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


    /* UPDATE */

    updateEnemies(delta);

    updateBullets(delta);

    updateMissiles(delta);

    updateParticles(delta);

    updateLightning();

    updateSkills(delta);

    checkSkillPickup();


    /* DRAW */

    drawBackground();

    drawParticles();

    drawLightning();

    drawBullets();

    drawMissiles();

    drawEnemies();

    drawPlayer();


    /* LOOP */

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

updateUI();

updateSkillUI();
