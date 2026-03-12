/* ===== levels.js — 100 levels, 20 escenarios × 5 niveles ===== */
"use strict";

/* ===== Structure Generators ===== */
function mkGrid(bx,by,cols,rows,matFn,bw,bh){
    bw=bw||44;bh=bh||26;
    const b=[],sx=bx-(cols*bw)/2+bw/2;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        const m=typeof matFn==='function'?matFn(r,c):matFn;
        b.push({x:sx+c*bw,y:by-r*(bh+2),w:bw-2,h:bh,mat:m});
    }
    return b;
}
function mkPillars(bx,by,offsets,h,mat,bw){
    bw=bw||22;const b=[];
    offsets.forEach(ox=>{for(let r=0;r<h;r++)b.push({x:bx+ox,y:by-r*28,w:bw,h:26,mat});});
    return b;
}
function mkBeam(bx,by,w,mat,h){return[{x:bx,y:by,w:w,h:h||14,mat}];}
function mkPyramid(bx,by,base,mat,bw,bh){
    bw=bw||44;bh=bh||26;const b=[];
    for(let r=0;r<base;r++){const n=base-r;const sx=bx-(n*bw)/2+bw/2;
        for(let c=0;c<n;c++)b.push({x:sx+c*bw,y:by-r*(bh+2),w:bw-2,h:bh,mat:typeof mat==='function'?mat(r):mat});
    }
    return b;
}
function mkTower(bx,by,w,rows,mats){
    const b=[];
    for(let r=0;r<rows;r++){const m=mats[Math.min(Math.floor(r*mats.length/rows),mats.length-1)];
        for(let c=0;c<w;c++)b.push({x:bx+c*32-(w*32)/2+16,y:by-r*28,w:30,h:26,mat:m});
    }
    return b;
}
function mkDiamond(bx,by,half,mat){
    const b=[];
    for(let r=0;r<half*2-1;r++){
        const n=r<half?r+1:half*2-1-r;
        const sx=bx-(n*44)/2+22;
        for(let c=0;c<n;c++)b.push({x:sx+c*44,y:by-r*28,w:42,h:26,mat:typeof mat==='function'?mat(r):mat});
    }
    return b;
}
function mkArch(bx,by,span,h,mat){
    const b=[];
    b.push(...mkPillars(bx,by,[-span/2,span/2],h,mat));
    b.push(...mkBeam(bx,by-h*28,span+30,mat));
    return b;
}
function mkWall(bx,by,w,h,mat){
    const b=[];
    for(let r=0;r<h;r++)for(let c=0;c<w;c++){
        b.push({x:bx+c*46-(w*46)/2+23,y:by-r*28,w:44,h:26,mat:typeof mat==='function'?mat(r,c):mat});
    }
    return b;
}
function combine(...arrays){return[].concat(...arrays);}
function withProps(blocks,props){return blocks.map(b=>Object.assign({},b,props));}

/* ===== Scenario Definitions ===== */
const SCENARIO_DEFS = [
    {name:'Pradera',           bg:'prairie'},
    {name:'Desierto',          bg:'desert'},
    {name:'Bosque',            bg:'forest'},
    {name:'Nieve',             bg:'snow'},
    {name:'Tundra',            bg:'tundra'},
    {name:'Volcán',            bg:'volcano'},
    {name:'Castillo',          bg:'castle'},
    {name:'Ruinas',            bg:'ruins'},
    {name:'Infierno',          bg:'inferno'},
    {name:'Espacio',           bg:'space'},
    {name:'Pantano',           bg:'swamp'},
    {name:'Dimensión Oscura',  bg:'darkdim'},
    {name:'Océano',            bg:'ocean'},
    {name:'Jungla',            bg:'jungle'},
    {name:'Cielo',             bg:'sky'},
    {name:'Caverna',           bg:'cave'},
    {name:'Cristal',           bg:'crystal'},
    {name:'Abismo',            bg:'abyss'},
    {name:'Mecanismo',         bg:'clockwork'},
    {name:'Nexo',              bg:'nexus'}
];

/* ===== 100 Level Definitions ===== */
const LEVELS = [];

function addLvl(scnIdx,subIdx,name,balls,buildFn,enemiesFn){
    const sc=SCENARIO_DEFS[scnIdx];
    LEVELS.push({
        name:name, balls:balls, bg:sc.bg, mechanic:null,
        mechanicDesc:'', mechGroup:scnIdx, mechSub:subIdx,
        build:buildFn, enemies:enemiesFn||null
    });
}

/* ============================================================
   ESCENARIO 0: PRADERA (Niveles 1-5) — Introducción básica
   ============================================================ */
addLvl(0,0,'Granja Abandonada',8,(bx,by)=>
    mkPyramid(bx,by,5,'wood'),
    (bx,by)=>[{x:bx,y:by-5*28-16,type:'villager'}]);
addLvl(0,1,'Establo Viejo',8,(bx,by)=>
    combine(mkGrid(bx,by,5,3,'wood'),mkBeam(bx,by-3*28,240,'wood')),
    (bx,by)=>[{x:bx-40,y:by-3*28-30,type:'villager'},{x:bx+40,y:by-3*28-30,type:'villager'}]);
addLvl(0,2,'Molino de Viento',8,(bx,by)=>
    combine(mkTower(bx,by,2,8,['stone','wood']),mkBeam(bx,by-8*28,80,'wood')),
    (bx,by)=>[{x:bx,y:by-8*28-30,type:'villager'}]);
addLvl(0,3,'Aldea Perdida',9,(bx,by)=>
    combine(mkGrid(bx-80,by,3,4,'wood'),mkGrid(bx+80,by,3,4,'stone'),
        mkBeam(bx,by-4*28,280,'wood'),mkPyramid(bx,by-4*28-16,4,'wood')),
    (bx,by)=>[{x:bx-80,y:by-4*28-30,type:'villager'},{x:bx+80,y:by-4*28-30,type:'villager'},{x:bx,y:by-8*28-30,type:'soldier'}]);
addLvl(0,4,'Muralla de Madera',10,(bx,by)=>
    combine(mkGrid(bx,by,7,5,(r)=>r<2?'stone':'wood'),
        mkBeam(bx,by-5*28,320,'stone'),mkGrid(bx,by-5*28-28,5,2,'wood')),
    (bx,by)=>[{x:bx-60,y:by-7*28-30,type:'villager'},{x:bx,y:by-7*28-30,type:'soldier'},{x:bx+60,y:by-7*28-30,type:'villager'}]);

/* ============================================================
   ESCENARIO 1: DESIERTO (Niveles 6-10)
   ============================================================ */
addLvl(1,0,'Oasis del Desierto',7,(bx,by)=>
    combine(mkPillars(bx,by,[-60,60],5,'stone'),mkBeam(bx,by-5*28,160,'stone')),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'villager'}]);
addLvl(1,1,'Templo de Arena',9,(bx,by)=>
    combine(mkPillars(bx,by,[-90,-30,30,90],6,'stone'),
        mkBeam(bx,by-3*28,220,'stone'),mkBeam(bx,by-6*28,220,'stone')),
    (bx,by)=>[{x:bx-30,y:by-6*28-30,type:'villager'},{x:bx+30,y:by-6*28-30,type:'soldier'}]);
addLvl(1,2,'Pirámide Menor',9,(bx,by)=>
    mkPyramid(bx,by,7,(r)=>r<3?'stone':'wood'),
    (bx,by)=>[{x:bx,y:by-7*28-16,type:'soldier'}]);
addLvl(1,3,'Gran Pirámide',11,(bx,by)=>
    combine(mkPyramid(bx,by,8,'stone'),mkGrid(bx,by-8*28-14,3,2,'stone')),
    (bx,by)=>[{x:bx-30,y:by-10*28-14,type:'soldier'},{x:bx+30,y:by-10*28-14,type:'soldier'}]);
