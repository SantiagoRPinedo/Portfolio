// static/js/games/breakout.js

class BreakoutPowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'multi', 'fast', 'slow', 'pierce'
        this.width = 30;
        this.height = 15;
        this.speed = 2;
        this.markedForDeletion = false;

        // Configuración visual según el tipo
        const configs = {
            'multi':  { color: '#00ff00', text: 'x3' },   // Verde
            'fast':   { color: '#ff0000', text: '>>' },   // Rojo
            'slow':   { color: '#00ffff', text: '<<' },   // Cyan
            'pierce': { color: '#ff00ff', text: '///' }   // Magenta
        };
        this.color = configs[type].color;
        this.text = configs[type].text;
    }

    update(canvasHeight) {
        this.y += this.speed;
        if (this.y > canvasHeight) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = '#050510';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.color;
        ctx.font = '10px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width/2, this.y + this.height/2);
    }
}

export class Breakout {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score-display');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.hiScoreElement = document.getElementById('hi-score-display');
        
        this.highScore = localStorage.getItem('breakout_hi') || 0;
        this.canvas.width = 700; 
        this.canvas.height = 500;
        this.animationId = null;
        this.isRunning = false;

        this.keys = {};
        this.handleKeyDown = (e) => { this.keys[e.key] = true; };
        this.handleKeyUp = (e) => { this.keys[e.key] = false; };
        this.handleRestart = (e) => {
            if (!this.isRunning && (e.key === ' ' || e.code === 'Space' || e.type === 'click')) {
                this.initGame();
                this.loop();
            }
        };
    }

    initGame() {
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1; // Empezamos en el Nivel 1
        this.isRunning = true;
        this.powerUps = [];
        this.pierceTimer = 0; // Temporizador para el modo Láser
        this.gameOverScreen.style.display = 'none';
        
        this.updateScoreDisplay();
        this.initEntities();
        this.buildDynamicLevel(this.currentLevel);
    }

    initEntities() {
        this.paddle = {
            width: 100,
            height: 15,
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height - 30,
            speed: 8,
            color: '#00ffff'
        };

        // Ahora usamos un arreglo de pelotas para permitir Multi-ball
        this.balls = [this.createBall(this.canvas.width / 2, this.canvas.height - 50, 5.5)];
        this.powerUps = [];
        this.pierceTimer = 0;
    }

    createBall(x, y, speed) {
        return {
            radius: 6,
            x: x,
            y: y,
            vx: speed * 0.7 * (Math.random() > 0.5 ? 1 : -1),
            vy: -speed * 0.7,
            speed: speed,
            color: '#ffffff' // Color base, cambiará si es Pierce
        };
    }

    // Generador procedural de niveles
    buildDynamicLevel(level) {
        this.bricks = [];
        // Aumenta filas y columnas progresivamente. Tope en nivel 10.
        const effectiveLevel = Math.min(level, 10); 
        
        const rows = 3 + Math.floor(effectiveLevel / 2); // Nivel 1: 3, Nivel 10: 8 filas
        const cols = 6 + effectiveLevel;                 // Nivel 1: 7, Nivel 10: 16 columnas
        
        const padding = 5;
        const offsetTop = 50;
        const offsetLeft = 20;
        
        const brickWidth = (this.canvas.width - (offsetLeft * 2) - (padding * (cols - 1))) / cols;
        const brickHeight = Math.max(15, 25 - effectiveLevel); // Se hacen más bajitos en niveles altos

        const colors = ['#00ffff', '#00ff00', '#ffff00', '#ff0000'];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Posibilidad de dejar "huecos" en niveles altos para hacer patrones
                if (Math.random() > 0.1 || effectiveLevel < 3) {
                    // El color (y dureza visual) se basa en la fila
                    const colorIndex = Math.min(Math.floor((r / rows) * colors.length), colors.length - 1);
                    this.bricks.push({
                        x: offsetLeft + (c * (brickWidth + padding)),
                        y: offsetTop + (r * (brickHeight + padding)),
                        width: brickWidth,
                        height: brickHeight,
                        color: colors[colorIndex],
                        status: 1
                    });
                }
            }
        }
    }

    start() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('keydown', this.handleRestart);
        this.gameOverScreen.addEventListener('click', this.handleRestart);
        this.initGame();
        this.loop();
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('keydown', this.handleRestart);
        this.gameOverScreen.removeEventListener('click', this.handleRestart);
    }

    triggerGameOver() {
        this.isRunning = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('breakout_hi', this.highScore);
            this.updateScoreDisplay();
        }
        this.gameOverScreen.style.display = 'flex';
        this.gameOverScreen.querySelector('h2').textContent = 'GAME OVER';
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = `LVL: ${this.currentLevel} | SCORE: ${this.score} | LIVES: ${this.lives}`;
        if (this.hiScoreElement) this.hiScoreElement.textContent = `HI: ${this.highScore}`;
    }

    checkLevelComplete() {
        const allDestroyed = this.bricks.every(b => b.status === 0);
        if (allDestroyed) {
            this.currentLevel++;
            this.initEntities(); 
            this.buildDynamicLevel(this.currentLevel); 
            this.updateScoreDisplay();
        }
    }

    spawnPowerUp(x, y) {
        // 20% de probabilidad de soltar un power up
        if (Math.random() < 0.20) {
            const types = ['multi', 'fast', 'slow', 'pierce'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerUps.push(new BreakoutPowerUp(x, y, type));
        }
    }

    activatePowerUp(type) {
        if (type === 'multi') {
            // Añadir 2 pelotas más por cada pelota activa en ese momento
            const newBalls = [];
            this.balls.forEach(ball => {
                newBalls.push(this.createBall(ball.x, ball.y, ball.speed));
                newBalls.push(this.createBall(ball.x, ball.y, ball.speed));
            });
            this.balls = this.balls.concat(newBalls);
        } else if (type === 'fast') {
            this.balls.forEach(ball => {
                ball.speed = Math.min(ball.speed * 1.3, 12);
                this.normalizeVelocity(ball);
            });
        } else if (type === 'slow') {
            this.balls.forEach(ball => {
                ball.speed = Math.max(ball.speed * 0.7, 4);
                this.normalizeVelocity(ball);
            });
        } else if (type === 'pierce') {
            this.pierceTimer = 400; // Efecto dura ~6 segundos a 60fps
        }
        this.score += 50;
        this.updateScoreDisplay();
    }

    normalizeVelocity(ball) {
        // Mantener el ángulo actual pero cambiar la velocidad total
        const angle = Math.atan2(ball.vy, ball.vx);
        ball.vx = ball.speed * Math.cos(angle);
        ball.vy = ball.speed * Math.sin(angle);
    }

    update() {
        if (!this.isRunning) return;

        // Modo Pierce Timer
        if (this.pierceTimer > 0) this.pierceTimer--;

        // Movimiento de la paleta
        if ((this.keys['ArrowLeft'] || this.keys['a']) && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if ((this.keys['ArrowRight'] || this.keys['d']) && this.paddle.x + this.paddle.width < this.canvas.width) {
            this.paddle.x += this.paddle.speed;
        }

        // Actualizar PowerUps
        this.powerUps.forEach(pu => {
            pu.update(this.canvas.height);
            // Colisión con Paleta
            if (!pu.markedForDeletion && 
                pu.y + pu.height > this.paddle.y && pu.y < this.paddle.y + this.paddle.height &&
                pu.x + pu.width > this.paddle.x && pu.x < this.paddle.x + this.paddle.width) {
                this.activatePowerUp(pu.type);
                pu.markedForDeletion = true;
            }
        });
        this.powerUps = this.powerUps.filter(pu => !pu.markedForDeletion);

        // Actualizar Pelotas
        this.balls.forEach((ball, index) => {
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Color de la pelota (Muestra modo láser)
            ball.color = this.pierceTimer > 0 ? '#ff00ff' : '#ffffff';

            // Rebotes en paredes laterales y techo
            if (ball.x + ball.radius > this.canvas.width) { ball.x = this.canvas.width - ball.radius; ball.vx = -ball.vx; }
            if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx = -ball.vx; }
            if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy = -ball.vy; }

            // Colisión con la paleta
            if (ball.vy > 0 && ball.y + ball.radius > this.paddle.y && ball.y - ball.radius < this.paddle.y + this.paddle.height &&
                ball.x > this.paddle.x && ball.x < this.paddle.x + this.paddle.width) {
                
                let hitPoint = (ball.x - (this.paddle.x + this.paddle.width / 2));
                hitPoint = hitPoint / (this.paddle.width / 2);
                let angle = hitPoint * (Math.PI / 3);
                
                ball.vx = ball.speed * Math.sin(angle);
                ball.vy = -Math.abs(ball.speed * Math.cos(angle)); // Asegurarse que suba
                ball.y = this.paddle.y - ball.radius; // Desatascar
            }

            // Colisión con ladrillos
            for (let i = 0; i < this.bricks.length; i++) {
                let b = this.bricks[i];
                if (b.status === 1) {
                    if (ball.x > b.x && ball.x < b.x + b.width && ball.y > b.y && ball.y < b.y + b.height) {
                        
                        b.status = 0;
                        this.score += 15;
                        this.spawnPowerUp(b.x + b.width/2, b.y + b.height/2);
                        
                        // Si NO es modo pierce, rebotar. Si ES modo pierce, atraviesa.
                        if (this.pierceTimer <= 0) {
                            // Detectar por dónde golpeó para rebotar bien
                            const hitFromTopOrBottom = (ball.y - ball.vy <= b.y || ball.y - ball.vy >= b.y + b.height);
                            if (hitFromTopOrBottom) ball.vy = -ball.vy;
                            else ball.vx = -ball.vx;
                        }
                        
                        this.updateScoreDisplay();
                        this.checkLevelComplete();
                    }
                }
            }
        });

        // Eliminar pelotas que cayeron al vacío
        this.balls = this.balls.filter(ball => ball.y - ball.radius < this.canvas.height);

        // Pérdida de vida (si no quedan pelotas)
        if (this.balls.length === 0) {
            this.lives--;
            this.updateScoreDisplay();
            if (this.lives <= 0) {
                this.triggerGameOver();
            } else {
                this.balls = [this.createBall(this.canvas.width / 2, this.canvas.height - 50, 5.5)];
                this.paddle.x = this.canvas.width / 2 - this.paddle.width / 2;
                this.pierceTimer = 0;
            }
        }
    }

    draw() {
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar PowerUps
        this.powerUps.forEach(pu => pu.draw(this.ctx));

        // Dibujar paleta
        this.ctx.fillStyle = '#050510';
        this.ctx.strokeStyle = this.paddle.color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = this.pierceTimer > 0 ? 20 : 10;
        this.ctx.shadowColor = this.pierceTimer > 0 ? '#ff00ff' : this.paddle.color;
        this.ctx.strokeRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Dibujar pelotas
        this.balls.forEach(ball => {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = ball.color;
            this.ctx.shadowColor = ball.color;
            this.ctx.shadowBlur = this.pierceTimer > 0 ? 15 : 5;
            this.ctx.fill();
            this.ctx.closePath();
        });

        // Dibujar ladrillos
        for (let i = 0; i < this.bricks.length; i++) {
            let b = this.bricks[i];
            if (b.status === 1) {
                this.ctx.fillStyle = '#050510';
                this.ctx.strokeStyle = b.color;
                this.ctx.shadowColor = b.color;
                this.ctx.shadowBlur = 5;
                this.ctx.strokeRect(b.x, b.y, b.width, b.height);
                
                this.ctx.fillStyle = b.color;
                this.ctx.globalAlpha = 0.2;
                this.ctx.fillRect(b.x, b.y, b.width, b.height);
                this.ctx.globalAlpha = 1.0;
            }
        }
        this.ctx.shadowBlur = 0; 
    }

    loop() {
        this.update();
        this.draw();
        if (this.isRunning) {
            this.animationId = requestAnimationFrame(() => this.loop());
        }
    }
}