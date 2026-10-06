import Phaser from 'phaser';

export class Stickman extends Phaser.GameObjects.Container {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y);
    scene.add.existing(this);

    this.isPlayer = options.isPlayer ?? false;
    this.color = options.color ?? 0xffffff;
    this.accent = options.accent ?? 0x8b5cf6;
    this.facing = 1;

    this.maxHp = options.maxHp ?? 100;
    this.hp = this.maxHp;
    this.attackPower = options.attack ?? 10;
    this.defense = options.defense ?? 2;
    this.moveSpeed = options.speed ?? 200;
    this.jumpForce = options.jumpForce ?? -560;

    this.isAttacking = false;
    this.isHit = false;
    this.isDead = false;
    this.attackCooldown = 0;
    this.invulnTime = 0;
    this.hpBarOffsetY = options.hpBarOffsetY ?? -70;

    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    this.hpBarBg = scene.add.graphics();
    this.hpBarFill = scene.add.graphics();
    this.add(this.hpBarBg);
    this.add(this.hpBarFill);

    this.drawStickman(0);
    this.drawHpBar();

    scene.physics.world.enable(this);
    this.body.setSize(30, 70);
    this.body.setOffset(-15, -35);
    this.body.setCollideWorldBounds(true);
    this.body.setDragX(0);
  }

  drawStickman(t = 0) {
    const g = this.graphics;
    g.clear();

    const main = this.isHit ? 0xff4444 : this.color;
    const lineWidth = 4;

    g.lineStyle(lineWidth, main, 1);
    g.fillStyle(main, 1);

    g.strokeCircle(0, -40, 10);
    g.fillCircle(0, -40, 8);

    g.fillStyle(0x000000, 1);
    g.fillCircle(-3, -42, 1.6);
    g.fillCircle(3, -42, 1.6);

    g.lineStyle(lineWidth, main, 1);
    g.beginPath();
    g.moveTo(0, -30);
    g.lineTo(0, 5);
    g.strokePath();

    let armAngle = 0;
    if (this.isAttacking) armAngle = Math.sin(t * 0.03) * 0.9;

    g.beginPath();
    g.moveTo(0, -25);
    g.lineTo(-14, -12);
    g.strokePath();

    const armLen = 16;
    const ax = Math.cos(-0.6 + armAngle) * armLen;
    const ay = Math.sin(-0.6 + armAngle) * armLen;
    g.beginPath();
    g.moveTo(0, -25);
    g.lineTo(ax, -25 + ay);
    g.strokePath();

    g.beginPath();
    g.moveTo(0, 5);
    g.lineTo(-10, 30);
    g.strokePath();
    g.beginPath();
    g.moveTo(0, 5);
    g.lineTo(10, 30);
    g.strokePath();

    if (this.isPlayer) {
      const sx = ax;
      const sy = -25 + ay;
      g.lineStyle(3, 0xffffff, 1);
      g.beginPath();
      g.moveTo(sx, sy);
      g.lineTo(sx + 22, sy - 4);
      g.strokePath();
      g.lineStyle(2, this.accent, 1);
      g.beginPath();
      g.moveTo(sx + 22, sy - 4);
      g.lineTo(sx + 30, sy - 6);
      g.strokePath();
    }

    g.setScale(this.facing, 1);
  }

  drawHpBar() {
    const w = 44;
    const h = 5;
    const y = this.hpBarOffsetY;

    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x000000, 0.7);
    this.hpBarBg.fillRoundedRect(-w / 2 - 1, y - 1, w + 2, h + 2, 2);

    const pct = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    const color = this.isPlayer
      ? (pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xf59e0b : 0xef4444)
      : 0xef4444;

    this.hpBarFill.clear();
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRoundedRect(-w / 2, y, w * pct, h, 2);
    this.hpBarFill.setScale(this.facing, 1);
  }

  update(time, delta) {
    if (this.isDead) return;

    const dt = delta / 1000;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.invulnTime > 0) this.invulnTime -= dt;
    if (this.isHit && this.invulnTime <= 0) this.isHit = false;

    if (this.isAttacking && this.attackCooldown < 0.28) {
      this.isAttacking = false;
    }

    this.drawStickman(time);
    this.drawHpBar();
  }

  moveLeft() {
    if (this.isDead) return;
    this.body.setVelocityX(-this.moveSpeed);
    if (this.facing !== -1) {
      this.facing = -1;
      this.drawStickman(0);
      this.drawHpBar();
    }
  }

  moveRight() {
    if (this.isDead) return;
    this.body.setVelocityX(this.moveSpeed);
    if (this.facing !== 1) {
      this.facing = 1;
      this.drawStickman(0);
      this.drawHpBar();
    }
  }

  stop() {
    if (this.isDead) return;
    this.body.setVelocityX(0);
  }

  jump() {
    if (this.isDead) return;
    if (this.body.blocked.down || this.body.touching.down) {
      this.body.setVelocityY(this.jumpForce);
    }
  }

  attack(target) {
    if (this.isDead || this.attackCooldown > 0) return false;
    this.isAttacking = true;
    this.attackCooldown = 0.4;

    this.body.setVelocityX(this.facing * 120);

    if (target && !target.isDead) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);
      const facingTarget = Math.sign(dx) === this.facing;
      if (dist < 80 && facingTarget) {
        const dmg = target.takeDamage(this.attackPower, this.facing);
        return { hit: true, damage: dmg, target };
      }
    }
    return { hit: false };
  }

  takeDamage(amount, fromDir = 1) {
    if (this.isDead || this.invulnTime > 0) return 0;
    const dmg = Math.max(1, Math.round(amount - this.defense * 0.5));
    this.hp = Math.max(0, this.hp - dmg);
    this.isHit = true;
    this.invulnTime = 0.5;

    this.body.setVelocityX(fromDir * 260);
    this.body.setVelocityY(-200);

    this.drawStickman(0);
    this.drawHpBar();

    if (this.hp <= 0) this.die();
    return dmg;
  }

  die() {
    this.isDead = true;
    this.isAttacking = false;
    this.body.setVelocity(0, 0);
    this.graphics.setAlpha(0.4);
    this.hpBarFill.clear();
  }

  respawn(x, y) {
    this.hp = this.maxHp;
    this.isDead = false;
    this.isHit = false;
    this.isAttacking = false;
    this.invulnTime = 1;
    this.attackCooldown = 0;
    this.graphics.setAlpha(1);
    this.setPosition(x, y);
    this.body.setVelocity(0, 0);
    this.drawStickman(0);
    this.drawHpBar();
  }
}
