/**
 * Base event emitter class for handling window events
 */
class EventEmitter {
  /**
     * @private
     * @type {object.<string, Array<Function>>}
     */
  #listeners = {}

  /**
   * Register an event listener
   * @param {string} event - The event name to listen for
   * @param {Function} callback - The callback function to execute
   */
  on (event, callback) {
    if (!this.#listeners[event]) this.#listeners[event] = []
    this.#listeners[event].push(callback)
  }

  /**
   * Emit an event to all registered listeners
   * @param {string} event - The event name to emit
   * @param {*} [data] - Optional data to pass to the listeners
   */
  emit (event, data) {
    if (this.#listeners[event]) this.#listeners[event].forEach(callback => callback(data))
  }
}

/**
 * Represents a draggable window component with a title bar and content area
 * @extends EventEmitter
 * @fires Window#close
 * @fires Window#focus
 * @fires Window#dragStart
 * @fires Window#drag
 * @fires Window#dragEnd
 * @fires Window#minimize
 */
export default class Window extends EventEmitter {
  /**
   * Create a new Window instance
   * @param {string} id - Unique identifier for the window
   * @param {string} title - Window title displayed in the title bar
   * @param {string} content - HTML content to display in the window
   * @param {number} width - Initial window width in pixels
   * @param {number} height - Initial window height in pixels
   * @param {object} savedState - Previously saved window state
   * @param {number} savedState.width - Saved window width
   * @param {number} savedState.height - Saved window height
   * @param {number} savedState.x - Saved X position
   * @param {number} savedState.y - Saved Y position
   * @param {boolean} savedState.isMinimized - Saved minimize state
   * @param {number} savedState.zIndex - Saved z-index
   */
  constructor (id, title, content, width = 400, height = 300, savedState = null) {
    super()
    this.id = id
    this.title = title
    this.content = content

    if (savedState) {
      this.width = savedState.width
      this.height = savedState.height
      this.x = savedState.x
      this.y = savedState.y
      this.isMinimized = savedState.isMinimized
      this.zIndex = savedState.zIndex
    } else {
      this.width = width
      this.height = height

      this.x = Math.min(
        Math.max(0, Math.random() * (window.innerWidth - width - 100)),
        window.innerWidth - width - 100
      )
      this.y = Math.min(
        Math.max(50, Math.random() * (window.innerHeight - height - 100)),
        window.innerHeight - height
      )

      this.isMinimized = false
      this.background_color = '#FAF9F6'
      this.titlebar_background_color = '#333'
      this.titlebar_text_color = '#fff'

    }

    // Initialize drag state
    this.isDragging = false
    this.initialX = 0
    this.initialY = 0
    this.initialMouseX = 0
    this.initialMouseY = 0

    this.createElement()

    // Adjust initial positioning to ensure it's within viewport
    this.x = Math.min(
      Math.max(0, this.x),
      Math.max(0, window.innerWidth - width)
    )
    this.y = Math.min(
      Math.max(0, this.y),
      Math.max(0, window.innerHeight - height)
    )

    if (this.isMinimized) {
      this.minimize()
    }

    // Add resize event listener
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  /**
   * Creates the DOM elements for the window
   * @private
   */
  createElement () {
    this.element = document.createElement('div')
    this.element.className = 'window'
    this.element.style.cssText = `
        position: fixed;
        left: ${this.x}px;
        top: ${this.y}px;
        width: ${this.width}px;
        height: ${this.height}px;
        background: ${this.background_color};
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        overflow: hidden;
      `

    this.titleBar = document.createElement('div')
    this.titleBar.className = 'window-title-bar'
    this.titleBar.style.cssText = `
        padding: 8px;
        background: ${this.titlebar_background_color};
        color: ${this.titlebar_text_color};
        border-bottom: 1px solid #ddd;
        cursor: move;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
      `

    const titleText = document.createElement('div')
    titleText.className = 'window-title-bar-text'
    titleText.textContent = this.title
    this.titleBar.appendChild(titleText)

    const buttonContainer = document.createElement('div')
    buttonContainer.style.display = 'flex'

    const minimizeButton = document.createElement('button')
    minimizeButton.textContent = '−'
    minimizeButton.style.cssText = `
        border: none;
        background: none;
        font-size: 20px;
        font-weight: bolder;
        color: white;
        cursor: pointer;
        padding: 0 5px;
        margin-right: 5px;
      `
    minimizeButton.onclick = e => {
      e.stopPropagation()
      this.toggleMinimize()
    }
    buttonContainer.appendChild(minimizeButton)

    const closeButton = document.createElement('button')
    closeButton.textContent = '×'
    closeButton.style.cssText = `
        border: none;
        background: none;
        font-size: 20px;
        font-weight: bolder;
        color: white;
        cursor: pointer;
        padding: 0 5px;
        margin-right: 5px;
      `
    closeButton.onclick = e => {
      e.stopPropagation()
      this.emit('close', this)
    }
    buttonContainer.appendChild(closeButton)
    this.titleBar.appendChild(buttonContainer)

    this.contentArea = document.createElement('div')
    this.contentArea.className = 'window-content'
    this.contentArea.style.cssText = `
        padding: 16px;
        overflow: auto;
        height: calc(100% - 37px);
      `
    this.contentArea.innerHTML = this.content

    this.titleBar.onmousedown = e => {
      e.preventDefault()
      this.startDrag(e)
    }
    this.element.appendChild(this.titleBar)
    this.element.appendChild(this.contentArea)

    this.element.onclick = () => this.emit('focus', this)
  }

  /**
   * Handles window repositioning when browser window is resized
   * @private
   */
  handleResize () {
    // Ensure the window stays within the new viewport boundaries
    const maxX = Math.max(0, window.innerWidth - this.width)
    const maxY = Math.max(0, window.innerHeight - this.height)

    // Adjust x and y coordinates if they're now out of bounds
    this.x = Math.min(this.x, maxX)
    this.y = Math.min(this.y, maxY)

    // Update the window's position
    this.updatePosition()
  }

  /**
   * Initiates window dragging
   * @param {MouseEvent} event - The mousedown event
   * @fires Window#dragStart
   * @private
   */
  startDrag (event) {
    this.isDragging = true
    this.initialX = this.x
    this.initialY = this.y
    this.initialMouseX = event.clientX
    this.initialMouseY = event.clientY
    this.emit('dragStart', this)
  }

  /**
   * Updates window position during drag
   * @param {MouseEvent} event - The mousemove event
   * @fires Window#drag
   */
  drag (event) {
    if (!this.isDragging) return

    // Calculate the distance moved
    const deltaX = event.clientX - this.initialMouseX
    const deltaY = event.clientY - this.initialMouseY

    // Calculate new position
    let newX = this.initialX + deltaX
    let newY = this.initialY + deltaY

    // Constrain to viewport bounds
    newX = Math.max(0, Math.min(newX, window.innerWidth - this.width))
    newY = Math.max(0, Math.min(newY, window.innerHeight - this.height))

    this.x = newX
    this.y = newY
    this.updatePosition()
    /**
     * @event Window#drag
     * @type {Window}
     * @property {Window} window - The window instance that is being dragged
     */
    this.emit('drag', this)
  }

  /**
   * Ends the window dragging operation
   * @fires Window#dragEnd
   */
  dragEnd () {
    if (!this.isDragging) return
    this.isDragging = false
    /**
     * @event Window#dragEnd
     * @type {Window}
     * @property {Window} window - The window instance that was dragged
     */
    this.emit('dragEnd', this)
  }

  /**
   * Toggles the window's minimized state
   * @fires Window#minimize
   */
  toggleMinimize () {
    if (this.isMinimized) {
      this.restore()
    } else {
      this.minimize()
    }
    /**
     * @event Window#minimize
     * @type {Window}
     * @property {Window} window - The window instance that was minimized
     */
    this.emit('minimize', this)
  }

  /**
   * Minimizes the window
   */
  minimize () {
    this.isMinimized = true
    this.element.style.display = 'none'
  }

  /**
   * Restores the window from minimized state
   */
  restore () {
    this.isMinimized = false
    this.element.style.display = 'block'
  }

  /**
   * Updates the window's position on screen
   * @private
   */
  updatePosition () {
    this.element.style.left = `${this.x}px`
    this.element.style.top = `${this.y}px`
  }

  /**
   * Sets the window's z-index
   * @param {number} index - The z-index value
   */
  setZIndex (index) {
    this.zIndex = index
    this.element.style.zIndex = index
  }

  /**
   * Returns the current state of the window
   * @property {string} id - Window identifier
   * @property {string} title - Window title
   * @property {string} content - Window content
   * @property {number} width - Window width
   * @property {number} height - Window height
   * @property {number} x - Window X position
   * @property {number} y - Window Y position
   * @property {boolean} isMinimized - Window minimize state
   * @property {number} zIndex - Window z-index
   * @returns {object} The window state
   */
  getState () {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      isMinimized: this.isMinimized,
      zIndex: this.zIndex
    }
  }

  /**
   * Removes the window from the DOM
   */
  destroy () {
    this.element.remove()
  }
}
