/* ===== game.js — Motor principal: menú → mapa → juego (ballesta + poderes de flecha) ===== */
"use strict";

const { Engine, Bodies, Body, Composite, Events, Vector } = Matter;

/* ===== Screens ===== */
let gameScreen = 'menu';

/* ===== Canvas & DOM ===== */
const canvas = document.getElementById("game");
const ctx    = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

const scoreEl       = document.getElementById("score");
const shotsEl       = document.getElementById("shots");
const remainingEl   = document.getElementById("remaining");
const enemiesEl     = document.getElementById("enemies");
const levelLabelEl  = document.getElementById("levelLabel");
const resetBtn      = document.getElementById("resetBtn");
const overlay       = document.getElementById("overlay");
const overlayContent= document.getElementById("overlayContent");
const menuScreen    = document.getElementById("menuScreen");
const mapScreen     = document.getElementById("mapScreen");
const gameShell     = document.getElementById("gameShell");
const mapGrid       = document.getElementById("mapGrid");
const startBtn      = document.getElementById("startBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const backToMapBtn  = document.getElementById("backToMapBtn");
const mechDescEl    = document.getElementById("mechDesc");
const powerBar      = document.getElementById("powerBar");

/* ===== Physics ===== */
const engine = Engine.create({ gravity: { x: 0, y: 1.2 }, enableSleeping: true,
    positionIterations: 10, velocityIterations: 8 });
const world  = engine.world;
Matter.Sleeping._motionSleepThreshold = 0.12;

/* ===== Constants ===== */
const GROUND_Y    = 590;
const SLING       = { x: 150, y: 500 };
const MAX_PULL    = 140;
const LAUNCH_MULT = 0.18;
const CAT_BALL    = 0x0001;
const CAT_BLOCK   = 0x0002;
const CAT_GROUND  = 0x0004;

const MATERIALS = {
    wood:     { density:0.003, friction:0.7, restitution:0.2,  hp:180,  colors:['#b87333','#c4843d','#a86428','#9a5520'] },
    stone:    { density:0.006, friction:0.9, restitution:0.08, hp:380,  colors:['#808080','#909090','#707070','#686868'] },
    metal:    { density:0.01,  friction:0.5, restitution:0.03, hp:650,  colors:['#556070','#606878','#4a5565','#505a68'] },
    ice:      { density:0.002, friction:0.05,restitution:0.5,  hp:120,  colors:['#a0d8f0','#b0e0f8','#90c8e8','#88c0e0'] },
    rubber:   { density:0.002, friction:0.95,restitution:0.85, hp:150,  colors:['#c04060','#d05070','#b03050','#a02848'] },
    glass:    { density:0.004, friction:0.3, restitution:0.15, hp:80,   colors:['#c0d8e8','#d0e4f0','#b0cce0','#a8c4d8'] },
    obsidian: { density:0.012, friction:0.6, restitution:0.02, hp:800,  colors:['#1a1028','#201430','#160c22','#120820'] }
};

/* ===== Arrow Powers ===== */
const POWERS = {
    normal:    { name:'Normal',     icon:'🏹', color:'#c0c0c0', desc:'Flecha estándar' },
    fire:      { name:'Fuego',      icon:'🔥', color:'#ff6030', desc:'Incendia bloques al impactar', charges:5 },
    explosive: { name:'Explosiva',  icon:'💥', color:'#ff4040', desc:'Explota al impactar, daño en área', charges:1 }
};

/* ===== Game state ===== */
let score = 0;
/* 🎯 ballsLeft = número de flechas disponibles para el nivel actual */
let ballsLeft = 5, currentLevel = 0;
let activeBall = null, blockBodies = [], enemyBodies = [];
let particles = [], ambientParts = [];
let dragging = false, launched = false;
let waitingForRest = false, waitingTimer = 0;
let gameOver = false, levelWon = false;
let bestScores = {};
let unlockedUpTo = 0;
let damageEnabled = false;
let frameCount = 0, launchFrameCount = 0;
let initialBlockCount = 0;     /* total de bloques al inicio (para cálculo de estrellas) */
let initialEnemyCount = 0;     /* total de enemigos al inicio */
let selectedPower = 'normal';  /* poder de flecha seleccionado */
let powerCharges = {};         /* cargas: { fire:2, explosive:1, ice:2, piercing:1 } */
let testerMode = false;        /* modo tester: todo desbloqueado + flechas infinitas */

/* ===== Static boundaries ===== */
let staticBodies = [];
function createBoundaries() {
    staticBodies.forEach(b => Composite.remove(world, b));
    staticBodies = [];
    const opts = { isStatic: true, friction: 0.9, restitution: 0.1,
        collisionFilter: { category: CAT_GROUND, mask: CAT_BALL | CAT_BLOCK } };
    staticBodies = [
        Bodies.rectangle(W / 2, GROUND_Y + 30, W + 200, 60, opts),
        Bodies.rectangle(-30, H / 2, 60, H + 200, opts),
        Bodies.rectangle(W + 30, H / 2, 60, H + 200, opts)
    ];
    Composite.add(world, staticBodies);
}

/* ===== Particles ===== */
function spawnParticles(x, y, color, count, type) {
    for (let i = 0; i < count; i++) {
        particles.push({ x, y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.9)*8,
            life: 20+Math.random()*35, maxLife: 55,
            size: 2+Math.random()*4, color, type: type||'square' });
    }
}
function updateParticles() {
    for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.15; p.x += p.vx; p.y += p.vy; p.vx *= 0.98; p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

/* ===== Ambient particles ===== */
function initAmbientParticles(theme) {
    ambientParts = [];
    const t = BG_THEMES[theme]; if (!t || !t.ambientParticles) return;
    const type = t.ambientParticles;
    const count = type==='snow'?60:(type==='embers'?30:25);
    for (let i = 0; i < count; i++) ambientParts.push(mkAmbP(type, true));
}
function mkAmbP(type, rY) {
    const p = { x: Math.random()*W, y: rY?Math.random()*GROUND_Y:-5,
        size: 1+Math.random()*3, alpha: 0.3+Math.random()*0.5, type };
    if (type==='snow')      { p.vx=(Math.random()-0.5)*0.8; p.vy=0.5+Math.random()*1.2; p.color='#fff'; p.shape='circle'; }
    else if (type==='embers'){ p.vx=(Math.random()-0.5)*1.5; p.vy=-(0.5+Math.random()*2); p.color=Math.random()>0.5?'#ff6020':'#ffaa30'; p.shape='circle'; p.y=GROUND_Y+Math.random()*20; }
    else if (type==='leaves'){ p.vx=0.3+Math.random()*0.8; p.vy=0.2+Math.random()*0.5; p.color=Math.random()>0.5?'#8a6020':'#6a8a20'; p.shape='square'; }
    else if (type==='sand')  { p.vx=1+Math.random()*2; p.vy=(Math.random()-0.5)*0.5; p.color='#d4a860'; p.shape='square'; p.size=1+Math.random()*1.5; }
    else if (type==='fireflies'){ p.vx=(Math.random()-0.5)*0.4; p.vy=(Math.random()-0.5)*0.3; p.color='#aaffaa'; p.shape='circle'; p.size=1.5+Math.random(); p.alpha=0.2+Math.random()*0.6; }
    return p;
}
function updateAmbientParticles() {
    const t = BG_THEMES[LEVELS[currentLevel].bg]; if (!t || !t.ambientParticles) return;
    for (let i = ambientParts.length-1; i >= 0; i--) {
        const p = ambientParts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.type==='fireflies') {
            p.vx += (Math.random()-0.5)*0.05; p.vy += (Math.random()-0.5)*0.05;
            p.alpha = 0.2 + 0.5*Math.abs(Math.sin(frameCount*0.03+i));
        }
        if (p.x<-10||p.x>W+10||p.y<-10||p.y>GROUND_Y+30) {
            ambientParts[i] = mkAmbP(p.type, false);
            const np = ambientParts[i];
            if (p.type==='snow') { np.y=-5; np.x=Math.random()*W; }
            else if (p.type==='embers') { np.y=GROUND_Y+Math.random()*10; np.x=Math.random()*W; }
            else { np.x=-5; np.y=Math.random()*GROUND_Y; }
        }
    }
}

