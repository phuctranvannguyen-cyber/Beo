/* =========================================================
   CYBER ARENA — COMPLETE GAME SCRIPT
   =========================================================

   FEATURES
   ---------------------------------------------------------
   ✓ 3 độ khó: DỄ / BÌNH THƯỜNG / KHÓ
   ✓ Mỗi độ khó có 5 màn
   ✓ Mỗi màn có 3 Wave
   ✓ Màn 5 có Boss
   ✓ Boss dạng Cyber Demon 👹
   ✓ Boss HP:
        Easy   = 3x quái thường
        Normal = 4x quái thường
        Hard   = 5x quái thường

   ✓ Quái càng về màn sau càng nhanh
   ✓ Súng tự động bắn
   ✓ Không cần nút FIRE
   ✓ WASD / Arrow để di chuyển

   ✓ Skill Drop:
        Stage 1 = 5%
        Stage 2 = 8%
        Stage 3 = 11%
        Stage 4 = 14%
        Stage 5 = 18%

   ✓ Boss luôn rơi 1 Skill

   ✓ Skill:
        💣 Bomb
        🚀 Missile
        ☢️ Clear
        ⚡ Speed
        🔥 Rapid Fire
        🔫 Double Shot
        🔫 Triple Shot
        ⚡ Thunder
        🔥 Fire
        ❄️ Ice
        👑 Ultra Gun
        💥 Super Damage

   ✓ Easy / Normal:
        Boss chết → Unlock Pet

   ✓ Hard:
        Không có Pet

   ✓ Pet copy sức mạnh người chơi
   ✓ Pet tự động chiến đấu
   ✓ Cyber Grid
   ✓ Particle
   ✓ Boss HP Bar
   ✓ Combo
   ✓ Skill UI

========================================================= */


/* =========================================================
   CANVAS
========================================================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


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


/* =========================================================
   UI ELEMENTS
========================================================= */

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


/* =========================================================
   GAME CONFIG
========================================================= */

const MAX_STAGES = 5;

const WAVES_PER_STAGE = 3;


/*
   TỶ LỆ RƠI SKILL

   Không quá ít như bản cũ,
   nhưng cũng không quá nhiều.
*/

const DROP_RATE = {

    1: 0.05,   // 5%

    2: 0.08,   // 8%

    3: 0.11,   // 11%

    4: 0.14,   // 14%

    5: 0.18    // 18%

};


/* =========================================================
   DIFFICULTIES
========================================================= */

const difficulties = {

    easy: {

        name:
            "DỄ",

        enemyHP:
            20,

        enemySpeed:
            0.65,

        enemyDamage:
            5,

        enemyCount:
            5,

        bossMultiplier:
            3,

        bossSpeed:
            0.75,

        pet:
            true

    },


    normal: {

        name:
            "BÌNH THƯỜNG",

        enemyHP:
            30,

        enemySpeed:
            0.9,

        enemyDamage:
            8,

        enemyCount:
            7,

        bossMultiplier:
            4,

        bossSpeed:
            0.9,

        pet:
            true

    },


    hard: {

        name:
            "KHÓ",

        enemyHP:
            45,

        enemySpeed:
            1.15,

        enemyDamage:
            12,

        enemyCount:
            9,

        bossMultiplier:
            5,

        bossSpeed:
            1.05,

        pet:
            false

    }

};


let difficulty =
    difficulties.normal;


/* =========================================================
   GAME STATE
========================================================= */

let gameRunning =
    false;

let score =
    0;

let combo =
    1;

let stage =
    1;

let wave =
    1;


/*
   battle
   boss-warning
   boss
   reward
   game-complete
*/

let phase =
    "battle";


let enemies = [];

let bullets = [];

let enemyBullets = [];

let particles = [];

let missiles = [];

let lightning = [];

let skills = [];

let boss =
    null;


let spawnTimer =
    0;

let waveClearTimer =
    0;

let lastTime =
    0;

let lastKillTime =
    0;


/* =========================================================
   KEYBOARD
========================================================= */

const keys = {};


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:
        0,

    y:
        0,

    size:
        28,

    baseSpeed:
        4.5,

    speed:
        4.5,

    health:
        100,

    maxHealth:
        100,

    damage:
        5,

    bulletCount:
        1,

    bulletSpeed:
        11,

    attackCooldown:
        0,

    baseAttackCooldown:
        420,

    invincible:
        0,

    elemental:
        null,

    skillTimers: {

        speed:
            0,

        rapidFire:
            0,

        damage:
            0,

        ultra:
            0,

        double:
            0,

        triple:
            0

    }

};


/* =========================================================
   PET
========================================================= */

const pet = {

    active:
        false,

    x:
        0,

    y:
        0,

    size:
        20,

    health:
        100,

    maxHealth:
        100,

    damage:
        5,

    bulletCount:
        1,

    attackCooldown:
        0,

    orbitAngle:
        0,

    elemental:
        null

};


/* =========================================================
   SKILLS
========================================================= */

