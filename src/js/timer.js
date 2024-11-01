// Event emitter for window events
class TimerEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

/**
 * A robust timer class for handling countdown functionality.
 */
export default class Timer extends TimerEventEmitter {
    /**
     * @type {number|null} - Timer interval ID
     * @private
     */
    #intervalId = null;
  
    /**
     * @type {number|null} - Start timestamp
     * @private
     */
    #startTime = null;
  
    /**
     * @type {number|null} - End timestamp
     * @private
     */
    #endTime = null;
  
    /**
     * @type {number} - Duration in milliseconds
     * @private
     */
    #duration = 0;
  
    /**
     * @type {number} - Initial duration in milliseconds (for reset)
     * @private
     */
    #initialDuration = 0;
  
    /**
     * @type {boolean} - Pause state
     * @private
     */
    #isPaused = false;
  
    /**
     * @type {Function|null} - Callback for timer completion
     * @private
     */
    #onComplete = null;
  
    /**
     * @type {Function|null} - Callback for timer reset
     * @private
     */
    #onReset = null;
  
    /**
     * Creates a new Timer instance.
     * @param {Object} config - Timer configuration
     * @param {string} [config.elementId] - ID of the timer element
     * @param {Function} [config.onComplete] - Callback when timer completes
     * @param {Function} [config.onTick] - Callback for each timer tick
     * @param {Function} [config.onReset] - Callback for when timer is reset
     * @param {string} [config.format='seconds'] - Time format ('seconds' or 'countdown')
     */
    constructor({ 
      elementId = null, 
      onComplete = null,
      onReset = null,
      format = 'seconds' 
    } = {}) {
      super();
      this.#onComplete = onComplete;
      this.#onReset = onReset;
      this.format = format;
    }
  
    /**
     * Starts the timer.
     * @param {number} duration - Duration in seconds
     * @throws {Error} If duration is invalid or timer is already running
     */
    start(duration) {
      if (!duration || duration <= 0) {
        throw new Error('Duration must be a positive number');
      }
      if (this.#intervalId !== null) {
        throw new Error('Timer is already running');
      }
  
      this.#initialDuration = duration * 1000; // Store initial duration for reset
      this.#duration = this.#initialDuration;
      this.#startTime = Date.now();
      this.#endTime = this.#startTime + this.#duration;
      this.#isPaused = false;
  
      this.#startInterval();
    }
  
    /**
     * Stops and resets the timer.
     */
    stop() {
      if (this.#intervalId) {
        clearInterval(this.#intervalId);
        this.#intervalId = null;
      }
      this.#startTime = null;
      this.#endTime = null;
      this.#isPaused = false;
    }
  
    /**
     * Resets the timer to its initial duration.
     * @param {boolean} [autostart=false] - Whether to automatically start the timer after reset
     */
    reset(autostart = false) {
      const wasRunning = this.isRunning();
      
      // Stop the current timer
      if (this.#intervalId) {
        clearInterval(this.#intervalId);
        this.#intervalId = null;
      }
  
      // Reset to initial values
      this.#duration = this.#initialDuration;
      this.#isPaused = false;
  
      // Call reset callback if provided
      if (this.#onReset) {
        this.#onReset(this.#initialDuration / 1000);
      }
  
      // Autostart if requested or if timer was running before reset
      if (autostart || wasRunning) {
        this.#startTime = Date.now();
        this.#endTime = this.#startTime + this.#duration;
        this.#startInterval();
      }
    }
  
    /**
     * Pauses the timer.
     */
    pause() {
      if (this.#intervalId && !this.#isPaused) {
        clearInterval(this.#intervalId);
        this.#duration = this.#endTime - Date.now();
        this.#isPaused = true;
      }
    }
  
    /**
     * Resumes the timer from a paused state.
     */
    resume() {
      if (this.#isPaused) {
        this.#startTime = Date.now();
        this.#endTime = this.#startTime + this.#duration;
        this.#isPaused = false;
        this.#startInterval();
      }
    }
  
    /**
     * Gets the remaining time in seconds.
     * @returns {number} Remaining time in seconds
     */
    getTimeRemaining() {
      if (!this.#endTime) return 0;
      return Math.max(0, Math.ceil((this.#endTime - Date.now()) / 1000));
    }
  
    /**
     * Gets the initial duration in seconds.
     * @returns {number} Initial duration in seconds
     */
    getInitialDuration() {
      return this.#initialDuration / 1000;
    }
  
    /**
     * Checks if the timer is currently running.
     * @returns {boolean} True if timer is running
     */
    isRunning() {
      return this.#intervalId !== null && !this.#isPaused;
    }
  
    /**
     * @private
     */
    #startInterval() {
      this.#intervalId = setInterval(() => {
        const remaining = this.getTimeRemaining();
        
        //this.#updateDisplay(remaining);
        
        this.emit('tick', remaining);
  
        if (remaining <= 0) {
          this.stop();
          if (this.#onComplete) {
            this.#onComplete();
          }
        }
      }, 100); // More frequent updates for smoother display
    }
  }