// js/games/galaxy_shooter.js

class Laser {
    constructor(x, y, vx, speed, color, isSShot = false, owner = 'player') {
        this.initialX = x; 
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.width = owner === 'enemy' ? 6 : 4; // Láser enemigo más grueso
        this.height = 15;
        this.speed = speed;
        this.color = color;
        this.isSShot = isSShot;
        this.owner = owner; // 'player' o 'enemy'
        this.angle = 0; 
        this.markedForDeletion = false;
    }

    update() {
        // Si speed es negativo (enemigo), el láser irá hacia abajo automáticamente
        this.y -= this.speed;
        this.x += this.vx; 

        if (this.isSShot) {
            this.angle += 0.3;
            this.x = this.initialX + Math.sin(this.angle) * 30; 
        }

        if (this.y < -50 || this.y > 450 || this.x < -50 || this.x > 750) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        // Forma de círculo si es láser enemigo, rectángulo si es del jugador
        if (this.owner === 'enemy') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        }
        ctx.shadowBlur = 0;
    }
}

class PowerUp {
    constructor(canvasWidth) {
        // Catálogo de Power-Ups con sus colores e identificadores visuales
        const types = [
            { name: 'shield', color: '#0055ff', letter: 'S' },       // Azul
            { name: 'speed', color: '#ffff00', letter: 'V' },        // Amarillo
            { name: 'triple', color: '#00ff00', letter: '3' },       // Verde
            { name: 's_shot', color: '#ffa500', letter: '~' },       // Naranja
            { name: 'quintuple', color: '#ff0000', letter: '5' }     // Rojo
        ];
        
        const type = types[Math.floor(Math.random() * types.length)];
        this.type = type.name;
        this.color = type.color;
        this.letter = type.letter;
        
        this.width = 24;
        this.height = 24;
        this.x = Math.random() * (canvasWidth - this.width) + this.width / 2;
        this.y = -30;
        this.speed = 1.5; // Caen más lento que los enemigos
        this.markedForDeletion = false;
    }

    update(canvasHeight) {
        this.y += this.speed;
        if (this.y > canvasHeight + 50) this.markedForDeletion = true;
    }

