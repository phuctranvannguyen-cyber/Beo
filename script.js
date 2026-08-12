/* =========================================================
   CYBERARENA
   COMPLETE GAME SCRIPT
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       1. GAME CONFIG
    ===================================================== */

    const DIFFICULTIES = {
        easy: {
            name: "DỄ",
            enemyHp: 30,
            enemySpeed: 0.75,
            enemyDamage: 8,
            bossMultiplier: 3,
            dropBonus: 0.10
        },

        normal: {
            name: "BÌNH THƯỜNG",
            enemyHp: 45,
            enemySpeed: 0.95,
            enemyDamage: 10,
            bossMultiplier: 4,
            dropBonus: 0.18
        },

        hard: {
            name: "KHÓ",
            enemyHp: 65,
            enemySpeed: 1.20,
            enemyDamage: 14,
            bossMultiplier: 5,
            dropBonus: 0.28
        }
    };

    const STAGES = 5;

    let difficulty = "normal";
    let stage = 1;

    let score = 0;
    let wave = 1;
    let combo = 1;

    let gameRunning = true;
    let bossAlive = false;

    let enemies = [];
    let bullets = [];
    let enemyBullets = [];
    let drops = [];
    let particles = [];

    let keys = {};

    let player;
    let pet = null;

    let lastTime = performance.now();
    let enemySpawnTimer = 0;
    let shootTimer = 0;

    /* =====================================================
       2. CREATE GAME AREA
    ===================================================== */

    let arena =
        document.querySelector("#gameArena") ||
        document.querySelector(".game-arena") ||
        document.querySelector("#game") ||
        document.body;

    arena.style.position = "relative";
    arena.style.overflow = "hidden";

    /*
       Nếu chưa có game container thì tạo một container riêng.
    */

    if (arena === document.body) {
        arena = document.createElement("div");
        arena.id = "gameArena";

        Object.assign(arena.style, {
            position: "fixed",
            inset: "0",
            background: "#02040d",
            overflow: "hidden"
        });

        document.body.appendChild(arena);
    }

    /* =====================================================
       3. PLAYER
    ===================================================== */

    player = {
        x: arena.clientWidth / 2,
        y: arena.clientHeight - 130,

        width: 48,
        height: 58,

        speed: 5,

        hp: 100,
        maxHp: 100,

        damage: 12,
        fireRate: 420,

        projectileCount: 1,

        shield: false,
        speedBoost: 1,

        elemental: null,

        alive: true
    };

    /* =====================================================
       4. CREATE PLAYER DOM
    ===================================================== */

    const playerElement = document.createElement("div");

    playerElement.id = "player";

    Object.assign(playerElement.style, {
        position: "absolute",
        width: "48px",
        height: "58px",

        transform: "translate(-50%, -50%)",

        zIndex: "50",

        pointerEvents: "none",

        filter:
            "drop-shadow(0 0 8px #00ffff) " +
            "drop-shadow(0 0 18px #00ffff)"
    });

    playerElement.innerHTML = `
        <div style="
            position:absolute;
            left:12px;
            top:4px;
            width:24px;
            height:24px;
            background:#00ffff;
            clip-path:polygon(
                50% 0%,
                100% 100%,
                50% 78%,
                0% 100%
            );
            box-shadow:
                0 0 8px #00ffff,
                0 0 20px #00ffff;
        "></div>

        <div style="
            position:absolute;
            left:4px;
            top:30px;
            width:40px;
            height:20px;
            border:2px solid #00ffff;
            background:rgba(0,255,255,.12);
            clip-path:polygon(
                15% 0,
                85% 0,
                100% 100%,
                0 100%
            );
            box-shadow:
                inset 0 0 10px #00ffff,
                0 0 10px #00ffff;
        "></div>

        <div style="
            position:absolute;
            left:19px;
            top:33px;
            width:10px;
            height:12px;
            background:#ff00ff;
            box-shadow:
                0 0 8px #ff00ff,
                0 0 15px #ff00ff;
        "></div>

        <div style="
            position:absolute;
            left:8px;
            top:51px;
            width:8px;
            height:5px;
            background:#ff00ff;
            box-shadow:0 0 10px #ff00ff;
        "></div>

        <div style="
            position:absolute;
            right:8px;
            top:51px;
            width:8px;
            height:5px;
            background:#ff00ff;
            box-shadow:0 0 10px #ff00ff;
        "></div>
    `;

    arena.appendChild(playerElement);

    /* =====================================================
       5. PLAYER MOVEMENT
    ===================================================== */

    document.addEventListener("keydown", e => {
        keys[e.key.toLowerCase()] = true;

        if (
            ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
                .includes(e.key.toLowerCase())
        ) {
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", e => {
        keys[e.key.toLowerCase()] = false;
    });

    function movePlayer(dt) {

        let speed = player.speed * player.speedBoost;

        if (keys["shift"]) {
            speed *= 1.35;
        }

        if (keys["arrowleft"] || keys["a"]) {
            player.x -= speed * dt;
        }

        if (keys["arrowright"] || keys["d"]) {
            player.x += speed * dt;
        }

        if (keys["arrowup"] || keys["w"]) {
            player.y -= speed * dt;
        }

        if (keys["arrowdown"] || keys["s"]) {
            player.y += speed * dt;
        }

        player.x = Math.max(30, Math.min(arena.clientWidth - 30, player.x));

        player.y = Math.max(
            80,
            Math.min(arena.clientHeight - 40, player.y)
        );

        playerElement.style.left = `${player.x}px`;
        playerElement.style.top = `${player.y}px`;
    }

    /* =====================================================
       6. AUTO SHOOT
    ===================================================== */

    function autoShoot(now) {

        if (now - shootTimer < player.fireRate) return;

        shootTimer = now;

        const count = player.projectileCount;

        if (count === 1) {
            createBullet(player.x, player.y - 30, 0);
        }

        else if (count === 2) {
            createBullet(player.x - 12, player.y - 25, -0.08);
            createBullet(player.x + 12, player.y - 25, 0.08);
        }

        else {
            createBullet(player.x, player.y - 30, 0);
            createBullet(player.x - 15, player.y - 22, -0.12);
            createBullet(player.x + 15, player.y - 22, 0.12);
        }
    }

    /* =====================================================
       7. BULLET
    ===================================================== */

    function createBullet(x, y, angle) {

        const element = document.createElement("div");

        Object.assign(element.style, {
            position: "absolute",

            width: "5px",
            height: "18px",

            background:
                player.elemental === "fire"
                    ? "#ff5500"
                    : player.elemental === "ice"
                    ? "#66ddff"
                    : player.elemental === "thunder"
                    ? "#ffff00"
                    : "#00ffff",

            boxShadow:
                "0 0 8px currentColor," +
                "0 0 15px currentColor",

            borderRadius: "5px",

            zIndex: "30"
        });

        arena.appendChild(element);

        bullets.push({
            x,
            y,

            vx: Math.sin(angle) * 5,
            vy: -9,

            damage: player.damage,

            element
        });
    }

    /* =====================================================
       8. ENEMY
    ===================================================== */

    function createEnemy(isBoss = false) {

        const config = DIFFICULTIES[difficulty];

        const enemy = {

            isBoss,

            x:
                50 +
                Math.random() *
                Math.max(100, arena.clientWidth - 100),

            y: -50,

            width: isBoss ? 100 : 42,
            height: isBoss ? 100 : 42,

            hp:
                isBoss
                    ? config.enemyHp * config.bossMultiplier
                    : config.enemyHp,

            maxHp:
                isBoss
                    ? config.enemyHp * config.bossMultiplier
                    : config.enemyHp,

            speed:
                config.enemySpeed *
                (1 + (stage - 1) * 0.08),

            damage: config.enemyDamage,

            element: null,

            dom: null,

            hitFlash: 0
        };

        /* ===============================
           ENEMY VISUAL
        =============================== */

        const el = document.createElement("div");

        el.className = "enemy";

        Object.assign(el.style, {
            position: "absolute",

            width: `${enemy.width}px`,
            height: `${enemy.height}px`,

            transform: "translate(-50%, -50%)",

            zIndex: "20",

            filter: isBoss
                ? "drop-shadow(0 0 10px #ff0055) drop-shadow(0 0 30px #ff0055)"
                : "drop-shadow(0 0 7px #ff0066)"
        });

        if (isBoss) {

            /*
                BOSS HÌNH STICKER QUỶ
            */

            el.innerHTML = `
                <div style="
                    position:absolute;
                    inset:5px;
                    background:#ff1744;
                    border:4px solid #ff0055;
                    border-radius:45% 45% 40% 40%;
                    box-shadow:
                        inset 0 0 20px #7a001f,
                        0 0 20px #ff0055;
                ">

                    <div style="
                        position:absolute;
                        left:15px;
                        top:25px;
                        width:18px;
                        height:10px;
                        background:#ffff00;
                        transform:rotate(20deg);
                        box-shadow:0 0 10px #ffff00;
                    "></div>

                    <div style="
                        position:absolute;
                        right:15px;
                        top:25px;
                        width:18px;
                        height:10px;
                        background:#ffff00;
                        transform:rotate(-20deg);
                        box-shadow:0 0 10px #ffff00;
                    "></div>

                    <div style="
                        position:absolute;
                        left:30px;
                        bottom:22px;
                        width:34px;
                        height:14px;
                        border-bottom:4px solid #12000a;
                        border-radius:50%;
                    "></div>

                    <div style="
                        position:absolute;
                        left:3px;
                        top:-18px;
                        width:28px;
                        height:38px;
                        background:#ff1744;
                        clip-path:polygon(0 100%, 30% 0, 100% 70%);
                        border:2px solid #ff0055;
                    "></div>

                    <div style="
                        position:absolute;
                        right:3px;
                        top:-18px;
                        width:28px;
                        height:38px;
                        background:#ff1744;
                        clip-path:polygon(100% 100%, 70% 0, 0 70%);
                        border:2px solid #ff0055;
                    "></div>
                </div>
            `;

        } else {

            el.innerHTML = `
                <div style="
                    position:absolute;
                    inset:5px;

                    background:
                        radial-gradient(
                            circle at 35% 35%,
                            #ff66aa,
                            #8a004d 45%,
                            #300020
                        );

                    border:2px solid #ff00aa;

                    clip-path:polygon(
                        50% 0,
                        90% 20%,
                        100% 60%,
                        75% 100%,
                        25% 100%,
                        0 60%,
                        10% 20%
                    );
                "></div>

                <div style="
                    position:absolute;
                    left:11px;
                    top:16px;
                    width:7px;
                    height:7px;
                    background:#00ffff;
                    box-shadow:0 0 8px #00ffff;
                "></div>

                <div style="
                    position:absolute;
                    right:11px;
                    top:16px;
                    width:7px;
                    height:7px;
                    background:#00ffff;
                    box-shadow:0 0 8px #00ffff;
                "></div>
            `;
        }

        arena.appendChild(el);

        enemy.dom = el;

        enemies.push(enemy);
    }

    /* =====================================================
       9. UPDATE ENEMIES
    ===================================================== */

    function updateEnemies(dt) {

        for (let i = enemies.length - 1; i >= 0; i--) {

            const enemy = enemies[i];

            /*
               Boss hơi di chuyển ngang
            */

            if (enemy.isBoss) {
                enemy.x +=
                    Math.sin(performance.now() / 600) *
                    0.8 *
                    dt;
            }

            enemy.y += enemy.speed * dt;

            enemy.dom.style.left = `${enemy.x}px`;
            enemy.dom.style.top = `${enemy.y}px`;

            /*
               Enemy chạm player
            */

            const distance = Math.hypot(
                enemy.x - player.x,
                enemy.y - player.y
            );

            if (distance < (enemy.isBoss ? 65 : 35)) {

                damagePlayer(enemy.damage);

                destroyEnemy(i);

                continue;
            }

            /*
               Boss không biến mất khi đi xuống
            */

            if (!enemy.isBoss && enemy.y > arena.clientHeight + 60) {

                damagePlayer(5);

                destroyEnemy(i);
            }
        }
    }

    /* =====================================================
       10. BULLETS UPDATE
    ===================================================== */

    function updateBullets(dt) {

        for (let i = bullets.length - 1; i >= 0; i--) {

            const bullet = bullets[i];

            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;

            bullet.element.style.left =
                `${bullet.x - 2}px`;

            bullet.element.style.top =
                `${bullet.y}px`;

            let hit = false;

            for (let j = enemies.length - 1; j >= 0; j--) {

                const enemy = enemies[j];

                const distance = Math.hypot(
                    bullet.x - enemy.x,
                    bullet.y - enemy.y
                );

                if (
                    distance <
                    (enemy.isBoss ? 55 : 27)
                ) {

                    hitEnemy(enemy, bullet.damage);

                    destroyBullet(i);

                    hit = true;

                    break;
                }
            }

            if (
                !hit &&
                (
                    bullet.y < -30 ||
                    bullet.x < -30 ||
                    bullet.x > arena.clientWidth + 30
                )
            ) {
                destroyBullet(i);
            }
        }
    }

    /* =====================================================
       11. HIT ENEMY
    ===================================================== */

    function hitEnemy(enemy, damage) {

        enemy.hp -= damage;

        createHitEffect(
            enemy.x,
            enemy.y
        );

        if (enemy.hp <= 0) {

            const index = enemies.indexOf(enemy);

            if (index !== -1) {

                if (enemy.isBoss) {

                    bossDefeated();

                } else {

                    score += 10 * combo;

                    combo = Math.min(
                        combo + 0.1,
                        5
                    );

                    maybeDropItem(
                        enemy.x,
                        enemy.y
                    );
                }

                destroyEnemy(index);
            }
        }
    }

    /* =====================================================
       12. DESTROY ENEMY
    ===================================================== */

    function destroyEnemy(index) {

        const enemy = enemies[index];

        if (!enemy) return;

        if (enemy.dom) {
            enemy.dom.remove();
        }

        enemies.splice(index, 1);
    }

    /* =====================================================
       13. DESTROY BULLET
    ===================================================== */

    function destroyBullet(index) {

        if (!bullets[index]) return;

        bullets[index].element.remove();

        bullets.splice(index, 1);
    }

    /* =====================================================
       14. DAMAGE PLAYER
    ===================================================== */

    function damagePlayer(amount) {

        if (!player.alive) return;

        if (player.shield) return;

        player.hp -= amount;

        createHitEffect(
            player.x,
            player.y
        );

        updateHUD();

        if (player.hp <= 0) {

            player.hp = 0;

            gameOver();
        }
    }

    /* =====================================================
       15. DROP SYSTEM
    ===================================================== */

    const ITEMS = [

        {
            name: "BOM",
            chance: 10,
            color: "#ff3355"
        },

        {
            name: "TÊN LỬA",
            chance: 10,
            color: "#ff7700"
        },

        {
            name: "QUÉT SẠCH",
            chance: 5,
            color: "#ffffff"
        },

        {
            name: "TĂNG TỐC",
            chance: 15,
            color: "#00ff88"
        },

        {
            name: "TĂNG TỐC BẮN",
            chance: 20,
            color: "#00ffff"
        },

        {
            name: "2 ĐẠN",
            chance: 10,
            color: "#66ffff"
        },

        {
            name: "3 ĐẠN",
            chance: 5,
            color: "#aa66ff"
        },

        {
            name: "ULTRA GUN",
            chance: 10,
            color: "#ff00ff"
        },

        {
            name: "SẤM SÉT",
            chance: 8,
            color: "#ffff00"
        },

        {
            name: "LỬA",
            chance: 6,
            color: "#ff5500"
        },

        {
            name: "BĂNG",
            chance: 6,
            color: "#66ddff"
        }
    ];

    /*
       Tổng tỷ lệ cơ bản thấp.
       Mỗi stage tăng nhẹ.
    */

    function getDropChance() {

        const config = DIFFICULTIES[difficulty];

        let base = 12;

        base += (stage - 1) * 4;

        base += config.dropBonus * 100;

        return Math.min(base, 35);
    }

    function maybeDropItem(x, y) {

        const chance = getDropChance();

        if (Math.random() * 100 > chance) {
            return;
        }

        const totalWeight =
            ITEMS.reduce(
                (sum, item) => sum + item.chance,
                0
            );

        let random =
            Math.random() * totalWeight;

        let selected = ITEMS[0];

        for (const item of ITEMS) {

            random -= item.chance;

            if (random <= 0) {
                selected = item;
                break;
            }
        }

        createDrop(
            x,
            y,
            selected
        );
    }

    /* =====================================================
       16. CREATE DROP
    ===================================================== */

    function createDrop(x, y, item) {

        const el = document.createElement("div");

        Object.assign(el.style, {

            position: "absolute",

            left: `${x}px`,
            top: `${y}px`,

            width: "34px",
            height: "34px",

            transform: "translate(-50%, -50%)",

            border: `2px solid ${item.color}`,

            color: item.color,

            background: "rgba(0,0,0,.7)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            fontSize: "8px",
            fontWeight: "bold",

            textAlign: "center",

            borderRadius: "8px",

            boxShadow:
                `0 0 8px ${item.color},
                 0 0 20px ${item.color}`,

            zIndex: "40"
        });

        el.textContent =
            item.name
                .replace("TĂNG ", "")
                .replace("ĐẠN", "D");

        arena.appendChild(el);

        drops.push({

            x,
            y,

            item,

            life: 8000,

            element: el
        });
    }

    /* =====================================================
       17. UPDATE DROPS
    ===================================================== */

    function updateDrops(dt) {

        for (let i = drops.length - 1; i >= 0; i--) {

            const drop = drops[i];

            drop.life -= dt * 16;

            drop.y += Math.sin(
                performance.now() / 200
            ) * 0.2;

            drop.element.style.left =
                `${drop.x}px`;

            drop.element.style.top =
                `${drop.y}px`;

            const distance = Math.hypot(
                drop.x - player.x,
                drop.y - player.y
            );

            if (distance < 35) {

                collectItem(drop.item);

                drop.element.remove();

                drops.splice(i, 1);

                continue;
            }

            if (drop.life <= 0) {

                drop.element.remove();

                drops.splice(i, 1);
            }
        }
    }

    /* =====================================================
       18. COLLECT ITEM
    ===================================================== */

    function collectItem(item) {

        showMessage(
            `⚡ ${item.name} ACTIVATED`
        );

        switch (item.name) {

            case "BOM":

                enemies.forEach(e => {
                    e.hp -= 40;
                });

                break;

            case "TÊN LỬA":

                enemies.forEach(e => {
                    e.hp -= 70;
                });

                break;

            case "QUÉT SẠCH":

                enemies.forEach(e => {
                    if (!e.isBoss) {
                        e.hp = 0;
                    }
                });

                break;

            case "TĂNG TỐC":

                player.speedBoost = 1.6;

                setTimeout(() => {
                    player.speedBoost = 1;
                }, 7000);

                break;

            case "TĂNG TỐC BẮN":

                player.fireRate *= 0.55;

                setTimeout(() => {
                    player.fireRate /= 0.55;
                }, 8000);

                break;

            case "2 ĐẠN":

                player.projectileCount =
                    Math.max(
                        player.projectileCount,
                        2
                    );

                break;

            case "3 ĐẠN":

                player.projectileCount = 3;

                break;

            case "ULTRA GUN":

                player.damage += 20;

                player.fireRate *= 0.65;

                break;

            case "SẤM SÉT":

                player.elemental =
                    "thunder";

                player.damage += 25;

                break;

            case "LỬA":

                player.elemental =
                    "fire";

                player.damage += 20;

                break;

            case "BĂNG":

                player.elemental =
                    "ice";

                player.damage += 18;

                break;
        }

        updateHUD();
    }

    /* =====================================================
       19. BOSS
    ===================================================== */

    function spawnBoss() {

        if (bossAlive) return;

        bossAlive = true;

        createEnemy(true);

        showMessage(
            `☠ BOSS ĐÃ XUẤT HIỆN - STAGE ${stage}`
        );
    }

    function bossDefeated() {

        bossAlive = false;

        score += 1000 * stage;

        createExplosion(
            player.x,
            player.y - 100
        );

        /*
           EASY + NORMAL:
           nhận PET sau khi hạ boss
        */

        if (
            (difficulty === "easy" ||
             difficulty === "normal") &&
            !pet
        ) {

            createPet();

            showMessage(
                "🐾 PET ĐÃ THAM GIA CHIẾN ĐẤU!"
            );
        }

        setTimeout(() => {

            if (stage < STAGES) {

                stage++;

                wave++;

                enemies.forEach(e => {
                    if (e.dom) e.dom.remove();
                });

                enemies = [];

                showMessage(
                    `STAGE ${stage}/5`
                );

            } else {

                victory();
            }

        }, 2200);
    }

    /* =====================================================
       20. PET
    ===================================================== */

    function createPet() {

        pet = {

            x: player.x - 70,
            y: player.y,

            damage: player.damage,

            fireRate: player.fireRate,

            element: document.createElement("div")
        };

        Object.assign(pet.element.style, {

            position: "absolute",

            width: "30px",
            height: "30px",

            transform: "translate(-50%, -50%)",

            background:
                "radial-gradient(circle, #ffccff, #aa00ff)",

            border:
                "2px solid #ff66ff",

            borderRadius: "50%",

            boxShadow:
                "0 0 10px #ff00ff," +
                "0 0 25px #aa00ff",

            zIndex: "45"
        });

        arena.appendChild(pet.element);

        pet.element.innerHTML = `
            <div style="
                position:absolute;
                left:6px;
                top:8px;
                width:6px;
                height:6px;
                background:#000;
                border-radius:50%;
            "></div>

            <div style="
                position:absolute;
                right:6px;
                top:8px;
                width:6px;
                height:6px;
                background:#000;
                border-radius:50%;
            "></div>
        `;
    }

    function updatePet() {

        if (!pet) return;

        pet.x +=
            (player.x - 70 - pet.x) * 0.08;

        pet.y +=
            (player.y - pet.y) * 0.08;

        pet.element.style.left =
            `${pet.x}px`;

        pet.element.style.top =
            `${pet.y}px`;
    }

    /* =====================================================
       21. PET AUTO ATTACK
    ===================================================== */

    let petShootTimer = 0;

    function petShoot(now) {

        if (!pet) return;

        if (now - petShootTimer < 650) {
            return;
        }

        petShootTimer = now;

        let target = null;

        let closest = Infinity;

        enemies.forEach(enemy => {

            const distance = Math.hypot(
                enemy.x - pet.x,
                enemy.y - pet.y
            );

            if (distance < closest) {

                closest = distance;

                target = enemy;
            }
        });

        if (!target) return;

        const angle = Math.atan2(
            target.y - pet.y,
            target.x - pet.x
        );

        const el = document.createElement("div");

        Object.assign(el.style, {

            position: "absolute",

            width: "7px",
            height: "7px",

            background: "#ff00ff",

            borderRadius: "50%",

            boxShadow:
                "0 0 8px #ff00ff," +
                "0 0 15px #ff00ff",

            zIndex: "40"
        });

        arena.appendChild(el);

        enemyBullets.push({

            x: pet.x,
            y: pet.y,

            vx: Math.cos(angle) * 7,
            vy: Math.sin(angle) * 7,

            damage: pet.damage,

            element: el
        });
    }

    /* =====================================================
       22. ENEMY BULLETS
    ===================================================== */

    function updateEnemyBullets(dt) {

        for (
            let i = enemyBullets.length - 1;
            i >= 0;
            i--
        ) {

            const bullet =
                enemyBullets[i];

            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;

            bullet.element.style.left =
                `${bullet.x}px`;

            bullet.element.style.top =
                `${bullet.y}px`;

            const distance = Math.hypot(
                bullet.x - player.x,
                bullet.y - player.y
            );

            if (distance < 25) {

                damagePlayer(
                    bullet.damage
                );

                bullet.element.remove();

                enemyBullets.splice(i, 1);

                continue;
            }

            if (
                bullet.x < -30 ||
                bullet.x > arena.clientWidth + 30 ||
                bullet.y < -30 ||
                bullet.y > arena.clientHeight + 30
            ) {

                bullet.element.remove();

                enemyBullets.splice(i, 1);
            }
        }
    }

    /* =====================================================
       23. EFFECTS
    ===================================================== */

    function createHitEffect(x, y) {

        for (let i = 0; i < 5; i++) {

            const p =
                document.createElement("div");

            Object.assign(p.style, {

                position: "absolute",

                left: `${x}px`,
                top: `${y}px`,

                width: "5px",
                height: "5px",

                background: "#00ffff",

                borderRadius: "50%",

                boxShadow:
                    "0 0 10px #00ffff",

                zIndex: "60"
            });

            arena.appendChild(p);

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                Math.random() * 4 + 2;

            let life = 20;

            const timer =
                setInterval(() => {

                    p.style.left =
                        `${x +
                        Math.cos(angle) *
                        speed *
                        (20 - life)}px`;

                    p.style.top =
                        `${y +
                        Math.sin(angle) *
                        speed *
                        (20 - life)}px`;

                    life--;

                    if (life <= 0) {

                        clearInterval(timer);

                        p.remove();
                    }

                }, 20);
        }
    }

    function createExplosion(x, y) {

        const ring =
            document.createElement("div");

        Object.assign(ring.style, {

            position: "absolute",

            left: `${x}px`,
            top: `${y}px`,

            width: "20px",
            height: "20px",

            transform:
                "translate(-50%, -50%)",

            border:
                "5px solid #ff00ff",

            borderRadius: "50%",

            boxShadow:
                "0 0 20px #ff00ff",

            zIndex: "100"
        });

        arena.appendChild(ring);

        let size = 20;

        const timer =
            setInterval(() => {

                size += 20;

                ring.style.width =
                    `${size}px`;

                ring.style.height =
                    `${size}px`;

                ring.style.opacity =
                    `${1 - size / 300}`;

                if (size >= 300) {

                    clearInterval(timer);

                    ring.remove();
                }

            }, 25);
    }

    /* =====================================================
       24. SPAWN ENEMIES
    ===================================================== */

    function spawnEnemies(dt) {

        if (bossAlive) return;

        /*
           Stage 5 = boss
        */

        if (stage === 5) {

            if (enemies.length === 0) {

                spawnBoss();
            }

            return;
        }

        enemySpawnTimer += dt;

        const spawnRate =
            Math.max(
                650,
                1300 -
                stage * 100
            );

        if (
            enemySpawnTimer >= spawnRate &&
            enemies.length < 8 + stage
        ) {

            enemySpawnTimer = 0;

            createEnemy(false);
        }
    }

    /* =====================================================
       25. HUD
    ===================================================== */

    function updateHUD() {

        const scoreEl =
            document.querySelector("#score");

        const waveEl =
            document.querySelector("#wave");

        const stageEl =
            document.querySelector("#stage");

        const hpEl =
            document.querySelector("#hp");

        if (scoreEl) {
            scoreEl.textContent =
                Math.floor(score);
        }

        if (waveEl) {
            waveEl.textContent =
                `S${stage} / W${wave}`;
        }

        if (stageEl) {

            stageEl.textContent =
                `${DIFFICULTIES[difficulty].name}
                 • STAGE ${stage}/5`;
        }

        if (hpEl) {

            hpEl.textContent =
                Math.ceil(player.hp);
        }

        const hpBar =
            document.querySelector("#hpBar");

        if (hpBar) {

            hpBar.style.width =
                `${Math.max(
                    0,
                    player.hp /
                    player.maxHp *
                    100
                )}%`;
        }
    }

    /* =====================================================
       26. MESSAGE
    ===================================================== */

    function showMessage(text) {

        const old =
            document.querySelector(
                ".game-message"
            );

        if (old) old.remove();

        const msg =
            document.createElement("div");

        msg.className =
            "game-message";

        Object.assign(msg.style, {

            position: "absolute",

            left: "50%",
            top: "30%",

            transform:
                "translate(-50%, -50%)",

            color: "#00ffff",

            fontSize: "22px",

            fontWeight: "bold",

            letterSpacing: "3px",

            textShadow:
                "0 0 10px #00ffff," +
                "0 0 25px #00ffff",

            zIndex: "200",

            pointerEvents: "none"
        });

        msg.textContent = text;

        arena.appendChild(msg);

        setTimeout(() => {

            msg.remove();

        }, 1800);
    }

    /* =====================================================
       27. GAME OVER
    ===================================================== */

    function gameOver() {

        gameRunning = false;

        showMessage(
            "☠ SYSTEM FAILURE"
        );

        setTimeout(() => {

            if (
                confirm(
                    `GAME OVER\nĐiểm: ${Math.floor(score)}\nChơi lại?`
                )
            ) {

                location.reload();
            }

        }, 500);
    }

    /* =====================================================
       28. VICTORY
    ===================================================== */

    function victory() {

        gameRunning = false;

        createExplosion(
            arena.clientWidth / 2,
            arena.clientHeight / 2
        );

        showMessage(
            "★ CYBERARENA CLEARED ★"
        );

        setTimeout(() => {

            alert(
                `🏆 CHIẾN THẮNG!\n\n` +
                `Độ khó: ${DIFFICULTIES[difficulty].name}\n` +
                `Điểm: ${Math.floor(score)}\n` +
                `Hoàn thành 5/5 màn!`
            );

        }, 1500);
    }

    /* =====================================================
       29. MAIN LOOP
    ===================================================== */

    function gameLoop(now) {

        const delta =
            Math.min(
                now - lastTime,
                50
            );

        lastTime = now;

        const dt =
            delta / 16.67;

        if (gameRunning) {

            movePlayer(dt);

            autoShoot(now);

            petShoot(now);

            spawnEnemies(dt);

            updateEnemies(dt);

            updateBullets(dt);

            updateEnemyBullets(dt);

            updateDrops(dt);

            updatePet();

            updateHUD();
        }

        requestAnimationFrame(
            gameLoop
        );
    }

    /* =====================================================
       30. DIFFICULTY DETECTION
    ===================================================== */

    function detectDifficulty() {

        const text =
            document.body.innerText
                .toLowerCase();

        if (text.includes("dễ")) {
            difficulty = "easy";
        }

        if (text.includes("khó")) {
            difficulty = "hard";
        }

        /*
           Mặc định:
           BÌNH THƯỜNG
        */

        updateHUD();
    }

    /* =====================================================
       31. INITIALIZE
    ===================================================== */

    detectDifficulty();

    player.x =
        arena.clientWidth / 2;

    player.y =
        arena.clientHeight - 110;

    playerElement.style.left =
        `${player.x}px`;

    playerElement.style.top =
        `${player.y}px`;

    /*
       Spawn một vài quái ngay khi bắt đầu
       để màn hình không còn trống.
    */

    setTimeout(() => {

        createEnemy(false);
        createEnemy(false);

    }, 500);

    updateHUD();

    showMessage(
        "⚡ CYBERARENA ONLINE"
    );

    requestAnimationFrame(
        gameLoop
    );

})();
