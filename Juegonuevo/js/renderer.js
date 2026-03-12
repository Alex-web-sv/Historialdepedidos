/* ===== renderer.js — Canvas drawing: crossbow, arrows, themed blocks, 10 backgrounds ===== */
"use strict";

/* ===== Theme Block Color Overrides ===== */
const THEME_BLOCK_TINTS = {
    prairie: { wood:'#c89040', stone:'#a09070', metal:'#607050', ice:'#b0e0d0', rubber:'#c06040', glass:'#90c0a0', obsidian:'#2a2030' },
    desert:  { wood:'#d4a860', stone:'#c4a878', metal:'#8a7060', ice:'#c0d8e0', rubber:'#c07848', glass:'#b0a878', obsidian:'#3a2818' },
    forest:  { wood:'#6a5a20', stone:'#608060', metal:'#506048', ice:'#80c0a0', rubber:'#6a4828', glass:'#608858', obsidian:'#1a2018' },
    snow:    { wood:'#b0a898', stone:'#c0c8d0', metal:'#8090a0', ice:'#d0e8ff', rubber:'#a08878', glass:'#b0c8d8', obsidian:'#404858' },
    tundra:  { wood:'#5a4a48', stone:'#607080', metal:'#506070', ice:'#90b8d0', rubber:'#5a4040', glass:'#607888', obsidian:'#282838' },
    volcano: { wood:'#5a2010', stone:'#4a2828', metal:'#4a3030', ice:'#ff8060', rubber:'#6a2818', glass:'#5a3028', obsidian:'#1a0808' },
    castle:  { wood:'#7a5028', stone:'#9a7050', metal:'#5a5060', ice:'#a0b8d0', rubber:'#8a5838', glass:'#7a8090', obsidian:'#2a2030' },
    ruins:   { wood:'#5a5040', stone:'#686860', metal:'#505050', ice:'#90a0a0', rubber:'#5a4838', glass:'#606060', obsidian:'#1a1818' },
    inferno: { wood:'#4a1808', stone:'#3a1818', metal:'#3a2028', ice:'#ff6040', rubber:'#5a2010', glass:'#4a2020', obsidian:'#0a0408' },
    space:   { wood:'#404858', stone:'#384050', metal:'#5060a0', ice:'#6080c0', rubber:'#404060', glass:'#4860a0', obsidian:'#101028' },
    swamp:   { wood:'#4a5028', stone:'#506040', metal:'#405838', ice:'#70a880', rubber:'#7a5040', glass:'#607860', obsidian:'#303830' },
    darkdim: { wood:'#302040', stone:'#282038', metal:'#3a2860', ice:'#5040a0', rubber:'#502848', glass:'#3a2858', obsidian:'#1a1030' },
    ocean:   { wood:'#6a5a48', stone:'#607888', metal:'#507080', ice:'#80c0e0', rubber:'#805848', glass:'#6090b0', obsidian:'#203848' },
    jungle:  { wood:'#5a4a18', stone:'#506030', metal:'#405828', ice:'#70b080', rubber:'#7a5020', glass:'#608050', obsidian:'#203020' },
    sky:     { wood:'#a08858', stone:'#90a0b0', metal:'#7088a0', ice:'#a0d0f0', rubber:'#b08868', glass:'#88b0d0', obsidian:'#405868' },
    cave:    { wood:'#5a4030', stone:'#605848', metal:'#505040', ice:'#809098', rubber:'#6a4838', glass:'#606858', obsidian:'#282420' },
    crystal: { wood:'#4a3058', stone:'#483868', metal:'#4a3880', ice:'#6050a0', rubber:'#5a3060', glass:'#7050a0', obsidian:'#201040' },
    abyss:   { wood:'#2a1820', stone:'#281828', metal:'#302030', ice:'#402848', rubber:'#3a1828', glass:'#382038', obsidian:'#100810' },
    clockwork:{ wood:'#6a5838', stone:'#605840', metal:'#8a7848', ice:'#90a088', rubber:'#7a6038', glass:'#807050', obsidian:'#3a3420' },
    nexus:   { wood:'#3a2858', stone:'#383060', metal:'#4a3878', ice:'#6050b0', rubber:'#4a2858', glass:'#5048a0', obsidian:'#1a1040' }
};

/* ===== Background Drawing ===== */
function drawBackground(ctx, W, GROUND_Y, theme, frameCount) {
    const t = BG_THEMES[theme];
    if (!t) return;
    const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    t.sky.forEach(s => grad.addColorStop(s.pos, s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, GROUND_Y);
    if (t.stars) drawStars(ctx, W, GROUND_Y, frameCount);
    if (t.nebula) drawNebula(ctx, W, GROUND_Y, frameCount);
    if (t.aurora) drawAurora(ctx, W, frameCount);
    if (t.moon) drawMoon(ctx, t.moon);
    if (t.sun) drawSun(ctx, t.sun);
    if (t.clouds) {
        const offset = (frameCount * 0.15) % (W + 200);
        drawCloud(ctx, (100 + offset) % (W + 200) - 100, 55, 1.0);
        drawCloud(ctx, (400 + offset * 0.7) % (W + 200) - 100, 40, 0.7);
        drawCloud(ctx, (650 + offset * 0.5) % (W + 200) - 100, 75, 0.85);
    }
    if (t.mountains) drawMountains(ctx, W, GROUND_Y);
    if (t.dunes) drawDunes(ctx, W, GROUND_Y);
    if (t.trees) t.trees.forEach(tree => drawTree(ctx, tree.x, GROUND_Y, tree.s, theme));
    if (t.fog) drawFog(ctx, W, GROUND_Y, frameCount);
    if (t.lava) drawLavaGlow(ctx, W, GROUND_Y, frameCount);
    if (t.lightning) drawLightning(ctx, W, GROUND_Y, frameCount);
}

function drawStars(ctx, W, H, frame) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 80; i++) {
        const x = (i * 137.5 + 50) % W;
        const y = (i * 97.3 + 20) % (H * 0.7);
        const flicker = 0.5 + 0.5 * Math.sin(frame * 0.02 + i * 1.3);
        ctx.globalAlpha = flicker * 0.8;
        ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
}

function drawNebula(ctx, W, H, frame) {
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 4; i++) {
        const cx = 200 + i * 180;
        const cy = 80 + i * 40 + Math.sin(frame * 0.003 + i) * 20;
        const r = 80 + i * 20;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const hue = (i * 60 + frame * 0.1) % 360;
        g.addColorStop(0, `hsla(${hue},80%,60%,0.3)`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
}

function drawAurora(ctx, W, frame) {
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 5; i++) {
        const y = 40 + i * 18 + Math.sin(frame * 0.008 + i) * 15;
        const grd = ctx.createLinearGradient(0, y, W, y);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(0.3, '#40ff80');
        grd.addColorStop(0.5, '#4080ff');
        grd.addColorStop(0.7, '#ff40ff');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, y, W, 12);
    }
    ctx.globalAlpha = 1;
}