addLvl(1,4,'Ciudadela del Sol',15,(bx,by)=>
    combine(mkPillars(bx,by,[-110,-55,0,55,110],8,'stone'),
        mkBeam(bx,by-4*28,260,'stone'),mkBeam(bx,by-8*28,260,'stone'),
        mkGrid(bx,by-8*28-28,4,2,'metal')),
    (bx,by)=>[{x:bx-55,y:by-8*28-30,type:'soldier'},{x:bx,y:by-10*28-44,type:'knight'},{x:bx+55,y:by-8*28-30,type:'soldier'},
        {x:bx,y:by-4*28-30,type:'boss_ogre'}]);

/* ============================================================
   ESCENARIO 2: BOSQUE (Niveles 11-15) — Introduce wizard
   ============================================================ */
addLvl(2,0,'Cabaña del Bosque',8,(bx,by)=>
    combine(mkGrid(bx,by,4,3,'wood'),mkBeam(bx,by-3*28,200,'wood'),
        mkPyramid(bx,by-3*28-16,3,'wood')),
    (bx,by)=>[{x:bx,y:by-6*28-30,type:'wizard'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(2,1,'Torre Druida',8,(bx,by)=>
    mkTower(bx,by,2,10,['stone','wood','wood']),
    (bx,by)=>[{x:bx,y:by-10*28-30,type:'wizard'},{x:bx-80,y:by-16,type:'soldier'}]);
addLvl(2,2,'Puente Élfico',9,(bx,by)=>
    combine(mkPillars(bx,by,[-100,100],6,'stone'),mkBeam(bx,by-3*28,240,'wood'),
        mkBeam(bx,by-6*28,240,'wood'),mkGrid(bx,by-6*28-28,3,2,'wood')),
    (bx,by)=>[{x:bx,y:by-3*28-30,type:'soldier'},{x:bx,y:by-8*28-30,type:'wizard'}]);
addLvl(2,3,'Fortaleza Verde',10,(bx,by)=>
    combine(mkGrid(bx,by,6,4,(r)=>r<2?'stone':'wood'),
        mkBeam(bx,by-4*28,280,'stone'),mkTower(bx-60,by-4*28-14,1,4,['wood']),
        mkTower(bx+60,by-4*28-14,1,4,['wood'])),
    (bx,by)=>[{x:bx-60,y:by-8*28-30,type:'soldier'},{x:bx+60,y:by-8*28-30,type:'villager'},{x:bx,y:by-4*28-30,type:'wizard'}]);
addLvl(2,4,'Árbol Ancestral',11,(bx,by)=>
    combine(mkTower(bx,by,3,12,['stone','stone','wood','wood']),
        mkBeam(bx,by-6*28,180,'stone'),mkBeam(bx,by-12*28,120,'wood')),
    (bx,by)=>[{x:bx,y:by-6*28-30,type:'wizard'},{x:bx,y:by-12*28-30,type:'wizard'},{x:bx-90,y:by-16,type:'soldier'}]);

/* ============================================================
   ESCENARIO 3: NIEVE (Niveles 16-20) — Introduce healer
   ============================================================ */
addLvl(3,0,'Iglú Solitario',7,(bx,by)=>
    mkPyramid(bx,by,5,'ice'),
    (bx,by)=>[{x:bx,y:by-5*28-16,type:'villager'},{x:bx+70,y:by-16,type:'healer'}]);
addLvl(3,1,'Fuerte de Nieve',8,(bx,by)=>
    combine(mkGrid(bx,by,6,3,'wood'),mkGrid(bx,by-3*28,4,2,'ice')),
    (bx,by)=>[{x:bx-30,y:by-5*28-30,type:'villager'},{x:bx+30,y:by-5*28-30,type:'healer'}]);
addLvl(3,2,'Palacio Glaciar',9,(bx,by)=>
    combine(mkPillars(bx,by,[-80,0,80],7,'stone'),
        mkBeam(bx,by-3*28,200,'ice'),mkBeam(bx,by-7*28,200,'ice'),
        mkGrid(bx,by-7*28-28,3,2,'ice')),
    (bx,by)=>[{x:bx,y:by-3*28-30,type:'soldier'},{x:bx,y:by-9*28-30,type:'healer'}]);
addLvl(3,3,'Montaña Helada',10,(bx,by)=>
    combine(mkPyramid(bx,by,8,(r)=>r<3?'stone':'ice'),
        mkGrid(bx,by-8*28-16,2,2,'metal')),
    (bx,by)=>[{x:bx,y:by-10*28-30,type:'soldier'},{x:bx-30,y:by-8*28-30,type:'healer'},{x:bx-80,y:by-16,type:'soldier'}]);
addLvl(3,4,'Citadela Ártica',14,(bx,by)=>
    combine(mkGrid(bx,by,7,4,(r)=>r<2?'stone':'ice'),
        mkBeam(bx,by-4*28,320,'stone'),mkGrid(bx,by-4*28-28,5,3,'ice'),
        mkBeam(bx,by-7*28-28,240,'stone'),mkPyramid(bx,by-8*28-14,3,'ice')),
    (bx,by)=>[{x:bx-50,y:by-4*28-30,type:'soldier'},{x:bx+50,y:by-4*28-30,type:'healer'},
        {x:bx,y:by-11*28-30,type:'knight'},{x:bx,y:by-8*28-50,type:'boss_ogre'}]);

/* ============================================================
   ESCENARIO 4: TUNDRA (Niveles 21-25) — Introduce nullifier
   ============================================================ */
addLvl(4,0,'Lago Congelado',7,(bx,by)=>
    mkGrid(bx,by,5,4,'ice'),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'soldier'},{x:bx+70,y:by-16,type:'nullifier'}]);
addLvl(4,1,'Cueva de Hielo',8,(bx,by)=>
    combine(mkPillars(bx,by,[-70,70],6,'ice'),mkBeam(bx,by-6*28,180,'ice'),
        mkGrid(bx,by,3,3,'ice')),
    (bx,by)=>[{x:bx,y:by-3*28-30,type:'soldier'},{x:bx,y:by-6*28-30,type:'nullifier'}]);
addLvl(4,2,'Palacio de Escarcha',9,(bx,by)=>
    combine(mkPillars(bx,by,[-90,90],8,'stone'),
        mkGrid(bx,by,3,6,'ice'),mkBeam(bx,by-8*28,220,'stone')),
    (bx,by)=>[{x:bx,y:by-6*28-30,type:'knight'},{x:bx,y:by-8*28-30,type:'nullifier'},{x:bx-70,y:by-16,type:'soldier'}]);
addLvl(4,3,'Fortaleza Cristalina',10,(bx,by)=>
    combine(mkGrid(bx,by,6,5,(r)=>r<2?'stone':'ice'),
        mkBeam(bx,by-5*28,280,'stone'),mkPyramid(bx,by-5*28-16,4,'ice')),
    (bx,by)=>[{x:bx-40,y:by-5*28-30,type:'healer'},{x:bx+40,y:by-5*28-30,type:'nullifier'},{x:bx,y:by-9*28-30,type:'knight'}]);
addLvl(4,4,'Corona de Hielo',13,(bx,by)=>
    combine(mkPillars(bx,by,[-100,-50,0,50,100],9,'stone'),
        mkBeam(bx,by-4*28,240,'stone'),mkBeam(bx,by-9*28,240,'metal'),
        mkGrid(bx,by-9*28-28,4,3,'ice')),
    (bx,by)=>[{x:bx-50,y:by-9*28-30,type:'knight'},{x:bx+50,y:by-9*28-30,type:'nullifier'},{x:bx,y:by-12*28-30,type:'healer'}]);

/* ============================================================
   ESCENARIO 5: VOLCÁN (Niveles 26-30) — Mix de mecánicas
   ============================================================ */
addLvl(5,0,'Cráter Menor',8,(bx,by)=>
    combine(mkGrid(bx,by,4,4,'stone'),mkBeam(bx,by-4*28,190,'metal')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'soldier'},{x:bx+70,y:by-16,type:'soldier'}]);
addLvl(5,1,'Forja Volcánica',9,(bx,by)=>
    combine(mkPillars(bx,by,[-70,70],6,'metal'),mkGrid(bx,by,3,4,'stone'),
        mkBeam(bx,by-6*28,180,'metal')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'soldier'},{x:bx,y:by-6*28-30,type:'healer'}]);