/* ===== Block creation ===== */
function createBlock(def) {
    const mat = MATERIALS[def.mat] || MATERIALS.wood;
    const body = Bodies.rectangle(def.x, def.y, def.w, def.h, {
        density: mat.density, friction: mat.friction, restitution: mat.restitution,
        collisionFilter: { category: CAT_BLOCK, mask: CAT_BALL | CAT_BLOCK | CAT_GROUND },
        chamfer: { radius: 1 }, isSleeping: true
    });
    body.gameData = { hp: mat.hp, maxHp: mat.hp, mat: def.mat, w: def.w, h: def.h,
        color: mat.colors[Math.floor(Math.random()*mat.colors.length)],
        burning: false, burnTimer: 0, frozen: false,
        shield: false, shieldActive: false,
        fireproof: def.fireproof || false,
        blastproof: def.blastproof || false
    };
    return body;
}

/* ===== Enemy Types ===== */
const ENEMY_TYPES = {
    villager:  { hp: 120, radius: 14, label: '👨‍🌾', color: '#8a6a40' },
    soldier:   { hp: 180, radius: 14, label: '💂', color: '#606878' },
    knight:    { hp: 260, radius: 15, label: '🛡️', color: '#5a6a80' },
    wizard:    { hp: 160, radius: 14, label: '🧙', color: '#6a40a0' },
    king:      { hp: 350, radius: 16, label: '👑', color: '#c8a040' },
    skeleton:  { hp: 100, radius: 13, label: '💀', color: '#c8c0a0' },
    demon:     { hp: 300, radius: 15, label: '👹', color: '#a03020' },
    alien:     { hp: 220, radius: 14, label: '👽', color: '#60a080' },
    healer:    { hp: 170, radius: 14, label: '💚', color: '#40a060' },
    nullifier: { hp: 200, radius: 15, label: '🚫', color: '#8040c0' },
    boss_ogre:     { hp: 600,  radius: 20, label: '👹', color: '#704020', isBoss:true },
    boss_dragon:   { hp: 900,  radius: 22, label: '🐉', color: '#c04020', isBoss:true },
    boss_lich:     { hp: 800,  radius: 21, label: '🧟', color: '#5030a0', isBoss:true },
    boss_titan:    { hp: 1100, radius: 24, label: '⚔️', color: '#606880', isBoss:true },
    boss_overlord: { hp: 1500, radius: 25, label: '😈', color: '#800020', isBoss:true }
};

