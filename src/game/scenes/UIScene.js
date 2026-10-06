import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor(){super('UIScene');}
  init(data){this.battle=data.battle;}

  create(){
    this.input.addPointer(3);this.buildTopLeftHud();this.buildTopRightHud();this.buildTouchControls();
    this.scale.on('resize',this.handleResize,this);this.events.on('shutdown',()=>this.scale.off('resize',this.handleResize,this));
    this.lastHpWidth=-1;this.lastCombo=-1;
  }

  handleResize(){this.scene.restart({battle:this.battle});}

  buildTopLeftHud(){
    const pd=this.registry.get('playerData');this.hudContainer=this.add.container(0,0).setDepth(500);
    const panel=this.add.graphics();panel.fillStyle(0x1a0b2e,0.85);panel.fillRoundedRect(10,10,260,78,10);panel.lineStyle(2,0x8b5cf6,0.7);panel.strokeRoundedRect(10,10,260,78,10);this.hudContainer.add(panel);
    const av=this.add.graphics();av.fillStyle(0x2d1b4e,1);av.fillCircle(45,50,22);av.lineStyle(2,0xec4899,1);av.strokeCircle(45,50,22);av.fillStyle(0xffffff,1);av.fillCircle(45,46,6);av.fillRoundedRect(37,56,16,12,4);this.hudContainer.add(av);
    this.nameText=this.add.text(78,22,pd.username,{fontFamily:'Trebuchet MS',fontSize:'15px',fontStyle:'bold',color:'#ffffff'});this.hudContainer.add(this.nameText);
    this.lvText=this.add.text(78,40,`Lv. ${pd.level}`,{fontFamily:'Trebuchet MS',fontSize:'11px',color:'#a78bfa'});this.hudContainer.add(this.lvText);
    this.hpBarBg=this.add.graphics();this.hpBarBg.fillStyle(0x000000,0.7);this.hpBarBg.fillRoundedRect(78,54,180,10,5);this.hudContainer.add(this.hpBarBg);
    this.hpBarFill=this.add.graphics();this.hudContainer.add(this.hpBarFill);
    this.energyBg=this.add.graphics();this.energyBg.fillStyle(0x000000,0.7);this.energyBg.fillRoundedRect(78,68,180,8,4);this.hudContainer.add(this.energyBg);
    this.energyFill=this.add.graphics();this.energyFill.fillStyle(0x3b82f6,1);this.energyFill.fillRoundedRect(78,68,180,8,4);this.hudContainer.add(this.energyFill);
    this.hpBar={x:78,y:54,w:180,h:10};
  }

  buildTopRightHud(){
    const {width}=this.scale;this.topRight=this.add.container(0,0).setDepth(500);
    this.comboText=this.add.text(width-20,30,'',{fontFamily:'Trebuchet MS',fontSize:'26px',fontStyle:'bold',color:'#ffd700',stroke:'#000000',strokeThickness:4}).setOrigin(1,0);this.topRight.add(this.comboText);
    const pauseBg=this.add.circle(width-40,90,24,0x1a0b2e,0.9);pauseBg.setStrokeStyle(2,0x8b5cf6,0.8);pauseBg.setInteractive({useHandCursor:true});this.topRight.add(pauseBg);
    const pauseIcon=this.add.text(width-40,90,'❚❚',{fontFamily:'Trebuchet MS',fontSize:'16px',color:'#ffffff'}).setOrigin(0.5);this.topRight.add(pauseIcon);
    pauseBg.on('pointerup',()=>{this.scene.stop();this.battle.scene.stop();this.battle.scene.start('MenuScene');});
  }

  buildTouchControls(){
    const {width,height}=this.scale;this.controls=this.add.container(0,0).setDepth(500);const btnSize=68,bottomY=height-80,leftX=60,rightX=leftX+btnSize+14;
    this.createControlButton(leftX,bottomY,btnSize,'◀',()=>this.setMove('left',true),()=>this.setMove('left',false));
    this.createControlButton(rightX,bottomY,btnSize,'▶',()=>this.setMove('right',true),()=>this.setMove('right',false));
    this.createControlButton(width-160,bottomY-30,btnSize,'⤒',()=>this.doJump(),null,0x3b82f6);
    this.createControlButton(width-80,bottomY,84,'⚔',()=>this.doAttack(),null,0xef4444);
  }

  createControlButton(x,y,size,label,onDown,onUp,color=0x1a0b2e){
    const container=this.add.container(x,y),bg=this.add.circle(0,0,size/2,color,0.9);bg.setStrokeStyle(2,0xffffff,0.5);container.add(bg);
    const txt=this.add.text(0,0,label,{fontFamily:'Trebuchet MS',fontSize:`${Math.round(size*0.4)}px`,fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5);container.add(txt);
    bg.setInteractive({useHandCursor:true});bg.on('pointerdown',()=>{container.setScale(0.9);if(onDown)onDown();});
    const release=()=>{container.setScale(1);if(onUp)onUp();};bg.on('pointerup',release);bg.on('pointerout',release);bg.on('pointerupoutside',release);this.controls.add(container);return container;
  }

  setMove(dir,state){
    if(!this.battle||!this.battle.player)return;this.touchState=this.touchState||{left:false,right:false};this.touchState[dir]=state;const p=this.battle.player;if(p.isDead)return;
    if(this.touchState.left&&!this.touchState.right)p.moveLeft();else if(this.touchState.right&&!this.touchState.left)p.moveRight();else p.stop();
  }
  doJump(){if(!this.battle||!this.battle.player)return;this.battle.player.jump();}
  doAttack(){if(!this.battle)return;this.battle.triggerPlayerAttack();}

  updateHpBar(){
    const p=this.battle.player;if(!p)return;const pct=Math.max(0,p.hp/p.maxHp);if(pct===this.lastHpWidth)return;this.lastHpWidth=pct;
    const {x,y,w,h}=this.hpBar,color=pct>0.5?0x22c55e:pct>0.25?0xf59e0b:0xef4444;this.hpBarFill.clear();this.hpBarFill.fillStyle(color,1);this.hpBarFill.fillRoundedRect(x,y,w*pct,h,5);
  }

  updateCombo(){
    if(!this.battle)return;const c=this.battle.comboCount;if(c===this.lastCombo)return;this.lastCombo=c;
    if(c>=2){this.comboText.setText(`${c}x COMBO`);this.tweens.add({targets:this.comboText,scale:{from:1.3,to:1},duration:250,ease:'Back.easeOut'});}else this.comboText.setText('');
  }

  update(){this.updateHpBar();this.updateCombo();}
}