addLvl(5,2,'Puente de Lava',10,(bx,by)=>
    combine(mkPillars(bx,by,[-110,110],8,'metal'),
        mkBeam(bx,by-4*28,260,'metal'),mkBeam(bx,by-8*28,260,'metal'),
        mkGrid(bx,by-4*28-28,4,3,'stone')),
    (bx,by)=>[{x:bx-50,y:by-4*28-30,type:'soldier'},{x:bx+50,y:by-4*28-30,type:'healer'},{x:bx,y:by-8*28-30,type:'knight'}]);
addLvl(5,3,'Templo de Fuego',11,(bx,by)=>
    combine(mkGrid(bx,by,5,6,(r)=>r<3?'metal':'stone'),
        mkBeam(bx,by-6*28,240,'metal'),mkPyramid(bx,by-6*28-16,4,'stone')),
    (bx,by)=>[{x:bx-40,y:by-6*28-30,type:'knight'},{x:bx+40,y:by-6*28-30,type:'nullifier'},{x:bx,y:by-10*28-30,type:'healer'}]);
addLvl(5,4,'Corazón del Volcán',16,(bx,by)=>
    combine(mkGrid(bx,by,6,7,(r)=>r<3?'metal':'stone'),
        mkBeam(bx,by-7*28,280,'metal'),mkTower(bx,by-7*28-14,2,5,['metal','stone']),
        withProps([{x:bx-80,y:by,w:22,h:56,mat:'metal'},{x:bx+80,y:by,w:22,h:56,mat:'metal'}],{fireproof:true})),
    (bx,by)=>[{x:bx-50,y:by-7*28-30,type:'soldier'},{x:bx+50,y:by-7*28-30,type:'nullifier'},{x:bx,y:by-12*28-30,type:'knight'},
        {x:bx,y:by-7*28-50,type:'boss_dragon'}]);

/* ============================================================
   ESCENARIO 6: CASTILLO (Niveles 31-35) — rubber + glass
   ============================================================ */
addLvl(6,0,'Torre de Guardia',8,(bx,by)=>
    mkTower(bx,by,2,7,['stone','wood']),
    (bx,by)=>[{x:bx,y:by-7*28-30,type:'soldier'},{x:bx-70,y:by-16,type:'soldier'}]);
addLvl(6,1,'Muralla Exterior',9,(bx,by)=>
    combine(mkGrid(bx,by,6,4,(r)=>r<2?'stone':'wood'),
        mkBeam(bx,by-4*28,280,'stone'),mkGrid(bx,by-4*28-28,3,2,'rubber')),
    (bx,by)=>[{x:bx-50,y:by-4*28-30,type:'soldier'},{x:bx+50,y:by-6*28-30,type:'healer'}]);
addLvl(6,2,'Patio Interior',10,(bx,by)=>
    combine(mkPillars(bx,by,[-100,100],7,'stone'),
        mkGrid(bx,by,4,5,'wood'),mkBeam(bx,by-7*28,240,'metal'),
        mkGrid(bx-60,by-7*28-28,2,2,'glass')),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'knight'},{x:bx,y:by-7*28-30,type:'nullifier'}]);
addLvl(6,3,'Salón del Trono',11,(bx,by)=>
    combine(mkGrid(bx,by,5,6,(r)=>r<3?'metal':'stone'),
        mkBeam(bx,by-6*28,240,'metal'),mkGrid(bx,by-6*28-28,3,3,'stone')),
    (bx,by)=>[{x:bx,y:by-6*28-30,type:'knight'},{x:bx-40,y:by-9*28-30,type:'healer'},{x:bx+40,y:by-9*28-30,type:'king'}]);
addLvl(6,4,'Castillo Imperial',14,(bx,by)=>
    combine(mkPillars(bx,by,[-120,-60,0,60,120],9,'stone'),
        mkBeam(bx,by-4*28,280,'metal'),mkBeam(bx,by-9*28,280,'metal'),
        mkGrid(bx,by-4*28-28,5,4,'stone'),mkGrid(bx,by-9*28-28,4,3,'metal')),
    (bx,by)=>[{x:bx-60,y:by-9*28-30,type:'soldier'},{x:bx+60,y:by-9*28-30,type:'nullifier'},{x:bx,y:by-12*28-30,type:'king'}]);

/* ============================================================
   ESCENARIO 7: RUINAS (Niveles 36-40)
   ============================================================ */
addLvl(7,0,'Ruinas Menores',8,(bx,by)=>
    combine(mkGrid(bx,by,5,4,'stone'),mkPyramid(bx,by-4*28,3,'wood')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'skeleton'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(7,1,'Templo Caído',9,(bx,by)=>
    combine(mkPillars(bx,by,[-80,0,80],7,'stone'),
        mkBeam(bx,by-3*28,200,'stone'),mkBeam(bx,by-7*28,200,'stone')),
    (bx,by)=>[{x:bx-40,y:by-7*28-30,type:'skeleton'},{x:bx+40,y:by-7*28-30,type:'healer'}]);
addLvl(7,2,'Columnas Antiguas',10,(bx,by)=>
    combine(mkPillars(bx,by,[-100,-50,0,50,100],8,'stone'),
        mkBeam(bx,by-4*28,240,'stone'),mkBeam(bx,by-8*28,240,'stone')),
    (bx,by)=>[{x:bx-50,y:by-4*28-30,type:'skeleton'},{x:bx+50,y:by-8*28-30,type:'nullifier'},{x:bx,y:by-8*28-30,type:'healer'}]);
addLvl(7,3,'Palacio en Ruinas',11,(bx,by)=>
    combine(mkGrid(bx,by,6,5,(r)=>r<2?'metal':'stone'),
        mkBeam(bx,by-5*28,280,'metal'),mkGrid(bx,by-5*28-28,4,3,'stone'),
        mkBeam(bx,by-8*28-28,200,'metal')),
    (bx,by)=>[{x:bx-40,y:by-5*28-30,type:'skeleton'},{x:bx+40,y:by-5*28-30,type:'soldier'},{x:bx,y:by-9*28-30,type:'healer'}]);
addLvl(7,4,'Coliseo Destruido',17,(bx,by)=>
    combine(mkPillars(bx,by,[-130,-65,0,65,130],10,'stone'),
        mkBeam(bx,by-5*28,300,'metal'),mkBeam(bx,by-10*28,300,'metal'),
        mkGrid(bx,by-5*28-28,5,4,'stone'),
        withProps([{x:bx,y:by-10*28-28,w:60,h:14,mat:'stone'}],{blastproof:true})),
    (bx,by)=>[{x:bx-65,y:by-10*28-30,type:'skeleton'},{x:bx,y:by-5*28-30,type:'nullifier'},
        {x:bx+65,y:by-10*28-30,type:'soldier'},{x:bx,y:by-10*28-30,type:'skeleton'},
        {x:bx,y:by-5*28-50,type:'boss_dragon'}]);

/* ============================================================
   ESCENARIO 8: INFIERNO (Niveles 41-45)
   ============================================================ */
addLvl(8,0,'Portal del Infierno',8,(bx,by)=>
    combine(mkPillars(bx,by,[-60,60],5,'stone'),mkGrid(bx,by,3,3,'wood')),
    (bx,by)=>[{x:bx,y:by-3*28-30,type:'demon'},{x:bx+70,y:by-16,type:'soldier'}]);
addLvl(8,1,'Río de Fuego',9,(bx,by)=>
    combine(mkGrid(bx,by,5,3,'wood'),mkBeam(bx,by-3*28,240,'stone'),
        mkGrid(bx,by-3*28-28,3,3,'wood')),
    (bx,by)=>[{x:bx-40,y:by-3*28-30,type:'demon'},{x:bx+40,y:by-6*28-30,type:'healer'}]);
addLvl(8,2,'Torre Infernal',10,(bx,by)=>
    mkTower(bx,by,3,10,['metal','stone','wood']),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'demon'},{x:bx,y:by-10*28-30,type:'nullifier'}]);