/* ===== Enemy creation ===== */
function createEnemy(def) {
    const et = ENEMY_TYPES[def.type] || ENEMY_TYPES.villager;
    const body = Bodies.circle(def.x, def.y, et.radius, {
        density: 0.004, friction: 0.6, restitution: 0.2,
        collisionFilter: { category: CAT_BLOCK, mask: CAT_BALL | CAT_BLOCK | CAT_GROUND },
        isSleeping: true
    });
    body.gameData = {
        isEnemy: true, hp: et.hp, maxHp: et.hp,
        type: def.type, radius: et.radius,
        label: et.label, color: et.color,
        burning: false, burnTimer: 0, frozen: false,
        isBoss: et.isBoss || false,
        hasBuiltBarrier: false
    };
    if (def.type === 'healer') {
        body.gameData.healTimer = 0;
        body.gameData.healInterval = 150;
        body.gameData.healRadius = 160;
        body.gameData.healAmount = 12;
    }
    if (def.type === 'nullifier') {
        body.gameData.nullRadius = 140;
    }
    return body;
}

/* ===== Arrow (projectile) creation ===== */
function createBall() {
    if (activeBall) Composite.remove(world, activeBall);
    activeBall = Bodies.circle(SLING.x, SLING.y, 16, {
        density: 0.008, friction: 0.4, restitution: 0.5,
        collisionFilter: { category: CAT_BALL, mask: CAT_BLOCK | CAT_GROUND }
    });
    Body.setStatic(activeBall, true);
    activeBall.gameData = { launched: false, power: 'normal', trail: [] };
    Composite.add(world, activeBall);
    launched = false; waitingForRest = false; waitingTimer = 0; dragging = false;
}

/* ===== Level loading ===== */
function loadLevel(index) {
    Composite.clear(world, false);
    particles = []; score = 0;
    gameOver = false; levelWon = false;
    damageEnabled = false;
    overlay.classList.remove('show');
    currentLevel = index;
    const lvl = LEVELS[index];
    /* 🎯 Flechas del nivel: lvl.balls define cuántas flechas tiene este nivel */
    ballsLeft = testerMode ? 999 : lvl.balls;
    engine.gravity.y = 1.2;
    selectedPower = 'normal';
    powerCharges = {};
    for (const key in POWERS) { if (POWERS[key].charges) powerCharges[key] = testerMode ? 999 : POWERS[key].charges; }
    createBoundaries();
    const defs = lvl.build(700, GROUND_Y - 16);
    blockBodies = defs.map(d => createBlock(d));
    initialBlockCount = blockBodies.length;
    Composite.add(world, blockBodies);
    /* Enemies */
    const enemyDefs = lvl.enemies ? lvl.enemies(700, GROUND_Y - 16) : [];
    enemyBodies = enemyDefs.map(d => createEnemy(d));
    initialEnemyCount = enemyBodies.length;
    Composite.add(world, enemyBodies);
    initAmbientParticles(lvl.bg);
    createBall(); updateHud(); updatePowerBar();
    if (mechDescEl) mechDescEl.textContent = lvl.name;
    startAmbient(lvl.bg);
    /* Pre-construir buffers de grito en la primera carga */
    if (!_screamBuffers) sfxEnemyDeath().catch(()=>{});
}

/* ===== HUD ===== */
function updateHud() {
    scoreEl.textContent = Math.round(score);
    shotsEl.textContent = ballsLeft;
    remainingEl.textContent = blockBodies.length;
    if (enemiesEl) enemiesEl.textContent = enemyBodies.length;
    const lvl = LEVELS[currentLevel];
    levelLabelEl.textContent = 'Nivel ' + (currentLevel+1) + ' — ' + lvl.name;
}