    draw(ctx) {
        // Dibujar un rombo neón
        ctx.fillStyle = '#050510';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x, this.y + this.height/2);
        ctx.lineTo(this.x - this.width/2, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Letra interior
        ctx.fillStyle = this.color;
        ctx.font = '12px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(this.letter, this.x, this.y);
    }
}

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 40;
        this.height = 40;
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 50;
        this.speed = 8;
        this.color = '#00ffff'; 
        this.lasers = [];
        this.canShoot = true;
        
        // --- SISTEMA DE ESTADOS (POWER-UPS) ---
        this.shields = 0; // Acumulable hasta 3
        this.timers = {
            speed: 0,
            triple: 0,
            s_shot: 0,
            quintuple: 0
        };
    }

    activatePowerUp(type) {
        if (type === 'shield' && this.shields < 3) this.shields++;
        // Asignamos duración en frames (aprox 60fps)
        else if (type === 'speed') this.timers.speed = 600; // 10 seg
        else if (type === 'triple') this.timers.triple = 600; // 10 seg
        else if (type === 's_shot') this.timers.s_shot = 480; // 8 seg
        else if (type === 'quintuple') this.timers.quintuple = 300; // 5 seg
    }

    update(keys) {
        // Reducir temporizadores
        for (let power in this.timers) {
            if (this.timers[power] > 0) this.timers[power]--;
        }

        // Movimiento
        if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && this.x - this.width / 2 > 0) this.x -= this.speed;
        if ((keys['ArrowRight'] || keys['d'] || keys['D']) && this.x + this.width / 2 < this.canvasWidth) this.x += this.speed;
        if ((keys['ArrowUp'] || keys['w'] || keys['W']) && this.y - this.height / 2 > 0) this.y -= this.speed;
        if ((keys['ArrowDown'] || keys['s'] || keys['S']) && this.y + this.height / 2 < this.canvasHeight) this.y += this.speed;

        // Disparo
        if (keys[' '] && this.canShoot) {
            // Si el modo velocidad está activo, el delay baja de 200ms a 100ms
            const currentDelay = this.timers.speed > 0 ? 100 : 250;
            const ySpawn = this.y - this.height / 2;

            // Jerarquía de disparo (El quíntuple tiene prioridad sobre el triple, etc.)
            if (this.timers.quintuple > 0) {
                this.lasers.push(new Laser(this.x, ySpawn, 0, 10, '#ff0000')); // Centro
                this.lasers.push(new Laser(this.x - 10, ySpawn, -2, 10, '#ff0000')); // Izquierda
                this.lasers.push(new Laser(this.x + 10, ySpawn, 2, 10, '#ff0000')); // Derecha
                this.lasers.push(new Laser(this.x - 20, ySpawn, -4, 10, '#ff0000')); // Extrema Izq
                this.lasers.push(new Laser(this.x + 20, ySpawn, 4, 10, '#ff0000')); // Extrema Der
            } 
            else if (this.timers.s_shot > 0) {
                this.lasers.push(new Laser(this.x, ySpawn, 0, 8, '#ffa500', true)); // Disparo S
            }
            else if (this.timers.triple > 0) {
                this.lasers.push(new Laser(this.x, ySpawn, 0, 10, '#00ff00')); // Centro
                this.lasers.push(new Laser(this.x - 10, ySpawn, -2, 10, '#00ff00')); // Izquierda
                this.lasers.push(new Laser(this.x + 10, ySpawn, 2, 10, '#00ff00')); // Derecha
            } 
            else {
                this.lasers.push(new Laser(this.x, ySpawn, 0, 10, this.color)); // Normal
            }

            this.canShoot = false;
            setTimeout(() => this.canShoot = true, currentDelay);
        }

        this.lasers.forEach(laser => laser.update());
        this.lasers = this.lasers.filter(laser => !laser.markedForDeletion);
    }

    draw(ctx) {
        this.lasers.forEach(laser => laser.draw(ctx));

        // Dibujar escudo alrededor de la nave si hay más de 0
        if (this.shields > 0) {
            ctx.strokeStyle = '#0055ff';
            ctx.lineWidth = this.shields; // Más escudos = línea más gruesa
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#0055ff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width - 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Dibujar nave
        ctx.fillStyle = '#050510';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x, this.y + this.height / 4);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

class Enemy {
    constructor(canvasWidth, type, isBoss = false) {
        this.type = type; // 1: Básico, 2: Movimiento en S, 3: Tirador
        this.isBoss = isBoss;
        
        // Tamaños y vida según el tipo
        this.width = isBoss ? 80 : 35;
        this.height = isBoss ? 80 : 35;
        this.hp = isBoss ? 50 : (type === 3 ? 3 : (type === 2 ? 2 : 1));
        this.maxHp = this.hp;
        
        this.x = isBoss ? canvasWidth / 2 : Math.random() * (canvasWidth - this.width) + this.width / 2;
        this.y = -this.height;
        this.initialX = this.x;
        this.angle = 0;
        
        this.speed = isBoss ? 1 : (type === 2 ? 2.5 : Math.random() * 1.5 + 1);
        this.color = isBoss ? '#ff0000' : (type === 2 ? '#00ffff' : (type === 3 ? '#ffff00' : '#ff00ff')); 
        
        this.shootTimer = 0;
        this.shootInterval = isBoss ? 50 : 100; // El jefe dispara más rápido
        this.markedForDeletion = false;
    }

    // Le pasamos el array de láseres enemigos para que pueda disparar
    update(canvasHeight, enemyLasers) {
        // MOVIMIENTO
        if (this.isBoss && this.y > 100) {
            // El Jefe se detiene en Y = 100 y se mueve de lado a lado
            this.speed = 0;
            this.angle += 0.03;
            this.x = this.initialX + Math.sin(this.angle) * 150;
        } else if (this.type === 2 && !this.isBoss) {
            // Movimiento en S
            this.y += this.speed;
            this.angle += 0.05;
            this.x = this.initialX + Math.sin(this.angle) * 60;
        } else {
            // Bajada recta
            this.y += this.speed;
        }

        // DISPARO (Solo tipo 3 o Jefes)
        if (this.type === 3 || this.isBoss) {
            this.shootTimer++;
            if (this.shootTimer >= this.shootInterval) {
                this.shootTimer = 0;
                // Los jefes tienen un 40% de probabilidad de lanzar disparos en S
                const useSShot = this.isBoss && Math.random() < 0.4;
                
                // Disparo central (velocidad negativa para ir hacia abajo)
                enemyLasers.push(new Laser(this.x, this.y + this.height/2, 0, -5, this.color, useSShot, 'enemy'));
                
                if (this.isBoss) {
                    // El jefe lanza un disparo triple
                    enemyLasers.push(new Laser(this.x - 25, this.y + this.height/2, -2, -5, this.color, false, 'enemy'));
                    enemyLasers.push(new Laser(this.x + 25, this.y + this.height/2, 2, -5, this.color, false, 'enemy'));
                }
            }
        }

        // Si sale de la pantalla, eliminar
        if (this.y > canvasHeight + 100) this.markedForDeletion = true;
    }

    draw(ctx) {
        // Dibujar Barra de Vida si tiene más de 1 HP
        if (this.maxHp > 1) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2 - 10, this.width * (this.hp/this.maxHp), 4);
        }

        ctx.fillStyle = '#050510';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        if (this.isBoss) {
            // Forma Octagonal enorme para el Jefe
            ctx.moveTo(this.x - this.width/2, this.y - this.height/4);
            ctx.lineTo(this.x - this.width/4, this.y - this.height/2);
            ctx.lineTo(this.x + this.width/4, this.y - this.height/2);
            ctx.lineTo(this.x + this.width/2, this.y - this.height/4);
            ctx.lineTo(this.x + this.width/2, this.y + this.height/4);
            ctx.lineTo(this.x, this.y + this.height/2); // Punta inferior
            ctx.lineTo(this.x - this.width/2, this.y + this.height/4);
        } else {
            // Forma Base Enemigo
            ctx.moveTo(this.x - this.width / 2, this.y - this.height / 2);
            ctx.lineTo(this.x + this.width / 2, this.y - this.height / 2);
            ctx.lineTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x, this.y + this.height / 2); 
            ctx.lineTo(this.x - this.width / 2, this.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

export class GalaxyShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score-display');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.hiScoreElement = document.getElementById('hi-score-display'); 
        this.highScore = localStorage.getItem('galaxy_shooter_hi') || 0;
        
        this.animationId = null;
        this.isRunning = false;
        this.canvas.height = 400; 

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
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.enemies = [];
        this.enemyLasers = []; // NUEVO: Arreglo de láseres enemigos
        this.powerUps = [];
        this.score = 0;
        this.nextBossScore = 500; // NUEVO: Umbral del próximo jefe
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 60; 
        
        this.isRunning = true;
        this.gameOverScreen.style.display = 'none';
        
        this.scoreElement.textContent = `SCORE: ${this.score}`;
        if (this.hiScoreElement) this.hiScoreElement.textContent = `HI: ${this.highScore}`;
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
            localStorage.setItem('galaxy_shooter_hi', this.highScore);
            if (this.hiScoreElement) this.hiScoreElement.textContent = `HI: ${this.highScore}`;
        }
    }

    checkCollisions() {
        const hitboxReduce = 10; 

        // 1. Láser JUGADOR vs ENEMIGO (Sistema de Puntos de Vida)
        this.player.lasers.forEach(laser => {
            this.enemies.forEach(enemy => {
                if (!laser.markedForDeletion && !enemy.markedForDeletion &&
                    laser.x < enemy.x + enemy.width / 2 && laser.x + laser.width > enemy.x - enemy.width / 2 &&
                    laser.y < enemy.y + enemy.height / 2 && laser.y + laser.height > enemy.y - enemy.height / 2) {
                    
                    laser.markedForDeletion = true; // El láser siempre se destruye al impactar
                    enemy.hp--; // Reducir HP del enemigo

                    if (enemy.hp <= 0) {
                        enemy.markedForDeletion = true;
                        // El jefe da 100 puntos, los otros dan 10 o 20
                        this.score += enemy.isBoss ? 100 : (enemy.type * 10);
                        this.scoreElement.textContent = `SCORE: ${this.score}`;
                    }
                }
            });
        });

        // 2. Láser ENEMIGO vs JUGADOR
        this.enemyLasers.forEach(laser => {
            if (!laser.markedForDeletion &&
                laser.x < this.player.x + this.player.width/2 && laser.x + laser.width > this.player.x - this.player.width/2 &&
                laser.y < this.player.y + this.player.height/2 && laser.y + laser.height > this.player.y - this.player.height/2) {
                
                laser.markedForDeletion = true;
                if (this.player.shields > 0) this.player.shields--;
                else this.triggerGameOver();
            }
        });

        // 3. JUGADOR vs POWER-UP
        this.powerUps.forEach(pu => {
            if (!pu.markedForDeletion &&
                this.player.x - this.player.width/2 + hitboxReduce < pu.x + pu.width/2 &&
                this.player.x + this.player.width/2 - hitboxReduce > pu.x - pu.width/2 &&
                this.player.y - this.player.height/2 + hitboxReduce < pu.y + pu.height/2 &&
                this.player.y + this.player.height/2 - hitboxReduce > pu.y - pu.height/2) {
                pu.markedForDeletion = true;
                this.player.activatePowerUp(pu.type);
            }
        });

        // 4. JUGADOR vs CUERPO DEL ENEMIGO (Kamikaze)
        this.enemies.forEach(enemy => {
            if (!enemy.markedForDeletion &&
                this.player.x - this.player.width/2 + hitboxReduce < enemy.x + enemy.width/2 &&
                this.player.x + this.player.width/2 - hitboxReduce > enemy.x - enemy.width/2 &&
                this.player.y - this.player.height/2 + hitboxReduce < enemy.y + enemy.height/2 &&
                this.player.y + this.player.height/2 - hitboxReduce > enemy.y - enemy.height/2) {
                
                if (this.player.shields > 0) {
                    this.player.shields--;
                    enemy.hp -= 5; // Daño masivo por choque
                    if (enemy.hp <= 0) enemy.markedForDeletion = true;
                } else {
                    this.triggerGameOver();
                }
            }
        });
    }

    drawShieldUI() {
        for(let i = 0; i < this.player.shields; i++) {
            this.ctx.fillStyle = '#0055ff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#0055ff';
            this.ctx.beginPath();
            this.ctx.arc(20 + (i * 20), 40, 6, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;
    }

    update() {
        if (!this.isRunning) return;

        this.player.update(this.keys);

        // Lógica de Spawns
        if (this.score >= this.nextBossScore) {
            // ¡SPAWN DEL JEFE!
            this.enemies.push(new Enemy(this.canvas.width, 4, true));
            this.nextBossScore += 500; // El siguiente será en 500 puntos más
        } else {
            // Spawn regular
            this.enemySpawnTimer++;
            if (this.enemySpawnTimer > this.enemySpawnInterval) {
                let type = 1;
                // Solo si el score > 500, salen enemigos nuevos
                if (this.score >= 500) {
                    const rand = Math.random();
                    if (rand < 0.20) type = 2; // 20% Serpientes
                    else if (rand < 0.40) type = 3; // 20% Tiradores
                }

                this.enemies.push(new Enemy(this.canvas.width, type, false));
                
                // 8% de PowerUp
                if (Math.random() < 0.08) this.powerUps.push(new PowerUp(this.canvas.width));

                this.enemySpawnTimer = 0;
                if (this.enemySpawnInterval > 20) this.enemySpawnInterval -= 0.5;
            }
        }

        // Actualizar entidades
        this.enemies.forEach(enemy => enemy.update(this.canvas.height, this.enemyLasers));
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

        this.enemyLasers.forEach(laser => laser.update());
        this.enemyLasers = this.enemyLasers.filter(laser => !laser.markedForDeletion);

        this.powerUps.forEach(pu => pu.update(this.canvas.height));
        this.powerUps = this.powerUps.filter(pu => !pu.markedForDeletion);

        this.checkCollisions();

        if (!this.isRunning) this.gameOverScreen.style.display = 'flex';
    }

    draw() {
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.powerUps.forEach(pu => pu.draw(this.ctx));
        this.enemyLasers.forEach(laser => laser.draw(this.ctx));
        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        this.drawShieldUI();
    }

    loop() {
        this.update();
        this.draw();
        if (this.isRunning) this.animationId = requestAnimationFrame(() => this.loop());
    }
}