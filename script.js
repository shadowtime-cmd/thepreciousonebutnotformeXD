/* script.js - Core interactive capabilities */

document.addEventListener('DOMContentLoaded', () => {

    // --- SOUND & MUSIC ENGINE ---
    const romanticMusic = document.getElementById('romantic-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    let audioCtx = null;
    let synthInterval = null;

    // Helper to start procedural romantic background chimes if files fail to load
    function playSweetChimes() {
        if (synthInterval) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale
            synthInterval = setInterval(() => {
                if (audioCtx.state === 'suspended') return;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                // Pick a sweet sounding note
                const note = notes[Math.floor(Math.random() * notes.length)];
                osc.frequency.value = note;
                osc.type = 'sine';

                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3);

                osc.start();
                osc.stop(audioCtx.currentTime + 3);
            }, 1200);
        } catch (e) {
            console.log("Audio synthesis not fully supported:", e);
        }
    }

    function toggleMusic() {
        if (romanticMusic.paused) {
            romanticMusic.play().then(() => {
                musicIcon.className = "fa-solid fa-volume-high animate-bounce text-rose-500";
            }).catch(() => {
                // Autoplay blocked fallback: build synthesized sweet chimes
                if (!audioCtx) playSweetChimes();
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                musicIcon.className = "fa-solid fa-music animate-spin text-pink-500";
            });
        } else {
            romanticMusic.pause();
            musicIcon.className = "fa-solid fa-volume-xmark text-slate-400";
        }
    }

    musicToggle.addEventListener('click', toggleMusic);

    // Automatically trigger audio on first user action anywhere
    document.body.addEventListener('click', () => {
        if (romanticMusic.paused && !synthInterval) {
            // Silently try to boot up audio
            romanticMusic.play().then(() => {
                musicIcon.className = "fa-solid fa-volume-high animate-bounce text-rose-500";
            }).catch(() => {
                playSweetChimes();
            });
        }
    }, { once: true });


    // --- AMBIENT CANVAS BACKGROUND EFFECT ---
    const ambientCanvas = document.getElementById('ambient-canvas');
    const ambientCtx = ambientCanvas.getContext('2d');
    let ambientParticles = [];

    function resizeAmbientCanvas() {
        ambientCanvas.width = window.innerWidth;
        ambientCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeAmbientCanvas);
    resizeAmbientCanvas();

    class AmbientHeart {
        constructor() {
            this.reset();
            this.y = Math.random() * ambientCanvas.height;
        }
        reset() {
            this.x = Math.random() * ambientCanvas.width;
            this.y = ambientCanvas.height + 20;
            this.size = Math.random() * 15 + 8;
            this.speed = Math.random() * 0.8 + 0.3;
            this.opacity = Math.random() * 0.3 + 0.1;
            this.wiggle = Math.random() * 1.5;
            this.wiggleSpeed = Math.random() * 0.02 + 0.005;
            this.angle = 0;
        }
        update() {
            this.y -= this.speed;
            this.angle += this.wiggleSpeed;
            this.x += Math.sin(this.angle) * this.wiggle;
            if (this.y < -20) {
                this.reset();
            }
        }
        draw() {
            ambientCtx.save();
            ambientCtx.globalAlpha = this.opacity;
            ambientCtx.fillStyle = '#ff7a90';
            ambientCtx.beginPath();
            const topY = this.y - this.size / 2;
            ambientCtx.moveTo(this.x, this.y);
            // Left shoulder
            ambientCtx.bezierCurveTo(
                this.x - this.size / 2, this.y - this.size / 2,
                this.x - this.size, topY,
                this.x - this.size, this.y - this.size * 1.2
            );
            // Left top arc
            ambientCtx.bezierCurveTo(
                this.x - this.size, this.y - this.size * 1.8,
                this.x - this.size / 2, this.y - this.size * 2,
                this.x, this.y - this.size * 1.4
            );
            // Right top arc
            ambientCtx.bezierCurveTo(
                this.x + this.size / 2, this.y - this.size * 2,
                this.x + this.size, this.y - this.size * 1.8,
                this.x + this.size, this.y - this.size * 1.2
            );
            // Right shoulder
            ambientCtx.bezierCurveTo(
                this.x + this.size, topY,
                this.x + this.size / 2, this.y - this.size / 2,
                this.x, this.y
            );
            ambientCtx.closePath();
            ambientCtx.fill();
            ambientCtx.restore();
        }
    }

    // Populate particles
    for (let i = 0; i < 30; i++) {
        ambientParticles.push(new AmbientHeart());
    }

    function animateAmbient() {
        ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
        ambientParticles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateAmbient);
    }
    animateAmbient();


    // --- SCREEN TRANSITIONS ---
    const screens = {
        intro: document.getElementById('screen-intro'),
        gallery: document.getElementById('screen-gallery'),
        letter: document.getElementById('screen-letter'),
        proposal: document.getElementById('screen-proposal'),
        celebration: document.getElementById('screen-celebration')
    };

    function transitionTo(fromScreen, toScreen) {
        fromScreen.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            fromScreen.classList.add('hidden');
            toScreen.classList.remove('hidden');
            // Trigger browser reflow
            toScreen.offsetHeight;
            toScreen.classList.remove('opacity-0', 'scale-95');
            toScreen.classList.add('opacity-100', 'scale-100');
        }, 500);
    }

    // Navigation triggers
    document.getElementById('btn-start').addEventListener('click', () => {
        transitionTo(screens.intro, screens.gallery);
        // Fire celebration style sound play
        toggleMusic();
    });

    document.getElementById('btn-to-letter').addEventListener('click', () => {
        transitionTo(screens.gallery, screens.letter);
    });

    document.getElementById('btn-back-to-gallery').addEventListener('click', () => {
        transitionTo(screens.letter, screens.gallery);
    });

    document.getElementById('btn-to-proposal').addEventListener('click', () => {
        transitionTo(screens.letter, screens.proposal);
    });


    // --- APPRECIATION CARDS LOGIC ---
    const cardData = {
        smile: {
            title: "Your Smile",
            icon: "fa-regular fa-face-smile-beam text-rose-500",
            iconBg: "bg-rose-50",
            text: "Your smile is a pure, radiant masterpiece. The moment your lips curve and your eyes crinkle, any stress or darkness in my world instantly evaporates. It's my absolute favorite view, warmer than a thousand suns and sweeter than any melody."
        },
        eyes: {
            title: "Your Eyes",
            icon: "fa-regular fa-eye text-pink-500",
            iconBg: "bg-pink-50",
            text: "They say eyes are the windows to the soul, and yours are the most beautiful universe I've ever gotten lost in. There's a brilliant spark of intelligence, deep warmth, and genuine kindness that shines every time you look my way. I could gaze into them forever."
        },
        grace: {
            title: "Your Grace",
            icon: "fa-solid fa-wand-magic-sparkles text-amber-500",
            iconBg: "bg-amber-50",
            text: "You carry yourself with an elegance and gentle strength that is truly spellbinding. Whether you're laughing, thinking deeply, or simply walking into a room, you bring a quiet magic and effortless class that elevates everything and everyone around you."
        },
        heart: {
            title: "Your Gentle Soul",
            icon: "fa-regular fa-heart text-red-500",
            iconBg: "bg-red-50",
            text: "Your heart is your most magnificent attribute. The compassion you show, the endless empathy you possess, and the quiet ways you care for others make you more beautiful than words can ever describe. Being loved by you is the greatest privilege of my life."
        }
    };

    const cards = document.querySelectorAll('.appreciation-card');
    const overlay = document.getElementById('card-overlay');
    const closeOverlayBtn = document.getElementById('close-overlay');
    const closeOverlayBtnBottom = document.getElementById('close-overlay-btn');
    const overlayIcon = document.getElementById('overlay-icon');
    const overlayIconContainer = document.getElementById('overlay-icon-container');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayDescription = document.getElementById('overlay-description');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-target');
            const data = cardData[type];
            if (data) {
                // Populate Overlay
                overlayIcon.className = data.icon;
                overlayIconContainer.className = `w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${data.iconBg}`;
                overlayTitle.textContent = data.title;
                overlayDescription.textContent = data.text;

                // Show modal with animation
                overlay.classList.remove('hidden');
                // reflow
                overlay.offsetHeight;
                overlay.classList.add('opacity-100');
                overlay.querySelector('div').classList.remove('scale-95');
                overlay.querySelector('div').classList.add('scale-100');

                // Trigger a mini custom burst of floating hearts
                spawnFloatingHearts(6);
            }
        });
    });

    function closeOverlay() {
        overlay.classList.remove('opacity-100');
        overlay.querySelector('div').classList.remove('scale-100');
        overlay.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    }

    closeOverlayBtn.addEventListener('click', closeOverlay);
    closeOverlayBtnBottom.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });


    // --- FLOATING HEARTS FX SYSTEM ---
    const heartsContainer = document.getElementById('floating-hearts');
    const heartIcons = ['fa-heart', 'fa-heart-pulse', 'fa-face-kiss-wink-heart'];

    function spawnFloatingHearts(count = 10) {
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('i');
            const randomIcon = heartIcons[Math.floor(Math.random() * heartIcons.length)];
            heart.className = `fa-solid ${randomIcon} floating-heart-element`;

            // Random styling parameters
            const size = Math.random() * 20 + 15; // 15px - 35px
            const left = Math.random() * 100; // 0% - 100%
            const duration = Math.random() * 5 + 6; // 6s - 11s
            const rot = Math.random() * 360 + 180;
            const floatX = (Math.random() * 150) - 75; // -75px to 75px

            heart.style.fontSize = `${size}px`;
            heart.style.left = `${left}%`;
            heart.style.setProperty('--float-dur', `${duration}s`);
            heart.style.setProperty('--float-rot', `${rot}deg`);
            heart.style.setProperty('--float-x', `${floatX}px`);

            // Random romantic hues
            const colors = ['#f43f5e', '#ec4899', '#f472b6', '#fb7185', '#ff4d6d'];
            heart.style.color = colors[Math.floor(Math.random() * colors.length)];

            heartsContainer.appendChild(heart);

            // Cleanup after animation completes
            setTimeout(() => {
                heart.remove();
            }, duration * 1000);
        }
    }

    // Periodic automatic background float
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            spawnFloatingHearts(2);
        }
    }, 3000);


    // --- THE ELUSIVE RUNAWAY "NO" BUTTON ---
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');
    const proposalContainer = document.getElementById('proposal-buttons-container');

    function runaway() {
        // Find constraints of container or viewport to keep it accessible but out of reach
        const padding = 20;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Generate entirely new random absolute coordinates
        // We will make the "No" button absolute when hovered so it flies around freely
        if (btnNo.style.position !== 'fixed') {
            btnNo.style.position = 'fixed';
            btnNo.style.zIndex = '99';
        }

        const buttonWidth = btnNo.offsetWidth;
        const buttonHeight = btnNo.offsetHeight;

        const maxLeft = width - buttonWidth - padding;
        const maxTop = height - buttonHeight - padding;

        const randomLeft = Math.max(padding, Math.random() * maxLeft);
        const randomTop = Math.max(padding, Math.random() * maxTop);

        btnNo.style.left = `${randomLeft}px`;
        btnNo.style.top = `${randomTop}px`;

        // Make Yes button grow slightly bigger each time No is avoided
        const currentScale = parseFloat(btnYes.style.transform.replace(/[^0-9.]/g, '')) || 1;
        if (currentScale < 1.6) {
            btnYes.style.transform = `scale(${currentScale + 0.05})`;
        }
    }

    btnNo.addEventListener('mouseover', runaway);
    btnNo.addEventListener('click', runaway);
    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        runaway();
    });


    // --- CELEBRATION CONFLICT FREE CANVAS FX SYSTEM ---
    const celebrationCanvas = document.getElementById('celebration-canvas');
    const celebCtx = celebrationCanvas.getContext('2d');
    let celebParticles = [];
    let celebrationActive = false;

    function resizeCelebCanvas() {
        celebrationCanvas.width = window.innerWidth;
        celebrationCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCelebCanvas);
    resizeCelebCanvas();

    class ConfettiHeart {
        constructor() {
            this.x = celebrationCanvas.width / 2;
            this.y = celebrationCanvas.height / 2 + 100;
            this.size = Math.random() * 12 + 6;
            this.color = ['#ff4d6d', '#ff7a90', '#f43f5e', '#ec4899', '#f472b6', '#ffffff'][Math.floor(Math.random() * 6)];

            // Circular initial explosion
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 12 + 4;
            this.vx = Math.cos(angle) * velocity;
            this.vy = Math.sin(angle) * velocity - Math.random() * 5; // upward bias

            this.gravity = 0.15;
            this.drag = 0.98;
            this.opacity = 1;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        }

        update() {
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= 0.008;
            this.rotation += this.rotationSpeed;
        }

        draw() {
            if (this.opacity <= 0) return;
            celebCtx.save();
            celebCtx.globalAlpha = this.opacity;
            celebCtx.translate(this.x, this.y);
            celebCtx.rotate(this.rotation);
            celebCtx.fillStyle = this.color;

            // Draw a cute heart shape
            celebCtx.beginPath();
            celebCtx.moveTo(0, 0);
            celebCtx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, 0, -this.size, -this.size);
            celebCtx.bezierCurveTo(-this.size, -this.size*1.6, -this.size/2, -this.size*2, 0, -this.size*1.2);
            celebCtx.bezierCurveTo(this.size/2, -this.size*2, this.size, -this.size*1.6, this.size, -this.size);
            celebCtx.bezierCurveTo(this.size, 0, this.size/2, -this.size/2, 0, 0);
            celebCtx.closePath();
            celebCtx.fill();
            celebCtx.restore();
        }
    }

    function spawnCelebShower() {
        for (let i = 0; i < 150; i++) {
            celebParticles.push(new ConfettiHeart());
        }
    }

    function animateCelebration() {
        if (!celebrationActive) return;
        celebCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);

        // Randomly spawn more bursts from corners or bottom
        if (Math.random() < 0.08) {
            const customHeart = new ConfettiHeart();
            customHeart.x = Math.random() * celebrationCanvas.width;
            customHeart.y = celebrationCanvas.height + 20;
            customHeart.vy = -Math.random() * 15 - 5;
            celebParticles.push(customHeart);
        }

        celebParticles.forEach((p, index) => {
            p.update();
            p.draw();
            if (p.opacity <= 0) {
                celebParticles.splice(index, 1);
            }
        });

        requestAnimationFrame(animateCelebration);
    }


    // --- FINAL ACCEPTANCE ACTION ---
    btnYes.addEventListener('click', () => {
        // Remove runaway "No" button entirely so it doesn't float around on celebration screen
        btnNo.remove();

        // Play louder or happier sound if possible
        if (romanticMusic.paused) {
            toggleMusic();
        }

        // Move to final celebration screen
        transitionTo(screens.proposal, screens.celebration);

        // Fire confetti explosion!
        celebrationActive = true;
        spawnCelebShower();
        animateCelebration();

        // Continuous shower
        setInterval(() => {
            if (celebrationActive) spawnCelebShower();
        }, 3500);

        // Spawn extra floating background hearts
        spawnFloatingHearts(30);
    });


    // --- LIFETIME PROMISES GENERATOR ---
    const promises = [
        "I promise to always listen to you, even when you are saying nothing at all. 💖",
        "I promise to support your biggest dreams and hold your hand through every challenge. 🌟",
        "I promise to make you laugh every single day, especially on the hard ones. 😂",
        "I promise to appreciate your beautiful heart and soul, and tell you so every morning. ☀️",
        "I promise to choose you, eagerly and entirely, over and over again, every single day. 🌹",
        "I promise to build a life with you filled with wonder, warmth, and safe adventures. 🏡",
        "I promise to love you, not just for who you are, but for who you inspire me to be. 🥰"
    ];

    const btnPromise = document.getElementById('btn-promise');
    const promiseText = document.getElementById('promise-text');

    btnPromise.addEventListener('click', () => {
        promiseText.classList.add('opacity-0');
        setTimeout(() => {
            const randomPromise = promises[Math.floor(Math.random() * promises.length)];
            promiseText.textContent = randomPromise;
            promiseText.classList.remove('opacity-0');
            // Trigger local mini confetti sparks
            for (let i = 0; i < 15; i++) {
                const miniSpark = new ConfettiHeart();
                miniSpark.x = btnPromise.getBoundingClientRect().left + btnPromise.offsetWidth / 2;
                miniSpark.y = btnPromise.getBoundingClientRect().top;
                celebParticles.push(miniSpark);
            }
        }, 300);
    });

});