addLvl(8,3,'Fortaleza Demoníaca',11,(bx,by)=>
    combine(mkPillars(bx,by,[-100,100],8,'metal'),mkGrid(bx,by,4,6,'wood'),
        mkBeam(bx,by-8*28,240,'metal'),mkPyramid(bx,by-8*28-16,3,'stone')),
    (bx,by)=>[{x:bx-50,y:by-6*28-30,type:'demon'},{x:bx+50,y:by-6*28-30,type:'healer'},{x:bx,y:by-11*28-30,type:'nullifier'}]);
addLvl(8,4,'Trono del Infierno',14,(bx,by)=>
    combine(mkGrid(bx,by,6,6,(r)=>r<3?'metal':'stone'),
        mkBeam(bx,by-6*28,280,'metal'),mkGrid(bx,by-6*28-28,4,4,'stone'),
        mkBeam(bx,by-10*28-28,200,'metal'),mkPyramid(bx,by-11*28-14,3,'metal')),
    (bx,by)=>[{x:bx-60,y:by-6*28-30,type:'soldier'},{x:bx+60,y:by-6*28-30,type:'demon'},
        {x:bx,y:by-10*28-50,type:'healer'},{x:bx,y:by-14*28-30,type:'demon'}]);

/* ============================================================
   ESCENARIO 9: ESPACIO (Niveles 46-50)
   ============================================================ */
addLvl(9,0,'Estación Lunar',8,(bx,by)=>
    combine(mkGrid(bx,by,4,4,'metal'),mkBeam(bx,by-4*28,190,'metal')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'alien'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(9,1,'Satélite Perdido',9,(bx,by)=>
    combine(mkPillars(bx,by,[-70,70],6,'metal'),mkGrid(bx,by,3,4,'metal'),
        mkBeam(bx,by-6*28,180,'metal')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'alien'},{x:bx,y:by-6*28-30,type:'nullifier'}]);
addLvl(9,2,'Nave Nodriza',11,(bx,by)=>
    combine(mkGrid(bx,by,6,4,'metal'),mkBeam(bx,by-4*28,280,'metal'),
        mkGrid(bx,by-4*28-28,4,3,'metal'),mkBeam(bx,by-7*28-28,200,'metal')),
    (bx,by)=>[{x:bx-40,y:by-4*28-30,type:'alien'},{x:bx+40,y:by-7*28-50,type:'healer'},{x:bx,y:by-8*28-30,type:'nullifier'}]);
addLvl(9,3,'Asteroide Base',12,(bx,by)=>
    combine(mkPillars(bx,by,[-100,-50,0,50,100],7,'metal'),
        mkBeam(bx,by-3*28,240,'metal'),mkBeam(bx,by-7*28,240,'metal'),
        mkGrid(bx,by-3*28-28,4,3,'stone')),
    (bx,by)=>[{x:bx-50,y:by-7*28-30,type:'soldier'},{x:bx+50,y:by-7*28-30,type:'alien'},{x:bx,y:by-3*28-30,type:'healer'}]);
addLvl(9,4,'Fortaleza Estelar',18,(bx,by)=>
    combine(mkGrid(bx,by,7,6,(r)=>r<3?'metal':'stone'),
        mkBeam(bx,by-6*28,320,'metal'),mkGrid(bx,by-6*28-28,5,4,'metal'),
        mkBeam(bx,by-10*28-28,240,'metal'),mkPyramid(bx,by-11*28-14,3,'metal'),
        withProps([{x:bx-90,y:by,w:22,h:56,mat:'metal'}],{blastproof:true})),
    (bx,by)=>[{x:bx-60,y:by-6*28-30,type:'soldier'},{x:bx+60,y:by-6*28-30,type:'nullifier'},
        {x:bx,y:by-10*28-50,type:'healer'},{x:bx,y:by-14*28-30,type:'alien'},
        {x:bx,y:by-6*28-50,type:'boss_lich'}]);

/* ============================================================
   ESCENARIO 10: PANTANO (Niveles 51-55) — rubber & glass
   ============================================================ */
addLvl(10,0,'Ciénaga del Chamán',9,(bx,by)=>
    combine(mkGrid(bx,by,4,4,'wood'),mkBeam(bx,by-4*28,200,'rubber'),
        mkPyramid(bx,by-4*28-16,3,'wood')),
    (bx,by)=>[{x:bx-30,y:by-4*28-30,type:'villager'},{x:bx+30,y:by-7*28-16,type:'healer'}]);
addLvl(10,1,'Pantano Inquieto',10,(bx,by)=>
    combine(mkGrid(bx,by,5,3,'wood'),mkPillars(bx,by,[-80,80],5,'stone'),
        mkBeam(bx,by-5*28,200,'stone'),mkGrid(bx,by-5*28-28,2,2,'rubber')),
    (bx,by)=>[{x:bx-60,y:by-3*28-30,type:'soldier'},{x:bx+60,y:by-5*28-30,type:'soldier'}]);
addLvl(10,2,'Puente Putrefacto',10,(bx,by)=>
    combine(mkPillars(bx,by,[-100,100],7,'stone'),mkBeam(bx,by-3*28,240,'wood'),
        mkBeam(bx,by-7*28,240,'wood'),mkGrid(bx,by-3*28-28,3,3,'glass')),
    (bx,by)=>[{x:bx,y:by-3*28-30,type:'healer'},{x:bx-60,y:by-7*28-30,type:'soldier'},
        {x:bx+60,y:by-7*28-30,type:'nullifier'}]);
addLvl(10,3,'Fortaleza del Fango',12,(bx,by)=>
    combine(mkGrid(bx,by,6,5,(r)=>r<2?'stone':'wood'),
        mkBeam(bx,by-5*28,280,'stone'),mkGrid(bx,by-5*28-28,4,3,'rubber'),
        mkBeam(bx,by-8*28-28,200,'stone')),
    (bx,by)=>[{x:bx-50,y:by-5*28-30,type:'healer'},{x:bx+50,y:by-5*28-30,type:'nullifier'},{x:bx,y:by-9*28-30,type:'knight'}]);
addLvl(10,4,'Corazón del Pantano',13,(bx,by)=>
    combine(mkPillars(bx,by,[-110,-55,0,55,110],8,'stone'),
        mkBeam(bx,by-4*28,260,'stone'),mkBeam(bx,by-8*28,260,'stone'),
        mkGrid(bx,by-4*28-28,4,3,'wood'),mkGrid(bx,by-8*28-28,3,2,'glass')),
    (bx,by)=>[{x:bx-55,y:by-4*28-30,type:'soldier'},{x:bx+55,y:by-4*28-30,type:'soldier'},
        {x:bx-30,y:by-8*28-30,type:'healer'},{x:bx+30,y:by-8*28-30,type:'nullifier'},{x:bx,y:by-10*28-30,type:'knight'}]);

/* ============================================================
   ESCENARIO 11: DIMENSIÓN OSCURA (Niveles 56-60) — obsidian
   ============================================================ */
addLvl(11,0,'Portal Oscuro',9,(bx,by)=>
    combine(mkPillars(bx,by,[-70,70],6,'stone'),mkGrid(bx,by,4,4,'obsidian'),
        mkBeam(bx,by-6*28,180,'metal')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'soldier'},{x:bx,y:by-6*28-30,type:'nullifier'}]);
addLvl(11,1,'Vacío Arcano',10,(bx,by)=>
    combine(mkTower(bx,by,2,9,['metal','obsidian','stone']),
        mkBeam(bx,by-5*28,120,'metal'),mkBeam(bx,by-9*28,120,'metal')),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'nullifier'},{x:bx,y:by-9*28-30,type:'healer'}]);
addLvl(11,2,'Pesadilla Viviente',11,(bx,by)=>
    combine(mkGrid(bx,by,5,5,(r)=>r<2?'metal':'obsidian'),
        mkBeam(bx,by-5*28,240,'metal'),mkPyramid(bx,by-5*28-16,4,'stone')),
    (bx,by)=>[{x:bx-60,y:by-5*28-30,type:'soldier'},{x:bx+60,y:by-5*28-30,type:'soldier'},
        {x:bx,y:by-9*28-30,type:'nullifier'}]);
