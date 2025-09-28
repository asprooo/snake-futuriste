/ Système de particules avancé pour Snake Futuriste
class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.explosions = [];
        this.trails = [];
    }

    // Créer des particules d'explosion lors de la mort
    createDeathExplosion(x, y) {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 80,
                maxLife: 80,
                size: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 60}, 100%, ${50 + Math.random() * 30}%)`,
                type: 'explosion',
                gravity: 0.1
            });
        }
    }

    // Créer des particules colorées lors de manger
    createFoodExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 40,
                maxLife: 40,
                size: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                type: 'food',
                sparkle: true
            });
        }
    }

    // Créer une traînée derrière le serpent
    createTrail(segments) {
        if (segments.length === 0) return;
        
        const head = segments[0];
        this.trails.push({
            x: head.x * 20 + 10,
            y: head.y * 20 + 10,
            life: 20,
            maxLife: 20,
            size: 3
        });

        // Limiter le nombre de traînées
        if (this.trails.length > 30) {
            this.trails.shift();
        }
    }

    // Créer des particules de fond ambiance
    createAmbientParticles() {
        if (this.particles.filter(p => p.type === 'ambient').length < 10) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 10,
                vx: (Math.random() - 0.5) * 1,
                vy: -Math.random() * 2 - 0.5,
                life: 200,
                maxLife: 200,
                size: Math.random() * 2 + 0.5,
                color: 'rgba(0, 255, 136, 0.3)',
                type: 'ambient'
            });
        }
    }

    // Créer effet matrix (particules descendantes)
    createMatrixEffect() {
        if (Math.random() < 0.1) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -10,
                vx: 0,
                vy: Math.random() * 3 + 1,
                life: 150,
                maxLife: 150,
                size: 1,
                color: `rgba(0, 255, 136, ${Math.random() * 0.5 + 0.1})`,
                type: 'matrix',
                char: String.fromCharCode(Math.random() * 26 + 65) // A-Z
            });
        }
    }

    // Mettre à jour toutes les particules
    update() {
        // Mettre à jour les particules
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            // Appliquer la gravité pour les explosions
            if (particle.type === 'explosion' && particle.gravity) {
                particle.vy += particle.gravity;
            }

            // Effet scintillant pour les particules de nourriture
            if (particle.sparkle) {
                particle.size = (Math.sin(Date.now() * 0.01 + particle.x) + 1) * 2;
            }

            // Garder les particules en vie
            return particle.life > 0 && 
                   particle.x > -50 && particle.x < this.canvas.width + 50 &&
                   particle.y > -50 && particle.y < this.canvas.height + 50;
        });

        // Mettre à jour les traînées
        this.trails = this.trails.filter(trail => {
            trail.life--;
            return trail.life > 0;
        });
    }

    // Dessiner toutes les particules
    draw() {
        // Dessiner les traînées
        this.trails.forEach(trail => {
            const alpha = trail.life / trail.maxLife;
            this.ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Dessiner les particules
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;

            if (particle.type === 'matrix') {
                // Afficher des caractères pour l'effet matrix
                this.ctx.fillStyle = particle.color;
                this.ctx.font = '12px monospace';
                this.ctx.fillText(particle.char, particle.x, particle.y);
            } else {
                // Particules normales
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();

                // Ajouter un effet de lueur pour certaines particules
                if (particle.type === 'food' || particle.type === 'explosion') {
                    this.ctx.shadowColor = particle.color;
                    this.ctx.shadowBlur = particle.size * 2;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        });
    }

    // Créer un feu d'artifice à une position
    createFirework(x, y, color = null) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        const selectedColor = color || colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = Math.random() * 8 + 4;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60,
                maxLife: 60,
                size: Math.random() * 3 + 2,
                color: selectedColor,
                type: 'firework',
                gravity: 0.05
            });
        }
    }

    // Nettoyer toutes les particules
    clear() {
        this.particles = [];
        this.trails = [];
        this.explosions = [];
    }

    // Obtenir le nombre total de particules actives
    getParticleCount() {
        return this.particles.length + this.trails.length;
    }
}

// Exporter la classe pour l'utiliser dans game.js
window.ParticleSystem = ParticleSystem;
