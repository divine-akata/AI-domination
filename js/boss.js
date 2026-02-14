export class Boss {
  constructor() {
    this.maxHP = 5;
    this.hp = 5;
    this.isAlive = true;
    this.hasFled = false;
    this.currentMove = "neutral";
  }

    takeDamage(amount) {
  if (!this.isAlive) return;

  this.hp -= amount;

  if (this.hp <= 0) {
    this.die();
  } else {
    this.currentMove = "cry";
  }
}

  die() {
    this.isAlive = false;
    this.currentMove = "dead";
  }

  flee() {
    this.isAlive = false;
    this.hasFled = true;
    this.currentMove = "flee"; // cry + turn animation
  }

  setMove(move) {
    this.currentMove = move;
  }
}
