/* =========================================================
   CYBER ARENA
   ROUND + WAVE + BOSS SYSTEM
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
        enemyHP: 2,
        enemySpeed: 0.65,
        enemyDamage: 6,
        enemyCount: 5
    },

    normal: {
        name: "BÌNH THƯỜNG",
        enemyHP: 3,
        enemySpeed: 0.95,
        enemyDamage: 10,
        enemyCount: 7
    },

    hard: {
        name: "KHÓ",
        enemyHP: 5,
        enemySpeed: 1.3,
        enemyDamage: 15,
        enemyCount: 10
    }

};

let difficulty = difficulties.normal;


/* =========================================================
   GAME STATE
========================================================= */

let gameRunning = false;

let score = 0;
let combo = 1;

let round = 1;
let wave = 1;

let maxRounds = 10;

let phase = "battle";

/*
phase:

battle
boss-warning
boss
reward
round-clear
game-complete
*/

let enemies = [];
let bullets = [];
let particles = [];
let missiles = [];
let lightning = [];
let skills = [];
let enemyBullets = [];

let boss = null;

let spawnTimer = 0;
let waveEnemyTarget = 0;

let lastTime = 0;
let lastKillTime = 0;

let keys = {};


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

    damage: 1,

    bulletCount: 1,

    bulletSpeed: 12,

    attackCooldown: 0,

    baseAttackCooldown: 250,

    invincible: 0,

    elemental: null,

    skillTimers: {

        speed: 0,
        rapidFire: 0,
        damage: 0,
        ultra: 0,
        double: 0,
        triple: 0

    }

};


/* =========================================================
   SKILLS
========================================================= */

const SKILLS = [

    {
        id: "bomb",
        name: "BOM",
        icon: "💣",
        chance: 8,
        color: "#ff5500"
    },

    {
        id: "missile",
        name: "TÊN LỬA",
        icon: "🚀",
        chance: 8,
        color: "#ff3333"
    },

    {
        id: "clear",
        name: "QUÉT SẠCH",
        icon: "☢️",
        chance: 4,
        color: "#ff00ff"
    },

    {
        id: "speed",
        name: "TĂNG TỐC",
        icon: "⚡",
        chance: 12,
        color: "#00ffff"
    },

    {
        id: "rapid",
        name: "RAPID FIRE",
        icon: "🔥",
        chance: 18,
        color: "#ffff00"
    },

    {
        id: "double",
        name: "DOUBLE SHOT",
        icon: "🔫",
        chance: 10,
        color: "#00ff88"
    },

    {
        id: "triple",
        name: "TRIPLE SHOT",
        icon: "🔫",
        chance: 7,
        color: "#00ff88"
    },

    {
        id: "thunder",
        name: "SẤM SÉT",
        icon: "⚡",
        chance: 8,
        color: "#9d7cff"
    },

    {
        id: "fire",
        name: "LỬA",
        icon: "🔥",
        chance: 7,
        color: "#ff4400"
    },

    {
        id: "ice",
        name: "BĂNG",
        icon: "❄️",
        chance: 6,
        color: "#66ddff"
    },

    {
        id: "ultra",
        name: "ULTRA GUN",
        icon: "👑",
        chance: 5,
        color: "#ff00ff"
    },

    {
        id: "damage",
        name: "SUPER DAMAGE",
        icon: "💥",
        chance: 7,
        color: "#ff0055"
    }

];


/* =========================================================
   BOSS DATA
========================================================= */

const BOSS_NAMES = [

    "CYBER REAPER",
    "VOID HUNTER",
    "NEON DESTROYER",
    "DARK TITAN",
    "MECHA X",
    "CYBER DRAGON",
    "OMEGA CORE",
    "VOID EMPEROR",
    "NIGHTMARE",
    "FINAL OVERLORD"

];


/* =========================================================
   CREATE SKILL PANEL
========================================================= */

