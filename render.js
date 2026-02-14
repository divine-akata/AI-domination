// render.js - Updated to work with main.js

let playerEl;
let robotEl;
let rainEl;
let weatherEl;
let rHpEl;
let logEl;

// Rain collision system
let rainInterval = null;
let rainDrops = [];
let bossPosition = { x: 0, y: 0, width: 0, height: 0 };
let bossHitByRain = false;

// Sprite maps
const playerSprites = {
  stand: "player-stand.png",
  hit: "player-swordhit.png",
};

const robotSprites = {
  stand: "robot-stand.png",
  crying: "robot-crying.png",
  dead: "robot-dead.png",
  run: "robot-runsaway.png",
};

// ----------------------
// Initialize
// ----------------------
export function init() {
  playerEl = document.getElementById("player");
  robotEl = document.getElementById("robot");
  rainEl = document.getElementById("rain");
  weatherEl = document.getElementById("weather");
  rHpEl = document.getElementById("rHp");
  logEl = document.getElementById("log");
  
  updateBossPosition();
}

function updateBossPosition() {
  if (robotEl) {
    const rect = robotEl.getBoundingClientRect();
    bossPosition = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }
}

// ----------------------
// Main Draw Function (called from main.js)
// ----------------------
export function draw(state) {
  // Update health
  if (rHpEl) {
    rHpEl.textContent = state.bossHits;
  }
  
  // Update combat log
  drawCombatLog(state.combatLog);
  
  // Update boss position for collision
  updateBossPosition();
  
  // Handle game over
  if (state.isGameOver) {
    if (state.winner === "player") {
      renderRobot("dead");
    } else {
      // Player lost
      renderRobot("stand");
    }
  } else {
    // Normal gameplay
    if (state.bossHits <= 2) {
      renderRobot("crying");
    } else {
      renderRobot("stand");
    }
  }
}

// ----------------------
// Combat Log
// ----------------------
function drawCombatLog(log) {
  if (!logEl) return;
  logEl.textContent = log.join("\n");
  logEl.scrollTop = logEl.scrollHeight;
}

// ----------------------
// Rain System with Collision
// ----------------------
export function startRainEffect() {
  console.log('☁️ Rain starting!');
  
  if (!rainEl) return;
  
  bossHitByRain = false;
  rainDrops = [];
  
  // Show rain overlay
  rainEl.classList.add("on");
  
  if (weatherEl) {
    weatherEl.textContent = "🌧️ RAINING!";
  }
  
  // Start collision detection
  rainInterval = setInterval(() => {
    spawnRainParticles();
    updateRainParticles();
    checkRainCollision();
  }, 50);
}

function spawnRainParticles() {
  // Create virtual rain drops for collision
  for (let i = 0; i < 3; i++) {
    rainDrops.push({
      x: Math.random() * window.innerWidth,
      y: -10,
      speed: Math.random() * 5 + 3
    });
  }
}

function updateRainParticles() {
  rainDrops = rainDrops.filter(drop => {
    drop.y += drop.speed;
    return drop.y < window.innerHeight + 10;
  });
}

function checkRainCollision() {
  if (bossHitByRain) return;
  
  updateBossPosition(); // Update every frame
  
  for (let drop of rainDrops) {
    if (drop.x >= bossPosition.x && 
        drop.x <= bossPosition.x + bossPosition.width &&
        drop.y >= bossPosition.y && 
        drop.y <= bossPosition.y + bossPosition.height) {
      
      bossHitByRain = true;
      console.log('💧 Boss hit by rain!');
      
      // Visual feedback
      if (robotEl) {
        robotEl.classList.add("robot-hit");
        setTimeout(() => robotEl.classList.remove("robot-hit"), 220);
      }
      break;
    }
  }
}

export function stopRainEffect() {
  console.log('☀️ Rain stopping!');
  
  if (rainInterval) {
    clearInterval(rainInterval);
    rainInterval = null;
  }
  
  if (rainEl) {
    rainEl.classList.remove("on");
  }
  
  if (weatherEl) {
    weatherEl.textContent = "Clear";
  }
  
  rainDrops = [];
  bossHitByRain = false;
}

// ----------------------
// Collision Check (for boss.js)
// ----------------------
export function checkBossRainCollision() {
  return bossHitByRain;
}

export function resetRainCollision() {
  bossHitByRain = false;
}

// ----------------------
// Player Actions (visual feedback)
// ----------------------
function renderPlayer(state) {
  if (!playerEl) return;
  playerEl.src = playerSprites[state] || playerSprites.stand;
}

function renderRobot(state) {
  if (!robotEl) return;
  robotEl.src = robotSprites[state] || robotSprites.stand;
}

// Trigger animations based on actions
export function playAttackEffect() {
  renderPlayer("hit");
  if (playerEl) {
    playerEl.classList.add("player-hit");
    setTimeout(() => {
      playerEl.classList.remove("player-hit");
      renderPlayer("stand");
    }, 220);
  }
}

export function playHitEffect() {
  if (robotEl) {
    robotEl.classList.add("robot-hit");
    setTimeout(() => robotEl.classList.remove("robot-hit"), 220);
  }
}

// ----------------------
// Auto-init
// ----------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}