export class Boss {
  constructor() {
    this.maxHP = 5;
    this.hp = 5;
    this.isAlive = true;
    this.hasFled = false;
    this.currentMove = "neutral";
    this.isDefeated = false;
  }

  takeDamage(amount) {
    if (!this.isAlive) return;

    this.hp -= amount;

    if (this.hp <= 0) {
      this.enterDefeatStance();
    }
  }

  enterDefeatStance() {
    this.isDefeated = true;
    this.currentMove = "handsUp";
    console.log("🤖 Robot lifts hands in surrender.");
  }

  collapse() {
    this.isAlive = false;
    console.log("☠️ Robot collapses.");
  }

  flee() {
    this.isAlive = false;
    this.hasFled = true;
    this.currentMove = "cry";
    console.log("😭 Robot cries and runs away.");
  }

  setMove(move) {
    this.currentMove = move;
  }
}
