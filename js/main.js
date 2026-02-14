import { Player } from "./player.js";
import { setupInput } from "./input.js";
import * as ai from "./ai.js";
import * as boss from "./boss.js";
import * as render from "./render.js";

let player;
let state;

// ----------------------
// Constants
// ----------------------
const INITIAL_BOSS_HITS = 5;
const TURN = {
  PLAYER: "player",
  BOSS: "boss"
};

// Rain timing constants (in milliseconds)
const RAIN_MIN_INTERVAL = 10000; // 10 seconds
const RAIN_MAX_INTERVAL = 20000; // 20 seconds
const RAIN_DURATION = 5000; // 5 seconds

let rainTimer = null;
let rainStopTimer = null;

// ----------------------
// State Initialization
// ----------------------
function initGame() {
  player = new Player();

  state = {
    playerHits: player.hitsRemaining,
    bossHits: INITIAL_BOSS_HITS,
    turn: TURN.PLAYER,
    isGameOver: false,
    winner: null,
    lastAction: null,
    isRaining: false,
    currentRain: null,
    combatLog: ["FIGHT!"] // Store silly messages
  };
  scheduleNextRain();

  render.draw(state);
}

initGame();

//-----------------------
// RAIN SYSTEM
//-----------------------
function scheduleNextRain() {
  if (rainTimer) clearTimeout(rainTimer);
  const delay = Math.random() * (RAIN_MAX_INTERVAL - RAIN_MIN_INTERVAL) + RAIN_MIN_INTERVAL;

  rainTimer = setTimeout(() => {
    startRain();
  }, delay);
}

function startRain() {
  if (state.isGameOver) return;
  
  state.isRaining = true; // Fixed: was state.isRaining() = true
  addToCombatLog("☁️ It's starting to rain!");
  
  render.startRainEffect(); // You'll need this in render.js
  
  rainStopTimer = setTimeout(() => {
    stopRain();
  }, RAIN_DURATION);
}

function stopRain() {
  if (!state.isRaining) return;
  addToCombatLog("Rain stops! ☀️");
  state.isRaining = false;
  state.currentRain = null;
  
  render.stopRainEffect();

  scheduleNextRain();
}

function applyRainEffects(action, isPlayer) {
  if (!state.isRaining) return action;
  
  if (action.type === "dodge" && isPlayer && Math.random() < 0.3) {
    action.dodgeFailed = true;
    action.sillyText = "Oops! Slipped in the rain! 💦";
  }
  
  if (action.type === "attack" && !isPlayer && Math.random() < 0.3) {
    action.damage = 0;
    action.sillyText = "Robot short-circuits in rain! ⚡💧";
  }
  
  return action;
}

// ----------------------
// CORE GAME API
// ----------------------
export function handlePlayerAction(actionName, unlockInput) {
  if (state.isGameOver || state.turn !== TURN.PLAYER) {
    unlockInput?.();
    return;
  }

  let action = executePlayerAction(actionName);
  if (!action) {
    unlockInput?.();
    return;
  }

  // Applying rain effects to player's action
  action = applyRainEffects(action, true);

  if (action.dodgeFailed) {
    player.isDodging = false;
    addToCombatLog(action.sillyText);
  } else {
    state.lastAction = action.type; // Fixed: was action,type (comma instead of dot)
    ai.observePlayerAction(action.type);
    applyPlayerAction(action);
  }

  if (checkGameOver()) {
    stopRainSystem();
    syncState();
    render.draw(state);
    unlockInput?.();
    return;
  }

  state.turn = TURN.BOSS;
  runBossTurn();

  syncState();
  render.draw(state);
  unlockInput?.();
}

export function getGameState() {
  return { ...state };
}

// Removed duplicate resetGame function
export function resetGame() {
  stopRainSystem();
  initGame();
}

// Export combat log for rendering
export function getCombatLog() {
  return state.combatLog;
}

// Export player status for UI
export function getPlayerStatus() {
  return player.getStatus();
}

export function getRainState() {
  return {
    isRaining: state.isRaining,
    currentRain: state.currentRain
  };
}

// ----------------------
// INTERNAL GAME LOGIC
// ----------------------
function executePlayerAction(actionName) {
  const actions = {
    attack: () => player.attack(),
    dodge: () => player.dodge(),
    wait: () => player.wait()
  };

  return actions[actionName]?.();
}

function applyPlayerAction(action) {
  // Add player action to combat log
  addToCombatLog(`You: ${action.sillyText}`);

  if (action.type === "attack") {
    state.bossHits = Math.max(0, state.bossHits - action.damage);
  }
}

function runBossTurn() {
  let bossAction = boss.chooseAction(state.bossHits);

  // Apply rain effects to boss action
  bossAction = applyRainEffects(bossAction, false);

  // Add boss action to combat log
  addToCombatLog(`Boss: ${bossAction.sillyText}`);

  if (bossAction.type === "attack" && bossAction.damage > 0) {
    const result = player.takeDamage(bossAction.damage);
    
    // Show the result message
    addToCombatLog(result.sillyText);
  }

  if (!checkGameOver()) {
    state.turn = TURN.PLAYER;
  }
}

function stopRainSystem() {
  if (rainTimer) clearTimeout(rainTimer);
  if (rainStopTimer) clearTimeout(rainStopTimer);
  state.isRaining = false;
}

function checkGameOver() {
  if (!player.isAlive()) {
    state.isGameOver = true;
    state.winner = TURN.BOSS;
    addToCombatLog("💀 YOU DIED! The robot wins!");
    return true;
  }

  if (state.bossHits <= 0) {
    state.isGameOver = true;
    state.winner = TURN.PLAYER;
    addToCombatLog("🎉 VICTORY! Robot.exe has stopped working!");
    return true;
  }

  return false;
}

function syncState() {
  state.playerHits = Math.max(0, player.hitsRemaining);
  state.bossHits = Math.max(0, state.bossHits);
}

function addToCombatLog(message) {
  state.combatLog.push(message);
  
  // Keep only last 6 messages (including "FIGHT!")
  if (state.combatLog.length > 6) {
    state.combatLog.shift();
  }
}

// ----------------------
// INPUT WIRING
// ----------------------
setupInput(handlePlayerAction);