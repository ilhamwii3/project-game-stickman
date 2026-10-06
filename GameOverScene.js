import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor(){super('GameOverScene');}
  init(data){this.win=data.win;this.reward=data.reward||null;}

  create(){
    const {width,height}=this.scale;const bg=this.add.graphics();bg.fillGradientStyle(0x1a0b2e,0x1a0b2e,0x0a0510,0x0a0510,1);bg.fillRect(0,0,width,height);
    this.cameras.main.fadeIn(300,0,0,0);const title=this.win?'VICTORY':'DEFEATED',titleColor=this.win?'#ffd700':'#ef4444';
    const t=this.add.text(width/2,height*0.32,title,{fontFamily:'Trebuchet MS',fontSize:'56px',fontStyle:'bold',color:titleColor,stroke:'#000000',strokeThickness:6}).setOrigin(0.5);t.setScale(0.2);this.tweens.add({targets:t,scale:1,duration:500,ease:'Back.easeOut'});
    if(this.win&&this.reward)this.add.text(width/2,height*0.45,`+${this.reward.gold} 🪙   +${this.reward.exp} EXP`,{fontFamily:'Trebuchet MS',fontSize:'22px',color:'#ffffff',stroke:'#000000',strokeThickness:4}).setOrigin(0.5);
    this.createButton(width/2,height*0.62,'PLAY AGAIN',0xef4444,()=>this.scene.start('BattleScene'));
    this.createButton(width/2,height*0.75,'MAIN MENU',0x8b5cf6,()=>this.scene.start('MenuScene'));
  }

  createButton(cx,cy,label,color,onClick){
    const w=240,h=60,container=this.add.container(cx,cy),bg=this.add.graphics();bg.fillStyle(0x1a0b2e,0.95);bg.fillRoundedRect(-w/2,-h/2,w,h,12);bg.lineStyle(2,color,1);bg.strokeRoundedRect(-w/2,-h/2,w,h,12);container.add(bg);
    const label2=this.add.text(0,0,label,{fontFamily:'Trebuchet MS',fontSize:'20px',fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5);container.add(label2);
    const hit=this.add.rectangle(0,0,w,h,0x000000,0.001).setInteractive({useHandCursor:true});container.add(hit);
    hit.on('pointerdown',()=>this.tweens.add({targets:container,scale:0.94,duration:80,yoyo:true}));hit.on('pointerup',onClick);return container;
  }
}