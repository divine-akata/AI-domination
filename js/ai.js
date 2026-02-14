export class BossAI {
  constructor(boss) {
    this.boss = boss;

    this.learningRate = 0.2;
    this.epsilon = 0.2;

    this.isRaining = false;

    const savedValues = localStorage.getItem("bossAI");

    this.actionValues = savedValues
      ? JSON.parse(savedValues)
      : {
          attack: 0,
          counter: 0,
          cry: 0,
          flee: 0
        };
  }

  chooseAction() {
    if (Math.random() < this.epsilon) {
      return this.randomAction();
    }

    return Object.keys(this.actionValues).reduce((a, b) =>
      this.actionValues[a] > this.actionValues[b] ? a : b
    );
  }

  randomAction() {
    const actions = Object.keys(this.actionValues);
    return actions[Math.floor(Math.random() * actions.length)];
  }

  takeTurn() {
    if (!this.boss.isAlive) return null;

    if (!this.isRaining && Math.random() < 0.1) {
      this.isRaining = true;
      this.boss.die();
      return null;
    }

    const action = this.chooseAction();

    if (action === "attack") {
      this.boss.setMove("attack");
    }

    if (action === "counter") {
      this.boss.setMove("counter");
    }

    if (action === "cry") {
      this.boss.setMove("cry");
    }

    if (action === "flee") {
      this.boss.flee();
    }

    return action;
  }

  updateLearning(action, reward) {
    if (!action) return;

    this.actionValues[action] +=
      this.learningRate * reward;

    localStorage.setItem(
      "bossAI",
      JSON.stringify(this.actionValues)
    );

    console.log("Updated action values:", this.actionValues);
  }
}
