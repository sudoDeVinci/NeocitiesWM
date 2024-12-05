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
   * The minimize button element
   * @property {HTMLButtonElement} minimizeButton - The minimize button element
   * @default null
   */
  minimizeButton = null

  /**
   * The close button element
   * @property {HTMLButtonElement} closeButton - The close button element
   * @default null
   */
  closeButton = null

  /**
   * The window element containing all other elements
   * @property {HTMLDivElement} element - The window element
   * @default null
   */
  element = null

  /**
   * The unique identifier for the window
   * @property {string} id - The window identifier
   * @default null
   */
  id = null

  /**
   * The content in the window content area
   * @property {string} content - The window content
   * @default null
   */
  content = null

  /**
   * The title bar element containing the window title and buttons
   * @property {HTMLDivElement} titleBar - The title bar element
   * @default null
   */
  titleBar = null

  /**
   * The text element displaying the window title
   * @property {HTMLDivElement} titleText - The title text element
   * @default null
   */
  titleText = null

  /**
   * The content area element containing the window content
   * @property {HTMLDivElement} contentArea - The content area element
   * @default null
   */
  contentArea = null

  /**
   * The window's current X position
   * @property {number} x - The window's X position
   * @default 100
   */
  x = 100

  /**
   * The window's current Y position
   * @property {number} y - The window's Y position
   * @default 100
   */
  y = 100

  /**
   * Whether the window is currently minimized
   * @property {boolean} isMinimized - The window's minimized state
   * @default false
   */
  isMinimized = false

  /**
   * Whether the window is currently being dragged
   * @property {boolean} isDragging - The window's dragging state
   * @default false
   */
  isDragging = false

  /**
   * The current window z index
   * @property {number} zIndex - The window's z-index
   * @default 0
   */
  zIndex = 0

  /**
   * The window's height in pixels
   * @property {number} height - The window's height
   * @default null
   */
  height = null

  /**
   * The window's width in pixels
   * @property {number} width - The window's width
   * @default null
   */
  width = null


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

    // Addresize handles
    this.createResizeHandles()
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

    this.titleText = document.createElement('div')
    this.titleText.className = 'window-title-bar-text'
    this.titleText.textContent = this.title
    this.titleBar.appendChild(this.titleText)

    const buttonContainer = document.createElement('div')
    buttonContainer.style.display = 'flex'

    this.minimizeButton = document.createElement('button')
    this.minimizeButton.className = 'window-minimize-button'
    this.minimizeButton.textContent = '−'
    this.minimizeButton.style.cssText = `
        border: none;
        background: none;
        font-size: 20px;
        font-weight: bolder;
        color: white;
        cursor: pointer;
        padding: 0 5px;
        margin-right: 5px;
      `
    this.minimizeButton.onclick = e => {
      e.stopPropagation()
      this.toggleMinimize()
    }
    buttonContainer.appendChild(this.minimizeButton)

    this.closeButton = document.createElement('button')
    this.closeButton.className = 'window-close-button'
    this.closeButton.textContent = '×'
    this.closeButton.style.cssText = `
        border: none;
        background: none;
        font-size: 20px;
        font-weight: bolder;
        color: white;
        cursor: pointer;
        padding: 0 5px;
        margin-right: 5px;
      `
    this.closeButton.onclick = e => {
      e.stopPropagation()
      this.emit('close', this)
    }
    buttonContainer.appendChild(this.closeButton)
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
   * Creates resize handles for the window
   * @private
   */
  createResizeHandles () {
    const resizeHandles = [
      { cursor: 'nwse-resize', position: 'top-left', dx: -1, dy: -1 },
      { cursor: 'ns-resize', position: 'top-center', dx: 0, dy: -1 },
      { cursor: 'nesw-resize', position: 'top-right', dx: 1, dy: -1 },
      { cursor: 'ew-resize', position: 'middle-left', dx: -1, dy: 0 },
      { cursor: 'ew-resize', position: 'middle-right', dx: 1, dy: 0 },
      { cursor: 'nesw-resize', position: 'bottom-left', dx: -1, dy: 1 },
      { cursor: 'ns-resize', position: 'bottom-center', dx: 0, dy: 1 },
      { cursor: 'nwse-resize', position: 'bottom-right', dx: 1, dy: 1 }
    ]

    resizeHandles.forEach(handle => {
      const resizeHandle = document.createElement('div')
      resizeHandle.className = `resize-handle resize-${handle.position}`
      resizeHandle.style.cssText = `
        position: absolute;
        background: transparent;
        z-index: 10;
        cursor: ${handle.cursor};
      `

      // Position and size the resize handles
      switch (handle.position) {
        case 'top-left':
          resizeHandle.style.top = '-5px'
          resizeHandle.style.left = '-5px'
          resizeHandle.style.width = '15px'
          resizeHandle.style.height = '15px'
          break
        case 'top-center':
          resizeHandle.style.top = '-5px'
          resizeHandle.style.left = 'calc(50% - 5px)'
          resizeHandle.style.width = '10px'
          resizeHandle.style.height = '10px'
          break
        case 'top-right':
          resizeHandle.style.top = '-5px'
          resizeHandle.style.right = '-5px'
          resizeHandle.style.width = '15px'
          resizeHandle.style.height = '15px'
          break
        case 'middle-left':
          resizeHandle.style.top = 'calc(50% - 5px)'
          resizeHandle.style.left = '-5px'
          resizeHandle.style.width = '10px'
          resizeHandle.style.height = '10px'
          break
        case 'middle-right':
          resizeHandle.style.top = 'calc(50% - 5px)'
          resizeHandle.style.right = '-5px'
          resizeHandle.style.width = '10px'
          resizeHandle.style.height = '10px'
          break
        case 'bottom-left':
          resizeHandle.style.bottom = '-5px'
          resizeHandle.style.left = '-5px'
          resizeHandle.style.width = '15px'
          resizeHandle.style.height = '15px'
          break
        case 'bottom-center':
          resizeHandle.style.bottom = '-5px'
          resizeHandle.style.left = 'calc(50% - 5px)'
          resizeHandle.style.width = '10px'
          resizeHandle.style.height = '10px'
          break
        case 'bottom-right':
          resizeHandle.style.bottom = '-5px'
          resizeHandle.style.right = '-5px'
          resizeHandle.style.width = '15px'
          resizeHandle.style.height = '15px'
          break
      }

      // Add resize event listener
      resizeHandle.addEventListener('mousedown', (e) => this.startResize(e, handle.dx, handle.dy))

      this.element.appendChild(resizeHandle)
    })
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

  /**
   * Initiates window resizing
   * @param {MouseEvent} event - The mousedown event
   * @param {number} dx - Horizontal resize direction (-1, 0, or 1)
   * @param {number} dy - Vertical resize direction (-1, 0, or 1)
   * @private
   */
  startResize (event, dx, dy) {
    event.stopPropagation()
    
    // Prevent text selection during resize
    event.preventDefault()

    // Store initial window state
    this.isResizing = true
    this.initialWidth = this.width
    this.initialHeight = this.height
    this.initialX = this.x
    this.initialY = this.y
    this.initialMouseX = event.clientX
    this.initialMouseY = event.clientY
    this.resizeDirX = dx
    this.resizeDirY = dy

    // Add global event listeners for resize
    document.addEventListener('mousemove', this.resize.bind(this))
    document.addEventListener('mouseup', this.endResize.bind(this))
  }

  /**
   * Handles window resizing
   * @param {MouseEvent} event - The mousemove event
   * @private
   */
  resize (event) {
    if (!this.isResizing) return

    // Calculate the distance moved
    const deltaX = event.clientX - this.initialMouseX
    const deltaY = event.clientY - this.initialMouseY

    // Calculate new dimensions and position
    let newWidth = this.initialWidth
    let newHeight = this.height
    let newX = this.x
    let newY = this.y

    // Horizontal resize
    if (this.resizeDirX !== 0) {
      newWidth = Math.max(200, this.initialWidth + (deltaX * this.resizeDirX))
      
      // Adjust X position for left-side resize
      if (this.resizeDirX < 0) {
        newX = this.initialX + (this.initialWidth - newWidth)
      }
    }

    // Vertical resize
    if (this.resizeDirY !== 0) {
      newHeight = Math.max(100, this.initialHeight + (deltaY * this.resizeDirY))
      
      // Adjust Y position for top-side resize
      if (this.resizeDirY < 0) {
        newY = this.initialY + (this.initialHeight - newHeight)
      }
    }

    // Constrain to viewport bounds
    newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth))
    newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight))

    // Update window properties
    this.width = newWidth
    this.height = newHeight
    this.x = newX
    this.y = newY

    // Update window styling
    this.element.style.width = `${this.width}px`
    this.element.style.height = `${this.height}px`
    this.updatePosition()

    // Adjust content area
    this.contentArea.style.height = `calc(100% - 37px)`
  }

  /**
   * Ends the window resizing operation
   * @private
   */
  endResize () {
    if (!this.isResizing) return

    this.isResizing = false

    // Remove global event listeners
    document.removeEventListener('mousemove', this.resize)
    document.removeEventListener('mouseup', this.endResize)

    // Emit resize event if needed
    this.emit('resize', this)
  }
}