/* ===== Power Bar UI ===== */
function updatePowerBar() {
    const bar = powerBar || document.getElementById("powerBar");
    if (!bar) return;
    bar.innerHTML = '';
    const keys = Object.keys(POWERS);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const pw = POWERS[key];
        const btn = document.createElement('button');
        btn.className = 'power-btn' + (key === selectedPower ? ' active' : '');
        /* Inline styles as fallback in case CSS doesn't load */
        btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;' +
            'padding:6px 12px;min-width:70px;border-radius:8px;cursor:pointer;' +
            'font-family:Cinzel,serif;font-size:12px;color:#e8d8c0;' +
            'background:rgba(42,26,10,0.9);border:2px solid #d4a040;';
        const charges = key === 'normal' ? '∞' : (powerCharges[key] || 0);
        const disabled = key !== 'normal' && (!powerCharges[key] || powerCharges[key] <= 0);
        if (disabled) { btn.classList.add('disabled'); btn.style.opacity = '0.3'; }
        if (key === selectedPower) {
            btn.style.borderColor = pw.color;
            btn.style.background = 'rgba(212,160,64,0.15)';
            btn.style.boxShadow = '0 0 10px rgba(212,160,64,0.3)';
        }
        btn.innerHTML = '<span style="font-size:20px">' + pw.icon + '</span>' +
            '<span style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#a09078">' + pw.name + '</span>' +
            '<span style="font-size:11px;font-weight:700;color:#f0c860">' + charges + '</span>';
        btn.title = pw.desc;
        btn.addEventListener('click', () => {
            if (key !== 'normal' && (!powerCharges[key] || powerCharges[key] <= 0)) return;
            selectedPower = key;
            updatePowerBar();
        });
        bar.appendChild(btn);
    }
}

/* ===== Power Effects ===== */
function applyExplosion(cx, cy) {
    sfxExplosion();
    spawnParticles(cx, cy, '#ff6020', 25, 'ember');
    spawnParticles(cx, cy, '#ffcc00', 15);
    spawnParticles(cx, cy, '#ff3000', 10, 'ember');
    const targets = blockBodies.concat(enemyBodies);
    for (const block of targets) {
        const dx = block.position.x - cx, dy = block.position.y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 180) {
            const factor = 1 - dist/180;
            const dmg = block.gameData.blastproof ? 60 * factor : 300 * factor;
            block.gameData.hp -= dmg;
            Matter.Sleeping.set(block, false);
            const nd = dist || 1;
            const fMult = block.gameData.blastproof ? 0.01 : 0.05;
            Body.applyForce(block, block.position, { x: dx/nd*factor*fMult, y: dy/nd*factor*fMult - 0.02 });
            score += Math.floor(20 * factor);
        }
    }
}

function applyFire(cx, cy) {
    sfxBurn();
    spawnParticles(cx, cy, '#ff6020', 12, 'ember');
    const targets = blockBodies.concat(enemyBodies);
    let burnCount = 0;
    const maxBurn = 4;
    for (const block of targets) {
        if (burnCount >= maxBurn) break;
        if (block.gameData.fireproof) continue;
        const dx = block.position.x - cx, dy = block.position.y - cy;
        if (Math.sqrt(dx*dx + dy*dy) < 80) {
            block.gameData.burning = true;
            block.gameData.burnTimer = 100;
            Matter.Sleeping.set(block, false);
            burnCount++;
        }
    }
}

function updateBurningBlocks() {
    const targets = blockBodies.concat(enemyBodies);
    for (const block of targets) {
        if (block.gameData.burning) {
            block.gameData.burnTimer--;
            block.gameData.hp -= 0.8;
            const py = block.gameData.isEnemy ? block.position.y - block.gameData.radius : block.position.y - block.gameData.h/2;
            if (Math.random() < 0.3) spawnParticles(block.position.x, py, '#ff6020', 1, 'ember');
            if (block.gameData.burnTimer <= 0) block.gameData.burning = false;
        }
    }
}

/* ===== Enemy Barrier Building ===== */
let barrierCheckTimer = 0;
function checkEnemyBarriers() {
    barrierCheckTimer++;
    if (barrierCheckTimer < 180) return;
    barrierCheckTimer = 0;
    for (const e of enemyBodies) {
        const gd = e.gameData;
        if (gd.frozen || gd.hasBuiltBarrier) continue;
        let hasNearby = false;
        for (const b of blockBodies) {
            const dx = b.position.x - e.position.x, dy = b.position.y - e.position.y;
            if (Math.sqrt(dx*dx + dy*dy) < 100) { hasNearby = true; break; }
        }
        if (!hasNearby) {
            gd.hasBuiltBarrier = true;
            const ex = e.position.x, ey = e.position.y;
            const barrierDefs = [
                {x:ex-25, y:ey, w:20, h:40, mat:'stone'},
                {x:ex+25, y:ey, w:20, h:40, mat:'stone'},
                {x:ex,    y:ey-30, w:54, h:14, mat:'stone'}
            ];
            for (const def of barrierDefs) {
                const block = createBlock(def);
                block.gameData.hp = 350;
                block.gameData.maxHp = 350;
                block.gameData.isBarrier = true;
                blockBodies.push(block);
                Composite.add(world, block);
                Matter.Sleeping.set(block, false);
            }
            spawnParticles(ex, ey, '#a08060', 12);
        }
    }
}

