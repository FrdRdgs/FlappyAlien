const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const finalScoreElement = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const powerButton = document.getElementById("powerButton");
const powerStatus = document.getElementById("powerStatus");


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
let powerReady = true;
let projectile = null;

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
// PODER DO ALIENÍGENA
// ============================

function usePower() {

    if (!gameRunning || !powerReady) {
        return;
    }

    powerReady = false;

    powerStatus.textContent = "USADO";
    powerButton.disabled = true;

    projectile = {
        x: alien.x + alien.width,
        y: alien.y + alien.height / 2,

        width: 30,
        height: 6,

        speed: 8
    };
}


function updateProjectile() {

    if (!projectile) {
        return;
    }

    projectile.x += projectile.speed;


    // Verifica se atingiu algum obstáculo
    for (let pipe of pipes) {

        const projectileRight =
            projectile.x + projectile.width;

        const projectileBottom =
            projectile.y + projectile.height;

        const pipeRight =
            pipe.x + pipeWidth;


        const horizontalCollision =
            projectileRight > pipe.x &&
            projectile.x < pipeRight;


        const verticalCollision =
            projectile.y < pipe.topHeight ||
            projectileBottom > pipe.bottomY;


        if (
            horizontalCollision &&
            verticalCollision
        ) {

            // Marca o obstáculo para remoção
            pipe.destroyed = true;

            projectile = null;

            return;
        }
    }


    // Remove o disparo quando sair da tela
    if (projectile.x > canvas.width) {
        projectile = null;
    }
}


function drawProjectile() {

    if (!projectile) {
        return;
    }

    ctx.fillStyle = "#69cfff";

    ctx.shadowColor = "#69cfff";
    ctx.shadowBlur = 15;

    ctx.fillRect(
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
    );

    ctx.shadowBlur = 0;
}

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


    // Remove obstáculos destruídos
    // ou que já saíram da tela
    pipes = pipes.filter(
        pipe =>
            !pipe.destroyed &&
            pipe.x + pipeWidth > 0
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
const planets = [];

// Estrelas
for (let i = 0; i < 70; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2
    });
}

// Planetas
planets.push(
    {
        x: 70,
        y: 100,
        radius: 35,
        color: "#1464a5",
        atmosphere: "#69cfff",
        speed: 0.15
    },
    {
        x: 330,
        y: 180,
        radius: 22,
        color: "#0b8f63",
        atmosphere: "#39ff88",
        speed: 0.25
    },
    {
        x: 280,
        y: 480,
        radius: 45,
        color: "#164b72",
        atmosphere: "#69cfff",
        speed: 0.1
    }
);


function drawBackground() {

    // Fundo espacial
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(0, "#020b18");
    gradient.addColorStop(1, "#062b3d");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ============================
    // PLANETAS
    // ============================

    for (let planet of planets) {

        // Atmosfera
        ctx.beginPath();

        ctx.arc(
            planet.x,
            planet.y,
            planet.radius + 5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = planet.atmosphere;
        ctx.globalAlpha = 0.15;

        ctx.fill();

        ctx.globalAlpha = 1;


        // Planeta
        const planetGradient = ctx.createRadialGradient(
            planet.x - planet.radius * 0.35,
            planet.y - planet.radius * 0.35,
            2,
            planet.x,
            planet.y,
            planet.radius
        );

        planetGradient.addColorStop(
            0,
            planet.atmosphere
        );

        planetGradient.addColorStop(
            0.5,
            planet.color
        );

        planetGradient.addColorStop(
            1,
            "#02111f"
        );

        ctx.beginPath();

        ctx.arc(
            planet.x,
            planet.y,
            planet.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = planetGradient;

        ctx.fill();


        // Anel em alguns planetas
        if (planet.radius > 30) {

            ctx.beginPath();

            ctx.ellipse(
                planet.x,
                planet.y,
                planet.radius * 1.5,
                planet.radius * 0.35,
                -0.2,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle = planet.atmosphere;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 3;

            ctx.stroke();

            ctx.globalAlpha = 1;
        }


        // Movimento lento
        if (gameRunning) {

            planet.x -= planet.speed;

            if (
                planet.x + planet.radius < 0
            ) {
                planet.x =
                    canvas.width + planet.radius;
            }
        }
    }


    // ============================
    // ESTRELAS
    // ============================

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

        updateProjectile();

        if (checkCollision()) {
            gameOver();
        }
    }


    // Desenha obstáculos
    for (let pipe of pipes) {
        drawPipe(pipe);
    }

    // Desenha disparo
    drawProjectile();

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

    if (event.code === "KeyE") {

    event.preventDefault();

    usePower();
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

powerButton.addEventListener(
    "click",
    usePower
);

// Inicia o loop
gameLoop();