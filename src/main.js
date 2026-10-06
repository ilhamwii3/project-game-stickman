import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene.js';
import { MenuScene } from './game/scenes/MenuScene.js';
import { BattleScene } from './game/scenes/BattleScene.js';
import { UIScene } from './game/scenes/UIScene.js';
import { GameOverScene } from './game/scenes/GameOverScene.js';
import { loadPlayerData } from './supabase/playerData.js';

const playerData = loadPlayerData();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0a0510',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1400 },
      debug: false
    }
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true
  },
  scene: [BootScene, MenuScene, BattleScene, UIScene, GameOverScene]
};

const game = new Phaser.Game(config);
game.registry.set('playerData', playerData);

window.addEventListener('load', () => {
  setTimeout(() => {
    const el = document.getElementById('loading-screen');
    if (el) el.classList.add('hidden');
  }, 800);
});
