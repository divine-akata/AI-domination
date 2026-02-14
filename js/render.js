// render.js - Updated to work with main.js
// Handles rendering game state, rain effects, and animations.

let playerEl;
let robotEl;
let rainEl;
let weatherEl;
let rHpEl;
let logEl;

// Rain collision system
let rainAnimationId = null; // Use RAF for smoother performance
let rainDrops = [];
const MAX_RAIN_DROPS = 50; // Limit to prevent performance issues
let bossPosition = { x: 0, y: 0, width: 0, height: 0 };
let bossHitByRain = false;

// Sprite maps
const playerSprites = {
  stand: "assets/sprites/player/player-stand.png",
  hit: "assets/sprites/player/player-swordhit.png",
};

const robotSprites = {
  stand: "assets/sprites/robot/robot-stand.png",
  crying: "assets/sprites/robot/robot-crying.png",
  dead: "assets/sprites/robot/robot-dead.png",
  run: "assets/sprites/robot/robot-runsaway.png",
};

// ----------------------
// Initialize
// ----------------------
/**
 * Initializes DOM elements and boss position.
 */
export function init() {
  try {
    playerEl = document.getElementById("player");
    robotEl = document.getElementById("robot");
    rainEl = document.getElementById("rain");
    weatherEl = document.getElementById("weather");
    rHpEl = document.getElementById("rHp");
    logEl = document.getElementById("log");
    
    updateBossPosition();
  } catch (error) {
    console.error("Error initializing render.js:", error);
  }
}

/**
 * Updates the boss's position for collision detection.
 */
function updateBossPosition() {
  if (!robotEl) return;
  try {
    const rect = robotEl.getBoundingClientRect();
    bossPosition = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  } catch (error) {
    console.error("Error updating boss position:", error);
  }
}

// ----------------------
// Main Draw Function (called from main.js)
// ----------------------
/**
 * Updates the UI based on the current game state.
 * @param {Object} state - The game state from main.js.
 */
export function draw(state) {
  try {
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
  } catch (error) {
    console.error("Error in draw():", error);
  }
}

// ----------------------
// Combat Log
// ----------------------
/**
 * Updates the combat log display.
 * @param {Array} log - Array of log messages.
 */
function drawCombatLog(log) {
  if (!logEl) return;
  try {
    logEl.textContent = log.join("\n");
    logEl.scrollTop = logEl.scrollHeight;
  } catch (error) {
    console.error("Error drawing combat log:", error);
  }
}

// ----------------------
// Rain System with Collision
// ----------------------
/**
 * Starts the rain effect, including overlay and collision simulation.
 */
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
  
  // Start collision detection with RAF for better performance
  const animateRain = () => {
    spawnRainParticles();
    updateRainParticles();
    checkRainCollision();
    rainAnimationId = requestAnimationFrame(animateRain);
  };
  animateRain();
}

/**
 * Spawns new rain particles, limited by MAX_RAIN_DROPS.
 */
function spawnRainParticles() {
  if (rainDrops.length >= MAX_RAIN_DROPS) return;
  for (let i = 0; i < 3; i++) {
    rainDrops.push({
      x: Math.random() * window.innerWidth,
      y: -10,
      speed: Math.random() * 5 + 3
    });
  }
}

/**
 * Updates rain particle positions and removes off-screen ones.
 */
function updateRainParticles() {
  rainDrops = rainDrops.filter(drop => {
    drop.y += drop.speed;
    return drop.y < window.innerHeight + 10;
  });
}

/**
 * Checks for collisions between rain drops and the boss.
 */
function checkRainCollision() {
  if (bossHitByRain) return;
  
  updateBossPosition(); // Update position
  
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

/**
 * Stops the rain effect and cleans up.
 */
export function stopRainEffect() {
  console.log('☀️ Rain stopping!');
  
  if (rainAnimationId) {
    cancelAnimationFrame(rainAnimationId);
    rainAnimationId = null;
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
/**
 * Checks if the boss has been hit by rain.
 * @returns {boolean} True if hit.
 */
export function checkBossRainCollision() {
  return bossHitByRain;
}

/**
 * Resets the rain collision flag.
 */
export function resetRainCollision() {
  bossHitByRain = false;
}

// ----------------------
// Player Actions (visual feedback)
// ----------------------
/**
 * Renders the player sprite.
 * @param {string} state - Sprite state (e.g., "stand").
 */
function renderPlayer(state) {
  if (!playerEl) return;
  playerEl.src = playerSprites[state] || playerSprites.stand;
}

/**
 * Renders the robot sprite.
 * @param {string} state - Sprite state (e.g., "stand").
 */
function renderRobot(state) {
  if (!robotEl) return;
  robotEl.src = robotSprites[state] || robotSprites.stand;
}

/**
 * Plays the attack animation for the player.
 */
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

/**
 * Plays the hit animation for the robot.
 */
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