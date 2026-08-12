/* ========================================
   NÉ VẬT CẢN - GAME ENGINE
======================================== */

// ================================
// LẤY CÁC ELEMENT
// ================================

const game = document.getElementById("game");
const player = document.getElementById("player");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");

const finalScoreText = document.getElementById("final-score");


// ================================
// BIẾN GAME
// ================================

let gameRunning = false;

let score = 0;
let lives = 3;

let playerX = 0;

let obstacles = [];

let gameLoop;
let obstacleTimer;
let scoreTimer;

let obstacleSpeed = 4;
let spawnRate = 900;


// ================================
// KHỞI TẠO NHÂN VẬT
// ================================

function resetPlayer() {

    playerX =
        game.clientWidth / 2 - player.offsetWidth / 2;

    player.style.left = playerX + "px";
}


// ================================
// CẬP NHẬT UI
// ================================

function updateUI() {

    scoreText.textContent = score;
    livesText.textContent = lives;

}


// ================================
// BẮT ĐẦU GAME
// ================================

function startGame() {

    // Reset dữ liệu

    score = 0;
    lives = 3;

    obstacleSpeed = 4;
    spawnRate = 900;

    obstacles = [];

    updateUI();

    // Xóa vật cản cũ

    document
        .querySelectorAll(".obstacle")
        .forEach(obstacle => obstacle.remove());


    // Ẩn màn hình bắt đầu

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");


    // Đặt nhân vật

    resetPlayer();


    gameRunning = true;


    // Bắt đầu vòng lặp

    gameLoop = requestAnimationFrame(updateGame);


    // Sinh vật cản

    obstacleTimer = setInterval(
        createObstacle,
        spawnRate
    );


    // Tăng điểm

    scoreTimer = setInterval(() => {

        if (!gameRunning) return;

        score++;

        updateUI();

        // Tăng độ khó

        if (score % 10 === 0) {

            obstacleSpeed += 0.5;

            if (spawnRate > 300) {

                spawnRate -= 50;

                clearInterval(obstacleTimer);

                obstacleTimer = setInterval(
                    createObstacle,
                    spawnRate
                );
            }
        }

    }, 1000);

}


// ================================
// TẠO VẬT CẢN
// ================================

function createObstacle() {

    if (!gameRunning) return;


    const obstacle = document.createElement("div");

    obstacle.classList.add("obstacle");


    // Vị trí X ngẫu nhiên

    const maxX =
        game.clientWidth - 45;

    const x =
        Math.random() * maxX;


    obstacle.style.left = x + "px";

    obstacle.style.top = "-50px";


    game.appendChild(obstacle);


    obstacles.push({

        element: obstacle,

        x: x,

        y: -50

    });

}


// ================================
// VÒNG LẶP GAME
// ================================

function updateGame() {

    if (!gameRunning) return;


    moveObstacles();

    checkCollisions();


    gameLoop =
        requestAnimationFrame(updateGame);

}


// ================================
// DI CHUYỂN VẬT CẢN
// ================================

function moveObstacles() {

    obstacles.forEach((obstacle, index) => {

        obstacle.y += obstacleSpeed;


        obstacle.element.style.top =
            obstacle.y + "px";


        // Xóa vật cản khi ra khỏi màn hình

        if (
            obstacle.y >
            game.clientHeight + 60
        ) {

            obstacle.element.remove();

            obstacles.splice(index, 1);

        }

    });

}


// ================================
// KIỂM TRA VA CHẠM
// ================================

function checkCollisions() {

    const playerRect =
        player.getBoundingClientRect();


    obstacles.forEach((obstacle, index) => {

        const obstacleRect =
            obstacle.element.getBoundingClientRect();


        if (
            playerRect.left <
            obstacleRect.right &&

            playerRect.right >
            obstacleRect.left &&

            playerRect.top <
            obstacleRect.bottom &&

            playerRect.bottom >
            obstacleRect.top
        ) {

            hitObstacle(obstacle, index);

        }

    });

}


// ================================
// KHI NHÂN VẬT BỊ ĐÂM
// ================================

function hitObstacle(obstacle, index) {

    // Xóa vật cản

    obstacle.element.remove();

    obstacles.splice(index, 1);


    // Trừ mạng

    lives--;

    updateUI();


    // Hiệu ứng damage

    player.classList.add("damage");

    setTimeout(() => {

        player.classList.remove("damage");

    }, 250);


    // Kiểm tra Game Over

    if (lives <= 0) {

        endGame();

    }

}


// ================================
// KẾT THÚC GAME
// ================================

function endGame() {

    gameRunning = false;


    // Dừng các timer

    cancelAnimationFrame(gameLoop);

    clearInterval(obstacleTimer);
    clearInterval(scoreTimer);


    // Hiển thị điểm

    finalScoreText.textContent = score;


    // Hiện Game Over

    gameOverScreen.classList.remove("hidden");

}


// ================================
// ĐIỀU KHIỂN NHÂN VẬT
// ================================

const keys = {

    left: false,

    right: false

};


// Nhấn phím

document.addEventListener("keydown", event => {

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {

        keys.left = true;

    }


    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {

        keys.right = true;

    }

});


// Thả phím

document.addEventListener("keyup", event => {

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {

        keys.left = false;

    }


    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {

        keys.right = false;

    }

});


// ================================
// DI CHUYỂN NHÂN VẬT
// ================================

function movePlayer() {

    if (!gameRunning) return;


    const speed = 7;


    if (keys.left) {

        playerX -= speed;

    }


    if (keys.right) {

        playerX += speed;

    }


    // Giới hạn bên trái

    if (playerX < 0) {

        playerX = 0;

    }


    // Giới hạn bên phải

    const maxX =
        game.clientWidth -
        player.offsetWidth;


    if (playerX > maxX) {

        playerX = maxX;

    }


    player.style.left =
        playerX + "px";

}


// ================================
// VÒNG LẶP DI CHUYỂN
// ================================

setInterval(() => {

    movePlayer();

}, 16);


// ================================
// NÚT BẮT ĐẦU
// ================================

startButton.addEventListener(
    "click",
    startGame
);


// ================================
// NÚT CHƠI LẠI
// ================================

restartButton.addEventListener(
    "click",
    startGame
);


// ================================
// RESIZE WINDOW
// ================================

window.addEventListener(
    "resize",
    () => {

        if (!gameRunning) {

            resetPlayer();

        }

    }
);


// ================================
// KHỞI TẠO
// ================================

resetPlayer();
updateUI();