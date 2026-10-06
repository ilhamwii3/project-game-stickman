import Phaser from 'phaser';

export function spawnDamageNumber(scene, x, y, amount, opts = {}) {
  const isCrit = opts.crit ?? false;
  const isPlayerDamage = opts.playerHit ?? false;
  const color = isPlayerDamage ? '#ff4444' : (isCrit ? '#ffd700' : '#ffffff');
  const size = isCrit ? 30 : 22;

  const text = scene.add.text(x, y, `${amount}`, {
    fontFamily: 'Trebuchet MS, sans-serif',
    fontSize: `${size}px`,
    fontStyle: 'bold',
    color,
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(1000);

  const offsetX = Phaser.Math.Between(-25, 25);
  const offsetY = isPlayerDamage ? 40 : -60;

  scene.tweens.add({
    targets: text,
    x: x + offsetX,
    y: y + offsetY,
    alpha: 0,
    scale: isCrit ? { from: 0.4, to: 1.3 } : { from: 0.6, to: 1 },
    duration: 750,
    ease: 'Cubic.easeOut',
    onComplete: () => text.destroy()
  });
}

export function spawnHitEffect(scene, x, y, color = 0xffffff) {
  for (let i = 0; i < 6; i++) {
    const p = scene.add.circle(x, y, 2 + Math.random() * 3, color, 1).setDepth(999);
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 40;
    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      scale: 0.2,
      duration: 350 + Math.random() * 200,
      ease: 'Cubic.easeOut',
      onComplete: () => p.destroy()
    });
  }
}