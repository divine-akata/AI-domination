// ----------------------
// Constants
// ----------------------
const KEY_BINDINGS = {
  a: "attack",
  d: "dodge",
  w: "jump", // Changed from "wait" to "jump"
  r: "reset"
};

// ----------------------
// Input Setup
// ----------------------
export function setupInput(onAction, options = {}) {
  const {
    preventRepeat = true,
    caseSensitive = false
  } = options;

  let inputLocked = false;
  let lastKey = null;

  const unlockInput = () => {
    inputLocked = false;
  };

  const handleKeyPress = (e) => {
    // Prevent repeated keydown events when key is held
    if (preventRepeat && e.repeat) return;
    
    if (inputLocked) return;

    const key = caseSensitive ? e.key : e.key.toLowerCase();
    const action = KEY_BINDINGS[key];
    
    if (action) {
      e.preventDefault();
      inputLocked = true;
      lastKey = key;
      onAction(action, unlockInput);
    }
  };

  window.addEventListener("keydown", handleKeyPress);

  // Return cleanup and utility functions
  return {
    cleanup: () => window.removeEventListener("keydown", handleKeyPress),
    lock: () => { inputLocked = true; },
    unlock: unlockInput,
    isLocked: () => inputLocked,
    getLastKey: () => lastKey
  };
}