addLvl(11,3,'Laberinto de Sombras',12,(bx,by)=>
    combine(mkPillars(bx,by,[-100,-50,0,50,100],8,'metal'),
        mkBeam(bx,by-4*28,240,'obsidian'),mkBeam(bx,by-8*28,240,'metal'),
        mkGrid(bx,by-4*28-28,4,3,'stone')),
    (bx,by)=>[{x:bx-50,y:by-4*28-30,type:'soldier'},{x:bx+50,y:by-4*28-30,type:'healer'},
        {x:bx,y:by-8*28-30,type:'nullifier'}]);
addLvl(11,4,'Trono de la Oscuridad',18,(bx,by)=>
    combine(mkGrid(bx,by,7,6,(r)=>r<3?'metal':'obsidian'),
        mkBeam(bx,by-6*28,320,'metal'),mkGrid(bx,by-6*28-28,5,4,'metal'),
        mkBeam(bx,by-10*28-28,240,'obsidian'),mkPyramid(bx,by-11*28-14,3,'metal'),
        withProps([{x:bx-120,y:by,w:22,h:56,mat:'obsidian'},{x:bx+120,y:by,w:22,h:56,mat:'obsidian'}],{fireproof:true})),
    (bx,by)=>[{x:bx-80,y:by-6*28-30,type:'soldier'},{x:bx+80,y:by-6*28-30,type:'soldier'},
        {x:bx-40,y:by-10*28-50,type:'healer'},{x:bx+40,y:by-10*28-50,type:'healer'},
        {x:bx-20,y:by-14*28-30,type:'nullifier'},{x:bx+20,y:by-14*28-30,type:'nullifier'},
        {x:bx,y:by-14*28-60,type:'boss_lich'}]);

/* ============================================================
   ESCENARIO 12: OCÉANO (Niveles 61-65) — glass + rubber heavy
   ============================================================ */
addLvl(12,0,'Muelle Abandonado',8,(bx,by)=>
    combine(mkGrid(bx,by,5,3,'wood'),mkPillars(bx,by,[-80,80],5,'wood'),
        mkBeam(bx,by-5*28,200,'wood')),
    (bx,by)=>[{x:bx,y:by-3*28-30,type:'soldier'},{x:bx,y:by-5*28-30,type:'soldier'}]);
addLvl(12,1,'Barco Hundido',9,(bx,by)=>
    combine(mkGrid(bx,by,6,3,(r,c)=>c%2===0?'wood':'glass'),
        mkBeam(bx,by-3*28,280,'wood'),mkPyramid(bx,by-3*28-16,3,'glass')),
    (bx,by)=>[{x:bx-40,y:by-3*28-30,type:'soldier'},{x:bx+40,y:by-6*28-30,type:'healer'}]);
addLvl(12,2,'Fortaleza Coral',10,(bx,by)=>
    combine(mkPillars(bx,by,[-90,0,90],7,'stone'),
        mkBeam(bx,by-3*28,220,'rubber'),mkBeam(bx,by-7*28,220,'stone'),
        mkGrid(bx,by-3*28-28,3,3,'glass')),
    (bx,by)=>[{x:bx,y:by-7*28-30,type:'nullifier'},{x:bx-60,y:by-3*28-30,type:'soldier'}]);
addLvl(12,3,'Abismo Marino',12,(bx,by)=>
    combine(mkWall(bx,by,5,6,(r)=>r<3?'stone':'glass'),
        mkBeam(bx,by-6*28,240,'metal'),mkDiamond(bx,by-6*28-16,3,'rubber')),
    (bx,by)=>[{x:bx-50,y:by-6*28-30,type:'healer'},{x:bx+50,y:by-6*28-30,type:'nullifier'},
        {x:bx,y:by-10*28-30,type:'knight'}]);
addLvl(12,4,'Templo Submarino',14,(bx,by)=>
    combine(mkArch(bx-60,by,80,6,'stone'),mkArch(bx+60,by,80,6,'stone'),
        mkBeam(bx,by-6*28,260,'metal'),mkGrid(bx,by-6*28-28,4,3,'glass'),
        mkPyramid(bx,by-9*28-28,3,'obsidian')),
    (bx,by)=>[{x:bx-60,y:by-6*28-30,type:'soldier'},{x:bx+60,y:by-6*28-30,type:'soldier'},
        {x:bx,y:by-9*28-30,type:'healer'},{x:bx,y:by-12*28-30,type:'nullifier'}]);

/* ============================================================
   ESCENARIO 13: JUNGLA (Niveles 66-70) — wood + rubber heavy
   ============================================================ */
