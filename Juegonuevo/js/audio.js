/* ===== audio.js — Sound effects + ambient drones per theme ===== */
"use strict";

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let ambientNodes = [];

function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
}

function playSound(freq, type, duration, vol) {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function sfxLaunch() {
    playSound(180, 'sine', 0.35, 0.2);
    playSound(280, 'triangle', 0.18, 0.12);
}
function sfxHit() { playSound(140 + Math.random() * 100, 'square', 0.1, 0.1); }
function sfxBreak() {
    playSound(70 + Math.random() * 50, 'sawtooth', 0.18, 0.15);
    playSound(200 + Math.random() * 80, 'square', 0.06, 0.08);
}
function sfxBreakWood() {
    playSound(120 + Math.random()*60, 'sawtooth', 0.15, 0.14);
    playSound(250 + Math.random()*80, 'triangle', 0.08, 0.08);
    playSound(80 + Math.random()*30, 'square', 0.05, 0.05);
}
function sfxBreakStone() {
    playSound(60 + Math.random()*30, 'square', 0.2, 0.18);
    playSound(150 + Math.random()*50, 'sawtooth', 0.12, 0.1);
    playSound(40 + Math.random()*20, 'sawtooth', 0.08, 0.06);
}
function sfxBreakMetal() {
    playSound(300 + Math.random()*150, 'square', 0.15, 0.12);
    playSound(500 + Math.random()*200, 'sawtooth', 0.1, 0.08);
    playSound(180 + Math.random()*60, 'triangle', 0.2, 0.06);
}
function sfxBreakIce() {
    playSound(800 + Math.random()*400, 'sine', 0.12, 0.1);
    playSound(1200 + Math.random()*300, 'sine', 0.08, 0.06);
    playSound(400 + Math.random()*200, 'triangle', 0.06, 0.05);
}
function sfxWin() {
    playSound(440, 'sine', 0.25, 0.2);
    setTimeout(() => playSound(554, 'sine', 0.25, 0.2), 180);
    setTimeout(() => playSound(659, 'sine', 0.25, 0.2), 360);
    setTimeout(() => playSound(880, 'sine', 0.5, 0.25), 540);
}
function sfxExplosion() {
    playSound(60, 'sawtooth', 0.4, 0.25);
    playSound(40, 'square', 0.3, 0.15);
}
function sfxPowerup() {
    playSound(600, 'sine', 0.15, 0.15);
    playSound(900, 'sine', 0.15, 0.12);
}
function sfxBurn() {
    playSound(90, 'sawtooth', 0.2, 0.08);
    playSound(120, 'triangle', 0.15, 0.06);
}
function sfxPhantom() {
    playSound(800, 'sine', 0.3, 0.1);
    playSound(1200, 'sine', 0.2, 0.06);
}
function sfxNullify() {
    playSound(200, 'sawtooth', 0.25, 0.12);
    playSound(100, 'square', 0.3, 0.08);
    playSound(400, 'sine', 0.15, 0.06);
}
function sfxHeal() {
    playSound(500, 'sine', 0.2, 0.1);
    playSound(750, 'sine', 0.18, 0.08);
    playSound(1000, 'sine', 0.12, 0.05);
}
function sfxMenuClick() {
    playSound(500, 'sine', 0.08, 0.12);
}
/* ===== Scream buffer cache (vocal formant synthesis) ===== */
let _screamBuffers = null;

async function _buildScreamBuffers() {
    ensureAudio();
    const sr = audioCtx.sampleRate;
    const bufs = [];
    /* Genera 8 variantes de grito con síntesis vocal realista */
    const variants = [
        { f0: 220, fEnd: 95,  dur: 0.88, formants: [700,1200,2600,3300], aspirate:0.30, jitter:8  },
        { f0: 560, fEnd: 190, dur: 0.62, formants: [850,1450,2800,3500], aspirate:0.45, jitter:12 },
        { f0: 340, fEnd: 140, dur: 0.48, formants: [750,1300,2500,3200], aspirate:0.35, jitter:6  },
        { f0: 300, fEnd: 110, dur: 0.92, formants: [680,1100,2700,3400], aspirate:0.25, jitter:10 },
        { f0: 170, fEnd: 75,  dur: 0.65, formants: [600,1000,2400,3100], aspirate:0.20, jitter:5  },
        { f0: 640, fEnd: 260, dur: 0.42, formants: [900,1600,2900,3600], aspirate:0.50, jitter:15 },
        { f0: 270, fEnd: 85,  dur: 0.78, formants: [720,1150,2550,3250], aspirate:0.40, jitter:20 },
        { f0: 420, fEnd: 155, dur: 0.55, formants: [800,1350,2650,3350], aspirate:0.55, jitter:8  }
    ];

    for (const v of variants) {
        const len = Math.ceil(sr * v.dur);
        const offline = new OfflineAudioContext(1, len, sr);

        /* ---- Fuente glotal (pulso + armónicos mejorados) ---- */
        const glottal = offline.createOscillator();
        glottal.type = 'sawtooth';
        glottal.frequency.setValueAtTime(v.f0, 0);
        glottal.frequency.linearRampToValueAtTime(v.f0 * 1.12, v.dur * 0.06);
        glottal.frequency.exponentialRampToValueAtTime(v.fEnd, v.dur * 0.85);
        /* Vibrato natural */
        const vib = offline.createOscillator();
        const vibG = offline.createGain();
        vib.frequency.value = 5 + Math.random() * 5;
        vibG.gain.value = 12 + Math.random() * 18;
        vib.connect(vibG); vibG.connect(glottal.frequency);
        vib.start(0); vib.stop(v.dur);
        /* Jitter (micro-perturbación de tono para realismo) */
        const jitLFO = offline.createOscillator();
        const jitG = offline.createGain();
        jitLFO.type = 'triangle';
        jitLFO.frequency.value = 20 + Math.random() * 30;
        jitG.gain.value = v.jitter || 8;
        jitLFO.connect(jitG); jitG.connect(glottal.frequency);
        jitLFO.start(0); jitLFO.stop(v.dur);
        /* Sub-armónico (octava inferior para profundidad) */
        const subOsc = offline.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(v.f0 / 2, 0);
        subOsc.frequency.exponentialRampToValueAtTime(Math.max(v.fEnd / 2, 30), v.dur * 0.85);
        const subGain = offline.createGain();
        subGain.gain.setValueAtTime(0.001, 0);
        subGain.gain.linearRampToValueAtTime(0.22, 0.04);
        subGain.gain.exponentialRampToValueAtTime(0.001, v.dur);
        subOsc.connect(subGain);
        subOsc.start(0); subOsc.stop(v.dur);

        const glotGain = offline.createGain();
        glotGain.gain.setValueAtTime(0.001, 0);
        glotGain.gain.linearRampToValueAtTime(0.9, 0.02);
        glotGain.gain.setValueAtTime(0.9, v.dur * 0.25);
        glotGain.gain.exponentialRampToValueAtTime(0.001, v.dur);
        glottal.connect(glotGain);
        glottal.start(0); glottal.stop(v.dur);

        /* ---- Ruido (componente de aire/grito) ---- */
        const noiseLen = len;
        const noiseBuf = offline.createBuffer(1, noiseLen, sr);
        const nd = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;
        const noiseSrc = offline.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        const aspLevel = v.aspirate || 0.35;
        const noiseGain = offline.createGain();
        noiseGain.gain.setValueAtTime(0.001, 0);
        noiseGain.gain.linearRampToValueAtTime(aspLevel + 0.15, 0.015);
        noiseGain.gain.linearRampToValueAtTime(aspLevel, 0.05);
        noiseGain.gain.setValueAtTime(aspLevel, v.dur * 0.2);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, v.dur);
        noiseSrc.connect(noiseGain);
        noiseSrc.start(0); noiseSrc.stop(v.dur);

        /* ---- Filtros formantes (simulan tracto vocal) ---- */
        const merger = offline.createGain();
        merger.gain.value = 1.0;
        glotGain.connect(merger);
        subGain.connect(merger);
        noiseGain.connect(merger);

        const masterGain = offline.createGain();
        masterGain.gain.value = 0;

        const fGains = [0.50, 0.35, 0.22, 0.12, 0.08];
        v.formants.forEach((freq, idx) => {
            const bp = offline.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = freq;
            bp.Q.value = 6 + idx * 2.5;
            const fg = offline.createGain();
            fg.gain.value = fGains[idx] || 0.08;
            merger.connect(bp);
            bp.connect(fg);
            fg.connect(masterGain);
        });

        /* Paso directo suave para cuerpo */
        const directG = offline.createGain();
        directG.gain.value = 0.15;
        merger.connect(directG);
        directG.connect(masterGain);

        /* Envolvente master */
        masterGain.gain.setValueAtTime(0.001, 0);
        masterGain.gain.linearRampToValueAtTime(1.0, 0.025);
        masterGain.gain.setValueAtTime(1.0, v.dur * 0.3);
        masterGain.gain.exponentialRampToValueAtTime(0.001, v.dur - 0.01);

        /* Compresor para unificar volumen */
        const comp = offline.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.ratio.value = 6;
        comp.attack.value = 0.003;
        comp.release.value = 0.05;
        masterGain.connect(comp);
        comp.connect(offline.destination);

        const rendered = await offline.startRendering();
        bufs.push(rendered);
    }
    return bufs;
}