/* ===== Advanced Enemy AI ===== */

function updateHealerEnemies() {
    for (const e of enemyBodies) {
        const gd = e.gameData;
        if (gd.type !== 'healer' || gd.frozen) continue;
        gd.healTimer = (gd.healTimer || 0) + 1;
        if (gd.healTimer >= gd.healInterval) {
            gd.healTimer = 0;
            let healed = false;
            for (const b of blockBodies) {
                if (b.gameData.hp >= b.gameData.maxHp) continue;
                const bx = b.position.x - e.position.x;
                const by = b.position.y - e.position.y;
                if (Math.sqrt(bx*bx + by*by) < gd.healRadius) {
                    b.gameData.hp = Math.min(b.gameData.maxHp, b.gameData.hp + gd.healAmount);
                    b.gameData.burning = false;
                    healed = true;
                }
            }
            if (healed) {
                spawnParticles(e.position.x, e.position.y, '#40ff60', 10, 'circle');
                sfxHeal();
            }
        }
    }
}

function updateNullifierEnemies() {
    if (!activeBall || !launched || !activeBall.gameData) return;
    for (const e of enemyBodies) {
        if (e.gameData.type !== 'nullifier') continue;
        const dx = activeBall.position.x - e.position.x;
        const dy = activeBall.position.y - e.position.y;
        if (Math.sqrt(dx*dx + dy*dy) < e.gameData.nullRadius) {
            if (activeBall.gameData.power !== 'normal') {
                activeBall.gameData.power = 'normal';
                spawnParticles(activeBall.position.x, activeBall.position.y, '#a040ff', 15);
                sfxNullify();
            }
        }
    }
}

/* ===== Collision events ===== */
Events.on(engine, 'collisionStart', (event) => {
    if (!damageEnabled) return;
    for (const pair of event.pairs) {
        const a = pair.bodyA, b = pair.bodyB;
        const ballHit = (a === activeBall || b === activeBall);
        const relVel = Vector.sub(a.velocity||{x:0,y:0}, b.velocity||{x:0,y:0});
        const speed = Vector.magnitude(relVel);
        const threshold = ballHit ? 2.5 : 5;
        if (speed < threshold) continue;

        [a, b].forEach(body => {
            if (body.gameData && body.gameData.hp !== undefined) {
                /* Enemies resist non-ball impacts (falls, block bumps) */
                if (body.gameData.isEnemy && !ballHit) {
                    body.gameData.hp -= speed * 0.5;
                    return;
                }
                const mult = ballHit ? 4 : 1.5;
                body.gameData.hp -= speed * speed * mult;
                score += Math.min(20, speed * 2);
                if (speed > 3.5) sfxHit();
            }
        });

        /* Arrow power effects on block impact */
        if (ballHit && activeBall && activeBall.gameData) {
            const power = activeBall.gameData.power;
            const cx = (a.position.x + b.position.x) / 2;
            const cy = (a.position.y + b.position.y) / 2;
            const hitBlock = (a === activeBall) ? b : a;
            if (hitBlock.gameData && hitBlock.gameData.hp !== undefined) {
                if (power === 'explosive') { applyExplosion(cx, cy); activeBall.gameData.power = 'normal'; }
                if (power === 'fire') applyFire(cx, cy);
            }
        }

        if (pair.activeContacts && pair.activeContacts.length > 0) {
            const cp = pair.activeContacts[0].vertex;
            spawnParticles(cp.x, cp.y, '#fde68a', Math.min(10, Math.floor(speed*1.5)));
        }
    }
});

