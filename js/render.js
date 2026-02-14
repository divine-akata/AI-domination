// render.js - Skeleton for rendering the game

// ----------------------
// DOM Elements (you'll need to add these to your HTML)
// ----------------------
let canvas; // or whatever container you're using
let playerElement;
let bossElement;
let combatLogElement;
let playerHealthElement;
let bossHealthElement;
let rainEffectElement;

// ----------------------
// Initialize (call this when DOM is ready)
// ----------------------
export function init() {
  // TODO: Get your DOM elements here
  // canvas = document.getElementById('game-canvas');
  // playerElement = document.getElementById('player');
  // bossElement = document.getElementById('boss');
  // combatLogElement = document.getElementById('combat-log');
  // etc.
}

// ----------------------
// Main Draw Function
// ----------------------
export function draw(state) {
  // This is called every turn to update the UI
  // state contains:
  // - state.playerHits (number 0-5)
  // - state.bossHits (number 0-5)
  // - state.turn ("player" or "boss")
  // - state.isGameOver (boolean)
  // - state.winner ("player" or "boss" or null)
  // - state.isRaining (boolean)
  // - state.combatLog (array of strings)
  
  drawPlayerHealth(state.playerHits);
  drawBossHealth(state.bossHits);
  drawCombatLog(state.combatLog);
  
  if (state.isGameOver) {
    drawGameOver(state.winner);
  }
  
  if (state.isRaining) {
    // Rain effect should already be showing from startRainEffect()
  }
}

// ----------------------
// Health Bar Rendering
// ----------------------
function drawPlayerHealth(hits) {
  // TODO: Update player health display
  // hits is a number from 0-5
  console.log('Player health:', hits);
}

function drawBossHealth(hits) {
  // TODO: Update boss health display
  // hits is a number from 0-5
  console.log('Boss health:', hits);
}

// ----------------------
// Combat Log Rendering
// ----------------------
function drawCombatLog(log) {
  // TODO: Display the combat log messages
  // log is an array of strings (max 6 messages)
  // Example: ["FIGHT!", "You: BONK! 👊", "Boss: Beep boop! 🤖"]
  console.log('Combat log:', log);
}

// ----------------------
// Rain Effects
// ----------------------
export function startRainEffect() {
  // TODO: Show rain animation/effect
  // This is called when rain starts
  console.log('☁️ Rain starting!');
  
  // Example ideas:
  // - Add a CSS class for rain animation
  // - Show rain particles
  // - Darken the background
  // - Play rain sound
}

export function stopRainEffect() {
  // TODO: Hide rain animation/effect
  // This is called when rain stops
  console.log('☀️ Rain stopping!');
  
  // Example ideas:
  // - Remove rain CSS class
  // - Clear rain particles
  // - Restore normal background
  // - Stop rain sound
}

// ----------------------
// Game Over Screen
// ----------------------
function drawGameOver(winner) {
  // TODO: Show game over screen
  // winner is either "player" or "boss"
  console.log('Game over! Winner:', winner);
  
  // Example ideas:
  // - Show victory/defeat message
  // - Show restart button
  // - Play victory/defeat sound
  // - Animate the winner
}

// ----------------------
// Optional: Visual Effects for Actions
// ----------------------
export function playAttackEffect(isPlayer) {
  // TODO: Optional - show attack animation
  // isPlayer is true if player attacked, false if boss attacked
  console.log('Attack effect!', isPlayer ? 'player' : 'boss');
}

export function playDodgeEffect() {
  // TODO: Optional - show dodge animation
  console.log('Dodge effect!');
}

export function playHitEffect(isPlayer) {
  // TODO: Optional - show hit/damage animation
  // isPlayer is true if player was hit, false if boss was hit
  console.log('Hit effect!', isPlayer ? 'player' : 'boss');
}

// ----------------------
// Call init when ready
// ----------------------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}