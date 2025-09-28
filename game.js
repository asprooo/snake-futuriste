class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [{ x: 10, y: 10 }];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 150;
        this.gameRunning = false;
        this.gamePaused = false;
        this.particles = [];
        
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        document.getElementById('high-score').textContent = this.highScore;
        
        this.bindEvents();
        this.generateFood();
        this.createBackgroundParticles();
        this.draw();
    }

    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const keyActions = {
            'ArrowUp': () => this.changeDirection(0, -1),
            'KeyW': () => this.changeDirection(0, -1),
            'ArrowDown': () => this.changeDirection(0, 1),
            'KeyS': () => this.changeDirection(0, 1),
            'ArrowLeft': () => this.changeDirection(-1, 0),
            'KeyA': () => this.changeDirection(-1, 0),
            'ArrowRight': () => this.changeDirection(1, 0),
            'KeyD': () => this.changeDirection(1, 0),
            'Space': () => this.togglePause()
        };

        if (keyActions[e.code]) {
            e.preventDefault();
            keyActions[e.code]();
        }
    }

    changeDirection(newDx, newDy) {
        if (this.dx === -newDx || this.dy === -newDy) return;
        this.dx = newDx;
        this.dy = newDy;
    }

    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
        
        this.gameLoop();
    }

    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.gamePaused ? '▶️ REPRENDRE' : '⏸️ PAUSE';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }

    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 150;
        this.particles = [];
        
        document.getElementById('score').textContent = '0';
        document.getElementById('level').textContent = '1';
        document.getElementById('speed-fill').style.width = '0%';
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('pauseBtn').textContent = '⏸️ PAUSE';
        document.getElementById('gameOver').style.display = 'none';
        
        this.generateFood();
        this.draw();
    }

    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };

        // Éviter de placer la nourriture sur le serpent
        if (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y)) {
            this.generateFood();
        }
    }

    moveSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Collision avec les murs
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Collision avec soi-même
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Manger la nourriture
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.level = Math.floor(this.score / 50) + 1;
            this.gameSpeed = Math.max(50, 150 - (this.level - 1) * 10);
            
            document.getElementById('score').textContent = this.score;
            document.getElementById('level').textContent = this.level;
            
            const speedPercent = Math.min(100, ((150 - this.gameSpeed) / 100) * 100);
            document.getElementById('speed-fill').style.width = speedPercent + '%';
            
            this.createFoodParticles();
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    createFoodParticles() {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.food.x * this.gridSize + this.gridSize / 2,
                y: this.food.y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }

    createBackgroundParticles() {
        setInterval(() => {
            if (this.particles.length < 20) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 3 - 1,
                    life: 100,
                    maxLife: 100,
                    color: 'rgba(0, 255, 136, 0.3)'
                });
            }
        }, 200);
    }

    draw() {
        // Effacer le canvas avec un effet de traînée
        this.ctx.fillStyle = 'rgba(0, 8, 20, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessiner les particules
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
        });
        this.ctx.globalAlpha = 1;

        // Dessiner la nourriture avec effet de pulsation
        const time = Date.now() * 0.005;
        const pulseScale = 1 + Math.sin(time) * 0.2;
        const foodSize = this.gridSize * pulseScale;
        const offset = (this.gridSize - foodSize) / 2;
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 20;
        this.ctx.fillRect(
            this.food.x * this.gridSize + offset,
            this.food.y * this.gridSize + offset,
            foodSize,
            foodSize
        );
        this.ctx.shadowBlur = 0;

        // Dessiner le serpent
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Tête du serpent
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.shadowColor = '#FF6B6B';
                this.ctx.shadowBlur = 15;
            } else {
                // Corps du serpent
                const intensity = 1 - (index / this.snake.length) * 0.5;
                this.ctx.fillStyle = `rgba(0, 255, 136, ${intensity})`;
                this.ctx.shadowColor = '#00FF88';
                this.ctx.shadowBlur = 10;
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        this.ctx.shadowBlur = 0;
    }

    gameOver() {
        this.gameRunning = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('high-score').textContent = this.highScore;
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('gameOver').style.display = 'block';
        
        // Effet d'explosion
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: this.snake[0].x * this.gridSize + this.gridSize / 2,
                y: this.snake[0].y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 60,
                maxLife: 60,
                color: '#FF6B6B'
            });
        }
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.moveSnake();
        this.updateParticles();
        this.draw();
        
        setTimeout(() => this.gameLoop(), this.gameSpeed);
    }
}

// Initialiser le jeu
let game;
window.onload = () => {
    game = new SnakeGame();
};

function resetGame() {
    game.resetGame();
}
