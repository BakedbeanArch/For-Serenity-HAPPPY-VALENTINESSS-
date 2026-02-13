const CONFIG = {
    name: "SERENITY",
    totalPhotos: 12,
    captions: [
        "Boooks...", "Sweeets...", "Cute mugss...", 
        "Accey...", "Storeee...", "Flowiess...",
        "Displayyy...", "Cherryy...", "BIGGG Flowiee...",
        "Vasee...", "Skyyy...", "Every step led to you"
    ]
};

let state = JSON.parse(localStorage.getItem('val_state')) || {
    unlocked: 1,
    completed: [],
    finished: false
};

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    renderAlbum();
    renderConstellation();
    
    if (state.unlocked > 1) {
        document.getElementById('continue-btn').classList.remove('hidden');
        document.getElementById('begin-btn').classList.add('hidden');
    }

    setTimeout(playPixarIntro, 800);
});

function initStarfield() {
    const field = document.getElementById('starfield');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 2 + 1 + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.setProperty('--d', Math.random() * 3 + 2 + 's');
        field.appendChild(star);
    }
}

// --- PIXAR STYLE INTRO ---
async function playPixarIntro() {
    const star = document.getElementById('pixar-star');
    const ui = document.getElementById('intro-ui');
    
    star.style.opacity = '1';
    await wait(1500);
    star.style.transform = 'translateY(-15px) scale(1.4)';
    await wait(400);
    star.style.transform = 'translateY(0) scale(1)';
    await wait(600);
    star.style.transform = 'translateY(-200px)';
    star.style.opacity = '0';
    await wait(800);
    
    ui.classList.remove('hidden');
    setTimeout(() => ui.style.opacity = '1', 50);
}

// --- ALBUM RENDER ---
function renderAlbum() {
    const grid = document.getElementById('photo-grid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= CONFIG.totalPhotos; i++) {
        const card = document.createElement('div');
        const locked = i > state.unlocked;
        card.className = `photo-card ${locked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <img src="images/${i}.jpg" loading="lazy" onerror="this.parentElement.style.background='#222'">
            ${locked ? '<div class="lock-icon">✦</div>' : ''}
        `;
        
        if (!locked) card.onclick = () => openLightbox(i);
        grid.appendChild(card);
    }
}

function renderConstellation() {
    const container = document.getElementById('progress-letters');
    container.innerHTML = '';
    const chars = CONFIG.name.split('');
    const progress = state.completed.length / CONFIG.totalPhotos;
    const litCount = Math.floor(progress * chars.length);

    chars.forEach((char, i) => {
        const span = document.createElement('span');
        span.innerText = char;
        if (i < litCount || state.finished) span.className = 'lit';
        container.appendChild(span);
    });
}

// --- LIGHTBOX SYSTEM ---
function openLightbox(id) {
    const lb = document.getElementById('lightbox');
    const audio = document.getElementById('memory-audio');
    const hint = document.getElementById('audio-hint');
    
    document.getElementById('lightbox-img').src = `images/${id}.jpg`;
    document.getElementById('lightbox-caption').innerText = CONFIG.captions[id-1];
    audio.src = `audio/${id}.mp3`;
    
    lb.classList.remove('hidden');
    hint.innerText = "Listening...";
    
    audio.play().catch(() => {
        hint.innerText = "Tap to Play Voice";
        lb.onclick = () => audio.play();
    });

    audio.onended = () => {
        hint.innerText = "Memory Unlocked ✦";
        if (!state.completed.includes(id)) {
            state.completed.push(id);
            if (id === state.unlocked && state.unlocked < CONFIG.totalPhotos) {
                state.unlocked++;
            }
            save();
            renderAlbum();
            renderConstellation();
            checkFinal();
        }
    };
}

// --- FINAL SCENE ---
function checkFinal() {
    if (state.completed.length === CONFIG.totalPhotos) {
        state.finished = true;
        save();
        setTimeout(() => {
            document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
            document.getElementById('final-scene').classList.add('active');
            typeQuestion();
        }, 2000);
    }
}

function typeQuestion() {
    const lead = document.getElementById('final-lead-in');
    const quest = document.getElementById('valentine-question');
    const text = `${CONFIG.name}, will you be my Valentine?`;
    
    lead.classList.remove('hidden');
    setTimeout(() => {
        let i = 0;
        const interval = setInterval(() => {
            quest.innerHTML += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                document.getElementById('decision-buttons').classList.remove('hidden');
            }
        }, 100);
    }, 2000);
}

// --- BUTTON LOGIC ---
document.getElementById('begin-btn').onclick = () => {
    document.getElementById('bg-music').play().catch(()=>{});
    document.getElementById('intro-scene').classList.remove('active');
    document.getElementById('album-scene').classList.add('active');
};
document.getElementById('continue-btn').onclick = document.getElementById('begin-btn').onclick;

document.querySelector('.close-lightbox').onclick = () => {
    document.getElementById('lightbox').classList.add('hidden');
    document.getElementById('memory-audio').pause();
};

const noBtn = document.getElementById('no-btn');
noBtn.addEventListener('touchstart', moveNoButton);
noBtn.addEventListener('mouseover', moveNoButton);

function moveNoButton(e) {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 50);
    noBtn.style.position = 'fixed';
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
    noBtn.style.zIndex = "3000";
}

document.getElementById('yes-btn').onclick = () => {
    alert("I love you! ❤️ (Check the stars now)");
    location.reload(); 
};

function save() { localStorage.setItem('val_state', JSON.stringify(state)); }
function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

document.getElementById('restart-btn').onclick = () => {
    if(confirm("Start our journey over?")) {
        localStorage.clear();
        location.reload();
    }
};