function drawMoon(ctx, moon) {
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);
    ctx.fillStyle = '#e8e0d0';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, moon.r + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232,224,208,0.08)';
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath(); ctx.arc(moon.x - 6, moon.y - 4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(moon.x + 8, moon.y + 6, 3, 0, Math.PI * 2); ctx.fill();
}

function drawSun(ctx, sun) {
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.r + 20, 0, Math.PI * 2);
    ctx.fillStyle = sun.glow;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
    ctx.fillStyle = sun.color;
    ctx.fill();
}

function drawCloud(ctx, x, y, s) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    [[0,0,28],[24,-10,22],[44,-5,25],[62,2,20],[18,8,18]].forEach(([ox,oy,r]) => {
        ctx.beginPath();
        ctx.arc(x + ox * s, y + oy * s, r * s, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMountains(ctx, W, GY) {
    ctx.fillStyle = '#c8d8e8';
    ctx.beginPath();
    ctx.moveTo(0, GY); ctx.lineTo(80, GY - 100); ctx.lineTo(180, GY - 40);
    ctx.lineTo(300, GY - 130); ctx.lineTo(420, GY - 50); ctx.lineTo(W, GY - 80);
    ctx.lineTo(W, GY); ctx.fill();
    ctx.fillStyle = '#f0f4f8';
    ctx.beginPath(); ctx.moveTo(65,GY-85); ctx.lineTo(80,GY-100); ctx.lineTo(95,GY-85); ctx.fill();
    ctx.beginPath(); ctx.moveTo(275,GY-110); ctx.lineTo(300,GY-130); ctx.lineTo(325,GY-110); ctx.fill();
}

function drawDunes(ctx, W, GY) {
    ctx.fillStyle = '#c8a050';
    ctx.beginPath(); ctx.moveTo(0, GY);
    for (let x = 0; x <= W; x += 5) {
        ctx.lineTo(x, GY - 15 - Math.sin(x * 0.008) * 20 - Math.sin(x * 0.015) * 10);
    }
    ctx.lineTo(W, GY); ctx.fill();
}

function drawTree(ctx, x, gy, s, theme) {
    const tc = theme === 'forest' ? '#3a2a10' : '#5a3a1a';
    const lc = theme === 'forest' ? ['#1a4a10','#2a5a18','#1a3a0e'] : ['#3a7a20','#4a8a30','#2a6a18'];
    const tw = 8 * s, th = 50 * s;
    ctx.fillStyle = tc;
    ctx.fillRect(x - tw / 2, gy - th, tw, th);
    lc.forEach((c, i) => {
        ctx.beginPath();
        const r = (28 - i * 5) * s;
        ctx.arc(x, gy - th - i * 16 * s, r, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.fill();
    });
}

function drawFog(ctx, W, GY, frame) {
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 3; i++) {
        const y = GY - 60 + i * 30 + Math.sin(frame * 0.005 + i * 2) * 10;
        const grd = ctx.createLinearGradient(0, y, W, y);
        grd.addColorStop(0, 'transparent'); grd.addColorStop(0.3, '#a0d0a0');
        grd.addColorStop(0.7, '#80b080'); grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, y, W, 20);
    }
    ctx.globalAlpha = 1;
}

function drawLavaGlow(ctx, W, GY, frame) {
    const flicker = 0.6 + 0.4 * Math.sin(frame * 0.04);
    const grd = ctx.createLinearGradient(0, GY - 40, 0, GY + 60);
    grd.addColorStop(0, 'transparent');
    grd.addColorStop(0.5, `rgba(255,60,0,${0.15 * flicker})`);
    grd.addColorStop(1, `rgba(255,30,0,${0.25 * flicker})`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, GY - 40, W, 100);
}

function drawLightning(ctx, W, GY, frame) {
    if (Math.random() > 0.995) {
        ctx.fillStyle = `rgba(200,180,255,${0.05 + Math.random() * 0.08})`;
        ctx.fillRect(0, 0, W, GY);
    }
}

/* ===== Ground ===== */
function drawGround(ctx, W, H, GROUND_Y, theme) {
    const t = BG_THEMES[theme]; if (!t) return;
    ctx.fillStyle = t.ground;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = t.groundDark;
    ctx.fillRect(0, GROUND_Y - 3, W, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, GROUND_Y - 3, W, 2);
    ctx.fillStyle = t.dirt;
    ctx.fillRect(0, GROUND_Y + 22, W, H - GROUND_Y - 22);
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < 40; i++) {
        ctx.fillRect((i * 23.7) % W, GROUND_Y + 5 + (i * 13.3) % 15, 3, 2);
    }
}

/* ===== Crossbow (replaces slingshot) — faces RIGHT ===== */
function drawCrossbow(ctx, SLING, activeBall, launched) {
    const cx = SLING.x, cy = SLING.y;

    /* Shadow */
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(cx - 30, cy + 42, 60, 6);

    /* Stock (horizontal body) — extends to the LEFT */
    draw3DRect(ctx, cx - 72, cy - 10, 80, 16, '#5a3010', '#3a1a08', '#7a4a20');
    /* Stock grip — on the LEFT end */
    draw3DRect(ctx, cx - 70, cy - 6, 20, 28, '#4a2808', '#2a1808', '#6a3818');

    /* Bow arms (curved) — extend to the RIGHT */
    ctx.strokeStyle = '#6a4020';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    /* Top arm */
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 10);
    ctx.quadraticCurveTo(cx + 40, cy - 50, cx + 55, cy - 35);
    ctx.stroke();
    /* Bottom arm */
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy + 6);
    ctx.quadraticCurveTo(cx + 40, cy + 46, cx + 55, cy + 31);
    ctx.stroke();

    /* Bow arm tips — on the RIGHT */
    ctx.fillStyle = '#8a6030';
    ctx.beginPath(); ctx.arc(cx + 55, cy - 35, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 55, cy + 31, 4, 0, Math.PI * 2); ctx.fill();

    /* Bowstring — from RIGHT tips to arrow nock */
    ctx.strokeStyle = '#c0a060';
    ctx.lineWidth = 2;
    if (activeBall && !launched) {
        const bp = activeBall.position;
        ctx.beginPath();
        ctx.moveTo(cx + 55, cy - 35);
        ctx.lineTo(bp.x - 8, bp.y);
        ctx.lineTo(cx + 55, cy + 31);
        ctx.stroke();
    } else {
        /* Resting string */
        ctx.beginPath();
        ctx.moveTo(cx + 55, cy - 35);
        ctx.lineTo(cx + 10, cy - 2);
        ctx.lineTo(cx + 55, cy + 31);
        ctx.stroke();
    }

    /* Stock rail (groove for arrow) */
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 68, cy - 2);
    ctx.lineTo(cx + 8, cy - 2);
    ctx.stroke();

    /* Metal reinforcements */
    ctx.fillStyle = '#707880';
    ctx.fillRect(cx - 4, cy - 12, 6, 20);
    ctx.fillRect(cx - 36, cy - 8, 4, 12);

    /* Base stand */
    draw3DRect(ctx, cx - 25, cy + 38, 50, 10, '#5a3010', '#3a1a08', '#7a4a20');
    draw3DRect(ctx, cx - 12, cy + 20, 12, 20, '#4a2808', '#2a1808', '#6a3818');
}

