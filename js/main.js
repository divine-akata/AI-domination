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

let nextRainTimer = null; // Renamed for clarity
let rainStopTimer = null;

// ----------------------
// START SCREEN 
// ----------------------
let gameStarted = false;

/**
 * Sets up the start screen and play button event listener.
 */
function setupStartScreen() {
  const startScreen = document.getElementById('startScreen');
  const btnPlay = document.getElementById('btnPlay');

  console.log('Start screen:', startScreen); // DEBUG
  console.log('Play button:', btnPlay); // DEBUG

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      console.log('Play button clicked!'); // DEBUG
      
      // Add hidden class for fade-out
      startScreen.classList.add('hidden');
      
      // Remove from DOM and start game after animation
      setTimeout(() => {
        startScreen.classList.add('removed');
        if (!gameStarted) {
          gameStarted = true;
          console.log('Starting game...'); // DEBUG
          initGame(); // START THE GAME HERE
          setupInput(handlePlayerAction); // Setup input AFTER game starts
        }
      }, 500);
    });
  } else {
    console.error('Play button not found!'); // DEBUG
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupStartScreen);
} else {
  setupStartScreen();
}

// ----------------------
// STATE INITIALIZATION
// ----------------------

/**
 * Initializes the game state, player, and rain system.
 */
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

//-----------------------
// RAIN SYSTEM
//-----------------------

/**
 * Schedules the next rain event with a random delay.
 */
function scheduleNextRain() {
  if (nextRainTimer) clearTimeout(nextRainTimer);
  const delay = Math.random() * (RAIN_MAX_INTERVAL - RAIN_MIN_INTERVAL) + RAIN_MIN_INTERVAL;

  nextRainTimer = setTimeout(() => {
    startRain();
  }, delay);
}

/**
 * Starts a rain event, applying visual effects and scheduling its end.
 */
function startRain() {
  if (state.isGameOver) return;
  
  state.isRaining = true;
  addToCombatLog("Is it raining?");
  
  render.startRainEffect();
  
  rainStopTimer = setTimeout(() => {
    stopRain();
  }, RAIN_DURATION);
}

/**
 * Stops the current rain event and schedules the next one.
 */
function stopRain() {
  if (!state.isRaining) return;
  addToCombatLog("Rain stops!");
  state.isRaining = false;
  state.currentRain = null;
  
  render.stopRainEffect();

  scheduleNextRain();
}

/**
 * Applies rain effects to an action, potentially causing failures.
 * @param {Object} action - The action object.
 * @param {boolean} isPlayer - Whether the action is from the player.
 * @returns {Object} The modified action.
 */
function applyRainEffects(action, isPlayer) {
  if (!state.isRaining) return action;
  
  // Player dodge/jump can fail in rain
  if ((action.type === "dodge" || action.type === "jump") && isPlayer && Math.random() < 0.3) {
    action.dodgeFailed = true;
    action.sillyText = action.type === "dodge" ? "Oops! I just slipped" : "eewww, there's mud!";
  }
  
  // Boss attack can short-circuit in rain
  if (action.type === "attack" && !isPlayer && Math.random() < 0.3) {
    action.damage = 0;
    action.sillyText = "wha-a--att's-s ha-p--pen-i--";
  }
  
  return action;
}

// ----------------------
// CORE GAME API
// ----------------------

/**
 * Handles a player action, applies effects, and progresses the game.
 * @param {string} actionName - The name of the action (e.g., "attack").
 * @param {Function} unlockInput - Callback to unlock input after processing.
 */
export function handlePlayerAction(actionName, unlockInput) {
  try {
    // Handle reset separately
    if (actionName === "reset") {
      resetGame();
      unlockInput?.();
      return;
    }

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
      // Reset player state for failed dodge/jump
      if (action.type === "dodge") player.isDodging = false;
      // Assuming jump has a similar flag; adjust based on Player class
      addToCombatLog(action.sillyText);
    } else {
      state.lastAction = action.type;
      ai.observePlayerAction(action.type); // AI learns from player
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
  } catch (error) {
    console.error("Error in handlePlayerAction:", error);
  } finally {
    unlockInput?.();
  }
}

/**
 * Returns a copy of the current game state.
 * @returns {Object} The game state.
 */
export function getGameState() {
  return { ...state };
}

/**
 * Resets the game to its initial state.
 */
export function resetGame() {
  stopRainSystem();
  ai.reset(); // Reset AI learning
  initGame();
}

/**
 * Returns the current combat log.
 * @returns {Array} The combat log messages.
 */
export function getCombatLog() {
  return state.combatLog;
}

/**
 * Returns the player's current status.
 * @returns {Object} Player status.
 */
export function getPlayerStatus() {
  return player.getStatus();
}

/**
 * Returns the current rain state.
 * @returns {Object} Rain state.
 */
export function getRainState() {
  return {
    isRaining: state.isRaining,
    currentRain: state.currentRain
  };
}

/**
 * Returns AI stats for debugging/UI.
 * @returns {Object} AI stats.
 */
export function getAIStats() {
  return ai.getAIStats();
}

// ----------------------
// INTERNAL GAME LOGIC
// ----------------------

/**
 * Executes a player action based on the action name.
 * @param {string} actionName - The action name.
 * @returns {Object|null} The action object or null if invalid.
 */
function executePlayerAction(actionName) {
  const actions = {
    attack: () => player.attack(),
    dodge: () => player.dodge(),
    jump: () => player.jump()
  };

  return actions[actionName]?.();
}

/**
 * Applies the effects of a player action to the game state.
 * @param {Object} action - The action object.
 */
function applyPlayerAction(action) {
  // Add player action to combat log
  addToCombatLog(`You: ${action.sillyText}`);

  if (action.type === "attack") {
    state.bossHits = Math.max(0, state.bossHits - action.damage);
  }
}

/**
 * Runs the boss's turn, choosing and applying an action.
 */
function runBossTurn() {
  try {
    // Pass rain state to boss AI so it can flee
    let bossAction = boss.chooseAction(state.bossHits, state.isRaining);

    // Check if boss is fleeing from rain
    if (bossAction.fleeing) {
      addToCombatLog(`Boss: ${bossAction.sillyText}`);
      // Boss doesn't attack while fleeing, just skip turn
      if (!checkGameOver()) {
        state.turn = TURN.PLAYER;
      }
      return;
    }

    // Apply rain effects to boss action (short-circuit chance)
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
  } catch (error) {
    console.error("Error in runBossTurn:", error);
  }
}

/**
 * Stops the rain system and clears timers.
 */
function stopRainSystem() {
  if (nextRainTimer) clearTimeout(nextRainTimer);
  if (rainStopTimer) clearTimeout(rainStopTimer);
  state.isRaining = false;
}

/**
 * Checks if the game is over and updates state accordingly.
 * @returns {boolean} True if the game is over.
 */
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

/**
 * Syncs the state with the player's current hits.
 */
function syncState() {
  state.playerHits = Math.max(0, player.hitsRemaining);
  state.bossHits = Math.max(0, state.bossHits);
}

/**
 * Adds a message to the combat log, keeping only the last 6.
 * @param {string} message - The message to add.
 */
function addToCombatLog(message) {
  state.combatLog.push(message);
  
  // Keep only last 6 messages (including "FIGHT!")
  if (state.combatLog.length > 6) {
    state.combatLog.shift();
  }
}