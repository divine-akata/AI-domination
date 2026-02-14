import { Boss } from "./boss.js";
import { BossAI } from "./ai.js";
import { render } from "./render.js";

const boss = new Boss();
const ai = new BossAI(boss);

let gameOver = false;
let playerState = "neutral";

function playerAttack() {
  if (gameOver || !boss.isAlive) return;

  playerState = "attack";

  boss.takeDamage(1);

  ai.chooseMove();
  ai.maybeStartRain();

  checkGameOver();
  renderGame();
}

function checkGameOver() {
  if (boss.isDefeated && boss.isAlive) {
    setTimeout(() => {
      boss.collapse();
      gameOver = true;
      renderGame();
    }, 1000);
  }

  if (!boss.isAlive && !boss.isDefeated) {
    gameOver = true;
  }
}

function renderGame() {
  render({
    bossHP: boss.hp,
    bossAlive: boss.isAlive,
    bossMove: boss.currentMove,
    bossFled: boss.hasFled,
    isRaining: ai.isRaining,
    playerState: playerState
  });

  // Reset player stance after attack
  playerState = "neutral";
}

// ---------------- INPUT ----------------

document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    playerAttack();
  }
});

renderGame();
