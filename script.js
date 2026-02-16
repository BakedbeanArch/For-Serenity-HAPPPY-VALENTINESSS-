/**
 * SERENITY - Cinematic Valentine Experience
 * Vanilla JS - GPU Optimized
 */

const CONFIG = {
    name: "SERENITY",
    totalPhotos: 12,
    captions: [
        "BOOKSSS...", "SWEETSS...", "CUTE MUGSSS...", 
        "HEARTIESSS...", "STOREEE...", "FLOWIEESSS...",
        "FLOWIEE STALLL...", "CHERRIEE...", "BIGG FLOWIEE...",
        "WINDOW FLOWIEE...", "SKIEEESS...", "FINALLL FLOWIEEEE..."
    ],
    vibration: [50, 30, 50]
};

let state = JSON.parse(localStorage.getItem('val_state')) || {
    unlocked: 1,
    completed: [],
    finished: false,
    eggProgress: []
};

// --- DOM ELEMENTS ---
const elements = {
    intro: document.getElementById('intro-scene'),
    album: document.getElementById('album-scene'),
    final: document.getElementById('final-scene'),
    bgMusic: document.getElementById('bg-music-ambient'),
    memAudio: document.getElementById('memory-audio'),
    lightbox: document.getElementById('lightbox'),
    grid: document.getElementById('photo-grid'),
    constellation: document.getElementById('progress-letters'),
    bloom: document.getElementById('bloom-layer')
};

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    renderAlbum();
    renderConstellation();
    setupEventListeners();
    
    if (state.unlocked > 1) {
        document.getElementById('continue-btn').classList.remove('hidden');
        document.getElementById('begin-btn').classList.add('hidden');
    }

    // Cinematic Intro Sequence
    setTimeout(playPixarIntro, 1000);
});

function setupEventListeners() {
    document.getElementById('begin-btn').onclick = startJourney;
    document.getElementById('continue-btn').onclick = startJourney;
    document.querySelector('.close-lightbox').onclick = closeLightbox;
    document.getElementById('restart-btn').onclick = resetJourney;
    document.getElementById('yes-btn').onclick = handleYes;

    const noBtn = document.getElementById('no-btn');
    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); });

    // Handle background audio resume for mobile
    document.body.addEventListener('click', () => {
        if (elements.bgMusic.paused && elements.intro.classList.contains('active') === false) {
            elements.bgMusic.play();
        }
    }, { once: true });
}

// --- STARFIELD ---
function initStarfield() {
    const field = document.getElementById('starfield');
    const count = window.innerWidth < 768 ? 50 : 120;
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const z = Math.random() * 1000;
        const size = Math.random() * 2 + 1;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--d', `${Math.random() * 3 + 2}s`);
        star.style.transform = `translateZ(${z}px)`;
        
        field.appendChild(star);
    }

    // Parallax effect
    window.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        field.style.transform = `rotateY(${moveX}deg) rotateX(${-moveY}deg)`;
    });
}

// --- CINEMATIC SEQUENCES ---
async function playPixarIntro() {
    const star = document.getElementById('pixar-star');
    const ui = document.getElementById('intro-ui');
    
    star.style.opacity = '1';
    await wait(1500);
    star.style.transform = 'scale(1.5) translateY(-20px)';
    haptic(10);
    await wait(500);
    star.style.transform = 'scale(1) translateY(0)';
    await wait(800);
    star.style.opacity = '0';
    star.style.transform = 'translateY(-200px) scale(0)';
    
    await wait(800);
    ui.classList.remove('hidden');
    setTimeout(() => ui.style.opacity = '1', 50);
}

function startJourney() {
    elements.bgMusic.volume = 0;
    elements.bgMusic.play();
    fadeAudio(elements.bgMusic, 0.4, 2000);
    
    elements.intro.classList.remove('active');
    elements.album.classList.add('active');
    haptic(30);
}

// --- ALBUM LOGIC ---
function renderAlbum() {
    elements.grid.innerHTML = '';
    for (let i = 1; i <= CONFIG.totalPhotos; i++) {
        const isLocked = i > state.unlocked;
        const card = document.createElement('div');
        card.className = `photo-card ${isLocked ? 'locked' : 'unlocked'}`;
        
        card.innerHTML = `
            <img src="images/${i}.jpg" loading="lazy" alt="Memory">
            ${isLocked ? '<div class="lock-icon">✦</div>' : ''}
        `;
        
        if (!isLocked) card.onclick = () => openLightbox(i);
        elements.grid.appendChild(card);
    }
}

