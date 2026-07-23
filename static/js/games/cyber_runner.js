/**
 * Cartucho de Juego: Cyber Runner
 * Implementación POO pura.
 */

class Player {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = 30;
        this.height = 30;
        this.x = 50;
        this.y = this.canvas.height - this.height;
        this.vy = 0;
        this.gravity = 0.8;
        this.jumpPower = -12;
        this.isGrounded = true;
    }

    jump() {
        if (this.isGrounded) {
            this.vy = this.jumpPower;
            this.isGrounded = false;
        }
    }

    update() {
        this.vy += this.gravity;
        this.y += this.vy;

        if (this.y + this.height >= this.canvas.height) {
            this.y = this.canvas.height - this.height;
            this.vy = 0;
            this.isGrounded = true;
        }
    }

    draw() {
        this.ctx.fillStyle = '#00ffff'; 
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.shadowBlur = 0; 
    }
}

class Obstacle {
    // AHORA: Recibe x, y, width, height para ser dinámico (suelo o aire)
    constructor(canvas, ctx, x, y, width, height, speed) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        this.ctx.fillStyle = '#ff00ff'; 
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Exportamos la clase principal para que el Gestor pueda instanciarla
export class CyberRunner {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.player = new Player(this.canvas, this.ctx);
        this.obstacles = [];
        
        this.score = 0;
        this.gameSpeed = 6;
        this.frameTimer = 0;
        this.isGameOver = false;
        this.animationId = null;
        this.highScore = localStorage.getItem('cyber_runner_hi') || 0;

        document.getElementById('hi-score-display').textContent = 'HI: ' + Math.floor(this.highScore);
        this.scoreElement = document.getElementById('score-display');
        this.gameOverScreen = document.getElementById('game-over-screen');
        
        this.bindEvents();
    }

    bindEvents() {
        // Unificamos toda la lógica de salto y reinicio en una sola función
        const jumpAction = (e) => {
            if (e.type === 'keydown' && e.code === 'Space') e.preventDefault(); 
            if (this.isGameOver) {
                this.reset();
            } else {
                this.player.jump();
            }
        };

        // Escuchadores de eventos limpios y sin duplicados
        window.addEventListener('keydown', (e) => { if(e.code === 'Space') jumpAction(e); });
        this.canvas.addEventListener('mousedown', jumpAction);
        this.canvas.addEventListener('touchstart', jumpAction, {passive: false});
    }

    spawnObstacle() {
        if (this.frameTimer <= 0) {
            const size = 30; // Mismo tamaño que el jugador
            const x = this.canvas.width;
            let y;
            
            // 35% de probabilidad de que sea aéreo
            const isAirObstacle = Math.random() < 0.35; 

            if (isAirObstacle) {
                // Aéreo: Pasa por arriba de ti (Y=220). Si saltas, te golpeas.
                y = this.canvas.height - size - 50; 
            } else {
                // Suelo: Exactamente en la misma línea base que el jugador (Y=270)
                y = this.canvas.height - size;
            }

            this.obstacles.push(new Obstacle(this.canvas, this.ctx, x, y, size, size, this.gameSpeed));
            
            // FÓRMULA DE DIFICULTAD: El tiempo de aparición se reduce mientras más rápido vas
            const minFrames = 400 / this.gameSpeed; 
            const maxFrames = 900 / this.gameSpeed;
            this.frameTimer = Math.random() * (maxFrames - minFrames) + minFrames; 
        }
        
        this.frameTimer--;
    }

    checkCollision(obs) {
        return (
            this.player.x < obs.x + obs.width &&
            this.player.x + this.player.width > obs.x &&
            this.player.y < obs.y + obs.height &&
            this.player.y + this.player.height > obs.y
        );
    }

    update() {
        if (this.isGameOver) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.update();
        this.player.draw();
        this.spawnObstacle();

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.update();
            obs.draw();

            if (this.checkCollision(obs)) {
                this.isGameOver = true;
                this.gameOverScreen.style.display = 'flex';
            }

            if (obs.x + obs.width < 0) {
                this.obstacles.splice(i, 1);
                this.score += 10;
                
                // AUMENTO DE VELOCIDAD: Más rápido, pero con límite máximo de 18
                if (this.gameSpeed < 1800) {
                    this.gameSpeed += 0.15; 
                }

                this.scoreElement.textContent = `SCORE: ${this.score}`;
                
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('cyber_runner_hi', Math.floor(this.highScore));
                    document.getElementById('hi-score-display').textContent = 'HI: ' + Math.floor(this.highScore);
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this.update());
    }

    start() {
        this.reset();
    }

    stop() {
        cancelAnimationFrame(this.animationId);
    }

    reset() {
        this.player = new Player(this.canvas, this.ctx);
        this.obstacles = [];
        this.score = 0;
        this.gameSpeed = 6;
        this.frameTimer = 0; // Reiniciamos el timer para no tener spawn inmediato
        this.isGameOver = false;
        this.scoreElement.textContent = 'SCORE: 0';
        this.gameOverScreen.style.display = 'none';
        
        cancelAnimationFrame(this.animationId);
        this.update();
    }
}