const SKILLS = [

    {
        id:
            "bomb",

        name:
            "BOM",

        icon:
            "💣",

        chance:
            8,

        color:
            "#ff5500"

    },


    {
        id:
            "missile",

        name:
            "TÊN LỬA",

        icon:
            "🚀",

        chance:
            8,

        color:
            "#ff3333"

    },


    {
        id:
            "clear",

        name:
            "QUÉT SẠCH",

        icon:
            "☢️",

        chance:
            4,

        color:
            "#ff00ff"

    },


    {
        id:
            "speed",

        name:
            "TĂNG TỐC",

        icon:
            "⚡",

        chance:
            12,

        color:
            "#00ffff"

    },


    {
        id:
            "rapid",

        name:
            "RAPID FIRE",

        icon:
            "🔥",

        chance:
            18,

        color:
            "#ffff00"

    },


    {
        id:
            "double",

        name:
            "DOUBLE SHOT",

        icon:
            "🔫",

        chance:
            10,

        color:
            "#00ff88"

    },


    {
        id:
            "triple",

        name:
            "TRIPLE SHOT",

        icon:
            "🔫",

        chance:
            7,

        color:
            "#00ff88"

    },


    {
        id:
            "thunder",

        name:
            "SẤM SÉT",

        icon:
            "⚡",

        chance:
            8,

        color:
            "#9d7cff"

    },


    {
        id:
            "fire",

        name:
            "LỬA",

        icon:
            "🔥",

        chance:
            7,

        color:
            "#ff4400"

    },


    {
        id:
            "ice",

        name:
            "BĂNG",

        icon:
            "❄️",

        chance:
            6,

        color:
            "#66ddff"

    },


    {
        id:
            "ultra",

        name:
            "ULTRA GUN",

        icon:
            "👑",

        chance:
            5,

        color:
            "#ff00ff"

    },


    {
        id:
            "damage",

        name:
            "SUPER DAMAGE",

        icon:
            "💥",

        chance:
            7,

        color:
            "#ff0055"

    }

];


/* =========================================================
   CREATE GAME UI
========================================================= */

