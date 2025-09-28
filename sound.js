// Système de sons pour Snake Futuriste
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = localStorage.getItem('snakeMuted') === 'true';
        this.volume = parseFloat(localStorage.getItem('snakeVolume')) || 0.5;
        
        this.initAudioContext();
        this.createSounds();
    }

    // Initialiser le contexte audio
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API non supportée');
            return;
        }

        // Résoudre les problèmes de politique de lecture automatique
        document.addEventListener('click', () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
    }

    // Créer des oscillateurs pour différents sons
    createSounds() {
        if (!this.audioContext) return;

        // Son de manger (note joyeuse)
        this.sounds.eat = () => this.playTone(440, 0.1, 'sine');
        
        // Son de game over (son dramatique)
        this.sounds.gameOver = () => {
            this.playTone(220, 0.3, 'sawtooth');
            setTimeout(() => this.playTone(196, 0.5, 'sawtooth'), 200);
        };
        
        // Son de level up (arpège)
        this.sounds.levelUp = () => {
            [261, 329, 392, 523].forEach((freq, i) => {
                setTimeout(() => this.playTone(freq, 0.1, 'triangle'), i * 100);
            });
        };
        
        // Son de mouvement (très subtil)
        this.sounds.move = () => this.playTone(800, 0.02, 'square', 0.1);
        
        // Son de pause
        this.sounds.pause = () => this.playTone(330, 0.2, 'triangle');
    }

    // Jouer une tonalité
    playTone(frequency, duration, waveform = 'sine', volume = null) {
        if (!this.audioContext || this.isMuted) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const currentTime = this.audioContext.currentTime;

        // Configuration de l'oscillateur
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        oscillator.type = waveform;

        // Configuration du volume
        const finalVolume = (volume || this.volume) * 0.1; // Réduit le volume global
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

        // Connexions
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Démarrage et arrêt
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
    }

    // Jouer un son spécifique
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // Basculer le mode muet
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('snakeMuted', this.isMuted.toString());
        return this.isMuted;
    }

    // Définir le volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('snakeVolume', this.volume.toString());
    }

    // Créer une mélodie de victoire
    playVictoryMelody() {
        const melody = [
            { note: 261, duration: 0.2 }, // Do
            { note: 294, duration: 0.2 }, // Ré
            { note: 329, duration: 0.2 }, // Mi
            { note: 349, duration: 0.2 }, // Fa
            { note: 392, duration: 0.2 }, // Sol
            { note: 440, duration: 0.2 }, // La
            { note: 493, duration: 0.4 }, // Si
            { note: 523, duration: 0.6 }  // Do octave
        ];

        let delay = 0;
        melody.forEach(({ note, duration }) => {
            setTimeout(() => this.playTone(note, duration, 'triangle'), delay);
            delay += duration * 800; // Espacement entre les notes
        });
    }

    // Effet sonore d'explosion avec distorsion
    playExplosion() {
        if (!this.audioContext || this.isMuted) return;

        // Bruit blanc pour l'explosion
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        // Générer du bruit blanc qui décroît
        for (let i = 0; i < bufferSize; i++) {
            const decay = 1 - (i / bufferSize);
            output[i] = (Math.random() * 2 - 1) * decay;
        }

        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        whiteNoise.start();
        whiteNoise.stop(this.audioContext.currentTime + 0.5);
    }

    // Ambiance de fond (optionnel)
    createAmbientSound() {
        if (!this.audioContext || this.isMuted) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(55, this.audioContext.currentTime); // Note La grave
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.volume * 0.05, this.audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        
        // Variation de fréquence pour créer une ambiance
        setInterval(() => {
            if (!this.isMuted && oscillator.frequency) {
                const variation = 55 + Math.sin(Date.now() * 0.001) * 5;
                oscillator.frequency.setValueAtTime(variation, this.audioContext.currentTime);
            }
        }, 100);
        
        return oscillator;
    }
}

// Exporter pour utilisation dans game.js
window.SoundSystem = SoundSystem;