/* ===== Arrow (replaces ball) ===== */
function drawArrow(ctx, activeBall, GROUND_Y, frameCount) {
    if (!activeBall) return;
    const pos = activeBall.position;
    const gd = activeBall.gameData || {};
    const vel = activeBall.velocity || {x:0, y:0};
    const spd = Math.sqrt(vel.x*vel.x + vel.y*vel.y);
    const angle = gd.launched ? Math.atan2(vel.y, vel.x) : Math.atan2(0, 1); /* point RIGHT toward targets */
    const power = gd.power || 'normal';

    /* Arrow shadow on ground */
    if (pos.y < GROUND_Y - 10) {
        ctx.beginPath();
        ctx.ellipse(pos.x, GROUND_Y - 2, 14, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fill();
    }

    /* Trail effect based on power */
    if (gd.launched && gd.trail && gd.trail.length > 1) {
        const trail = gd.trail;
        for (let i = 0; i < trail.length - 1; i++) {
            const alpha = (i / trail.length) * 0.4;
            if (power === 'fire') {
                ctx.fillStyle = `rgba(255,${80+Math.random()*40},0,${alpha})`;
                ctx.beginPath();
                ctx.arc(trail[i].x + (Math.random()-0.5)*6, trail[i].y + (Math.random()-0.5)*6,
                    3 + Math.random()*3, 0, Math.PI*2);
                ctx.fill();
            } else if (power === 'explosive') {
                ctx.fillStyle = `rgba(255,40,40,${alpha})`;
                ctx.beginPath();
                ctx.arc(trail[i].x, trail[i].y, 2+i*0.2, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

    const len = 36;  /* arrow length */
    const hw = len / 2;

    /* Power glow aura */
    if (power !== 'normal' && gd.launched) {
        const glowColors = { fire:'rgba(255,100,0,0.3)', explosive:'rgba(255,40,40,0.35)' };
        const pulse = 0.7 + 0.3 * Math.sin(frameCount * 0.15);
        ctx.shadowColor = glowColors[power] || 'transparent';
        ctx.shadowBlur = 12 * pulse;
    }

    /* Shaft */
    ctx.fillStyle = '#8a6a30';
    ctx.fillRect(-hw, -2, len - 8, 4);

    /* Arrowhead */
    ctx.fillStyle = '#a0a8b0';
    ctx.beginPath();
    ctx.moveTo(hw, 0);
    ctx.lineTo(hw - 12, -5);
    ctx.lineTo(hw - 10, 0);
    ctx.lineTo(hw - 12, 5);
    ctx.closePath();
    ctx.fill();
    /* Arrowhead edge highlight */
    ctx.strokeStyle = '#c0c8d0';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    /* Fletching (feathers) */
    ctx.fillStyle = power === 'fire' ? '#ff6030' :
                    power === 'explosive' ? '#ff4040' : '#cc3030';
    /* Top feather */
    ctx.beginPath();
    ctx.moveTo(-hw, -1);
    ctx.lineTo(-hw - 4, -7);
    ctx.lineTo(-hw + 8, -1);
    ctx.closePath();
    ctx.fill();
    /* Bottom feather */
    ctx.beginPath();
    ctx.moveTo(-hw, 1);
    ctx.lineTo(-hw - 4, 7);
    ctx.lineTo(-hw + 8, 1);
    ctx.closePath();
    ctx.fill();

    /* Nock */
    ctx.fillStyle = '#5a4020';
    ctx.fillRect(-hw - 2, -1.5, 4, 3);

    /* Power-specific decorations on shaft */
    if (power === 'fire' && gd.launched) {
        ctx.fillStyle = `rgba(255,160,0,${0.3 + 0.2*Math.sin(frameCount*0.2)})`;
        ctx.fillRect(-hw + 4, -3, len - 16, 6);
    }
    if (power === 'explosive' && gd.launched) {
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.2);
        ctx.fillStyle = `rgba(255,0,0,${0.2 * pulse})`;
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.restore();
}

/* ===== Blocks with theme-matched styles ===== */
function drawBlocks(ctx, blockBodies, theme) {
    const tint = THEME_BLOCK_TINTS[theme];
    for (const body of blockBodies) {
        const gd = body.gameData;
        const pos = body.position;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(body.angle);
        const hw = gd.w / 2, hh = gd.h / 2, d = 4;

        /* Get theme-tinted color or default */
        const baseColor = (tint && tint[gd.mat]) || gd.color;

        /* 3D side (right) */
        ctx.fillStyle = darkenColor(baseColor, 0.6);
        ctx.beginPath(); ctx.moveTo(hw,-hh); ctx.lineTo(hw+d,-hh+d); ctx.lineTo(hw+d,hh+d); ctx.lineTo(hw,hh); ctx.fill();
        /* 3D bottom */
        ctx.fillStyle = darkenColor(baseColor, 0.45);
        ctx.beginPath(); ctx.moveTo(-hw,hh); ctx.lineTo(-hw+d,hh+d); ctx.lineTo(hw+d,hh+d); ctx.lineTo(hw,hh); ctx.fill();
        /* Face */
        ctx.fillStyle = baseColor;
        ctx.fillRect(-hw, -hh, gd.w, gd.h);
        /* Top highlight */
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(-hw, -hh, gd.w, 3);

        /* Material texture */
        if (gd.mat === 'wood') drawWoodTexture(ctx, -hw, -hh, gd.w, gd.h);
        else if (gd.mat === 'stone') drawStoneTexture(ctx, -hw, -hh, gd.w, gd.h);
        else if (gd.mat === 'metal') drawMetalTexture(ctx, -hw, -hh, gd.w, gd.h);
        else if (gd.mat === 'ice') drawIceTexture(ctx, -hw, -hh, gd.w, gd.h);
        else if (gd.mat === 'rubber') drawRubberTexture(ctx, -hw, -hh, gd.w, gd.h);
        else if (gd.mat === 'glass') drawGlassTexture(ctx, -hw, -hh, gd.w, gd.h);
        else if (gd.mat === 'obsidian') drawObsidianTexture(ctx, -hw, -hh, gd.w, gd.h);

        /* Theme-specific overlay effects */
        if (theme === 'volcano' || theme === 'inferno') {
            ctx.fillStyle = 'rgba(255,60,0,0.06)';
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
        } else if (theme === 'snow' || theme === 'tundra') {
            ctx.fillStyle = 'rgba(200,220,255,0.08)';
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
            /* Snow cap on top */
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(-hw, -hh, gd.w, 3);
        } else if (theme === 'space') {
            ctx.fillStyle = 'rgba(80,100,200,0.08)';
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
            /* Tech lines */
            ctx.strokeStyle = 'rgba(100,150,255,0.15)';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(-hw+2, -hh+gd.h*0.3); ctx.lineTo(hw-2, -hh+gd.h*0.3); ctx.stroke();
        } else if (theme === 'forest') {
            /* Moss overlay */
            ctx.fillStyle = 'rgba(60,120,40,0.08)';
            ctx.fillRect(-hw, hh-4, gd.w, 4);
        } else if (theme === 'ruins') {
            /* Aged overlay */
            ctx.fillStyle = 'rgba(80,70,50,0.1)';
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
        } else if (theme === 'castle') {
            /* Mortar lines for stone */
            if (gd.mat === 'stone') {
                ctx.strokeStyle = 'rgba(180,160,120,0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(-hw, -hh+gd.h/2); ctx.lineTo(hw, -hh+gd.h/2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-hw+gd.w/3, -hh); ctx.lineTo(-hw+gd.w/3, -hh+gd.h/2); ctx.stroke();
            }
        }

        /* Damage overlay */
        const dmg = 1 - (gd.hp / gd.maxHp);
        if (dmg > 0.15) {
            ctx.fillStyle = `rgba(0,0,0,${dmg * 0.35})`;
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
            if (dmg > 0.3) drawCracks(ctx, hw, hh, dmg);
        }

        /* Burning overlay */
        if (gd.burning) {
            ctx.fillStyle = `rgba(255,80,0,${0.2 + 0.1 * Math.sin(Date.now() * 0.01)})`;
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
            ctx.strokeStyle = 'rgba(255,160,0,0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-hw, -hh, gd.w, gd.h);
        }

        /* Frozen overlay */
        if (gd.frozen) {
            ctx.fillStyle = 'rgba(160,220,255,0.25)';
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
            ctx.strokeStyle = 'rgba(200,240,255,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-hw, -hh, gd.w, gd.h);
        }

        /* Shield overlay */
        if (gd.shield && gd.shieldActive) {
            ctx.strokeStyle = 'rgba(100,180,255,0.6)';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(100,180,255,0.4)';
            ctx.shadowBlur = 8;
            ctx.strokeRect(-hw - 1, -hh - 1, gd.w + 2, gd.h + 2);
            ctx.shadowBlur = 0;
        }

        /* Fireproof indicator */
        if (gd.fireproof) {
            ctx.fillStyle = 'rgba(255,120,30,0.15)';
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
            ctx.strokeStyle = 'rgba(255,100,0,0.5)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-hw + 1, -hh + 1, gd.w - 2, gd.h - 2);
        }
        /* Blastproof indicator */
        if (gd.blastproof) {
            ctx.fillStyle = 'rgba(80,80,255,0.12)';
            ctx.fillRect(-hw, -hh, gd.w, gd.h);
            ctx.strokeStyle = 'rgba(60,60,200,0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 2]);
            ctx.strokeRect(-hw + 1, -hh + 1, gd.w - 2, gd.h - 2);
            ctx.setLineDash([]);
        }

        /* Border */
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
        ctx.strokeRect(-hw, -hh, gd.w, gd.h);
        ctx.restore();
    }
}

function drawWoodTexture(ctx, x, y, w, h) {
    ctx.strokeStyle = 'rgba(60,30,10,0.2)'; ctx.lineWidth = 0.7;
    for (let i = 0; i < 4; i++) {
        const ly = y + h * (0.2 + i * 0.2);
        ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + w, ly + (Math.random() - 0.5) * 2); ctx.stroke();
    }
}

function drawStoneTexture(ctx, x, y, w, h) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w / 3, y); ctx.lineTo(x + w / 3, y + h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w * 2 / 3, y + h / 2); ctx.lineTo(x + w * 2 / 3, y + h); ctx.stroke();
}

function drawMetalTexture(ctx, x, y, w, h) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(180,200,220,0.3)';
    ctx.beginPath(); ctx.arc(x + 4, y + 4, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w - 4, y + h - 4, 1.5, 0, Math.PI * 2); ctx.fill();
}

function drawIceTexture(ctx, x, y, w, h) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, 'rgba(180,220,255,0.2)'); g.addColorStop(0.5, 'rgba(220,240,255,0.15)');
    g.addColorStop(1, 'rgba(160,200,240,0.2)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + w * 0.2, y + 1, w * 0.3, 2);
}