addLvl(13,0,'Aldea Tribal',8,(bx,by)=>
    combine(mkGrid(bx,by,4,4,'wood'),mkPillars(bx,by,[-70,70],4,'rubber')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'villager'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(13,1,'Templo Azteca',9,(bx,by)=>
    mkPyramid(bx,by,7,(r)=>r<3?'stone':r<5?'wood':'rubber'),
    (bx,by)=>[{x:bx,y:by-7*28-16,type:'wizard'},{x:bx+50,y:by-16,type:'soldier'}]);
addLvl(13,2,'Puente Colgante',10,(bx,by)=>
    combine(mkPillars(bx,by,[-110,110],8,'wood'),mkBeam(bx,by-4*28,260,'rubber'),
        mkBeam(bx,by-8*28,260,'wood'),mkGrid(bx,by-4*28-28,3,3,'wood')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'healer'},{x:bx-60,y:by-8*28-30,type:'wizard'},{x:bx+60,y:by-8*28-30,type:'soldier'}]);
addLvl(13,3,'Ruinas de la Selva',12,(bx,by)=>
    combine(mkWall(bx,by,6,5,(r)=>r<2?'stone':'wood'),
        mkBeam(bx,by-5*28,280,'stone'),mkGrid(bx,by-5*28-28,4,3,'rubber')),
    (bx,by)=>[{x:bx-50,y:by-5*28-30,type:'wizard'},{x:bx+50,y:by-5*28-30,type:'healer'},
        {x:bx,y:by-8*28-30,type:'nullifier'}]);
addLvl(13,4,'Corazón de la Jungla',18,(bx,by)=>
    combine(mkTower(bx-70,by,2,10,['stone','wood','rubber']),
        mkTower(bx+70,by,2,10,['stone','wood','rubber']),
        mkBeam(bx,by-5*28,200,'stone'),mkBeam(bx,by-10*28,200,'stone'),
        withProps([{x:bx,y:by,w:30,h:56,mat:'stone'}],{fireproof:true})),
    (bx,by)=>[{x:bx-70,y:by-10*28-30,type:'soldier'},{x:bx+70,y:by-10*28-30,type:'healer'},
        {x:bx,y:by-5*28-30,type:'wizard'},{x:bx,y:by-10*28-30,type:'nullifier'},
        {x:bx,y:by-5*28-50,type:'boss_titan'}]);

/* ============================================================
   ESCENARIO 14: CIELO (Niveles 71-75) — glass + ice heavy
   ============================================================ */
addLvl(14,0,'Nube Solitaria',8,(bx,by)=>
    combine(mkGrid(bx,by,5,3,'glass'),mkBeam(bx,by-3*28,240,'ice')),
    (bx,by)=>[{x:bx,y:by-3*28-30,type:'soldier'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(14,1,'Torre Celestial',9,(bx,by)=>
    mkTower(bx,by,2,10,['stone','glass','ice']),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'wizard'},{x:bx,y:by-10*28-30,type:'healer'}]);
addLvl(14,2,'Puerta del Cielo',10,(bx,by)=>
    combine(mkArch(bx,by,120,7,'stone'),mkGrid(bx,by-7*28-28,3,3,'glass'),
        mkBeam(bx,by-10*28-28,140,'ice')),
    (bx,by)=>[{x:bx,y:by-7*28-30,type:'nullifier'},{x:bx,y:by-11*28-30,type:'wizard'}]);
addLvl(14,3,'Palacio Flotante',12,(bx,by)=>
    combine(mkGrid(bx,by,6,4,(r)=>r<2?'stone':'glass'),
        mkBeam(bx,by-4*28,280,'ice'),mkDiamond(bx,by-4*28-16,4,'glass')),
    (bx,by)=>[{x:bx-50,y:by-4*28-30,type:'soldier'},{x:bx+50,y:by-4*28-30,type:'healer'},
        {x:bx,y:by-10*28-30,type:'wizard'}]);
addLvl(14,4,'Trono de las Nubes',15,(bx,by)=>
    combine(mkPillars(bx,by,[-110,-55,0,55,110],9,'stone'),
        mkBeam(bx,by-4*28,260,'glass'),mkBeam(bx,by-9*28,260,'ice'),
        mkGrid(bx,by-4*28-28,4,4,'glass'),mkPyramid(bx,by-9*28-16,3,'ice')),
    (bx,by)=>[{x:bx-55,y:by-9*28-30,type:'soldier'},{x:bx+55,y:by-9*28-30,type:'nullifier'},
        {x:bx,y:by-4*28-30,type:'healer'},{x:bx,y:by-12*28-30,type:'wizard'}]);

/* ============================================================
   ESCENARIO 15: CAVERNA (Niveles 76-80) — stone + obsidian
   ============================================================ */
addLvl(15,0,'Entrada de la Cueva',8,(bx,by)=>
    combine(mkGrid(bx,by,4,5,'stone'),mkBeam(bx,by-5*28,190,'obsidian')),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'skeleton'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(15,1,'Mina de Cristal',9,(bx,by)=>
    combine(mkPillars(bx,by,[-80,0,80],6,'obsidian'),mkGrid(bx,by,3,4,'stone'),
        mkBeam(bx,by-6*28,200,'stone')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'skeleton'},{x:bx,y:by-6*28-30,type:'healer'}]);
addLvl(15,2,'Lago Subterráneo',10,(bx,by)=>
    combine(mkGrid(bx,by,5,4,(r)=>r<2?'obsidian':'stone'),
        mkBeam(bx,by-4*28,240,'metal'),mkPyramid(bx,by-4*28-16,4,'stone')),
    (bx,by)=>[{x:bx,y:by-8*28-30,type:'wizard'},{x:bx-60,y:by-4*28-30,type:'nullifier'},
        {x:bx+60,y:by-16,type:'soldier'}]);
addLvl(15,3,'Trono de Roca',12,(bx,by)=>
    combine(mkWall(bx,by,5,7,(r)=>r<3?'obsidian':'stone'),
        mkBeam(bx,by-7*28,240,'metal'),mkGrid(bx,by-7*28-28,3,3,'obsidian')),
    (bx,by)=>[{x:bx-40,y:by-7*28-30,type:'healer'},{x:bx+40,y:by-7*28-30,type:'nullifier'},
        {x:bx,y:by-10*28-30,type:'skeleton'}]);
addLvl(15,4,'Corazón de la Montaña',19,(bx,by)=>
    combine(mkPillars(bx,by,[-120,-60,0,60,120],10,'obsidian'),
        mkBeam(bx,by-5*28,290,'metal'),mkBeam(bx,by-10*28,290,'metal'),
        mkGrid(bx,by-5*28-28,5,4,'stone'),
        withProps([{x:bx-100,y:by,w:22,h:56,mat:'obsidian'},{x:bx+100,y:by,w:22,h:56,mat:'obsidian'}],{blastproof:true})),
    (bx,by)=>[{x:bx-60,y:by-10*28-30,type:'soldier'},{x:bx+60,y:by-10*28-30,type:'soldier'},
        {x:bx,y:by-5*28-30,type:'healer'},{x:bx,y:by-10*28-30,type:'nullifier'},
        {x:bx,y:by-5*28-50,type:'boss_titan'}]);

/* ============================================================
   ESCENARIO 16: CRISTAL (Niveles 81-85) — glass + obsidian
   ============================================================ */
addLvl(16,0,'Prado de Cristal',9,(bx,by)=>
    combine(mkGrid(bx,by,5,3,'glass'),mkPyramid(bx,by-3*28,4,'glass')),
    (bx,by)=>[{x:bx,y:by-7*28-30,type:'wizard'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(16,1,'Espejo Infinito',10,(bx,by)=>
    combine(mkDiamond(bx,by,4,'glass'),mkGrid(bx-80,by,2,6,'obsidian'),mkGrid(bx+80,by,2,6,'obsidian')),
    (bx,by)=>[{x:bx,y:by-6*28-30,type:'healer'},{x:bx-80,y:by-6*28-30,type:'nullifier'}]);
addLvl(16,2,'Torre Prismática',11,(bx,by)=>
    combine(mkTower(bx,by,3,10,['obsidian','glass','glass']),
        mkBeam(bx,by-5*28,140,'obsidian'),mkBeam(bx,by-10*28,140,'glass')),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'soldier'},{x:bx,y:by-10*28-30,type:'wizard'}]);
addLvl(16,3,'Laberinto de Espejos',13,(bx,by)=>
    combine(mkPillars(bx,by,[-100,100],8,'obsidian'),mkGrid(bx,by,4,6,'glass'),
        mkBeam(bx,by-8*28,240,'obsidian'),mkGrid(bx,by-8*28-28,3,3,'glass')),
    (bx,by)=>[{x:bx-50,y:by-6*28-30,type:'healer'},{x:bx+50,y:by-6*28-30,type:'nullifier'},
        {x:bx,y:by-8*28-30,type:'soldier'},{x:bx,y:by-11*28-30,type:'wizard'}]);
addLvl(16,4,'Palacio de Cristal',15,(bx,by)=>
    combine(mkWall(bx,by,6,6,(r,c)=>r<2?'obsidian':(c%2===0?'glass':'obsidian')),
        mkBeam(bx,by-6*28,280,'obsidian'),mkDiamond(bx,by-6*28-16,4,'glass'),
        mkBeam(bx,by-12*28,160,'obsidian')),
    (bx,by)=>[{x:bx-70,y:by-6*28-30,type:'soldier'},{x:bx+70,y:by-6*28-30,type:'soldier'},
        {x:bx,y:by-6*28-30,type:'healer'},{x:bx,y:by-12*28-30,type:'nullifier'},{x:bx,y:by-14*28-30,type:'wizard'}]);

/* ============================================================
   ESCENARIO 17: ABISMO (Niveles 86-90) — obsidian + metal heavy
   ============================================================ */
addLvl(17,0,'Borde del Abismo',9,(bx,by)=>
    combine(mkGrid(bx,by,4,5,'metal'),mkBeam(bx,by-5*28,190,'obsidian')),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'demon'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(17,1,'Fosas del Olvido',10,(bx,by)=>
    combine(mkPillars(bx,by,[-80,80],7,'obsidian'),mkGrid(bx,by,4,5,'metal'),
        mkBeam(bx,by-7*28,200,'obsidian')),
    (bx,by)=>[{x:bx,y:by-5*28-30,type:'demon'},{x:bx,y:by-7*28-30,type:'healer'}]);
addLvl(17,2,'Puente sobre el Vacío',12,(bx,by)=>
    combine(mkArch(bx-70,by,80,7,'obsidian'),mkArch(bx+70,by,80,7,'obsidian'),
        mkBeam(bx,by-7*28,220,'metal'),mkGrid(bx,by-7*28-28,4,3,'metal')),
    (bx,by)=>[{x:bx-70,y:by-7*28-30,type:'soldier'},{x:bx+70,y:by-7*28-30,type:'nullifier'},
        {x:bx,y:by-10*28-30,type:'demon'}]);
addLvl(17,3,'Altar del Abismo',14,(bx,by)=>
    combine(mkWall(bx,by,5,7,(r)=>r<3?'obsidian':'metal'),
        mkBeam(bx,by-7*28,240,'obsidian'),mkDiamond(bx,by-7*28-16,3,'metal'),
        mkPyramid(bx,by-12*28,3,'obsidian')),
    (bx,by)=>[{x:bx-50,y:by-7*28-30,type:'healer'},{x:bx+50,y:by-7*28-30,type:'soldier'},
        {x:bx,y:by-12*28-30,type:'demon'},{x:bx,y:by-15*28-30,type:'nullifier'}]);
addLvl(17,4,'Trono del Vacío',20,(bx,by)=>
    combine(mkPillars(bx,by,[-130,-65,0,65,130],10,'obsidian'),
        mkBeam(bx,by-5*28,300,'metal'),mkBeam(bx,by-10*28,300,'obsidian'),
        mkGrid(bx,by-5*28-28,5,4,'metal'),mkGrid(bx,by-10*28-28,3,3,'obsidian'),
        withProps([{x:bx-110,y:by,w:22,h:56,mat:'obsidian'},{x:bx+110,y:by,w:22,h:56,mat:'obsidian'}],{fireproof:true,blastproof:true})),
    (bx,by)=>[{x:bx-65,y:by-10*28-30,type:'soldier'},{x:bx+65,y:by-10*28-30,type:'soldier'},
        {x:bx,y:by-5*28-30,type:'healer'},{x:bx,y:by-10*28-30,type:'nullifier'},{x:bx,y:by-13*28-30,type:'demon'},
        {x:bx,y:by-10*28-50,type:'boss_overlord'}]);

/* ============================================================
   ESCENARIO 18: MECANISMO (Niveles 91-95) — metal + rubber
   ============================================================ */
addLvl(18,0,'Engranaje Menor',9,(bx,by)=>
    combine(mkGrid(bx,by,4,4,'metal'),mkGrid(bx,by-4*28,3,2,'rubber')),
    (bx,by)=>[{x:bx,y:by-6*28-30,type:'soldier'},{x:bx+60,y:by-16,type:'soldier'}]);
addLvl(18,1,'Fábrica Abandonada',10,(bx,by)=>
    combine(mkPillars(bx,by,[-90,0,90],7,'metal'),
        mkBeam(bx,by-3*28,220,'rubber'),mkBeam(bx,by-7*28,220,'metal'),
        mkGrid(bx,by-3*28-28,3,3,'metal')),
    (bx,by)=>[{x:bx,y:by-7*28-30,type:'healer'},{x:bx-60,y:by-3*28-30,type:'soldier'}]);
addLvl(18,2,'Torre de Relojería',12,(bx,by)=>
    combine(mkTower(bx,by,3,12,['metal','metal','rubber']),
        mkBeam(bx,by-6*28,160,'metal'),mkBeam(bx,by-12*28,120,'rubber')),
    (bx,by)=>[{x:bx,y:by-6*28-30,type:'nullifier'},{x:bx,y:by-12*28-30,type:'healer'},
        {x:bx-80,y:by-16,type:'soldier'}]);
addLvl(18,3,'Gran Mecanismo',14,(bx,by)=>
    combine(mkWall(bx,by,6,6,(r,c)=>(r+c)%2===0?'metal':'rubber'),
        mkBeam(bx,by-6*28,280,'metal'),mkGrid(bx,by-6*28-28,4,4,'metal'),
        mkBeam(bx,by-10*28-28,200,'rubber')),
    (bx,by)=>[{x:bx-60,y:by-6*28-30,type:'soldier'},{x:bx+60,y:by-6*28-30,type:'nullifier'},
        {x:bx,y:by-10*28-50,type:'healer'},{x:bx,y:by-12*28-30,type:'knight'}]);
addLvl(18,4,'Motor del Mundo',16,(bx,by)=>
    combine(mkPillars(bx,by,[-120,-60,0,60,120],10,'metal'),
        mkBeam(bx,by-5*28,290,'rubber'),mkBeam(bx,by-10*28,290,'metal'),
        mkGrid(bx,by-5*28-28,5,4,(r)=>r<2?'metal':'rubber'),
        mkPyramid(bx,by-10*28-16,4,'metal')),
    (bx,by)=>[{x:bx-60,y:by-10*28-30,type:'soldier'},{x:bx+60,y:by-10*28-30,type:'soldier'},
        {x:bx-30,y:by-5*28-30,type:'healer'},{x:bx+30,y:by-5*28-30,type:'nullifier'},
        {x:bx,y:by-14*28-30,type:'king'}]);

/* ============================================================
   ESCENARIO 19: NEXO (Niveles 96-100) — FINAL — todos materiales
   ============================================================ */
addLvl(19,0,'Grieta Dimensional',10,(bx,by)=>
    combine(mkGrid(bx,by,5,4,(r)=>['obsidian','metal','stone','glass'][r]),
        mkBeam(bx,by-4*28,240,'obsidian'),mkDiamond(bx,by-4*28-16,3,'glass')),
    (bx,by)=>[{x:bx,y:by-4*28-30,type:'soldier'},{x:bx,y:by-8*28-30,type:'nullifier'},
        {x:bx+70,y:by-16,type:'healer'}]);
addLvl(19,1,'Convergencia',12,(bx,by)=>
    combine(mkArch(bx-60,by,80,7,'obsidian'),mkArch(bx+60,by,80,7,'metal'),
        mkBeam(bx,by-7*28,260,'metal'),mkGrid(bx,by-7*28-28,4,3,(r)=>r<2?'glass':'rubber')),
    (bx,by)=>[{x:bx-60,y:by-7*28-30,type:'soldier'},{x:bx+60,y:by-7*28-30,type:'healer'},
        {x:bx,y:by-10*28-30,type:'nullifier'},{x:bx,y:by-16,type:'demon'}]);
addLvl(19,2,'Fortaleza del Nexo',14,(bx,by)=>
    combine(mkWall(bx,by,6,7,(r,c)=>{
        if(r<2)return'obsidian';if(r<4)return c%2===0?'metal':'rubber';return'glass';
    }),mkBeam(bx,by-7*28,280,'obsidian'),mkGrid(bx,by-7*28-28,4,4,'metal'),
        mkBeam(bx,by-11*28-28,200,'obsidian')),
    (bx,by)=>[{x:bx-60,y:by-7*28-30,type:'soldier'},{x:bx+60,y:by-7*28-30,type:'soldier'},
        {x:bx,y:by-11*28-50,type:'healer'},{x:bx-30,y:by-13*28-30,type:'nullifier'},{x:bx+30,y:by-13*28-30,type:'demon'}]);
addLvl(19,3,'Núcleo Inestable',16,(bx,by)=>
    combine(mkPillars(bx,by,[-130,-65,0,65,130],10,'obsidian'),
        mkBeam(bx,by-5*28,300,'metal'),mkBeam(bx,by-10*28,300,'obsidian'),
        mkGrid(bx,by-5*28-28,5,4,(r)=>r<2?'metal':'glass'),
        mkDiamond(bx,by-10*28-16,3,'rubber'),mkPyramid(bx,by-14*28,3,'obsidian')),
    (bx,by)=>[{x:bx-65,y:by-10*28-30,type:'soldier'},{x:bx+65,y:by-10*28-30,type:'soldier'},
        {x:bx-30,y:by-5*28-30,type:'healer'},{x:bx+30,y:by-5*28-30,type:'healer'},
        {x:bx,y:by-14*28-30,type:'nullifier'},{x:bx,y:by-17*28-30,type:'demon'}]);
addLvl(19,4,'Batalla Final',22,(bx,by)=>
    combine(mkWall(bx,by,7,8,(r,c)=>{
        if(r<2)return'obsidian';if(r<4)return'metal';if(r<6)return c%2===0?'rubber':'glass';return'glass';
    }),mkBeam(bx,by-8*28,320,'obsidian'),
        mkGrid(bx,by-8*28-28,6,4,(r)=>r<2?'obsidian':'metal'),
        mkBeam(bx,by-12*28-28,260,'metal'),
        mkPyramid(bx,by-13*28-14,4,'obsidian'),
        withProps([{x:bx-130,y:by,w:22,h:84,mat:'obsidian'},{x:bx+130,y:by,w:22,h:84,mat:'obsidian'}],{fireproof:true,blastproof:true})),
    (bx,by)=>[{x:bx-80,y:by-8*28-30,type:'soldier'},{x:bx+80,y:by-8*28-30,type:'soldier'},
        {x:bx-40,y:by-12*28-50,type:'healer'},{x:bx+40,y:by-12*28-50,type:'healer'},
        {x:bx-20,y:by-16*28-30,type:'nullifier'},{x:bx+20,y:by-16*28-30,type:'nullifier'},
        {x:bx,y:by-17*28-30,type:'king'},{x:bx,y:by-12*28-70,type:'boss_overlord'}]);

/* ===== BACKGROUND THEMES ===== */
const BG_THEMES = {
    prairie: {
        sky:[{pos:0,color:'#4a90d9'},{pos:0.6,color:'#87CEEB'},{pos:1,color:'#c8e8a0'}],
        sun:{x:780,y:80,r:35,color:'#ffe040',glow:'rgba(255,224,64,0.12)'},
        clouds:true,
        trees:[{x:50,s:0.6},{x:850,s:0.8},{x:750,s:0.5}],
        ground:'#5a8a30',groundDark:'#3a6a18',dirt:'#6a5030',
        ambientParticles:'leaves'
    },
    desert: {
        sky:[{pos:0,color:'#1a0800'},{pos:0.3,color:'#c86020'},{pos:0.7,color:'#e8a840'},{pos:1,color:'#f0d080'}],
        sun:{x:750,y:60,r:45,color:'#ffd040',glow:'rgba(255,200,40,0.15)'},
        dunes:true,
        ground:'#c8a050',groundDark:'#a88030',dirt:'#b09040',
        ambientParticles:'sand'
    },
    forest: {
        sky:[{pos:0,color:'#1a3a20'},{pos:0.5,color:'#2a5a30'},{pos:1,color:'#4a7a40'}],
        fog:true,
        trees:[{x:30,s:1.0},{x:100,s:0.7},{x:800,s:1.1},{x:870,s:0.6},{x:700,s:0.9}],
        ground:'#3a5a20',groundDark:'#2a4a15',dirt:'#4a3a20',
        ambientParticles:'fireflies'
    },
    snow: {
        sky:[{pos:0,color:'#c8d8f0'},{pos:0.5,color:'#e0e8f0'},{pos:1,color:'#f0f4f8'}],
        clouds:true, mountains:true,
        ground:'#e8e8f0',groundDark:'#c8c8d8',dirt:'#b0b0c0',
        ambientParticles:'snow'
    },
    tundra: {
        sky:[{pos:0,color:'#050818'},{pos:0.4,color:'#0a1030'},{pos:1,color:'#1a2848'}],
        stars:true, aurora:true, moon:{x:800,y:60,r:22},
        ground:'#a0c0d0',groundDark:'#80a0b0',dirt:'#708898',
        ambientParticles:'snow'
    },
    volcano: {
        sky:[{pos:0,color:'#1a0500'},{pos:0.4,color:'#3a1000'},{pos:0.8,color:'#5a2000'},{pos:1,color:'#802800'}],
        lava:true,
        ground:'#4a3020',groundDark:'#3a2010',dirt:'#2a1a0a',
        ambientParticles:'embers'
    },
    castle: {
        sky:[{pos:0,color:'#2a3a5a'},{pos:0.5,color:'#4a5a7a'},{pos:1,color:'#8a9ab0'}],
        clouds:true,
        sun:{x:200,y:90,r:30,color:'#ffd860',glow:'rgba(255,216,96,0.1)'},
        ground:'#5a6a50',groundDark:'#3a4a30',dirt:'#4a4030',
        ambientParticles:null
    },
    ruins: {
        sky:[{pos:0,color:'#0a0808'},{pos:0.4,color:'#1a1510'},{pos:1,color:'#2a2018'}],
        stars:true, lightning:true, moon:{x:700,y:50,r:18},
        ground:'#4a4038',groundDark:'#3a3028',dirt:'#2a2018',
        ambientParticles:'sand'
    },
    inferno: {
        sky:[{pos:0,color:'#1a0000'},{pos:0.3,color:'#4a0800'},{pos:0.7,color:'#7a1000'},{pos:1,color:'#aa2000'}],
        lava:true,
        ground:'#3a1008',groundDark:'#2a0805',dirt:'#1a0500',
        ambientParticles:'embers'
    },
    space: {
        sky:[{pos:0,color:'#000005'},{pos:0.5,color:'#050510'},{pos:1,color:'#0a0a18'}],
        stars:true, nebula:true,
        ground:'#2a2a3a',groundDark:'#1a1a2a',dirt:'#15151f',
        ambientParticles:null
    },
    swamp: {
        sky:[{pos:0,color:'#0a1a08'},{pos:0.4,color:'#1a3a18'},{pos:0.8,color:'#263a20'},{pos:1,color:'#3a4a28'}],
        fog:true,
        trees:[{x:40,s:0.9},{x:100,s:0.6},{x:820,s:0.8},{x:890,s:0.5}],
        ground:'#2a3a18',groundDark:'#1a2a10',dirt:'#1a2008',
        ambientParticles:'fireflies'
    },
    darkdim: {
        sky:[{pos:0,color:'#06000f'},{pos:0.35,color:'#150828'},{pos:0.7,color:'#200a40'},{pos:1,color:'#2a1050'}],
        stars:true, nebula:true,
        ground:'#1a0a30',groundDark:'#100520',dirt:'#0a0318',
        ambientParticles:null
    },
    ocean: {
        sky:[{pos:0,color:'#0a2848'},{pos:0.4,color:'#1a4868'},{pos:0.8,color:'#3a7898'},{pos:1,color:'#5098b8'}],
        clouds:true,
        ground:'#2a5068',groundDark:'#1a3a50',dirt:'#183048',
        ambientParticles:null
    },
    jungle: {
        sky:[{pos:0,color:'#0a2a08'},{pos:0.4,color:'#1a4a18'},{pos:0.8,color:'#2a5a20'},{pos:1,color:'#3a6a28'}],
        fog:true,
        trees:[{x:20,s:1.1},{x:80,s:0.8},{x:830,s:1.0},{x:900,s:0.7},{x:750,s:0.9}],
        ground:'#2a4a10',groundDark:'#1a3a08',dirt:'#1a2a06',
        ambientParticles:'fireflies'
    },
    sky: {
        sky:[{pos:0,color:'#3a80e0'},{pos:0.4,color:'#60a8f0'},{pos:0.8,color:'#80c8ff'},{pos:1,color:'#a0e0ff'}],
        clouds:true,
        sun:{x:820,y:60,r:40,color:'#ffe860',glow:'rgba(255,232,96,0.12)'},
        ground:'#c0d8e8',groundDark:'#a0b8c8',dirt:'#90a8b8',
        ambientParticles:null
    },
    cave: {
        sky:[{pos:0,color:'#0a0808'},{pos:0.4,color:'#1a1410'},{pos:1,color:'#2a2018'}],
        ground:'#3a3028',groundDark:'#2a2018',dirt:'#1a1510',
        ambientParticles:null
    },
    crystal: {
        sky:[{pos:0,color:'#0a0020'},{pos:0.4,color:'#1a1040'},{pos:0.8,color:'#2a1860'},{pos:1,color:'#3a2080'}],
        stars:true, nebula:true,
        ground:'#2a1860',groundDark:'#1a1040',dirt:'#100830',
        ambientParticles:'fireflies'
    },
    abyss: {
        sky:[{pos:0,color:'#000000'},{pos:0.5,color:'#080008'},{pos:1,color:'#100010'}],
        stars:true,
        ground:'#100810',groundDark:'#080408',dirt:'#060306',
        ambientParticles:null
    },
    clockwork: {
        sky:[{pos:0,color:'#1a1810'},{pos:0.4,color:'#2a2818'},{pos:0.8,color:'#3a3828'},{pos:1,color:'#4a4838'}],
        ground:'#3a3828',groundDark:'#2a2818',dirt:'#201e10',
        ambientParticles:'embers'
    },
    nexus: {
        sky:[{pos:0,color:'#000010'},{pos:0.3,color:'#0a0830'},{pos:0.6,color:'#1a1060'},{pos:1,color:'#2a1880'}],
        stars:true, nebula:true, aurora:true,
        ground:'#1a1060',groundDark:'#0a0830',dirt:'#080620',
        ambientParticles:'fireflies'
    }
};