/* ===== Remove destroyed blocks ===== */
function removeDestroyedBlocks() {
    const toRemove = [];
    for (let i = blockBodies.length-1; i >= 0; i--) {
        const b = blockBodies[i], gd = b.gameData;
        const oob = b.position.x<-200||b.position.x>W+200||b.position.y>H+200||b.position.y<-300;
        if (gd.hp <= 0 || oob) {
            spawnParticles(b.position.x, b.position.y, gd.color, 14);
            /* Sonido según material */
            if (gd.mat === 'wood') sfxBreakWood();
            else if (gd.mat === 'stone' || gd.mat === 'obsidian') sfxBreakStone();
            else if (gd.mat === 'metal' || gd.mat === 'clockwork') sfxBreakMetal();
            else if (gd.mat === 'ice' || gd.mat === 'glass' || gd.mat === 'crystal') sfxBreakIce();
            else if (gd.mat === 'rubber') sfxHit();
            else sfxBreak();
            score += 50;
            toRemove.push(i);
            Composite.remove(world, b);
        }
    }
    toRemove.forEach(i => blockBodies.splice(i, 1));
    if (toRemove.length > 0) {
        for (const b of blockBodies) Matter.Sleeping.set(b, false);
        for (const b of enemyBodies) Matter.Sleeping.set(b, false);
    }
    /* Remove destroyed enemies */
    const enemyRemove = [];
    for (let i = enemyBodies.length-1; i >= 0; i--) {
        const e = enemyBodies[i], gd = e.gameData;
        const oob = e.position.x<-200||e.position.x>W+200||e.position.y>H+200||e.position.y<-300;
        if (gd.hp <= 0 || oob) {
            spawnParticles(e.position.x, e.position.y, '#ff4040', 10, 'circle');
            spawnParticles(e.position.x, e.position.y, '#ffd040', 8);
            sfxEnemyDeath();
            score += 100;
            enemyRemove.push(i);
            Composite.remove(world, e);
        }
    }
    enemyRemove.forEach(i => enemyBodies.splice(i, 1));
    if (enemyRemove.length > 0) {
        for (const b of blockBodies) Matter.Sleeping.set(b, false);
    }
}

/* ===== Game state check ===== */
function checkGameState() {
    if (gameOver || levelWon) return;
    removeDestroyedBlocks();
    updateBurningBlocks();
    checkEnemyBarriers();
    updateHealerEnemies();
    updateNullifierEnemies();
    /* Win when all enemies are dead (or no enemies) AND all blocks destroyed */
    const allEnemiesDead = enemyBodies.length === 0;
    const allBlocksDead = blockBodies.length === 0;
    if (allEnemiesDead && allBlocksDead) {
        levelWon = true; score += ballsLeft * 120; sfxWin();
        setTimeout(() => showOverlay(true), 700);
        return;
    }
    if (!launched) return;
    if (activeBall) {
        const bp = activeBall.position;
        if (bp.x<-300||bp.x>W+300||bp.y>H+300||bp.y<-600) {
            Composite.remove(world, activeBall); activeBall = null;
        }
    }
    if (!waitingForRest) { waitingForRest = true; waitingTimer = 0; launchFrameCount = frameCount; return; }
    const spd = activeBall ? Vector.magnitude(activeBall.velocity) : 0;
    if (spd < 0.4) waitingTimer++; else waitingTimer = Math.max(0, waitingTimer-2);
    if (frameCount - launchFrameCount > 300) waitingTimer = 101;
    if (waitingTimer > 100) {
        if (ballsLeft > 0) createBall();
        else { gameOver = true; setTimeout(() => showOverlay(false), 700); }
    }
}

/* ===== Overlay — estrellas basadas en % de destrucción ===== */
function showOverlay(won) {
    const destroyedBlocks = initialBlockCount - blockBodies.length;
    const destroyedEnemies = initialEnemyCount - enemyBodies.length;
    const totalInitial = initialBlockCount + initialEnemyCount;
    const totalDestroyed = destroyedBlocks + destroyedEnemies;
    const pct = totalInitial > 0 ? totalDestroyed / totalInitial : 0;
    let stars;
    if (won) {
        stars = ballsLeft >= 2 ? 3 : 2;   /* Victoria: 2★ mínimo, 3★ si sobran flechas */
    } else if (pct >= 0.9) {
        stars = 2;
    } else if (pct >= 0.7) {
        stars = 1;
    } else {
        stars = 0;
    }
    const starsStr = '\u2605'.repeat(stars) + '\u2606'.repeat(3-stars);
    const sc = Math.round(score);
    if (won || stars > 0) {
        const key = 'lvl'+currentLevel;
        if (!bestScores[key] || sc > bestScores[key]) bestScores[key] = sc;
        if (!bestScores[key+'s'] || stars > bestScores[key+'s']) bestScores[key+'s'] = stars;
        if (currentLevel >= unlockedUpTo) unlockedUpTo = currentLevel + 1;
    }
    const hasNext = (won || stars > 0) && currentLevel < LEVELS.length-1;
    const pctText = Math.round(pct * 100) + '% destruido';
    const enemyText = initialEnemyCount > 0 ? ' — Enemigos: ' + destroyedEnemies + '/' + initialEnemyCount : '';
    overlayContent.innerHTML =
        '<h2>' + (won ? '\u00a1Victoria!' : (stars > 0 ? '\u00a1Buen intento!' : 'Derrota')) + '</h2>' +
        '<p>' + (won ? 'Fortaleza destruida' : 'Sin flechas restantes') + '</p>' +
        '<div class="overlay-pct">' + pctText + enemyText + '</div>' +
        '<div class="stars">' + starsStr + '</div>' +
        '<div class="big-score">' + sc + '</div>' +
        '<div>' +
            '<button onclick="loadLevel('+currentLevel+');overlay.classList.remove(\'show\');">Reintentar</button>' +
            (hasNext ? '<button onclick="loadLevel('+(currentLevel+1)+');overlay.classList.remove(\'show\');">Siguiente</button>' : '') +
            '<button onclick="showMap();">Mapa</button>' +
        '</div>';
    overlay.classList.add('show');
}