function createSkillPanel() {

    if (
        document.getElementById(
            "skillPanel"
        )
    ) {
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

    document.querySelector(
        ".game-box"
    ).appendChild(panel);


    const style =
        document.createElement("style");

    style.textContent = `

        #skillPanel {
            position:absolute;
            top:55px;
            left:20px;
            z-index:20;
            pointer-events:none;
        }

        .skill-title {
            color:#00ffff;
            font-size:9px;
            letter-spacing:2px;
            text-shadow:0 0 10px #00ffff;
        }

        #activeSkills {
            display:flex;
            gap:5px;
            margin-top:5px;
        }

        .active-skill {
            padding:5px 7px;
            border:1px solid #00ffff;
            background:rgba(0,0,20,.8);
            box-shadow:0 0 12px #00ffff;
            text-align:center;
        }

        .active-skill-icon {
            display:block;
            font-size:18px;
        }

        .active-skill-name {
            font-size:6px;
            color:white;
        }

        .skill-drop {
            position:absolute;
            width:58px;
            height:58px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            background:rgba(0,5,20,.95);
            border:2px solid;
            box-shadow:0 0 25px currentColor;
            font-size:28px;
            z-index:25;
            animation:skillPulse .7s infinite alternate;
        }

        @keyframes skillPulse {
            from {
                transform:scale(.85);
            }

            to {
                transform:scale(1.12);
            }
        }

        .boss-warning {
            position:absolute;
            left:50%;
            top:35%;
            transform:translate(-50%,-50%);
            z-index:50;
            color:#ff0055;
            font-size:35px;
            font-weight:bold;
            letter-spacing:8px;
            text-shadow:
                0 0 10px #ff0055,
                0 0 30px #ff0055;
            animation:warning .6s infinite alternate;
            pointer-events:none;
        }

        @keyframes warning {
            from {
                opacity:.5;
            }

            to {
                opacity:1;
            }
        }

        .boss-bar {
            position:absolute;
            top:20px;
            left:50%;
            transform:translateX(-50%);
            width:55%;
            z-index:40;
            pointer-events:none;
        }

        .boss-name {
            text-align:center;
            color:#ff0055;
            font-weight:bold;
            letter-spacing:3px;
            margin-bottom:5px;
            text-shadow:0 0 10px #ff0055;
        }

        .boss-health-bg {
            width:100%;
            height:12px;
            border:1px solid #ff0055;
            background:rgba(255,0,80,.15);
        }

        .boss-health {
            height:100%;
            width:100%;
            background:#ff0055;
            box-shadow:0 0 15px #ff0055;
        }

        .round-message {
            position:absolute;
            top:45%;
            left:50%;
            transform:translate(-50%,-50%);
            z-index:45;
            color:#00ffff;
            text-align:center;
            font-size:28px;
            font-weight:bold;
            letter-spacing:5px;
            text-shadow:0 0 20px #00ffff;
            pointer-events:none;
        }

    `;

    document.head.appendChild(style);

}

createSkillPanel();


/* =========================================================
   SKILL RANDOM
========================================================= */

function getRandomSkill() {

    let total = 0;

    SKILLS.forEach(
        skill => {
            total += skill.chance;
        }
    );

    let random =
        Math.random() * total;


    for (
        const skill of SKILLS
    ) {

        random -=
            skill.chance;

        if (
            random <= 0
        ) {

            return skill;

        }

    }

    return SKILLS[0];

}


/* =========================================================
   DROP SKILL
========================================================= */

function dropSkill(
    x,
    y,
    guaranteed = false
) {

    /*
       NORMAL ENEMY:
       chỉ 3% drop

       ELITE:
       khoảng 8%

       BOSS:
       guaranteed
    */

    if (
        !guaranteed &&
        Math.random() > 0.03
    ) {

        return;

    }


    const skill =
        getRandomSkill();


    const element =
        document.createElement(
            "div"
        );

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


    document.querySelector(
        ".game-box"
    ).appendChild(element);


    skills.push({

        x,

        y,

        type: skill,

        element,

        life: 12000

    });

}


/* =========================================================
   PICKUP
========================================================= */

function checkSkillPickup() {

    skills.forEach(
        (skill, index) => {

            const distance =
                Math.hypot(
                    player.x -
                    skill.x,

                    player.y -
                    skill.y
                );


            if (
                distance < 45
            ) {

                activateSkill(
                    skill.type
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
   ACTIVATE SKILL
========================================================= */

function activateSkill(skill) {

    switch (
        skill.id
    ) {

        case "bomb":

            enemies.forEach(
                enemy => {

                    enemy.health -= 8;

                    createExplosion(
                        enemy.x,
                        enemy.y,
                        "#ff5500",
                        20
                    );

                }
            );

            break;


        case "missile":

            launchMissiles();

            break;


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
                enemies.length * 100;

            enemies = [];

            break;


        case "speed":

            player.speed =
                player.baseSpeed * 1.8;

            player.skillTimers.speed =
                10000;

            break;


        case "rapid":

            player.skillTimers.rapidFire =
                12000;

            break;


        case "double":

            player.bulletCount = 2;

            player.skillTimers.double =
                15000;

            break;


        case "triple":

            player.bulletCount = 3;

            player.skillTimers.triple =
                15000;

            break;


        case "thunder":

            player.elemental =
                "thunder";

            player.skillTimers.damage =
                15000;

            break;


        case "fire":

            player.elemental =
                "fire";

            player.skillTimers.damage =
                15000;

            break;


        case "ice":

            player.elemental =
                "ice";

            player.skillTimers.damage =
                15000;

            break;


        case "ultra":

            player.skillTimers.ultra =
                12000;

            player.damage = 3;

            break;


        case "damage":

            player.damage = 4;

            player.skillTimers.damage =
                15000;

            break;

    }

    updateSkillUI();

}


/* =========================================================
   ACTIVE SKILLS UI
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

        active.push(
            ["⚡", "SPEED"]
        );

    }


    if (
        player.skillTimers.rapidFire > 0
    ) {

        active.push(
            ["🔥", "RAPID"]
        );

    }


    if (
        player.bulletCount === 2
    ) {

        active.push(
            ["🔫", "DOUBLE"]
        );

    }


    if (
        player.bulletCount === 3
    ) {

        active.push(
            ["🔫", "TRIPLE"]
        );

    }


    if (
        player.elemental
    ) {

        const icon =
            player.elemental === "fire"
                ? "🔥"
                : player.elemental === "ice"
                    ? "❄️"
                    : "⚡";

        active.push(
            [
                icon,
                player.elemental.toUpperCase()
            ]
        );

    }


    if (
        player.skillTimers.ultra > 0
    ) {

        active.push(
            ["👑", "ULTRA"]
        );

    }


    if (
        player.damage > 1
    ) {

        active.push(
            ["💥", "DAMAGE"]
        );

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
                    ${skill[0]}
                </span>

                <span class="active-skill-name">
                    ${skill[1]}
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

    combo = 1;

    round = 1;

    wave = 1;

    phase = "battle";


    enemies = [];
    bullets = [];
    particles = [];
    missiles = [];
    lightning = [];
    skills = [];
    enemyBullets = [];


    boss = null;


    player.health =
        player.maxHealth;

    player.x =
        canvas.width / 2;

    player.y =
        canvas.height / 2;

    player.speed =
        player.baseSpeed;

    player.damage = 1;

    player.bulletCount = 1;

    player.elemental = null;


    Object.keys(
        player.skillTimers
    ).forEach(
        key => {

            player.skillTimers[key] = 0;

        }
    );


    menu.classList.add(
        "hidden"
    );

    gameOver.classList.add(
        "hidden"
    );


    updateUI();
    updateSkillUI();


    showRoundMessage(
        `ROUND ${round}`,
        1200
    );


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   ROUND MESSAGE
========================================================= */

function showRoundMessage(
    text,
    duration
) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "round-message";

    element.textContent =
        text;


    document.querySelector(
        ".game-box"
    ).appendChild(element);


    setTimeout(
        () => {

            element.remove();

        },
        duration
    );

}


/* =========================================================
   BOSS WARNING
========================================================= */

function startBossWarning() {

    phase =
        "boss-warning";


    const warning =
        document.createElement(
            "div"
        );

    warning.className =
        "boss-warning";

    warning.textContent =
        "⚠ BOSS INCOMING ⚠";


    document.querySelector(
        ".game-box"
    ).appendChild(warning);


    setTimeout(
        () => {

            warning.remove();

            spawnBoss();

        },
        2000
    );

}


/* =========================================================
   SPAWN BOSS
========================================================= */

function spawnBoss() {

    phase =
        "boss";


    const bossIndex =
        Math.min(
            round - 1,
            BOSS_NAMES.length - 1
        );


    const hp =
        500 +
        round * 300;


    boss = {

        x:
            canvas.width / 2,

        y:
            -100,

        size:
            55 +
            round * 2,

        health:
            hp,

        maxHealth:
            hp,

        speed:
            0.6 +
            round * 0.05,

        phase: 1,

        attackTimer: 0,

        spawnTimer: 0,

        name:
            BOSS_NAMES[bossIndex]

    };


    createBossBar();


    showRoundMessage(
        boss.name,
        1800
    );

}


/* =========================================================
   BOSS HEALTH BAR
========================================================= */

function createBossBar() {

    const old =
        document.getElementById(
            "bossBar"
        );

    if (old)
        old.remove();


    const bar =
        document.createElement(
            "div"
        );

    bar.id =
        "bossBar";

    bar.className =
        "boss-bar";

    bar.innerHTML = `

        <div class="boss-name">
            ${boss.name}
        </div>

        <div class="boss-health-bg">
            <div
                id="bossHealth"
                class="boss-health"
            ></div>
        </div>

    `;


    document.querySelector(
        ".game-box"
    ).appendChild(bar);

}


/* =========================================================
   UPDATE BOSS
========================================================= */

function updateBoss(delta) {

    if (!boss)
        return;


    /* Move towards player */

    const dx =
        player.x -
        boss.x;

    const dy =
        player.y -
        boss.y;


    const distance =
        Math.hypot(
            dx,
            dy
        );


    if (
        distance > 180
    ) {

        boss.x +=
            (dx / distance) *
            boss.speed *
            delta;

        boss.y +=
            (dy / distance) *
            boss.speed *
            delta;

    }


    /* ==========================
       PHASE 2
    ========================== */

    if (
        boss.health <=
        boss.maxHealth * 0.5 &&
        boss.phase === 1
    ) {

        boss.phase = 2;

        boss.speed *= 1.7;

        showRoundMessage(
            "⚠ BOSS ENRAGED ⚠",
            1200
        );

        createExplosion(
            boss.x,
            boss.y,
            "#ff0055",
            50
        );

    }


    /* ==========================
       BOSS ATTACK
    ========================== */

    boss.attackTimer -=
        16.67 * delta;


    if (
        boss.attackTimer <= 0
    ) {

        bossAttack();

        boss.attackTimer =
            boss.phase === 1
                ? 1100
                : 600;

    }


    /* ==========================
       SPAWN MINIONS
    ========================== */

    boss.spawnTimer -=
        16.67 * delta;


    if (
        boss.spawnTimer <= 0
    ) {

        spawnEnemy();

        spawnEnemy();


        boss.spawnTimer =
            boss.phase === 1
                ? 3500
                : 1800;

    }


    /* ==========================
       CONTACT
    ========================== */

    if (
        distance <
        boss.size +
        player.size
    ) {

        damagePlayer(
            20 +
            round * 2
        );

    }


    updateBossHealth();

}


/* =========================================================
   BOSS ATTACK
========================================================= */

function bossAttack() {

    const angle =
        Math.atan2(
            player.y -
            boss.y,

            player.x -
            boss.x
        );


    const bulletCount =
        boss.phase === 1
            ? 3
            : 7;


    for (
        let i = 0;
        i < bulletCount;
        i++
    ) {

        let spread = 0;


        if (
            bulletCount > 1
        ) {

            spread =
                (
                    i -
                    (bulletCount - 1) / 2
                ) *
                0.12;

        }


        enemyBullets.push({

            x: boss.x,

            y: boss.y,

            vx:
                Math.cos(
                    angle + spread
                ) * 4,

            vy:
                Math.sin(
                    angle + spread
                ) * 4,

            life: 2500

        });

    }


    createExplosion(
        boss.x,
        boss.y,
        "#ff0055",
        10
    );

}


/* =========================================================
   UPDATE BOSS BULLETS
========================================================= */

function updateEnemyBullets(delta) {

    enemyBullets.forEach(
        (bullet, index) => {

            bullet.x +=
                bullet.vx *
                delta;

            bullet.y +=
                bullet.vy *
                delta;

            bullet.life -=
                16.67 * delta;


            const distance =
                Math.hypot(
                    bullet.x -
                    player.x,

                    bullet.y -
                    player.y
                );


            if (
                distance <
                15
            ) {

                damagePlayer(
                    8 +
                    round
                );

                bullet.life = 0;

            }


            if (
                bullet.life <= 0
            ) {

                enemyBullets.splice(
                    index,
                    1
                );

            }

        }
    );

}


/* =========================================================
   BOSS HIT
========================================================= */

function hitBoss(
    damage
) {

    if (
        phase !== "boss" ||
        !boss
    ) {

        return;

    }


    boss.health -=
        damage;


    createExplosion(
        boss.x,
        boss.y,
        "#ff00ff",
        5
    );


    if (
        boss.health <= 0
    ) {

        killBoss();

    }

}


/* =========================================================
   KILL BOSS
========================================================= */

function killBoss() {

    phase =
        "reward";


    score +=
        2000 +
        round * 500;


    createExplosion(
        boss.x,
        boss.y,
        "#ff00ff",
        100
    );


    /* BOSS GUARANTEED DROP */

    dropSkill(
        boss.x,
        boss.y,
        true
    );


    const bossBar =
        document.getElementById(
            "bossBar"
        );

    if (bossBar)
        bossBar.remove();


    boss = null;


    updateUI();


    showRoundMessage(
        `ROUND ${round} CLEAR`,
        1800
    );


    setTimeout(
        () => {

            if (
                round >= maxRounds
            ) {

                completeGame();

                return;

            }


            round++;

            wave = 1;

            phase = "battle";

            enemies = [];

            enemyBullets = [];

            showRoundMessage(
                `ROUND ${round}`,
                1200
            );

        },
        2200
    );

}


/* =========================================================
   BOSS HEALTH
========================================================= */

function updateBossHealth() {

    const bar =
        document.getElementById(
            "bossHealth"
        );

    if (!bar || !boss)
        return;


    const percentage =
        Math.max(
            0,
            boss.health /
            boss.maxHealth *
            100
        );


    bar.style.width =
        percentage + "%";

}


/* =========================================================
   SPAWN ENEMY
========================================================= */

function spawnEnemy() {

    const limit =
        difficulty.enemyCount +
        round * 2;


    if (
        enemies.length >=
        limit
    ) {

        return;

    }


    const side =
        Math.floor(
            Math.random() * 4
        );


    let x;
    let y;


    if (
        side === 0
    ) {

        x = -30;

        y =
            Math.random() *
            canvas.height;

    }

    else if (
        side === 1
    ) {

        x =
            canvas.width + 30;

        y =
            Math.random() *
            canvas.height;

    }

    else if (
        side === 2
    ) {

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


    const elite =
        Math.random() <
        0.08;


    enemies.push({

        x,

        y,

        size:
            elite ? 30 : 21,

        speed:
            difficulty.enemySpeed +
            round * 0.04 +
            (elite ? 0.4 : 0),

        health:
            difficulty.enemyHP +
            round +
            (elite ? round * 2 : 0),

        maxHealth:
            difficulty.enemyHP +
            round +
            (elite ? round * 2 : 0),

        damage:
            difficulty.enemyDamage +
            round +
            (elite ? 8 : 0),

        elite,

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


            if (
                distance > 0
            ) {

                enemy.x +=
                    dx /
                    distance *
                    enemy.speed *
                    enemy.slow *
                    delta;

                enemy.y +=
                    dy /
                    distance *
                    enemy.speed *
                    enemy.slow *
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

function damagePlayer(
    amount
) {

    if (
        player.invincible > 0
    ) {

        return;

    }


    player.health -=
        amount;

    player.invincible =
        800;


    createExplosion(
        player.x,
        player.y,
        "#ff0055",
        20
    );


    updateUI();


    if (
        player.health <= 0
    ) {

        endGame();

    }

}


/* =========================================================
   ATTACK
========================================================= */

function attack() {

    if (
        !gameRunning
    )
        return;


    if (
        player.attackCooldown >
        0
    )
        return;


    let cooldown =
        player.baseAttackCooldown;


    if (
        player.skillTimers.rapidFire >
        0
    ) {

        cooldown *= .45;

    }


    if (
        player.skillTimers.ultra >
        0
    ) {

        cooldown *= .18;

    }


    player.attackCooldown =
        cooldown;


    let target = null;

    let nearest =
        Infinity;


    enemies.forEach(
        enemy => {

            const d =
                Math.hypot(
                    enemy.x -
                    player.x,

                    enemy.y -
                    player.y
                );


            if (
                d < nearest
            ) {

                nearest = d;

                target = enemy;

            }

        }
    );


    if (
        !target &&
        boss
    ) {

        target = boss;

    }


    if (!target)
        return;


    let count =
        player.bulletCount;


    if (
        player.skillTimers.triple >
        0
    ) {

        count = 3;

    }

    else if (
        player.skillTimers.double >
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
                ) * .18;


        const angle =
            Math.atan2(
                target.y -
                player.y,

                target.x -
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
                bullet.life <= 0
            ) {

                bullets.splice(
                    index,
                    1
                );

                return;

            }


            /* BOSS */

            if (
                boss
            ) {

                const d =
                    Math.hypot(
                        bullet.x -
                        boss.x,

                        bullet.y -
                        boss.y
                    );


                if (
                    d <
                    boss.size
                ) {

                    let damage =
                        bullet.damage;


                    if (
                        bullet.elemental ===
                        "thunder"
                    ) {

                        damage *= 2.5;

                        createLightning(
                            boss.x,
                            boss.y
                        );

                    }


                    if (
                        bullet.elemental ===
                        "fire"
                    ) {

                        damage *= 1.8;

                        createExplosion(
                            boss.x,
                            boss.y,
                            "#ff4400",
                            10
                        );

                    }


                    if (
                        bullet.elemental ===
                        "ice"
                    ) {

                        damage *= 1.3;

                    }


                    hitBoss(
                        damage
                    );


                    bullet.life = 0;

                }

            }


            /* NORMAL ENEMIES */

            enemies.forEach(
                enemy => {

                    const d =
                        Math.hypot(
                            bullet.x -
                            enemy.x,

                            bullet.y -
                            enemy.y
                        );


                    if (
                        d <
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

        enemy.slow = .45;

    }


    enemy.health -=
        damage;


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

function killEnemy(
    enemy
) {

    const index =
        enemies.indexOf(enemy);


    if (
        index === -1
    )
        return;


    enemies.splice(
        index,
        1
    );


    score +=
        enemy.elite
            ? 250
            : 100;


    /*
       NORMAL:
       3%

       ELITE:
       8%
    */

    const dropChance =
        enemy.elite
            ? .08
            : .03;


    if (
        Math.random() <
        dropChance
    ) {

        dropSkill(
            enemy.x,
            enemy.y,
            true
        );

    }


    const now =
        Date.now();


    if (
        now -
        lastKillTime <
        2500
    ) {

        combo++;

    }

    else {

        combo = 1;

    }


    lastKillTime =
        now;


    createExplosion(
        enemy.x,
        enemy.y,

        enemy.elite
            ? "#ffff00"
            : "#ff0055",

        enemy.elite
            ? 25
            : 12
    );


    updateUI();

}


/* =========================================================
   MISSILES
========================================================= */

function launchMissiles() {

    enemies
        .slice(0, 5)
        .forEach(
            target => {

                missiles.push({

                    x: player.x,

                    y: player.y,

                    target,

                    speed: 7,

                    damage: 15

                });

            }
        );

}


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
                    20
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
                dx /
                distance *
                missile.speed *
                delta;

            missile.y +=
                dy /
                distance *
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
            5 + 1;


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
                .025 *
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
   SKILLS TIMER
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
                    16.67 *
                    delta;

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
        player.skillTimers.double <= 0 &&
        player.skillTimers.triple <= 0
    ) {

        player.bulletCount = 1;

    }


    updateSkillUI();


    skills.forEach(
        (skill, index) => {

            skill.life -=
                16.67 *
                delta;


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
        "#02040d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.strokeStyle =
        "rgba(0,255,255,.08)";


    const size = 40;


    for (
        let x = 0;
        x < canvas.width;
        x += size
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
        y += size
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
                enemy.elite
                    ? "#ffff00"
                    : "#ff0055";


            ctx.fillStyle =
                enemy.elite
                    ? "#ffff00"
                    : "#ff0055";


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


            ctx.beginPath();

            ctx.arc(
                enemy.x,
                enemy.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();


            const width = 36;


            ctx.fillStyle =
                "rgba(255,255,255,.2)";


            ctx.fillRect(
                enemy.x -
                width / 2,

                enemy.y -
                enemy.size -
                10,

                width,
                4
            );


            ctx.fillStyle =
                enemy.elite
                    ? "#ffff00"
                    : "#ff0055";


            ctx.fillRect(
                enemy.x -
                width / 2,

                enemy.y -
                enemy.size -
                10,

                width *
                Math.max(
                    0,
                    enemy.health /
                    enemy.maxHealth
                ),

                4
            );


            ctx.restore();

        }
    );

}


/* =========================================================
   DRAW BOSS
========================================================= */

function drawBoss() {

    if (!boss)
        return;


    ctx.save();


    const color =
        boss.phase === 2
            ? "#ff0055"
            : "#ff00ff";


    ctx.shadowBlur = 40;

    ctx.shadowColor =
        color;

    ctx.fillStyle =
        color;


    ctx.beginPath();

    ctx.arc(
        boss.x,
        boss.y,
        boss.size,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* CORE */

    ctx.fillStyle =
        "#00ffff";

    ctx.shadowColor =
        "#00ffff";


    ctx.beginPath();

    ctx.arc(
        boss.x,
        boss.y,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* RING */

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 3;


    ctx.beginPath();

    ctx.arc(
        boss.x,
        boss.y,
        boss.size + 10,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.restore();

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
            )
                color = "#ff4400";


            if (
                bullet.elemental ===
                "ice"
            )
                color = "#66ddff";


            if (
                bullet.elemental ===
                "thunder"
            )
                color = "#9d7cff";


            ctx.fillStyle =
                color;

            ctx.shadowBlur = 20;

            ctx.shadowColor =
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
   DRAW ENEMY BULLETS
========================================================= */

function drawEnemyBullets() {

    enemyBullets.forEach(
        bullet => {

            ctx.save();


            ctx.fillStyle =
                "#ff0055";

            ctx.shadowBlur = 20;

            ctx.shadowColor =
                "#ff0055";


            ctx.beginPath();

            ctx.arc(
                bullet.x,
                bullet.y,
                6,
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


            ctx.fillStyle =
                "#ff5500";

            ctx.shadowBlur = 20;

            ctx.shadowColor =
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

            ctx.shadowBlur = 20;

            ctx.shadowColor =
                "#9d7cff";


            ctx.beginPath();

            ctx.moveTo(
                bolt.x,
                bolt.y - 60
            );

            ctx.lineTo(
                bolt.x - 15,
                bolt.y - 20
            );

            ctx.lineTo(
                bolt.x + 10,
                bolt.y
            );

            ctx.lineTo(
                bolt.x - 10,
                bolt.y + 30
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
   ROUND PROGRESSION
========================================================= */

function updateRoundProgress() {

    if (
        phase !== "battle"
    )
        return;


    /*
       Mỗi round có 3 wave.
    */

    const target =
        difficulty.enemyCount +
        round * 2;


    if (
        enemies.length === 0 &&
        spawnTimer > 1000
    ) {

        if (
            wave < 3
        ) {

            wave++;

            showRoundMessage(
                `WAVE ${wave}`,
                800
            );

        }

        else {

            startBossWarning();

        }

    }

}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    if (scoreElement)
        scoreElement.textContent =
            score;


    if (waveElement)
        waveElement.textContent =
            `R${round} / W${wave}`;


    if (comboElement)
        comboElement.textContent =
            "x" + combo;


    if (healthText)
        healthText.textContent =
            Math.max(
                0,
                Math.floor(
                    player.health
                )
            );


    if (healthBar)
        healthBar.style.width =
            Math.max(
                0,
                player.health
            ) + "%";


    if (levelText)
        levelText.textContent =
            `ROUND ${round}`;

}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    gameRunning = false;


    if (finalScore)
        finalScore.textContent =
            score;


    if (finalWave)
        finalWave.textContent =
            `ROUND ${round}`;


    gameOver.classList.remove(
        "hidden"
    );

}


/* =========================================================
   GAME COMPLETE
========================================================= */

function completeGame() {

    phase =
        "game-complete";

    gameRunning = false;


    showRoundMessage(
        "🏆 GAME COMPLETE 🏆",
        3000
    );


    setTimeout(
        () => {

            alert(
                "🏆 CHÚC MỪNG! Bạn đã đánh bại FINAL OVERLORD!"
            );

        },
        500
    );

}


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
   MOVEMENT
========================================================= */

function movePlayer() {

    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    )
        dy--;


    if (
        keys["s"] ||
        keys["arrowdown"]
    )
        dy++;


    if (
        keys["a"] ||
        keys["arrowleft"]
    )
        dx--;


    if (
        keys["d"] ||
        keys["arrowright"]
    )
        dx++;


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.hypot(
                dx,
                dy
            );

        dx /= length;
        dy /= length;

    }


    player.x +=
        dx *
        player.speed;


    player.y +=
        dy *
        player.speed;


    const half =
        player.size / 2;


    player.x =
        Math.max(
            half,
            Math.min(
                canvas.width -
                half,
                player.x
            )
        );


    player.y =
        Math.max(
            half,
            Math.min(
                canvas.height -
                half,
                player.y
            )
        );

}


/* =========================================================
   MOBILE CONTROL
========================================================= */

document
    .querySelectorAll(
        ".move-button"
    )
    .forEach(
        button => {

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
                () => {

                    keys[key] = false;

                }
            );


            button.addEventListener(
                "pointerleave",
                () => {

                    keys[key] = false;

                }
            );

        }
    );


if (attackButton) {

    attackButton.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            attack();

        }
    );

}


/* =========================================================
   DIFFICULTY BUTTON
========================================================= */

document
    .querySelectorAll(
        ".difficulty"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    startGame(
                        button.dataset.level
                    );

                }
            );

        }
    );


/* =========================================================
   RESTART
========================================================= */

if (restartButton) {

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

}


/* =========================================================
   MAIN LOOP
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


    /* cooldown */

    if (
        player.attackCooldown > 0
    ) {

        player.attackCooldown -=
            16.67 *
            delta;

    }


    if (
        player.invincible > 0
    ) {

        player.invincible -=
            16.67 *
            delta;

    }


    /* movement */

    movePlayer();


    /* spawn */

    if (
        phase === "battle"
    ) {

        spawnTimer +=
            16.67 *
            delta;


        if (
            spawnTimer >
            900
        ) {

            spawnEnemy();

            spawnTimer = 0;

        }

    }


    /* update */

    updateEnemies(delta);

    updateBullets(delta);

    updateEnemyBullets(delta);

    updateMissiles(delta);

    updateParticles(delta);

    updateLightning();

    updateSkills(delta);

    checkSkillPickup();


    if (
        phase === "boss"
    ) {

        updateBoss(delta);

    }


    updateRoundProgress();


    /* draw */

    drawBackground();

    drawParticles();

    drawLightning();

    drawBullets();

    drawMissiles();

    drawEnemyBullets();

    drawEnemies();

    drawBoss();

    drawPlayer();


    updateUI();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INIT
========================================================= */

updateUI();