function drawRubberTexture(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 3; i++) {
        const ly = y + h * (0.25 + i * 0.25);
        ctx.beginPath(); ctx.arc(x + w * 0.5, ly, w * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(200,100,60,0.1)';
    ctx.fillRect(x, y, w, h);
}

function drawGlassTexture(ctx, x, y, w, h) {
    ctx.globalAlpha = 0.15;
    const g = ctx.createLinearGradient(x, y, x + w * 0.5, y + h);
    g.addColorStop(0, 'rgba(255,255,255,0.4)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,0.1)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x + 2, y + 2, w * 0.2, h * 0.15);
    ctx.strokeStyle = 'rgba(200,220,255,0.2)'; ctx.lineWidth = 0.5;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

function drawObsidianTexture(ctx, x, y, w, h) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(60,20,80,0.15)'); g.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    g.addColorStop(1, 'rgba(40,10,60,0.15)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(100,60,160,0.12)';
    ctx.fillRect(x + w * 0.1, y + h * 0.4, w * 0.35, 1);
    ctx.fillRect(x + w * 0.5, y + h * 0.7, w * 0.3, 1);
    ctx.fillStyle = 'rgba(160,100,255,0.08)';
    ctx.fillRect(x, y, w, 2);
}

function drawCracks(ctx, hw, hh, d) {
    ctx.strokeStyle = `rgba(30,15,5,${d * 0.7})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-hw * 0.4, -hh); ctx.lineTo(0, 0); ctx.lineTo(-hw * 0.2, hh); ctx.stroke();
    if (d > 0.5) { ctx.beginPath(); ctx.moveTo(hw * 0.5, -hh); ctx.lineTo(hw * 0.1, hh * 0.6); ctx.stroke(); }
    if (d > 0.75) { ctx.beginPath(); ctx.moveTo(-hw * 0.7, -hh * 0.3); ctx.lineTo(hw * 0.6, hh * 0.4); ctx.stroke(); }
}

/* ===== Enemy visual helpers ===== */
function _skinColor(type) {
    switch (type) {
        case 'skeleton':  return '#e0d8c0';
        case 'demon':     return '#c03020';
        case 'alien':     return '#70c090';
        case 'mover':     return '#d0a870';
        case 'boss_ogre': return '#c08040';
        case 'boss_dragon': return '#e05030';
        case 'boss_lich': return '#c0b0d0';
        case 'boss_titan': return '#a0a0b0';
        case 'boss_overlord': return '#d04060';
        case 'healer':    return '#a0d0a0';
        case 'nullifier': return '#c0a0e0';
        default:          return '#e8c090';
    }
}

function _drawEnemyTorso(ctx, type, gd, tY, bY, bW, breathe) {
    const h = bY - tY;
    switch (type) {
        case 'villager':
            ctx.fillStyle = '#8a6a40';
            ctx.fillRect(-bW / 2, tY, bW, h);
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(-bW / 2, tY + h * 0.62, bW, 2);
            break;
        case 'soldier':
            ctx.fillStyle = '#606878';
            ctx.fillRect(-bW / 2, tY, bW, h);
            ctx.strokeStyle = '#808898'; ctx.lineWidth = 0.5;
            for (let y = tY + 3; y < bY - 2; y += 4) {
                ctx.beginPath(); ctx.moveTo(-bW / 2 + 1, y); ctx.lineTo(bW / 2 - 1, y); ctx.stroke();
            }
            break;
        case 'knight':
            ctx.fillStyle = '#5a6a80';
            ctx.fillRect(-bW / 2 - 1, tY, bW + 2, h);
            ctx.fillStyle = '#c0a040';
            ctx.fillRect(-1, tY + 3, 2, 8);
            ctx.fillRect(-3, tY + 5, 6, 2);
            break;
        case 'wizard':
            ctx.fillStyle = '#6a40a0';
            ctx.beginPath();
            ctx.moveTo(-bW / 2 + 2, tY); ctx.lineTo(bW / 2 - 2, tY);
            ctx.lineTo(bW / 2 + 3, bY); ctx.lineTo(-bW / 2 - 3, bY);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffd040'; ctx.font = '5px serif'; ctx.textAlign = 'center';
            ctx.fillText('\u2605', 0, tY + h / 2 + 2);
            break;
        case 'king':
            ctx.fillStyle = '#8020a0';
            ctx.fillRect(-bW / 2, tY, bW, h);
            ctx.fillStyle = '#c8a040';
            ctx.fillRect(-bW / 2, tY, bW, 2);
            ctx.fillRect(-bW / 2, bY - 2, bW, 2);
            ctx.fillStyle = '#f0e0d0';
            ctx.fillRect(-bW / 2 - 1, tY, bW + 2, 3);
            break;
        case 'skeleton':
            ctx.strokeStyle = '#d8d0b8'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(0, tY); ctx.lineTo(0, bY); ctx.stroke();
            for (let y = tY + 3; y < bY - 2; y += 3) {
                ctx.beginPath();
                ctx.moveTo(-bW / 2 + 2, y);
                ctx.quadraticCurveTo(0, y + 1.5, bW / 2 - 2, y);
                ctx.stroke();
            }
            break;
        case 'demon':
            ctx.fillStyle = '#a03020';
            ctx.beginPath();
            ctx.moveTo(-bW / 2, tY); ctx.lineTo(bW / 2, tY);
            ctx.lineTo(bW / 2 + 1, bY); ctx.lineTo(-bW / 2 - 1, bY);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#601810'; ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(-3, tY + 4); ctx.lineTo(0, tY + 8); ctx.lineTo(3, tY + 4); ctx.stroke();
            break;
        case 'alien':
            ctx.fillStyle = '#40806a';
            ctx.beginPath(); ctx.ellipse(0, tY + h / 2, bW / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(100,255,200,0.4)';
            ctx.beginPath(); ctx.arc(0, tY + h / 2, 3, 0, Math.PI * 2); ctx.fill();
            break;
        case 'mover':
            ctx.fillStyle = '#a06a30';
            ctx.fillRect(-bW / 2, tY, bW, h);
            ctx.fillStyle = '#805020';
            ctx.fillRect(-bW / 2, tY + h * 0.3, bW, 3);
            ctx.fillRect(-bW / 2, tY + h * 0.6, bW, 3);
            break;
        case 'boss_ogre': case 'boss_dragon': case 'boss_lich':
        case 'boss_titan': case 'boss_overlord':
            ctx.fillStyle = gd.color;
            ctx.fillRect(-bW / 2 - 2, tY, bW + 4, h);
            ctx.strokeStyle = '#ffd040'; ctx.lineWidth = 1;
            ctx.strokeRect(-bW / 2 - 2, tY, bW + 4, h);
            ctx.fillStyle = '#ffd040';
            ctx.beginPath(); ctx.arc(0, tY + h * 0.4, 3, 0, Math.PI * 2); ctx.fill();
            break;
        case 'healer':
            ctx.fillStyle = '#308050';
            ctx.fillRect(-bW / 2, tY, bW, h);
            ctx.fillStyle = '#60ff80';
            ctx.fillRect(-1.5, tY + 4, 3, 8);
            ctx.fillRect(-4, tY + 7, 8, 3);
            break;
        case 'nullifier':
            ctx.fillStyle = '#4a2080';
            ctx.beginPath();
            ctx.moveTo(-bW / 2, tY); ctx.lineTo(bW / 2, tY);
            ctx.lineTo(bW / 2 + 2, bY); ctx.lineTo(-bW / 2 - 2, bY);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#c080ff'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, tY + h / 2, 4, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-3, tY + h / 2 - 3); ctx.lineTo(3, tY + h / 2 + 3); ctx.stroke();
            break;
        default:
            ctx.fillStyle = gd.color;
            ctx.fillRect(-bW / 2, tY, bW, h);
    }
}

function _drawEnemyFace(ctx, type, hY, hR, fc) {
    const eY = hY - 1, sp = 3.5, po = Math.sin(fc * 0.04) * 1.2;
    if (type === 'skeleton') {
        ctx.fillStyle = '#2a2018';
        ctx.beginPath(); ctx.arc(-sp, eY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sp, eY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e02020';
        ctx.beginPath(); ctx.arc(-sp, eY, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sp, eY, 1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d8d0b8';
        for (let tx = -3; tx <= 3; tx += 2) ctx.fillRect(tx - 0.5, hY + 3, 1.2, 2);
    } else if (type === 'demon') {
        ctx.fillStyle = '#ff2000';
        ctx.beginPath(); ctx.arc(-sp, eY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sp, eY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#200800';
        ctx.beginPath(); ctx.arc(-sp + po, eY, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sp + po, eY, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#200800'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, hY + 2, 3.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(-3, hY + 3.5); ctx.lineTo(-2, hY + 6); ctx.lineTo(-1, hY + 3.5); ctx.fill();
        ctx.beginPath(); ctx.moveTo(1, hY + 3.5); ctx.lineTo(2, hY + 6); ctx.lineTo(3, hY + 3.5); ctx.fill();
    } else if (type === 'alien') {
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.ellipse(-sp, eY, 3, 2, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(sp, eY, 3, 2, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(100,255,200,0.5)';
        ctx.beginPath(); ctx.arc(-sp - 1, eY - 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sp - 1, eY - 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.ellipse(0, hY + 4, 1.5, 1, 0, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'nullifier') {
        ctx.strokeStyle = 'rgba(200,160,255,0.4)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(0, hY + 3, 2, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-sp, eY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sp, eY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a1008';
        ctx.beginPath(); ctx.arc(-sp + po, eY, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sp + po, eY, 1.2, 0, Math.PI * 2); ctx.fill();
        if (type === 'soldier' || type === 'knight') {
            ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(-sp - 2, eY - 3.5); ctx.lineTo(-sp + 2, eY - 2.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sp - 2, eY - 2.5); ctx.lineTo(sp + 2, eY - 3.5); ctx.stroke();
        }
        ctx.strokeStyle = '#4a2a1a'; ctx.lineWidth = 0.8;
        ctx.beginPath();
        if (type === 'king') ctx.arc(0, hY + 2.5, 2.5, 0.15 * Math.PI, 0.85 * Math.PI);
        else ctx.arc(0, hY + 3, 2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
    }
}

function _drawHeadgear(ctx, type, hY, hR) {
    switch (type) {
        case 'villager':
            ctx.fillStyle = '#c8a860';
            ctx.beginPath(); ctx.ellipse(0, hY - hR + 1, hR + 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#b89848';
            ctx.beginPath(); ctx.arc(0, hY - hR - 1, hR - 2, Math.PI, 0); ctx.fill();
            break;
        case 'soldier':
            ctx.fillStyle = '#707880';
            ctx.beginPath(); ctx.arc(0, hY, hR + 0.5, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#606870'; ctx.fillRect(-1, hY - 2, 2, 5);
            break;
        case 'knight':
            ctx.fillStyle = '#5a6a80';
            ctx.beginPath(); ctx.arc(0, hY - 1, hR + 1, Math.PI, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = '#1a1a2a'; ctx.fillRect(-hR + 1, hY - 2, hR * 2 - 2, 2);
            ctx.fillStyle = '#c03030';
            ctx.beginPath();
            ctx.moveTo(-1, hY - hR - 1); ctx.quadraticCurveTo(0, hY - hR - 8, 5, hY - hR - 2);
            ctx.fill();
            break;
        case 'wizard':
            ctx.fillStyle = '#5030a0';
            ctx.beginPath();
            ctx.moveTo(-hR + 1, hY - hR + 3); ctx.lineTo(0, hY - hR - 12); ctx.lineTo(hR - 1, hY - hR + 3);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#4020a0';
            ctx.beginPath(); ctx.ellipse(0, hY - hR + 3, hR + 2, 2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffd040'; ctx.font = '6px serif'; ctx.textAlign = 'center';
            ctx.fillText('\u2605', 0, hY - hR - 3);
            break;
        case 'king': {
            ctx.fillStyle = '#d4a030';
            const cw = hR + 2, t = hY - hR;
            ctx.beginPath();
            ctx.moveTo(-cw, t + 2); ctx.lineTo(-cw + 2, t - 5); ctx.lineTo(-cw + 5, t);
            ctx.lineTo(0, t - 6); ctx.lineTo(cw - 5, t); ctx.lineTo(cw - 2, t - 5); ctx.lineTo(cw, t + 2);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#a07820'; ctx.lineWidth = 0.5; ctx.stroke();
            ctx.fillStyle = '#e02020';
            ctx.beginPath(); ctx.arc(0, t - 4, 1.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#2040e0';
            ctx.beginPath(); ctx.arc(-5, t - 3, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, t - 3, 1, 0, Math.PI * 2); ctx.fill();
            break;
        }
        case 'demon':
            ctx.fillStyle = '#3a1008';
            ctx.beginPath();
            ctx.moveTo(-hR + 2, hY - hR + 2); ctx.quadraticCurveTo(-hR - 3, hY - hR - 6, -hR + 5, hY - hR - 4);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(hR - 2, hY - hR + 2); ctx.quadraticCurveTo(hR + 3, hY - hR - 6, hR - 5, hY - hR - 4);
            ctx.closePath(); ctx.fill();
            break;
        case 'alien':
            ctx.strokeStyle = '#50a080'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, hY - hR); ctx.quadraticCurveTo(2, hY - hR - 6, 0, hY - hR - 8); ctx.stroke();
            ctx.fillStyle = '#80ffc0';
            ctx.beginPath(); ctx.arc(0, hY - hR - 8, 2, 0, Math.PI * 2); ctx.fill();
            break;
        case 'mover':
            ctx.fillStyle = '#c06020';
            ctx.fillRect(-hR - 1, hY - hR + 1, (hR + 1) * 2, 3);
            ctx.strokeStyle = '#c06020'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(hR + 1, hY - hR + 2);
            ctx.lineTo(hR + 6, hY - hR + 5); ctx.stroke();
            break;
        case 'boss_ogre':
            ctx.fillStyle = '#604020';
            ctx.beginPath(); ctx.moveTo(-hR, hY - hR + 2); ctx.lineTo(-hR - 4, hY - hR - 6);
            ctx.lineTo(-hR + 4, hY - hR); ctx.fill();
            ctx.beginPath(); ctx.moveTo(hR, hY - hR + 2); ctx.lineTo(hR + 4, hY - hR - 6);
            ctx.lineTo(hR - 4, hY - hR); ctx.fill();
            break;
        case 'boss_dragon':
            ctx.fillStyle = '#c02020';
            ctx.beginPath(); ctx.moveTo(-hR, hY - hR); ctx.lineTo(-hR - 3, hY - hR - 10);
            ctx.lineTo(-hR + 3, hY - hR - 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(hR, hY - hR); ctx.lineTo(hR + 3, hY - hR - 10);
            ctx.lineTo(hR - 3, hY - hR - 2); ctx.fill();
            break;
        case 'boss_lich':
            ctx.fillStyle = '#4020a0';
            ctx.beginPath();
            ctx.moveTo(-hR + 1, hY - hR + 3); ctx.lineTo(0, hY - hR - 14); ctx.lineTo(hR - 1, hY - hR + 3);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#a080ff';
            ctx.beginPath(); ctx.arc(0, hY - hR - 6, 2, 0, Math.PI * 2); ctx.fill();
            break;
        case 'boss_titan':
            ctx.fillStyle = '#606880';
            ctx.beginPath(); ctx.arc(0, hY - 1, hR + 3, Math.PI, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = '#ffd040';
            ctx.fillRect(-1, hY - hR - 4, 2, 8);
            break;
        case 'boss_overlord': {
            ctx.fillStyle = '#600010';
            const cw2 = hR + 4, t2 = hY - hR;
            ctx.beginPath();
            ctx.moveTo(-cw2, t2 + 2); ctx.lineTo(-cw2 + 2, t2 - 8); ctx.lineTo(-cw2 + 5, t2);
            ctx.lineTo(0, t2 - 10); ctx.lineTo(cw2 - 5, t2); ctx.lineTo(cw2 - 2, t2 - 8); ctx.lineTo(cw2, t2 + 2);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ff2020';
            ctx.beginPath(); ctx.arc(0, t2 - 6, 2, 0, Math.PI * 2); ctx.fill();
            break;
        }
        case 'healer':
            ctx.fillStyle = '#40a040';
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.ellipse(i * 3, hY - hR - 1, 2.5, 4, 0, Math.PI, 0);
                ctx.fill();
            }
            break;
        case 'nullifier':
            ctx.fillStyle = '#2a1050';
            ctx.beginPath();
            ctx.arc(0, hY, hR + 2, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#1a0830';
            ctx.beginPath();
            ctx.moveTo(-hR - 2, hY - 1); ctx.lineTo(0, hY - hR - 5); ctx.lineTo(hR + 2, hY - 1);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#c080ff';
            ctx.beginPath(); ctx.arc(-3, hY - 1, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(3, hY - 1, 1.5, 0, Math.PI * 2); ctx.fill();
            break;
    }
}

function _drawHandItem(ctx, type, bW, tY, sw) {
    if (type === 'wizard') {
        ctx.strokeStyle = '#5a3020'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(bW / 2 + 5, tY + 10 - sw); ctx.lineTo(bW / 2 + 7, tY - 5); ctx.stroke();
        ctx.fillStyle = '#a060ff';
        ctx.beginPath(); ctx.arc(bW / 2 + 7, tY - 7, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'soldier' || type === 'knight') {
        ctx.fillStyle = '#a0a0b0'; ctx.fillRect(bW / 2 + 4, tY + 4 - sw, 2, 10);
        ctx.fillStyle = '#8a6a30'; ctx.fillRect(bW / 2 + 2.5, tY + 3 - sw, 5, 2);
    } else if (type === 'king') {
        ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-bW / 2 - 5, tY + 10 + sw); ctx.lineTo(-bW / 2 - 6, tY - 2); ctx.stroke();
        ctx.fillStyle = '#ff3030';
        ctx.beginPath(); ctx.arc(-bW / 2 - 6, tY - 4, 2, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'healer') {
        ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(bW / 2 + 5, tY + 10 - sw); ctx.lineTo(bW / 2 + 7, tY - 6); ctx.stroke();
        ctx.fillStyle = '#40ff60';
        ctx.beginPath(); ctx.arc(bW / 2 + 7, tY - 8, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'nullifier') {
        ctx.strokeStyle = '#3a1a60'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-bW / 2 - 5, tY + 10 + sw); ctx.lineTo(-bW / 2 - 6, tY - 2); ctx.stroke();
        ctx.fillStyle = '#8040c0';
        ctx.beginPath(); ctx.arc(-bW / 2 - 6, tY - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(160,80,255,0.4)';
        ctx.beginPath(); ctx.arc(-bW / 2 - 6, tY - 4, 5, 0, Math.PI * 2); ctx.fill();
    }
}

/* ===== Enemies ===== */
function drawEnemies(ctx, enemyBodies, frameCount) {
    for (const e of enemyBodies) {
        const gd = e.gameData;
        const pos = e.position;
        const r = gd.radius;
        const t = frameCount * 0.05;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(e.angle);

        const headR = 7;
        const headY = -r + 2;
        const bodyTop = headY + headR;
        const bodyBot = r - 2;
        const bW = 10;
        const legSwing = Math.sin(t) * 1.5;
        const armSwing = Math.sin(t * 0.8) * 3;
        const type = gd.type;
        const skin = _skinColor(type);

        /* Shadow */
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(0, r + 4, r * 0.7, 2.5, 0, 0, Math.PI * 2); ctx.fill();

        /* Healer aura */
        if (type === 'healer' && gd.healRadius) {
            const hp = 0.08 + 0.04 * Math.sin(frameCount * 0.04);
            ctx.strokeStyle = `rgba(64,255,96,${hp + 0.05})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.arc(0, 0, gd.healRadius, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(64,255,96,${hp * 0.3})`;
            ctx.beginPath(); ctx.arc(0, 0, gd.healRadius, 0, Math.PI * 2); ctx.fill();
        }
        /* Nullifier aura */
        if (type === 'nullifier' && gd.nullRadius) {
            const np = 0.06 + 0.03 * Math.sin(frameCount * 0.06);
            ctx.strokeStyle = `rgba(160,80,255,${np + 0.08})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 5]);
            ctx.beginPath(); ctx.arc(0, 0, gd.nullRadius, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(100,40,180,${np * 0.25})`;
            ctx.beginPath(); ctx.arc(0, 0, gd.nullRadius, 0, Math.PI * 2); ctx.fill();
        }
        /* Boss aura */
        if (gd.isBoss) {
            const bp = 0.12 + 0.06 * Math.sin(frameCount * 0.04);
            ctx.strokeStyle = `rgba(255,200,40,${bp + 0.1})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(255,200,40,${bp * 0.2})`;
            ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2); ctx.fill();
        }

        /* Legs */
        ctx.strokeStyle = type === 'skeleton' ? '#d8d0b8' : darkenColor(gd.color, 0.3);
        ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-3, bodyBot - 2); ctx.lineTo(-4 - legSwing, r + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(3, bodyBot - 2); ctx.lineTo(4 + legSwing, r + 2); ctx.stroke();

        /* Feet */
        ctx.fillStyle = type === 'skeleton' ? '#888' : '#3a2a1a';
        ctx.beginPath(); ctx.arc(-4 - legSwing, r + 3, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4 + legSwing, r + 3, 2, 0, Math.PI * 2); ctx.fill();

        /* Torso */
        _drawEnemyTorso(ctx, type, gd, bodyTop, bodyBot, bW, 0);

        /* Arms */
        ctx.strokeStyle = skin; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-bW / 2, bodyTop + 3); ctx.lineTo(-bW / 2 - 5, bodyTop + 10 + armSwing); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bW / 2, bodyTop + 3); ctx.lineTo(bW / 2 + 5, bodyTop + 10 - armSwing); ctx.stroke();
        /* Hands */
        ctx.fillStyle = skin;
        ctx.beginPath(); ctx.arc(-bW / 2 - 5, bodyTop + 10 + armSwing, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bW / 2 + 5, bodyTop + 10 - armSwing, 1.5, 0, Math.PI * 2); ctx.fill();

        /* Held items (weapons/staff) */
        _drawHandItem(ctx, type, bW, bodyTop, armSwing);

        /* Head */
        ctx.fillStyle = skin;
        ctx.beginPath(); ctx.arc(0, headY, headR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = darkenColor(skin, 0.3); ctx.lineWidth = 0.8; ctx.stroke();

        /* Face */
        _drawEnemyFace(ctx, type, headY, headR, frameCount);

        /* Headgear */
        _drawHeadgear(ctx, type, headY, headR);

        /* Damage overlay */
        const dmg = 1 - (gd.hp / gd.maxHp);
        if (dmg > 0.15) {
            ctx.fillStyle = `rgba(255,0,0,${dmg * 0.25})`;
            ctx.fillRect(-r, -r, r * 2, r * 2);
        }

        /* HP bar */
        if (dmg > 0.05 && gd.hp > 0) {
            const barW = r * 2.2, barH = 3, barY = -r - 8;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(-barW / 2, barY, barW, barH);
            ctx.fillStyle = dmg < 0.5 ? '#40d040' : (dmg < 0.8 ? '#e0a020' : '#e02020');
            ctx.fillRect(-barW / 2, barY, barW * (1 - dmg), barH);
        }

        /* Burning overlay */
        if (gd.burning) {
            const fl = 0.25 + 0.12 * Math.sin(Date.now() * 0.012);
            ctx.fillStyle = `rgba(255,80,0,${fl})`;
            ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2); ctx.fill();
            for (let i = 0; i < 3; i++) {
                const fx = (Math.random() - 0.5) * r * 1.5;
                const fy = -r + Math.random() * -8;
                ctx.fillStyle = `rgba(255,${120 + Math.random() * 80 | 0},0,0.7)`;
                ctx.beginPath(); ctx.arc(fx, fy, 2 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
            }
        }
        /* Frozen overlay */
        if (gd.frozen) {
            ctx.fillStyle = 'rgba(160,220,255,0.3)';
            ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(200,240,255,0.6)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, r + 2, 0, Math.PI * 2); ctx.stroke();
        }

        ctx.restore();
    }
}

/* ===== Particles ===== */
function drawParticles(ctx, particles) {
    for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        if (p.type === 'ember') { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
    }
    ctx.globalAlpha = 1;
}

function drawAmbientParticles(ctx, ambientParts) {
    for (const p of ambientParts) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillRect(p.x, p.y, p.size, p.size); }
    }
    ctx.globalAlpha = 1;
}

/* ===== Trajectory ===== */
function drawTrajectory(ctx, dragging, activeBall, launched, SLING, LAUNCH_MULT, gravityY, GROUND_Y) {
    if (!dragging || !activeBall || launched) return;
    const pos = activeBall.position;
    const dx = SLING.x - pos.x, dy = SLING.y - pos.y;
    let simX = pos.x, simY = pos.y;
    let simVx = dx * LAUNCH_MULT, simVy = dy * LAUNCH_MULT;
    const grav = gravityY * 0.001 * 16.67 * 16.67;
    const maxDist = 350; /* no llega hasta los bloques */
    let traveled = 0;
    const steps = 40;
    for (let i = 0; i < steps; i++) {
        const prevX = simX, prevY = simY;
        simVy += grav; simX += simVx; simY += simVy;
        traveled += Math.sqrt((simX-prevX)**2 + (simY-prevY)**2);
        if (simY > GROUND_Y || traveled > maxDist) break;
        const t = i / steps;
        const alpha = (1 - t) * 0.85;
        const radius = 3.5 + (1 - t) * 2;
        /* Outer glow */
        ctx.beginPath(); ctx.arc(simX, simY, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,180,60,${alpha * 0.25})`; ctx.fill();
        /* Main dot */
        ctx.beginPath(); ctx.arc(simX, simY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,120,${alpha})`; ctx.fill();
        /* Bright center */
        ctx.beginPath(); ctx.arc(simX, simY, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,220,${alpha * 0.9})`; ctx.fill();
    }
}

/* ===== Wind indicator ===== */
function drawWindIndicator(ctx, windForce, W) {
    if (windForce === 0) return;
    const cx = W / 2, cy = 18, len = windForce * 40;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - len, cy); ctx.lineTo(cx + len, cy); ctx.stroke();
    const dir = windForce > 0 ? 1 : -1;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.moveTo(cx + len, cy); ctx.lineTo(cx + len - dir * 8, cy - 5);
    ctx.lineTo(cx + len - dir * 8, cy + 5); ctx.fill();
    ctx.font = '11px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText('VIENTO', cx, cy + 18); ctx.textAlign = 'left';
}