/* ===== Input ===== */
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: (p.clientX-rect.left)*W/rect.width, y: (p.clientY-rect.top)*H/rect.height };
}
function pointerDown(e) {
    if (gameScreen !== 'playing' || gameOver || levelWon) return;
    ensureAudio();
    if (!activeBall || launched) return;
    const p = getPointerPos(e), pos = activeBall.position;
    if (Math.sqrt((p.x-pos.x)**2+(p.y-pos.y)**2) < 55) dragging = true;
}
function pointerMove(e) {
    if (!dragging || !activeBall || launched) return;
    const p = getPointerPos(e);
    let dx = p.x-SLING.x, dy = p.y-SLING.y;
    const len = Math.sqrt(dx*dx+dy*dy);
    if (len > MAX_PULL) { dx = dx/len*MAX_PULL; dy = dy/len*MAX_PULL; }
    Body.setPosition(activeBall, { x: SLING.x+dx, y: SLING.y+dy });
}
function pointerUp() {
    if (!dragging || !activeBall || launched) return;
    dragging = false;
    const pos = activeBall.position;
    const dx = SLING.x-pos.x, dy = SLING.y-pos.y;
    if (Math.sqrt(dx*dx+dy*dy) < 15) { Body.setPosition(activeBall,{x:SLING.x,y:SLING.y}); return; }
    Body.setStatic(activeBall, false);
    Matter.Sleeping.set(activeBall, false);
    Body.setVelocity(activeBall, { x: dx*LAUNCH_MULT, y: dy*LAUNCH_MULT });
    launched = true; damageEnabled = true;
    activeBall.gameData.launched = true;
    activeBall.gameData.power = selectedPower;
    if (selectedPower !== 'normal' && powerCharges[selectedPower] > 0) powerCharges[selectedPower]--;
    if (selectedPower !== 'normal' && (powerCharges[selectedPower] || 0) <= 0) selectedPower = 'normal';
    updatePowerBar();
    waitingForRest = false; waitingTimer = 0; ballsLeft--;
    sfxLaunch(); updateHud();
}

canvas.addEventListener('mousedown', pointerDown);
window.addEventListener('mousemove', pointerMove);
window.addEventListener('mouseup', pointerUp);
canvas.addEventListener('touchstart', e => { e.preventDefault(); pointerDown(e); }, { passive: false });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); pointerMove(e); }, { passive: false });
window.addEventListener('touchend', pointerUp);
resetBtn.addEventListener('click', () => loadLevel(currentLevel));

/* ===== Screen management ===== */
function showMenu() {
    gameScreen = 'menu';
    menuScreen.classList.add('show'); mapScreen.classList.remove('show');
    gameShell.style.display = 'none'; overlay.classList.remove('show');
    stopAmbient();
}
function showMap() {
    gameScreen = 'map';
    menuScreen.classList.remove('show'); mapScreen.classList.add('show');
    gameShell.style.display = 'none'; overlay.classList.remove('show');
    stopAmbient(); buildMapGrid();
}
function startGame(idx) {
    if (!testerMode && idx > unlockedUpTo) return;
    gameScreen = 'playing';
    menuScreen.classList.remove('show'); mapScreen.classList.remove('show');
    gameShell.style.display = ''; ensureAudio(); loadLevel(idx);
}

/* ===== PATH MAP ===== */
const THEME_LABELS = {
    prairie:'🌾 Pradera', desert:'🏜️ Desierto', forest:'🌲 Bosque',
    snow:'❄️ Nieve', tundra:'🌌 Tundra', volcano:'🌋 Volcán',
    castle:'🏰 Castillo', ruins:'🏛️ Ruinas', inferno:'🔥 Infierno', space:'🚀 Espacio',
    swamp:'🌿 Pantano', darkdim:'🌑 Dimensión Oscura',
    ocean:'🌊 Océano', jungle:'🌴 Jungla', sky:'☁️ Cielo',
    cave:'⛏️ Caverna', crystal:'💎 Cristal', abyss:'🕳️ Abismo',
    clockwork:'⚙️ Mecanismo', nexus:'✨ Nexo'
};

