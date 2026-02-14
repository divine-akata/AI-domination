export class BossAI {
  constructor(boss) {
    this.boss = boss;
    this.isRaining = false;
  }

  chooseMove() {
    if (!this.boss.isAlive) return;

    // If HP low, chance to panic
    if (this.boss.hp <= 2 && Math.random() < 0.3) {
      this.boss.flee();
      return;
    }

    // Otherwise choose between neutral and power shoot
    const rand = Math.random();

    if (rand < 0.5) {
      this.boss.setMove("neutral");
    } else {
      this.boss.setMove("powerShoot");
    }

    console.log("Boss move:", this.boss.currentMove);
  }

  maybeStartRain() {
    if (this.isRaining || !this.boss.isAlive) return;

    const rainChance = 0.2; // 20% chance per turn

    if (Math.random() < rainChance) {
      this.isRaining = true;
      console.log("🌧 It starts raining!");
      this.boss.die(); // immediate short-circuit
    }
  }
}
