import Phaser from 'phaser';
import { Stickman } from '../entities/Stickman.js';
import { spawnDamageNumber, spawnHitEffect } from '../systems/DamageNumber.js';
import { loadPlayerData, addRewards } from '../../supabase/playerData.js';

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 700;
const GROUND_Y = 600;

export class BattleScene extends Phaser.Scene {
  constructor(){super('BattleScene');}

  create(){
    this.cameras.main.setBackgroundColor('#0a0510'); this.cameras.main.fadeIn(300,0,0,0);
    this.physics.world.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT); this.cameras.main.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);
    this.buildArena(); const pd=this.registry.get('playerData')||loadPlayerData();
    this.player=new Stickman(this,300,GROUND_Y-100,{isPlayer:true,color:0xffffff,accent:0x8b5cf6,maxHp:pd.maxHp,attack:pd.attack,defense:pd.defense,speed:pd.speed,jumpForce:pd.jumpForce,hpBarOffsetY:-70});
    this.enemy=new Stickman(this,1000,GROUND_Y-100,{isPlayer:false,color:0xef4444,accent:0xff8a3d,maxHp:80,attack:10,defense:2,speed:130,jumpForce:-540,hpBarOffsetY:-70});
    this.player.body.setCollideWorldBounds(true); this.enemy.body.setCollideWorldBounds(true);
    this.groundBody=this.add.rectangle(WORLD_WIDTH/2,GROUND_Y+50,WORLD_WIDTH,100,0x000000,0); this.physics.add.existing(this.groundBody,true);
    this.physics.add.collider(this.player,this.groundBody); this.physics.add.collider(this.enemy,this.groundBody); this.physics.add.collider(this.player,this.enemy);
    this.cameras.main.startFollow(this.player,true,0.1,0.1); this.cameras.main.setFollowOffset(0,100);
    this.comboCount=0;this.comboTimer=0;this.comboWindow=2;this.enemyAiTimer=0;this.enemyAttackCooldown=0;
    this.setupInput();this.scene.launch('UIScene',{battle:this});this.scene.bringToTop('UIScene');
    this.events.on('shutdown',()=>{this.input.keyboard.removeAllKeys();});
  }

  buildArena(){
    const bg=this.add.graphics();bg.fillGradientStyle(0x1a0b2e,0x2d1b4e,0x0a0510,0x050308,1);bg.fillRect(0,0,WORLD_WIDTH,WORLD_HEIGHT);
    for(let i=0;i<6;i++){const x=150+i*260,torch=this.add.circle(x,300,6,0xff8a3d,0.9),glow=this.add.circle(x,300,40,0xff8a3d,0.12);this.tweens.add({targets:[torch,glow],alpha:{from:0.4,to:1},duration:500+Math.random()*400,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
    const ground=this.add.graphics();ground.fillStyle(0x0a0510,1);ground.fillRect(0,GROUND_Y,WORLD_WIDTH,WORLD_HEIGHT-GROUND_Y);ground.lineStyle(3,0x8b5cf6,0.6);ground.beginPath();ground.moveTo(0,GROUND_Y);ground.lineTo(WORLD_WIDTH,GROUND_Y);ground.strokePath();
    for(let i=0;i<40;i++){const x=i*40;ground.lineStyle(1,0x8b5cf6,0.15);ground.beginPath();ground.moveTo(x,GROUND_Y+5);ground.lineTo(x,GROUND_Y+30);ground.strokePath();}
    for(let i=0;i<4;i++){const x=100+i*450,p=this.add.graphics();p.fillStyle(0x1a0b2e,0.9);p.fillRect(x,GROUND_Y-300,60,300);p.lineStyle(2,0x8b5cf6,0.4);p.strokeRect(x,GROUND_Y-300,60,300);}
  }

  setupInput(){
    this.cursors=this.input.keyboard.createCursorKeys();this.keyA=this.input.keyboard.addKey('A');this.keyD=this.input.keyboard.addKey('D');this.keyJ=this.input.keyboard.addKey('J');this.keySpace=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);this.keyESC=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);this.input.keyboard.addCapture('SPACE');
  }

  triggerPlayerAttack(){if(!this.player||this.player.isDead)return;const result=this.player.attack(this.enemy);if(result.hit)this.registerHit(result);}
  registerHit(result){const t=result.target;spawnDamageNumber(this,t.x,t.y-60,result.damage,{crit:result.damage>=15});spawnHitEffect(this,t.x+(this.player.facing*-10),t.y-20,0xffd700);this.comboCount+=1;this.comboTimer=this.comboWindow;this.cameras.main.shake(80,0.004);if(t.isDead)this.onEnemyDefeated();}
  onEnemyDefeated(){const data=addRewards({gold:50,exp:25,win:true});this.registry.set('playerData',data);this.time.delayedCall(900,()=>{this.scene.stop('UIScene');this.scene.start('GameOverScene',{win:true,reward:{gold:50,exp:25}});});}
  onPlayerDefeated(){const data=addRewards({loss:true});this.registry.set('playerData',data);this.time.delayedCall(900,()=>{this.scene.stop('UIScene');this.scene.start('GameOverScene',{win:false});});}

  updateEnemyAI(time,delta){
    if(this.enemy.isDead||this.player.isDead){this.enemy.stop();return;}
    const dt=delta/1000;this.enemyAttackCooldown-=dt;this.enemyAiTimer-=dt;const dx=this.player.x-this.enemy.x,dist=Math.abs(dx);
    if(dist>70){if(dx<0)this.enemy.moveLeft();else this.enemy.moveRight();}
    else{this.enemy.stop();if(this.enemyAttackCooldown<=0){this.enemyAttackCooldown=1.2+Math.random()*0.6;this.enemy.facing=Math.sign(dx)||1;this.enemy.drawStickman(0);const result=this.enemy.attack(this.player);if(result.hit){spawnDamageNumber(this,this.player.x,this.player.y-60,result.damage,{playerHit:true});spawnHitEffect(this,this.player.x,this.player.y-20,0xff4444);this.cameras.main.shake(120,0.008);this.comboCount=0;if(this.player.isDead)this.onPlayerDefeated();}}}
    if(this.enemyAiTimer<=0){this.enemyAiTimer=2+Math.random()*3;if(Math.random()<0.3)this.enemy.jump();}
  }

  updateCombo(delta){if(this.comboCount>0){this.comboTimer-=delta/1000;if(this.comboTimer<=0)this.comboCount=0;}}
  update(time,delta){
    if(!this.player||!this.enemy)return;this.player.update(time,delta);this.enemy.update(time,delta);
    if(!this.player.isDead){const left=this.cursors.left.isDown||this.keyA.isDown,right=this.cursors.right.isDown||this.keyD.isDown;if(left&&!right)this.player.moveLeft();else if(right&&!left)this.player.moveRight();else this.player.stop();if(Phaser.Input.Keyboard.JustDown(this.keySpace))this.player.jump();if(Phaser.Input.Keyboard.JustDown(this.keyJ))this.triggerPlayerAttack();}
    if(Phaser.Input.Keyboard.JustDown(this.keyESC)){this.scene.stop('UIScene');this.scene.start('MenuScene');return;}this.updateEnemyAI(time,delta);this.updateCombo(delta);
  }
}