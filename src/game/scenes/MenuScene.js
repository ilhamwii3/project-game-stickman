import Phaser from 'phaser';
import { loadPlayerData } from '../../supabase/playerData.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0a0510');
    this.buildBackground();
    this.buildHeader();
    this.buildCharacter();
    this.buildMenu();
    this.buildBottomBar();
  }

  buildBackground() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0b2e, 0x1a0b2e, 0x0a0510, 0x0a0510, 1);
    bg.fillRect(0, 0, width, height);
    const moon = this.add.circle(width * 0.75, height * 0.22, 60, 0xf5e6d3, 0.15);
    this.add.circle(width * 0.75, height * 0.22, 50, 0xf5e6d3, 0.25);
    this.tweens.add({targets: moon, alpha: 0.35, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'});
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(height * 0.3, height);
      const p = this.add.circle(x, y, Phaser.Math.FloatBetween(1, 2.5), 0xff8a3d, 0.5);
      this.tweens.add({targets: p, y: y - Phaser.Math.Between(60, 160), alpha: 0, duration: Phaser.Math.Between(2500, 5000), repeat: -1, delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => { p.x = Phaser.Math.Between(0, width); p.y = height + 20; p.alpha = 0.5; }});
    }
    const castleY = height * 0.62;
    const castle = this.add.graphics();
    castle.fillStyle(0x050308, 1);
    castle.fillRect(0, castleY, width, height - castleY);
    for (let i = 0; i < 8; i++) {
      const cx = (width / 8) * i + 20, ch = 40 + Math.random() * 80;
      castle.fillRect(cx, castleY - ch, 40, ch);
    }
  }

  buildHeader() {
    const { width } = this.scale;
    const data = this.registry.get('playerData') || loadPlayerData();
    const panel = this.add.graphics();
    panel.fillStyle(0x1a0b2e, 0.85); panel.fillRoundedRect(10, 10, width - 20, 70, 12);
    panel.lineStyle(2, 0x8b5cf6, 0.7); panel.strokeRoundedRect(10, 10, width - 20, 70, 12);
    const avatar = this.add.graphics();
    avatar.fillStyle(0x2d1b4e, 1); avatar.fillCircle(50, 45, 24);
    avatar.lineStyle(2, 0xec4899, 1); avatar.strokeCircle(50, 45, 24);
    avatar.fillStyle(0xffffff, 1); avatar.fillCircle(50, 42, 6); avatar.fillRoundedRect(42, 52, 16, 12, 4);
    this.add.text(85, 22, data.username, {fontFamily: 'Trebuchet MS', fontSize: '18px', fontStyle: 'bold', color: '#ffffff'});
    this.add.text(85, 44, `Lv. ${data.level}`, {fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#a78bfa'});
    const expW = Math.max(120, width * 0.35);
    const expBg = this.add.graphics();
    expBg.fillStyle(0x000000, 0.6); expBg.fillRoundedRect(85, 62, expW, 6, 3);
    const expPct = Math.min(1, data.exp / data.expMax);
    expBg.fillStyle(0x8b5cf6, 1); expBg.fillRoundedRect(85, 62, expW * expPct, 6, 3);
    this.iconText(width - 200, 30, '🪙', `${data.gold}`, '#ffd700');
    this.iconText(width - 100, 30, '💎', `${data.gems}`, '#67e8f9');
  }

  iconText(x, y, icon, text, color) {
    this.add.text(x, y, icon, {fontSize: '16px'}).setOrigin(0, 0.5);
    this.add.text(x + 22, y, text, {fontFamily: 'Trebuchet MS', fontSize: '14px', fontStyle: 'bold', color}).setOrigin(0, 0.5);
  }

  buildCharacter() {
    const { width, height } = this.scale, cx = width / 2, cy = height * 0.42;
    const glow = this.add.circle(cx, cy + 40, 90, 0x8b5cf6, 0.15);
    this.tweens.add({targets: glow, scale: 1.15, alpha: 0.25, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'});
    const g = this.add.graphics();
    g.lineStyle(6, 0xffffff, 1); g.strokeCircle(cx, cy - 90, 26); g.fillStyle(0xffffff, 1); g.fillCircle(cx, cy - 90, 24);
    g.fillStyle(0x000000, 1); g.fillCircle(cx - 8, cy - 94, 4); g.fillCircle(cx + 8, cy - 94, 4);
    g.lineStyle(7, 0xffffff, 1);
    g.beginPath(); g.moveTo(cx, cy - 66); g.lineTo(cx, cy + 20); g.strokePath();
    g.beginPath(); g.moveTo(cx, cy - 50); g.lineTo(cx - 42, cy - 10); g.strokePath();
    g.beginPath(); g.moveTo(cx, cy - 50); g.lineTo(cx + 42, cy - 10); g.strokePath();
    g.beginPath(); g.moveTo(cx, cy + 20); g.lineTo(cx - 30, cy + 90); g.strokePath();
    g.beginPath(); g.moveTo(cx, cy + 20); g.lineTo(cx + 30, cy + 90); g.strokePath();
    g.lineStyle(5, 0xe0e0e0, 1); g.beginPath(); g.moveTo(cx + 42, cy - 10); g.lineTo(cx + 78, cy - 60); g.strokePath();
    g.lineStyle(3, 0x8b5cf6, 1); g.beginPath(); g.moveTo(cx + 78, cy - 60); g.lineTo(cx + 100, cy - 82); g.strokePath();
    g.fillStyle(0x8b5cf6, 0.35); g.beginPath(); g.moveTo(cx - 20, cy - 60); g.lineTo(cx + 20, cy - 60); g.lineTo(cx + 32, cy + 60); g.lineTo(cx - 32, cy + 60); g.closePath(); g.fillPath();
    this.tweens.add({targets: g, y: 8, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'});
    this.add.text(cx, cy + 120, 'THE WANDERER', {fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#a78bfa'}).setOrigin(0.5);
  }

  buildMenu() {
    const { width, height } = this.scale, menuY = height * 0.68;
    const buttons = [
      {label:'BATTLE',icon:'⚔️',scene:'BattleScene',color:0xef4444},{label:'HEROES',icon:'🛡️',scene:null,color:0x3b82f6},
      {label:'EQUIPMENT',icon:'🗡️',scene:null,color:0xf59e0b},{label:'UPGRADE',icon:'⬆️',scene:null,color:0x22c55e},
      {label:'SKILLS',icon:'✨',scene:null,color:0xa855f7},{label:'QUEST',icon:'📜',scene:null,color:0x06b6d4},
      {label:'SHOP',icon:'🏪',scene:null,color:0xec4899},{label:'LEADERBOARD',icon:'🏆',scene:null,color:0xffd700}
    ];
    const cols=4, rows=2, gapX=12, gapY=12, padX=20;
    const btnW=(width-padX*2-gapX*(cols-1))/cols, btnH=Math.min(80,(height*0.22-gapY)/rows);
    buttons.forEach((b,i)=>{const col=i%cols,row=Math.floor(i/cols),x=padX+col*(btnW+gapX),y=menuY+row*(btnH+gapY);this.createMenuButton(x,y,btnW,btnH,b);});
  }

  createMenuButton(x,y,w,h,btn) {
    const container=this.add.container(x+w/2,y+h/2),bg=this.add.graphics();
    bg.fillStyle(0x1a0b2e,0.9); bg.fillRoundedRect(-w/2,-h/2,w,h,10); bg.lineStyle(2,btn.color,0.8); bg.strokeRoundedRect(-w/2,-h/2,w,h,10); container.add(bg);
    container.add(this.add.text(0,-h*0.15,btn.icon,{fontSize:'22px'}).setOrigin(0.5));
    container.add(this.add.text(0,h*0.22,btn.label,{fontFamily:'Trebuchet MS',fontSize:'11px',fontStyle:'bold',color:'#e0e0e0'}).setOrigin(0.5));
    const hitZone=this.add.rectangle(0,0,w,h,0x000000,0.001).setInteractive({useHandCursor:true}); container.add(hitZone);
    hitZone.on('pointerdown',()=>this.tweens.add({targets:container,scale:0.94,duration:80,yoyo:true}));
    hitZone.on('pointerup',()=>{if(btn.scene){this.cameras.main.flash(200,139,92,246);this.time.delayedCall(150,()=>this.scene.start(btn.scene));}else this.showToast(`${btn.label} - coming in future phase`);});
  }

  buildBottomBar(){const {width,height}=this.scale;this.add.text(width/2,height-20,'v0.1 • Phase 1 Prototype',{fontFamily:'Trebuchet MS',fontSize:'11px',color:'#6b5b95'}).setOrigin(0.5);}
  showToast(msg){const {width,height}=this.scale;const t=this.add.text(width/2,height-80,msg,{fontFamily:'Trebuchet MS',fontSize:'14px',color:'#ffffff',backgroundColor:'#8b5cf6',padding:{x:14,y:8}}).setOrigin(0.5).setAlpha(0);this.tweens.add({targets:t,alpha:1,y:height-90,duration:200,onComplete:()=>this.time.delayedCall(1200,()=>this.tweens.add({targets:t,alpha:0,y:height-80,duration:250,onComplete:()=>t.destroy()}))});}
}