/* ===== Material Legend ===== */
function drawMaterialLegend(ctx, H) {
    const items = [{label:'Madera',color:'#c17f3a'},{label:'Piedra',color:'#8b8b8b'},
        {label:'Metal',color:'#607080'},{label:'Hielo',color:'#a0d0ff'},
        {label:'Goma',color:'#c06848'},{label:'Cristal',color:'#90c8e0'},{label:'Obsid.',color:'#2a1840'}];
    ctx.font = '10px Cinzel, serif';
    items.forEach((item, i) => {
        const x = 10 + i * 62, y = H - 14;
        draw3DRect(ctx, x, y, 12, 10, item.color, darkenColor(item.color, 0.5), lightenColor(item.color, 0.3));
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(item.label, x + 16, y + 9);
    });
}

/* ===== Mechanic indicator ===== */
function drawMechanicIndicator(ctx, mechanic, W) {
    if (!mechanic) return;
    const labels = {
        'explosive':'EXPLOSIVA','wind':'VIENTO','multiball':'MULTIBOLA','ice':'HIELO',
        'gravity':'GRAVEDAD','shields':'ESCUDOS','earthquake':'TERREMOTO',
        'fireball':'FUEGO','phantom':'FANTASMA'
    };
    const label = labels[mechanic] || mechanic.toUpperCase();
    ctx.font = 'bold 11px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,200,100,0.6)';
    ctx.fillText(label, W / 2, 14);
    ctx.textAlign = 'left';
}

