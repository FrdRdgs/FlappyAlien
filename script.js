const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const finalScoreElement = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");


// ============================
// CONFIGURAÇÕES
// ============================

const gravity = 0.4;
const jumpStrength = -7;

const pipeWidth = 65;
const pipeGap = 160;
const pipeSpeed = 2.5;


// ============================
// ESTADO DO JOGO
// ============================

let gameRunning = false;
let score = 0;

let highScore = localStorage.getItem("alienFlappyHighScore") || 0;

highScoreElement.textContent = highScore;


// ============================
// ALIENÍGENA
// ============================

const alien = {
    x: 80,
    y: 250,

    width: 40,
    height: 30,

    velocity: 0,

    reset() {
        this.y = 250;
        this.velocity = 0;
    },

    jump() {
        this.velocity = jumpStrength;
    },

    update() {
        this.velocity += gravity;
        this.y += this.velocity;
    },

    draw() {

        // Corpo
        ctx.fillStyle = "#39ff88";

        ctx.beginPath();
        ctx.ellipse(
            this.x + 20,
            this.y + 17,
            20,
            15,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Cabeça
        ctx.fillStyle = "#52ff9a";

        ctx.beginPath();
        ctx.ellipse(
            this.x + 20,
            this.y + 10,
            15,
            12,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Olhos
        ctx.fillStyle = "#061b30";

        ctx.beginPath();
        ctx.ellipse(
            this.x + 14,
            this.y + 9,
            4,
            6,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(
            this.x + 26,
            this.y + 9,
            4,
            6,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Antena
        ctx.strokeStyle = "#39ff88";
        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 20, this.y - 8);

        ctx.stroke();


        ctx.fillStyle = "#69cfff";

        ctx.beginPath();
        ctx.arc(
            this.x + 20,
            this.y - 9,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
};


// ============================
// OBSTÁCULOS
// ============================

let pipes = [];

function createPipe() {

    const minHeight = 80;
    const maxHeight = canvas.height - pipeGap - 80;

    const topHeight =
        Math.random() * (maxHeight - minHeight) + minHeight;

    pipes.push({
        x: canvas.width,

        topHeight: topHeight,

        bottomY: topHeight + pipeGap,

        passed: false
    });
}


function updatePipes() {

    for (let pipe of pipes) {

        pipe.x -= pipeSpeed;


        // Pontuação
        if (
            !pipe.passed &&
            pipe.x + pipeWidth < alien.x
        ) {

            pipe.passed = true;

            score++;

            scoreElement.textContent = score;
        }
    }


    // Remove obstáculos antigos
    pipes = pipes.filter(
        pipe => pipe.x + pipeWidth > 0
    );


    // Cria novos obstáculos
    if (
        pipes.length === 0 ||
        pipes[pipes.length - 1].x < 220
    ) {
        createPipe();
    }
}


function drawPipe(pipe) {

    // Parte superior
    ctx.fillStyle = "#0bc46b";

    ctx.fillRect(
        pipe.x,
        0,
        pipeWidth,
        pipe.topHeight
    );


    // Borda
    ctx.fillStyle = "#39ff88";

    ctx.fillRect(
        pipe.x - 5,
        pipe.topHeight - 20,
        pipeWidth + 10,
        20
    );


    // Parte inferior
    ctx.fillStyle = "#0bc46b";

    ctx.fillRect(
        pipe.x,
        pipe.bottomY,
        pipeWidth,
        canvas.height - pipe.bottomY
    );


    // Borda inferior
    ctx.fillStyle = "#39ff88";

    ctx.fillRect(
        pipe.x - 5,
        pipe.bottomY,
        pipeWidth + 10,
        20
    );
}


// ============================
// FUNDO ESPACIAL
// ============================

const stars = [];

for (let i = 0; i < 70; i++) {

    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2
    });
}


function drawBackground() {

    // Fundo
    ctx.fillStyle = "#061b30";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Estrelas
    for (let star of stars) {

        ctx.fillStyle = "#69cfff";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        if (gameRunning) {

            star.x -= star.speed;

            if (star.x < 0) {
                star.x = canvas.width;
            }
        }
    }
}


// ============================
// COLISÕES
// ============================

function checkCollision() {

    // Limites da tela
    if (
        alien.y <= 0 ||
        alien.y + alien.height >= canvas.height
    ) {
        return true;
    }


    for (let pipe of pipes) {

        const alienRight =
            alien.x + alien.width;

        const alienBottom =
            alien.y + alien.height;


        const pipeRight =
            pipe.x + pipeWidth;


        const horizontalCollision =
            alienRight > pipe.x &&
            alien.x < pipeRight;


        const verticalCollision =
            alien.y < pipe.topHeight ||
            alienBottom > pipe.bottomY;


        if (
            horizontalCollision &&
            verticalCollision
        ) {
            return true;
        }
    }


    return false;
}


// ============================
// GAME OVER
// ============================

function gameOver() {

    gameRunning = false;

    finalScoreElement.textContent = score;

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "alienFlappyHighScore",
            highScore
        );

        highScoreElement.textContent = highScore;
    }

    gameOverScreen.classList.remove("hidden");
}


// ============================
// INICIAR JOGO
// ============================

function startGame() {

    gameRunning = true;

    score = 0;

    scoreElement.textContent = score;

    alien.reset();

    pipes = [];

    createPipe();

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
}


// ============================
// LOOP PRINCIPAL
// ============================

function gameLoop() {

    drawBackground();


    if (gameRunning) {

        alien.update();

        updatePipes();


        if (checkCollision()) {
            gameOver();
        }
    }


    // Desenha obstáculos
    for (let pipe of pipes) {
        drawPipe(pipe);
    }


    // Desenha alienígena
    alien.draw();


    requestAnimationFrame(gameLoop);
}


// ============================
// CONTROLES
// ============================

document.addEventListener("keydown", event => {

    if (event.code === "Space") {

        event.preventDefault();

        if (!gameRunning) {
            startGame();
        }

        alien.jump();
    }
});


canvas.addEventListener("click", () => {

    if (gameRunning) {
        alien.jump();
    }
});


startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


// Inicia o loop
gameLoop();