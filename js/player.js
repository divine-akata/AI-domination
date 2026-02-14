// ----------------------
// Constants
// ----------------------
const SILLY_HIT_MESSAGES = [
  "Oof!",
  "Ouch!",
  "Not the face!",
  "That tickles!",
  "Rude!",
  "Hey!",
  "Ow ow ow!",
  "Seriously?!"
];

const SILLY_DODGE_MESSAGES = [
  "Swoosh! 💨",
  "Miss me! 😎",
  "Too slow!",
  "Nope! ✋",
  "Matrix dodge! 🕶️"
];

const SILLY_ATTACK_MESSAGES = [
  "BONK! 👊",
  "POW! 💥",
  "Take that! 🥊",
  "WHAM! ⚡",
  "KAPOW! 💢"
];

// ----------------------
// Player Class
// ----------------------
export class Player {
  constructor() {
    this.maxHits = 5;
    this.hitsRemaining = 5;
    this.isDodging = false;
    this.lastAction = null;
  }

  attack() {
    this.isDodging = false;
    this.lastAction = "attack";
    
    const randomMsg = SILLY_ATTACK_MESSAGES[
      Math.floor(Math.random() * SILLY_ATTACK_MESSAGES.length)
    ];
    
    return { 
      type: "attack", 
      damage: 1, // One hit
      sillyText: randomMsg,
      effects: { shake: 0.3, flash: "red" }
    };
  }

  dodge() {
    this.isDodging = true;
    this.lastAction = "dodge";
    
    const randomMsg = SILLY_DODGE_MESSAGES[
      Math.floor(Math.random() * SILLY_DODGE_MESSAGES.length)
    ];
    
    return { 
      type: "dodge",
      sillyText: randomMsg,
      effects: { dash: true, invulnFrames: 10 }
    };
  }

  wait() {
    this.isDodging = false;
    this.lastAction = "wait";
    
    return { 
      type: "wait",
      sillyText: "...waiting... ⏰"
    };
  }

  takeDamage(amount = 1) {
    if (this.isDodging) {
      this.isDodging = false;
      
      const randomMsg = SILLY_DODGE_MESSAGES[
        Math.floor(Math.random() * SILLY_DODGE_MESSAGES.length)
      ];
      
      return { 
        blocked: true, 
        damage: 0,
        hitsRemaining: this.hitsRemaining,
        sillyText: randomMsg,
        effects: { dodgeSuccess: true }
      };
    }
    
    const actualDamage = Math.min(amount, this.hitsRemaining);
    this.hitsRemaining = Math.max(0, this.hitsRemaining - amount);
    
    const randomMsg = SILLY_HIT_MESSAGES[
      Math.floor(Math.random() * SILLY_HIT_MESSAGES.length)
    ];
    
    return { 
      blocked: false, 
      damage: actualDamage,
      hitsRemaining: this.hitsRemaining,
      sillyText: `${randomMsg} (${this.hitsRemaining}/5 ❤️)`,
      effects: { hurt: true, flash: "white" }
    };
  }

  isAlive() {
    return this.hitsRemaining > 0;
  }

  getStatus() {
    return {
      hitsRemaining: this.hitsRemaining,
      maxHits: this.maxHits,
      healthPercent: (this.hitsRemaining / this.maxHits) * 100,
      isDodging: this.isDodging,
      lastAction: this.lastAction
    };
  }

  reset() {
    this.hitsRemaining = this.maxHits;
    this.isDodging = false;
    this.lastAction = null;
  }
}