let _screamIdx = 0;

async function sfxEnemyDeath() {
    ensureAudio();
    if (!_screamBuffers) {
        try { _screamBuffers = await _buildScreamBuffers(); }
        catch (e) {
            /* Fallback: tono simple si falla */
            playSound(500, 'sawtooth', 0.3, 0.3);
            playSound(250, 'square', 0.2, 0.2);
            return;
        }
    }
    const buf = _screamBuffers[_screamIdx % _screamBuffers.length];
    _screamIdx++;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    /* Variación aleatoria de tono ±15% para que cada muerte suene distinta */
    src.playbackRate.value = 0.85 + Math.random() * 0.30;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.7;
    src.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();
}

/* ===== Ambient drones per theme ===== */
const AMBIENT_CONFIGS = {
    prairie:  [{f:120,t:'sine',v:0.02},{f:180,t:'sine',v:0.01}],
    desert:   [{f:80,t:'sine',v:0.025},{f:160,t:'triangle',v:0.01}],
    forest:   [{f:100,t:'sine',v:0.02},{f:150,t:'sine',v:0.015}],
    snow:     [{f:200,t:'sine',v:0.015},{f:300,t:'sine',v:0.008}],
    tundra:   [{f:60,t:'sine',v:0.025},{f:90,t:'triangle',v:0.012}],
    volcano:  [{f:50,t:'sawtooth',v:0.02},{f:70,t:'square',v:0.008}],
    castle:   [{f:110,t:'sine',v:0.02},{f:165,t:'sine',v:0.01}],
    ruins:    [{f:55,t:'sine',v:0.025},{f:82,t:'triangle',v:0.012}],
    inferno:  [{f:42,t:'sawtooth',v:0.025},{f:63,t:'square',v:0.01}],
    space:    [{f:220,t:'sine',v:0.015},{f:330,t:'sine',v:0.008}],
    swamp:    [{f:80,t:'sine',v:0.02},{f:120,t:'triangle',v:0.012},{f:200,t:'sine',v:0.006}],
    darkdim:  [{f:45,t:'sine',v:0.022},{f:67,t:'sawtooth',v:0.008},{f:180,t:'sine',v:0.005}],
    ocean:    [{f:70,t:'sine',v:0.02},{f:110,t:'sine',v:0.012},{f:180,t:'triangle',v:0.006}],
    jungle:   [{f:95,t:'sine',v:0.018},{f:140,t:'triangle',v:0.01},{f:280,t:'sine',v:0.005}],
    sky:      [{f:250,t:'sine',v:0.012},{f:375,t:'sine',v:0.006}],
    cave:     [{f:55,t:'sine',v:0.025},{f:80,t:'triangle',v:0.01}],
    crystal:  [{f:300,t:'sine',v:0.01},{f:450,t:'sine',v:0.006},{f:600,t:'sine',v:0.003}],
    abyss:    [{f:35,t:'sine',v:0.025},{f:52,t:'sawtooth',v:0.008}],
    clockwork:[{f:100,t:'square',v:0.01},{f:150,t:'triangle',v:0.008},{f:200,t:'square',v:0.005}],
    nexus:    [{f:60,t:'sine',v:0.02},{f:120,t:'sine',v:0.01},{f:240,t:'sine',v:0.005}]
};

function startAmbient(theme) {
    stopAmbient();
    ensureAudio();
    const cfg = AMBIENT_CONFIGS[theme];
    if (!cfg) return;
    cfg.forEach(c => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = c.t;
        osc.frequency.setValueAtTime(c.f, audioCtx.currentTime);
        gain.gain.setValueAtTime(c.v, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        ambientNodes.push({osc, gain});
    });
}

function stopAmbient() {
    ambientNodes.forEach(n => {
        try { n.osc.stop(); } catch(e) {}
    });
    ambientNodes = [];
}
