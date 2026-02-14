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
    combatLog: ["FIGHT!"] // Store silly messages
  };
  scheduleNextRain();

  render.draw(state);
}

initGame();
//-----------------------
// RAIN SYSTEM
//-----------------------
function startRain(){
 state.isRaining() = true;
 rainStopTimer = setTimeout(() => {
  stopRain();
 }, RAIN_DURATION);
}

// ----------------------
// CORE GAME API
// ----------------------
export function handlePlayerAction(actionName, unlockInput) {
  if (state.isGameOver || state.turn !== TURN.PLAYER) {
    unlockInput?.();
    return;
  }

  const action = executePlayerAction(actionName);
  if (!action) {
    unlockInput?.();
    return;
  }

  state.lastAction = action.type;
  ai.observePlayerAction(action.type);

  applyPlayerAction(action);
  
  if (checkGameOver()) {
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

export function resetGame() {
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
  const bossAction = boss.chooseAction(state.bossHits);

  // Add boss action to combat log
  addToCombatLog(`Boss: ${bossAction.sillyText}`);

  if (bossAction.type === "attack") {
    const result = player.takeDamage(bossAction.damage);
    
    // If dodge was successful, show the dodge message
    if (result.blocked) {
      addToCombatLog(result.sillyText);
    } else {
      addToCombatLog(result.sillyText);
    }
  }

  if (!checkGameOver()) {
    state.turn = TURN.PLAYER;
  }
}

function checkGameOver() {
  if (!player.isAlive()) {
    state.isGameOver = true;
    state.winner = TURN.BOSS;
    addToCombatLog("YOU DIED! The robot wins! ");
    return true;
  }

  if (state.bossHits <= 0) {
    state.isGameOver = true;
    state.winner = TURN.PLAYER;
    addToCombatLog(" VICTORY! Robot.exe has stopped working! ");
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