/* ===== Helpers ===== */
function draw3DRect(ctx, x, y, w, h, face, dark, light) {
    const d = 3;
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.moveTo(x+w,y); ctx.lineTo(x+w+d,y+d); ctx.lineTo(x+w+d,y+h+d); ctx.lineTo(x+w,y+h); ctx.fill();
    ctx.fillStyle = darkenColor(dark, 0.7);
    ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+d,y+h+d); ctx.lineTo(x+w+d,y+h+d); ctx.lineTo(x+w,y+h); ctx.fill();
    ctx.fillStyle = face;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = light || 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, w, 2);
}

function darkenColor(hex, factor) {
    if (!hex || hex[0] !== '#') return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.floor(((num >> 16) & 0xFF) * factor);
    const g = Math.floor(((num >> 8) & 0xFF) * factor);
    const b = Math.floor((num & 0xFF) * factor);
    return `rgb(${r},${g},${b})`;
}

function lightenColor(hex, factor) {
    if (!hex || hex[0] !== '#') return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.floor(((num >> 16) & 0xFF) * (1 + factor)));
    const g = Math.min(255, Math.floor(((num >> 8) & 0xFF) * (1 + factor)));
    const b = Math.min(255, Math.floor((num & 0xFF) * (1 + factor)));
    return `rgb(${r},${g},${b})`;
}