function renderConstellation() {
    elements.constellation.innerHTML = '';
    const chars = CONFIG.name.split('');
    const progress = state.completed.length / CONFIG.totalPhotos;
    const litCount = Math.floor(progress * chars.length);

    chars.forEach((char, i) => {
        const span = document.createElement('span');
        span.innerText = char;
        if (i < litCount || state.finished) span.className = 'lit';
        
        // Easter Egg Listener
        span.onclick = () => handleEasterEgg(char);
        
        elements.constellation.appendChild(span);
    });

    // Intensify bloom based on progress
    elements.bloom.style.opacity = progress * 0.6;
}

// --- LIGHTBOX SYSTEM ---
function openLightbox(id) {
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    const hint = document.getElementById('audio-hint');
    
    img.src = `images/${id}.jpg`;
    cap.innerText = CONFIG.captions[id-1];
    
    elements.lightbox.classList.remove('hidden');
    document.querySelector('.media-container').classList.add('playing');
    
    // Crossfade Music
    fadeAudio(elements.bgMusic, 0.05, 1000);
    
    elements.memAudio.src = `audio/${id}.mp3`;
    elements.memAudio.play().catch(() => {
        hint.innerText = "Tap to Play Voice";
        elements.lightbox.onclick = () => elements.memAudio.play();
    });

    elements.memAudio.onended = () => {
        hint.innerText = "Memory Unlocked ✦";
        document.querySelector('.media-container').classList.remove('playing');
        unlockNext(id);
    };
}

function closeLightbox() {
    elements.lightbox.classList.add('hidden');
    elements.memAudio.pause();
    fadeAudio(elements.bgMusic, 0.4, 1000);
}

function unlockNext(id) {
    if (!state.completed.includes(id)) {
        state.completed.push(id);
        if (id === state.unlocked && state.unlocked < CONFIG.totalPhotos) {
            state.unlocked++;
        }
        haptic(CONFIG.vibration);
        save();
        renderAlbum();
        renderConstellation();
        checkFinal();
    }
}

// --- FINAL SCENE ---
function checkFinal() {
    if (state.completed.length === CONFIG.totalPhotos) {
        state.finished = true;
        save();
        setTimeout(() => {
            elements.album.classList.remove('active');
            elements.final.classList.add('active');
            elements.bloom.style.opacity = '1';
            typeQuestion();
        }, 2500);
    }
}

function typeQuestion() {
    const lead = document.getElementById('final-lead-in');
    const quest = document.getElementById('valentine-question');
    const text = `${CONFIG.name}, Will you be my Valentine?`;
    
    lead.classList.remove('hidden');
    lead.style.opacity = '1';
    
    setTimeout(() => {
        let i = 0;
        const interval = setInterval(() => {
            quest.innerHTML += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                document.getElementById('decision-buttons').classList.remove('hidden');
                setTimeout(() => document.getElementById('decision-buttons').style.opacity = '1', 50);
            }
        }, 100);
    }, 2000);
}

// --- INTERACTIVE ELEMENTS ---
function moveNoButton() {
    const btn = document.getElementById('no-btn');
    const x = Math.random() * (window.innerWidth - 150);
    const y = Math.random() * (window.innerHeight - 50);
    
    btn.style.position = 'fixed';
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.style.zIndex = "10000";
}

function handleYes() {
    haptic([100, 50, 100]);
    elements.bloom.style.background = 'radial-gradient(circle, rgba(255,105,180,0.4) 0%, transparent 70%)';
    alert("My heart is yours, always. ❤️");
    // Could trigger confetti or a final hidden photo here
}

function handleEasterEgg(char) {
    state.eggProgress.push(char);
    const target = CONFIG.name;
    if (state.eggProgress.join('').includes(target)) {
        haptic([10, 10, 10, 10, 50]);
        elements.bloom.style.opacity = '1';
        document.body.style.filter = 'sepia(0.5) saturate(1.5)';
        state.eggProgress = [];
    }
}

// --- UTILS ---
function save() { localStorage.setItem('val_state', JSON.stringify(state)); }

function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

function haptic(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

function fadeAudio(audio, targetVol, duration) {
    const startVol = audio.volume;
    const steps = 20;
    const interval = duration / steps;
    const delta = (targetVol - startVol) / steps;
    
    let currentStep = 0;
    const fader = setInterval(() => {
        audio.volume = Math.min(Math.max(audio.volume + delta, 0), 1);
        currentStep++;
        if (currentStep >= steps) clearInterval(fader);
    }, interval);
}

function resetJourney() {
    if(confirm("Erase all memories and start over?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}