function createGameUI() {

    if (
        document.getElementById(
            "skillPanel"
        )
    ) {

        return;

    }


    const panel =
        document.createElement(
            "div"
        );


    panel.id =
        "skillPanel";


    panel.innerHTML = `

        <div class="skill-title">
            ACTIVE SKILLS
        </div>

        <div id="activeSkills"></div>

        <div id="petStatus"></div>

    `;


    document
        .querySelector(".game-box")
        .appendChild(panel);


    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        #skillPanel {

            position:absolute;

            top:55px;

            left:20px;

            z-index:30;

            pointer-events:none;

        }


        .skill-title {

            color:#00ffff;

            font-size:9px;

            letter-spacing:2px;

            text-shadow:
                0 0 10px #00ffff;

        }


        #activeSkills {

            display:flex;

            gap:5px;

            margin-top:6px;

        }


        .active-skill {

            padding:5px 7px;

            border:
                1px solid #00ffff;

            background:
                rgba(0,0,20,.85);

            box-shadow:
                0 0 12px #00ffff;

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


        #petStatus {

            color:#ff00ff;

            font-size:9px;

            margin-top:8px;

            text-shadow:
                0 0 10px #ff00ff;

        }


        .skill-drop {

            position:absolute;

            width:58px;

            height:58px;

            border-radius:50%;

            display:flex;

            align-items:center;

            justify-content:center;

            background:
                rgba(0,5,20,.95);

            border:2px solid;

            box-shadow:
                0 0 25px currentColor;

            font-size:28px;

            z-index:25;

            animation:
                skillPulse .7s infinite alternate;

        }


        @keyframes skillPulse {

            from {

                transform:
                    scale(.85);

            }

            to {

                transform:
                    scale(1.12);

            }

        }


        .boss-warning {

            position:absolute;

            left:50%;

            top:35%;

            transform:
                translate(-50%,-50%);

            z-index:50;

            color:#ff0055;

            font-size:34px;

            font-weight:bold;

            letter-spacing:7px;

            text-shadow:
                0 0 10px #ff0055,
                0 0 30px #ff0055;

            animation:
                warning .5s infinite alternate;

            pointer-events:none;

        }


        @keyframes warning {

            from {

                opacity:.45;

            }

            to {

                opacity:1;

            }

        }


        .boss-bar {

            position:absolute;

            top:18px;

            left:50%;

            transform:
                translateX(-50%);

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

            text-shadow:
                0 0 15px #ff0055;

        }


        .boss-health-bg {

            width:100%;

            height:14px;

            border:
                1px solid #ff0055;

            background:
                rgba(255,0,80,.15);

        }


        .boss-health {

            height:100%;

            width:100%;

            background:#ff0055;

            box-shadow:
                0 0 18px #ff0055;

            transition:
                width .1s;

        }


        .round-message {

            position:absolute;

            top:45%;

            left:50%;

            transform:
                translate(-50%,-50%);

            z-index:45;

            color:#00ffff;

            text-align:center;

            font-size:30px;

            font-weight:bold;

            letter-spacing:5px;

            text-shadow:
                0 0 25px #00ffff;

            pointer-events:none;

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   START GAME
========================================================= */

function startGame(level) {

    difficulty =
        difficulties[level];


    gameRunning =
        true;


    score =
        0;


    combo =
        1;


    stage =
        1;


    wave =
        1;


    phase =
        "battle";


    enemies =
        [];

    bullets =
        [];

    enemyBullets =
        [];

    particles =
        [];

    missiles =
        [];

    lightning =
        [];

    skills =
        [];


    boss =
        null;


    spawnTimer =
        0;

    waveClearTimer =
        0;


    player.health =
        player.maxHealth;


    player.x =
        canvas.width / 2;


    player.y =
        canvas.height / 2;


    player.speed =
        player.baseSpeed;


    player.damage =
        5;


    player.bulletCount =
        1;


    player.elemental =
        null;


    player.attackCooldown =
        0;


    player.invincible =
        0;


    Object.keys(
        player.skillTimers
    ).forEach(
        key => {

            player.skillTimers[key] =
                0;

        }
    );


    pet.active =
        false;


    pet.x =
        player.x + 55;


    pet.y =
        player.y;


    pet.health =
        pet.maxHealth;


    menu.classList.add(
        "hidden"
    );


    gameOver.classList.add(
        "hidden"
    );


    createGameUI();


    updateUI();


    showMessage(
        "STAGE 1",
        1200
    );


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    duration = 1000
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "round-message";


    element.textContent =
        text;


    document
        .querySelector(".game-box")
        .appendChild(element);


    setTimeout(
        () => {

            element.remove();

        },
        duration
    );

}


/* =========================================================
   SPAWN ENEMY
========================================================= */

function spawnEnemy() {

    const stageSpeed =
        1 +
        (stage - 1) *
        0.12;


    const side =
        Math.floor(
            Math.random() * 4
        );


    let x;
    let y;


    if (
        side === 0
    ) {

        x =
            -30;

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

        y =
            -30;

    }

    else {

        x =
            Math.random() *
            canvas.width;

        y =
            canvas.height + 30;

    }


    /*
       Elite xuất hiện ít.
    */

    const elite =
        Math.random() <
        (
            0.05 +
            stage * 0.01
        );


    const hp =
        difficulty.enemyHP *
        (
            1 +
            (stage - 1) *
            0.15
        );


    enemies.push({

        x,
        y,

        size:
            elite
                ? 30
                : 21,

        speed:
            difficulty.enemySpeed *
            stageSpeed *
            (
                elite
                    ? 1.2
                    : 1
            ),

        health:
            hp *
            (
                elite
                    ? 2
                    : 1
            ),

        maxHealth:
            hp *
            (
                elite
                    ? 2
                    : 1
            ),

        damage:
            difficulty.enemyDamage *
            (
                1 +
                (stage - 1) *
                0.12
            ),

        elite,

        slow:
            1

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
                    (
                        dx /
                        distance
                    ) *
                    enemy.speed *
                    enemy.slow *
                    delta;


                enemy.y +=
                    (
                        dy /
                        distance
                    ) *
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
   AUTO FIRE
========================================================= */

function autoFire() {

    if (
        !gameRunning
    )
        return;


    if (
        phase !== "battle" &&
        phase !== "boss"
    )
        return;


    if (
        player.attackCooldown > 0
    )
        return;


    let target =
        null;


    let nearest =
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
                nearest
            ) {

                nearest =
                    distance;

                target =
                    enemy;

            }

        }
    );


    if (
        !target &&
        boss
    ) {

        target =
            boss;

    }


    if (!target)
        return;


    let cooldown =
        player.baseAttackCooldown;


    if (
        player.skillTimers.rapidFire >
        0
    ) {

        cooldown *=
            0.45;

    }


    if (
        player.skillTimers.ultra >
        0
    ) {

        cooldown *=
            0.18;

    }


    player.attackCooldown =
        cooldown;


    let count =
        player.bulletCount;


    if (
        player.skillTimers.triple >
        0
    ) {

        count =
            3;

    }

    else if (
        player.skillTimers.double >
        0
    ) {

        count =
            2;

    }


    const angle =
        Math.atan2(
            target.y -
            player.y,

            target.x -
            player.x
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        let spread =
            0;


        if (
            count > 1
        ) {

            spread =
                (
                    i -
                    (count - 1) / 2
                ) *
                0.16;

        }


        bullets.push({

            x:
                player.x,

            y:
                player.y,

            vx:
                Math.cos(
                    angle +
                    spread
                ) *
                player.bulletSpeed,

            vy:
                Math.sin(
                    angle +
                    spread
                ) *
                player.bulletSpeed,

            damage:
                player.damage,

            elemental:
                player.elemental,

            owner:
                "player",

            life:
                1200

        });

    }

}


/* =========================================================
   PET FIRE
========================================================= */

function petAutoFire() {

    if (
        !pet.active
    )
        return;


    if (
        pet.attackCooldown > 0
    )
        return;


    let target =
        null;


    let nearest =
        Infinity;


    enemies.forEach(
        enemy => {

            const distance =
                Math.hypot(
                    enemy.x -
                    pet.x,

                    enemy.y -
                    pet.y
                );


            if (
                distance <
                nearest
            ) {

                nearest =
                    distance;

                target =
                    enemy;

            }

        }
    );


    if (
        !target &&
        boss
    ) {

        target =
            boss;

    }


    if (!target)
        return;


    pet.attackCooldown =
        player.baseAttackCooldown;


    const angle =
        Math.atan2(
            target.y -
            pet.y,

            target.x -
            pet.x
        );


    for (
        let i = 0;
        i < pet.bulletCount;
        i++
    ) {

        let spread =
            0;


        if (
            pet.bulletCount > 1
        ) {

            spread =
                (
                    i -
                    (pet.bulletCount - 1) / 2
                ) *
                0.16;

        }


        bullets.push({

            x:
                pet.x,

            y:
                pet.y,

            vx:
                Math.cos(
                    angle +
                    spread
                ) *
                player.bulletSpeed,

            vy:
                Math.sin(
                    angle +
                    spread
                ) *
                player.bulletSpeed,

            damage:
                pet.damage,

            elemental:
                pet.elemental,

            owner:
                "pet",

            life:
                1200

        });

    }

}


/* =========================================================
   PET UPDATE
========================================================= */

function updatePet(delta) {

    if (
        !pet.active
    )
        return;


    pet.orbitAngle +=
        0.025 *
        delta;


    const radius =
        60;


    const targetX =
        player.x +
        Math.cos(
            pet.orbitAngle
        ) *
        radius;


    const targetY =
        player.y +
        Math.sin(
            pet.orbitAngle
        ) *
        radius;


    pet.x +=
        (
            targetX -
            pet.x
        ) *
        0.08 *
        delta;


    pet.y +=
        (
            targetY -
            pet.y
        ) *
        0.08 *
        delta;


    pet.attackCooldown -=
        16.67 *
        delta;


    petAutoFire();

}


/* =========================================================
   BULLETS
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
                16.67 *
                delta;


            if (
                bullet.life <= 0
            ) {

                bullets.splice(
                    index,
                    1
                );

                return;

            }


            /*
               Boss collision
            */

            if (
                boss
            ) {

                const distance =
                    Math.hypot(
                        bullet.x -
                        boss.x,

                        bullet.y -
                        boss.y
                    );


                if (
                    distance <
                    boss.size
                ) {

                    hitBoss(
                        bullet.damage,
                        bullet.elemental
                    );


                    bullet.life =
                        0;


                    return;

                }

            }


            /*
               Enemy collision
            */

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
                        enemy.size +
                        6
                    ) {

                        hitEnemy(
                            enemy,
                            bullet
                        );


                        bullet.life =
                            0;

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

        damage *=
            2.5;


        createLightning(
            enemy.x,
            enemy.y
        );

    }


    if (
        bullet.elemental ===
        "fire"
    ) {

        damage *=
            1.8;


        createExplosion(
            enemy.x,
            enemy.y,
            "#ff4400",
            8
        );

    }


    if (
        bullet.elemental ===
        "ice"
    ) {

        damage *=
            1.2;


        enemy.slow =
            0.45;

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
        enemies.indexOf(
            enemy
        );


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
       SKILL DROP
       5% → 18%
    */

    const chance =
        DROP_RATE[stage];


    if (
        Math.random() <
        chance
    ) {

        dropSkill(
            enemy.x,
            enemy.y
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

        combo =
            1;

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

}


/* =========================================================
   RANDOM SKILL
========================================================= */

function getRandomSkill() {

    let total =
        0;


    SKILLS.forEach(
        skill => {

            total +=
                skill.chance;

        }
    );


    let random =
        Math.random() *
        total;


    for (
        const skill
        of SKILLS
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
    y
) {

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
        (
            x -
            29
        ) +
        "px";


    element.style.top =
        (
            y -
            29
        ) +
        "px";


    element.style.color =
        skill.color;


    element.style.borderColor =
        skill.color;


    document
        .querySelector(
            ".game-box"
        )
        .appendChild(
            element
        );


    skills.push({

        x:
            x,

        y:
            y,

        type:
            skill,

        element:
            element,

        life:
            12000

    });

}


/* =========================================================
   PICKUP SKILL
========================================================= */

function checkSkillPickup() {

    skills.forEach(
        (
            skill,
            index
        ) => {

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

function activateSkill(
    skill
) {

    switch (
        skill.id
    ) {


        /*
           BOMB
        */

        case "bomb":

            enemies.forEach(
                enemy => {

                    enemy.health -=
                        20;


                    createExplosion(
                        enemy.x,
                        enemy.y,
                        "#ff5500",
                        15
                    );

                }
            );

            break;


        /*
           MISSILE
        */

        case "missile":

            launchMissiles();

            break;


        /*
           CLEAR
        */

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
                enemies.length *
                100;


            enemies =
                [];


            break;


        /*
           SPEED
        */

        case "speed":

            player.speed =
                player.baseSpeed *
                1.8;


            player.skillTimers.speed =
                10000;

            break;


        /*
           RAPID FIRE
        */

        case "rapid":

            player.skillTimers.rapidFire =
                12000;

            break;


        /*
           DOUBLE
        */

        case "double":

            player.bulletCount =
                2;


            player.skillTimers.double =
                15000;

            break;


        /*
           TRIPLE
        */

        case "triple":

            player.bulletCount =
                3;


            player.skillTimers.triple =
                15000;

            break;


        /*
           THUNDER
        */

        case "thunder":

            player.elemental =
                "thunder";


            player.skillTimers.damage =
                15000;

            break;


        /*
           FIRE
        */

        case "fire":

            player.elemental =
                "fire";


            player.skillTimers.damage =
                15000;

            break;


        /*
           ICE
        */

        case "ice":

            player.elemental =
                "ice";


            player.skillTimers.damage =
                15000;

            break;


        /*
           ULTRA
        */

        case "ultra":

            player.skillTimers.ultra =
                12000;


            player.damage =
                15;

            break;


        /*
           DAMAGE
        */

        case "damage":

            player.damage =
                12;


            player.skillTimers.damage =
                15000;

            break;

    }


    syncPetPower();

    updateSkillUI();

}


/* =========================================================
   MISSILE
========================================================= */

function launchMissiles() {

    enemies
        .slice(
            0,
            6
        )
        .forEach(
            target => {

                missiles.push({

                    x:
                        player.x,

                    y:
                        player.y,

                    target:
                        target,

                    speed:
                        7,

                    damage:
                        player.damage *
                        3

                });

            }
        );

}


function updateMissiles(
    delta
) {

    missiles.forEach(
        (
            missile,
            index
        ) => {

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
                    target.health <=
                    0
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
                (
                    dx /
                    distance
                ) *
                missile.speed *
                delta;


            missile.y +=
                (
                    dy /
                    distance
                ) *
                missile.speed *
                delta;

        }
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


    document
        .querySelector(
            ".game-box"
        )
        .appendChild(
            warning
        );


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


    /*
       Máu quái thường ở Stage 5
    */

    const normalEnemyHP =
        difficulty.enemyHP *
        (
            1 +
            (
                stage - 1
            ) *
            0.15
        );


    /*
       Boss:
       Easy   = 3x
       Normal = 4x
       Hard   = 5x
    */

    const bossHP =
        normalEnemyHP *
        difficulty.bossMultiplier;


    boss = {

        x:
            canvas.width / 2,

        y:
            100,

        size:
            70,

        health:
            bossHP,

        maxHealth:
            bossHP,

        speed:
            difficulty.bossSpeed *
            (
                1 +
                (
                    stage - 1
                ) *
                0.1
            ),

        phase:
            1,

        attackTimer:
            900,

        spawnTimer:
            2500,

        name:
            "CYBER DEMON",

        emoji:
            "👹"

    };


    createBossBar();


    showMessage(
        "👹 CYBER DEMON",
        1800
    );

}


/* =========================================================
   UPDATE BOSS
========================================================= */

function updateBoss(
    delta
) {

    if (!boss)
        return;


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


    /*
       Boss giữ khoảng cách
    */

    if (
        distance > 190
    ) {

        boss.x +=
            (
                dx /
                distance
            ) *
            boss.speed *
            delta;


        boss.y +=
            (
                dy /
                distance
            ) *
            boss.speed *
            delta;

    }


    /*
       Boss Phase 2
    */

    if (
        boss.health <=
        boss.maxHealth *
        0.5
        &&
        boss.phase === 1
    ) {

        boss.phase =
            2;


        boss.speed *=
            1.5;


        showMessage(
            "👹 ENRAGED",
            1200
        );


        createExplosion(
            boss.x,
            boss.y,
            "#ff0055",
            60
        );

    }


    boss.attackTimer -=
        16.67 *
        delta;


    if (
        boss.attackTimer <= 0
    ) {

        bossAttack();


        boss.attackTimer =
            boss.phase === 1
                ? 1000
                : 500;

    }


    boss.spawnTimer -=
        16.67 *
        delta;


    if (
        boss.spawnTimer <= 0
    ) {

        spawnEnemy();


        if (
            boss.phase === 2
        ) {

            spawnEnemy();

            spawnEnemy();

        }


        boss.spawnTimer =
            boss.phase === 1
                ? 3000
                : 1500;

    }


    if (
        distance <
        boss.size +
        player.size
    ) {

        damagePlayer(
            20
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


    const count =
        boss.phase === 1
            ? 5
            : 9;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const spread =
            (
                i -
                (
                    count - 1
                ) / 2
            ) *
            0.11;


        enemyBullets.push({

            x:
                boss.x,

            y:
                boss.y,

            vx:
                Math.cos(
                    angle +
                    spread
                ) *
                4.5,

            vy:
                Math.sin(
                    angle +
                    spread
                ) *
                4.5,

            life:
                2500

        });

    }


    createExplosion(
        boss.x,
        boss.y,
        "#ff0055",
        12
    );

}


/* =========================================================
   HIT BOSS
========================================================= */

function hitBoss(
    damage,
    elemental
) {

    if (!boss)
        return;


    let finalDamage =
        damage;


    if (
        elemental ===
        "thunder"
    ) {

        finalDamage *=
            2.5;


        createLightning(
            boss.x,
            boss.y
        );

    }


    if (
        elemental ===
        "fire"
    ) {

        finalDamage *=
            1.8;


        createExplosion(
            boss.x,
            boss.y,
            "#ff4400",
            8
        );

    }


    if (
        elemental ===
        "ice"
    ) {

        finalDamage *=
            1.2;

    }


    boss.health -=
        finalDamage;


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
        2000 *
        stage;


    createExplosion(
        boss.x,
        boss.y,
        "#ff00ff",
        100
    );


    /*
       BOSS LUÔN DROP 1 SKILL
    */

    dropSkill(
        boss.x,
        boss.y
    );


    /*
       EASY / NORMAL:
       UNLOCK PET
    */

    if (
        difficulty.pet
    ) {

        pet.active =
            true;


        pet.x =
            player.x +
            60;


        pet.y =
            player.y;


        syncPetPower();


        showMessage(
            "🐾 PET UNLOCKED!",
            1800
        );

    }


    const bossBar =
        document.getElementById(
            "bossBar"
        );


    if (bossBar)
        bossBar.remove();


    boss =
        null;


    /*
       Stage 5 hoàn thành
    */

    if (
        stage >=
        MAX_STAGES
    ) {

        completeGame();

        return;

    }


    /*
       Sang stage tiếp theo
    */

    setTimeout(
        () => {

            stage++;

            wave =
                1;

            phase =
                "battle";

            enemies =
                [];

            enemyBullets =
                [];

            spawnTimer =
                0;


            showMessage(
                `STAGE ${stage}`,
                1500
            );

        },
        2500
    );

}


/* =========================================================
   BOSS BAR
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
            👹 CYBER DEMON
        </div>

        <div class="boss-health-bg">

            <div
                id="bossHealth"
                class="boss-health"
            ></div>

        </div>

    `;


    document
        .querySelector(
            ".game-box"
        )
        .appendChild(
            bar
        );

}


function updateBossHealth() {

    if (!boss)
        return;


    const bar =
        document.getElementById(
            "bossHealth"
        );


    if (!bar)
        return;


    bar.style.width =
        Math.max(
            0,

            boss.health /
            boss.maxHealth *
            100

        ) +
        "%";

}


/* =========================================================
   ENEMY BULLETS
========================================================= */

function updateEnemyBullets(
    delta
) {

    enemyBullets.forEach(
        (
            bullet,
            index
        ) => {

            bullet.x +=
                bullet.vx *
                delta;


            bullet.y +=
                bullet.vy *
                delta;


            bullet.life -=
                16.67 *
                delta;


            const distance =
                Math.hypot(
                    bullet.x -
                    player.x,

                    bullet.y -
                    player.y
                );


            if (
                distance < 16
            ) {

                damagePlayer(
                    8 +
                    stage
                );


                bullet.life =
                    0;

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
   PLAYER DAMAGE
========================================================= */

function damagePlayer(
    amount
) {

    if (
        player.invincible > 0
    )
        return;


    player.health -=
        amount;


    player.invincible =
        700;


    createExplosion(
        player.x,
        player.y,
        "#ff0055",
        15
    );


    if (
        player.health <= 0
    ) {

        endGame();

    }

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
            5 +
            1;


        particles.push({

            x:
                x,

            y:
                y,

            vx:
                Math.cos(
                    angle
                ) *
                speed,

            vy:
                Math.sin(
                    angle
                ) *
                speed,

            life:
                1,

            color:
                color

        });

    }

}


function updateParticles(
    delta
) {

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
                particle.life >
                0
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

        x:
            x,

        y:
            y,

        life:
            15

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
                bolt.life >
                0
        );

}


/* =========================================================
   UPDATE SKILLS
========================================================= */

function updateSkills(
    delta
) {

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


    /*
       Speed hết
    */

    if (
        player.skillTimers.speed <=
        0
    ) {

        player.speed =
            player.baseSpeed;

    }


    /*
       Elemental / Damage hết
    */

    if (
        player.skillTimers.damage <=
        0
    ) {

        player.damage =
            5;

        player.elemental =
            null;

    }


    /*
       Double / Triple hết
    */

    if (
        player.skillTimers.double <=
        0 &&
        player.skillTimers.triple <=
        0
    ) {

        player.bulletCount =
            1;

    }


    /*
       Skill trên sân tự biến mất
    */

    skills.forEach(
        (
            skill,
            index
        ) => {

            skill.life -=
                16.67 *
                delta;


            if (
                skill.life <=
                0
            ) {

                skill.element.remove();


                skills.splice(
                    index,
                    1
                );

            }

        }
    );


    syncPetPower();

}


/* =========================================================
   WAVE SYSTEM
========================================================= */

function updateWaveSystem(
    delta
) {

    if (
        phase !==
        "battle"
    )
        return;


    /*
       Số quái cần đánh
    */

    const target =
        difficulty.enemyCount +
        stage * 2 +
        wave * 2;


    /*
       Spawn enemy
    */

    if (
        enemies.length <
        target
    ) {

        spawnTimer +=
            16.67 *
            delta;


        if (
            spawnTimer >=
            550
        ) {

            spawnEnemy();


            spawnTimer =
                0;

        }

    }


    /*
       Wave clear
    */

    if (
        enemies.length ===
        0 &&
        spawnTimer ===
        0
    ) {

        waveClearTimer +=
            16.67 *
            delta;


        if (
            waveClearTimer >
            1200
        ) {

            waveClearTimer =
                0;


            if (
                wave <
                WAVES_PER_STAGE
            ) {

                wave++;


                showMessage(
                    `WAVE ${wave}`,
                    900
                );

            }

            else {

                /*
                   Chỉ Stage 5 mới có Boss
                */

                if (
                    stage ===
                    MAX_STAGES
                ) {

                    startBossWarning();

                }

                else {

                    stage++;

                    wave =
                        1;


                    showMessage(
                        `STAGE ${stage}`,
                        1200
                    );

                }

            }

        }

    }

}


/* =========================================================
   BACKGROUND
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


    /*
       Cyber Grid
    */

    ctx.strokeStyle =
        "rgba(0,255,255,.07)";


    const grid =
        40;


    for (
        let x = 0;
        x < canvas.width;
        x += grid
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
        y += grid
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
   PLAYER DRAW
========================================================= */

function drawPlayer() {

    ctx.save();


    ctx.shadowBlur =
        25;


    ctx.shadowColor =
        "#00ffff";


    ctx.fillStyle =
        player.invincible >
        0
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
   PET DRAW
========================================================= */

function drawPet() {

    if (
        !pet.active
    )
        return;


    ctx.save();


    ctx.shadowBlur =
        25;


    ctx.shadowColor =
        "#ff00ff";


    ctx.fillStyle =
        "#ff00ff";


    ctx.beginPath();


    ctx.arc(
        pet.x,
        pet.y,
        pet.size,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.fillStyle =
        "#00ffff";


    ctx.beginPath();


    ctx.arc(
        pet.x - 7,
        pet.y - 2,
        4,
        0,
        Math.PI * 2
    );


    ctx.arc(
        pet.x + 7,
        pet.y - 2,
        4,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.restore();

}


/* =========================================================
   ENEMY DRAW
========================================================= */

function drawEnemies() {

    enemies.forEach(
        enemy => {

            ctx.save();


            const color =
                enemy.elite
                    ? "#ffff00"
                    : "#ff0055";


            ctx.shadowBlur =
                20;


            ctx.shadowColor =
                color;


            ctx.fillStyle =
                color;


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


            /*
               HP BAR
            */

            const width =
                36;


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
                color;


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
   BOSS DRAW
========================================================= */

function drawBoss() {

    if (!boss)
        return;


    ctx.save();


    const color =
        boss.phase === 2
            ? "#ff0055"
            : "#ff00ff";


    ctx.shadowBlur =
        45;


    ctx.shadowColor =
        color;


    ctx.font =
        `${boss.size * 2}px Arial`;


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        boss.emoji,
        boss.x,
        boss.y
    );


    /*
       Boss energy ring
    */

    ctx.strokeStyle =
        color;


    ctx.lineWidth =
        3;


    ctx.beginPath();


    ctx.arc(
        boss.x,
        boss.y,
        boss.size + 18,
        0,
        Math.PI * 2
    );


    ctx.stroke();


    ctx.restore();

}


/* =========================================================
   BULLET DRAW
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


            if (
                bullet.elemental ===
                "ice"
            ) {

                color =
                    "#66ddff";

            }


            if (
                bullet.elemental ===
                "thunder"
            ) {

                color =
                    "#9d7cff";

            }


            ctx.fillStyle =
                color;


            ctx.shadowBlur =
                20;


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
   ENEMY BULLET DRAW
========================================================= */

function drawEnemyBullets() {

    enemyBullets.forEach(
        bullet => {

            ctx.save();


            ctx.fillStyle =
                "#ff0055";


            ctx.shadowBlur =
                20;


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
   MISSILE DRAW
========================================================= */

function drawMissiles() {

    missiles.forEach(
        missile => {

            ctx.save();


            ctx.fillStyle =
                "#ff5500";


            ctx.shadowBlur =
                20;


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
   LIGHTNING DRAW
========================================================= */

function drawLightning() {

    lightning.forEach(
        bolt => {

            ctx.save();


            ctx.strokeStyle =
                "#9d7cff";


            ctx.lineWidth =
                4;


            ctx.shadowBlur =
                20;


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
   PARTICLES DRAW
========================================================= */

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.save();


            ctx.globalAlpha =
                particle.life;


            ctx.fillStyle =
                particle.color;


            ctx.shadowBlur =
                15;


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
   SKILL UI
========================================================= */

function updateSkillUI() {

    const container =
        document.getElementById(
            "activeSkills"
        );


    const petStatus =
        document.getElementById(
            "petStatus"
        );


    if (!container)
        return;


    container.innerHTML =
        "";


    const active =
        [];


    if (
        player.skillTimers.speed >
        0
    ) {

        active.push(
            ["⚡", "SPEED"]
        );

    }


    if (
        player.skillTimers.rapidFire >
        0
    ) {

        active.push(
            ["🔥", "RAPID"]
        );

    }


    if (
        player.bulletCount ===
        2
    ) {

        active.push(
            ["🔫", "DOUBLE"]
        );

    }


    if (
        player.bulletCount ===
        3
    ) {

        active.push(
            ["🔫", "TRIPLE"]
        );

    }


    if (
        player.elemental
    ) {

        const icon =
            player.elemental ===
            "fire"

                ? "🔥"

                : player.elemental ===
                  "ice"

                    ? "❄️"

                    : "⚡";


        active.push(
            [
                icon,

                player
                    .elemental
                    .toUpperCase()
            ]
        );

    }


    if (
        player.skillTimers.ultra >
        0
    ) {

        active.push(
            ["👑", "ULTRA"]
        );

    }


    if (
        player.damage >
        5
    ) {

        active.push(
            ["💥", "DAMAGE"]
        );

    }


    active.forEach(
        item => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "active-skill";


            element.innerHTML = `

                <span
                    class="active-skill-icon"
                >
                    ${item[0]}
                </span>

                <span
                    class="active-skill-name"
                >
                    ${item[1]}
                </span>

            `;


            container.appendChild(
                element
            );

        }
    );


    if (
        petStatus
    ) {

        petStatus.textContent =
            pet.active
                ? "🐾 PET ONLINE"
                : "";

    }

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    if (
        scoreElement
    ) {

        scoreElement.textContent =
            score;

    }


    if (
        waveElement
    ) {

        waveElement.textContent =
            `S${stage} / W${wave}`;

    }


    if (
        comboElement
    ) {

        comboElement.textContent =
            "x" +
            combo;

    }


    if (
        healthText
    ) {

        healthText.textContent =
            Math.max(
                0,

                Math.floor(
                    player.health
                )
            );

    }


    if (
        healthBar
    ) {

        healthBar.style.width =
            Math.max(
                0,

                player.health
            ) +
            "%";

    }


    if (
        levelText
    ) {

        levelText.textContent =
            `${difficulty.name} • STAGE ${stage}/5`;

    }


    updateSkillUI();

}


/* =========================================================
   END GAME
========================================================= */

function endGame() {

    gameRunning =
        false;


    if (
        finalScore
    ) {

        finalScore.textContent =
            score;

    }


    if (
        finalWave
    ) {

        finalWave.textContent =
            `STAGE ${stage}`;

    }


    gameOver.classList.remove(
        "hidden"
    );

}


/* =========================================================
   COMPLETE GAME
========================================================= */

function completeGame() {

    phase =
        "game-complete";


    gameRunning =
        false;


    showMessage(
        "🏆 5 STAGES COMPLETE 🏆",
        3000
    );


    setTimeout(
        () => {

            alert(

                `🏆 ${difficulty.name} COMPLETE!\n\n` +

                `Score: ${score}\n\n` +

                `Bạn đã đánh bại CYBER DEMON!`

            );

        },
        500
    );

}


/* =========================================================
   MOVEMENT
========================================================= */

function movePlayer() {

    let dx =
        0;

    let dy =
        0;


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
            Math.hypot(
                dx,
                dy
            );


        dx /=
            length;


        dy /=
            length;

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
   KEYBOARD EVENTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        keys[
            event.key.toLowerCase()
        ] =
            true;

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] =
            false;

    }
);


/* =========================================================
   DIFFICULTY BUTTONS
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
   RESTART BUTTON
========================================================= */

if (
    restartButton
) {

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
   MAIN GAME LOOP
========================================================= */

function gameLoop(
    time
) {

    if (
        !gameRunning
    )
        return;


    const delta =
        Math.min(
            (
                time -
                lastTime
            ) /
            16.67,

            2
        );


    lastTime =
        time;


    /*
       PLAYER COOLDOWN
    */

    if (
        player.attackCooldown >
        0
    ) {

        player.attackCooldown -=
            16.67 *
            delta;

    }


    /*
       INVINCIBILITY
    */

    if (
        player.invincible >
        0
    ) {

        player.invincible -=
            16.67 *
            delta;

    }


    /*
       MOVE
    */

    movePlayer();


    /*
       AUTO FIRE
    */

    autoFire();


    /*
       PET
    */

    updatePet(
        delta
    );


    /*
       WAVE
    */

    updateWaveSystem(
        delta
    );


    /*
       ENEMIES
    */

    updateEnemies(
        delta
    );


    /*
       BULLETS
    */

    updateBullets(
        delta
    );


    /*
       BOSS
    */

    if (
        phase ===
        "boss"
    ) {

        updateBoss(
            delta
        );

    }


    /*
       ENEMY BULLETS
    */

    updateEnemyBullets(
        delta
    );


    /*
       MISSILES
    */

    updateMissiles(
        delta
    );


    /*
       EFFECTS
    */

    updateParticles(
        delta
    );


    updateLightning();


    /*
       SKILLS
    */

    updateSkills(
        delta
    );


    checkSkillPickup();


    /*
       DRAW
    */

    drawBackground();

    drawParticles();

    drawLightning();

    drawBullets();

    drawMissiles();

    drawEnemyBullets();

    drawEnemies();

    drawBoss();

    drawPet();

    drawPlayer();


    /*
       UI
    */

    updateUI();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

createGameUI();

updateUI();