function buildMapGrid() {
    mapGrid.innerHTML = '';
    const COLS = 5;
    const total = LEVELS.length;
    const rows = Math.ceil(total / COLS);
    let lastTheme = '';

    for (let r = 0; r < rows; r++) {
        const firstIdx = r * COLS;
        const theme = LEVELS[firstIdx] ? LEVELS[firstIdx].bg : '';

        /* Theme section header */
        if (theme !== lastTheme) {
            const header = document.createElement('div');
            header.className = 'map-theme-header';
            header.textContent = THEME_LABELS[theme] || theme;
            mapGrid.appendChild(header);
            lastTheme = theme;
        }

        const rowDiv = document.createElement('div');
        rowDiv.className = 'path-row' + (r % 2 === 1 ? ' reversed' : '');

        const indices = [];
        for (let c = 0; c < COLS; c++) {
            const idx = r * COLS + c;
            if (idx < total) indices.push(idx);
        }
        if (r % 2 === 1) indices.reverse();

        indices.forEach((idx, ci) => {
            const lvl = LEVELS[idx];
            const starsCount = bestScores['lvl'+idx+'s'] || 0;
            const unlocked = testerMode || idx <= unlockedUpTo;
            const bestScore = bestScores['lvl'+idx] || 0;

            if (ci > 0) {
                const conn = document.createElement('div');
                conn.className = 'path-conn' + (unlocked ? ' active' : '');
                rowDiv.appendChild(conn);
            }

            const node = document.createElement('button');
            node.className = 'path-node';
            if (!unlocked) node.classList.add('locked');
            if (starsCount > 0) node.classList.add('completed');
            if (starsCount === 3) node.classList.add('perfect');

            const numSpan = document.createElement('span');
            numSpan.className = 'path-num';
            numSpan.textContent = unlocked ? (idx+1) : '🔒';
            node.appendChild(numSpan);

            if (starsCount > 0) {
                const starSpan = document.createElement('span');
                starSpan.className = 'path-stars';
                starSpan.textContent = '\u2605'.repeat(starsCount);
                node.appendChild(starSpan);
            }

            node.title = unlocked ? lvl.name + (bestScore ? ' — ' + bestScore + ' pts' : '') : 'Bloqueado';
            node.addEventListener('click', () => {
                if (!unlocked) return;
                sfxMenuClick(); startGame(idx);
            });
            rowDiv.appendChild(node);
        });

        mapGrid.appendChild(rowDiv);

        if (r < rows - 1) {
            const vconn = document.createElement('div');
            vconn.className = 'path-vconn-wrap' + (r % 2 === 1 ? ' left' : ' right');
            const unlockNext = testerMode || ((r+1)*COLS) <= unlockedUpTo;
            vconn.innerHTML = '<div class="path-vconn' + (unlockNext ? ' active' : '') + '"></div>';
            mapGrid.appendChild(vconn);
        }
    }
}

startBtn.addEventListener('click', () => { ensureAudio(); sfxMenuClick(); showMap(); });
backToMenuBtn.addEventListener('click', () => { sfxMenuClick(); showMenu(); });
backToMapBtn.addEventListener('click', () => { sfxMenuClick(); showMap(); });

/* ===== Tester Mode ===== */
function activateTesterMode() {
    const pwd = prompt('Ingresa la contraseña de tester:');
    if (pwd === 'tester2025') {
        testerMode = true;
        alert('Modo Tester activado. Todos los niveles desbloqueados, flechas y poderes infinitos.');
        showMap();
    } else if (pwd !== null) {
        alert('Contraseña incorrecta.');
    }
}
const testerBtn = document.getElementById('testerBtn');
if (testerBtn) testerBtn.addEventListener('click', activateTesterMode);

/* ===== Game loop ===== */
let lastTime = 0;
function gameLoop(ts) {
    if (!lastTime) lastTime = ts;
    const delta = Math.min(ts - lastTime, 50);
    lastTime = ts; frameCount++;

    if (gameScreen === 'playing') {
        const steps = Math.min(3, Math.max(1, Math.round(delta/16.67)));
        for (let s = 0; s < steps; s++) Engine.update(engine, 16.67);
        checkGameState(); updateParticles(); updateAmbientParticles(); updateHud();
        /* Update arrow trail for visual effects */
        if (activeBall && launched && activeBall.gameData) {
            activeBall.gameData.trail.push({x:activeBall.position.x, y:activeBall.position.y});
            if (activeBall.gameData.trail.length > 15) activeBall.gameData.trail.shift();
        }

        const lvl = LEVELS[currentLevel];
        ctx.clearRect(0, 0, W, H);
        drawBackground(ctx, W, GROUND_Y, lvl.bg, frameCount);
        drawGround(ctx, W, H, GROUND_Y, lvl.bg);
        drawCrossbow(ctx, SLING, activeBall, launched);
        drawTrajectory(ctx, dragging, activeBall, launched, SLING, LAUNCH_MULT, engine.gravity.y, GROUND_Y);
        drawBlocks(ctx, blockBodies, lvl.bg);
        drawEnemies(ctx, enemyBodies, frameCount);
        drawArrow(ctx, activeBall, GROUND_Y, frameCount);
        drawParticles(ctx, particles);
        drawAmbientParticles(ctx, ambientParts);
        drawMaterialLegend(ctx, H);
    }
    requestAnimationFrame(gameLoop);
}

/* ===== Start ===== */
showMenu();
requestAnimationFrame(gameLoop);
