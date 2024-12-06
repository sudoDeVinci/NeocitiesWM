import Window from './window.js'
import WindowConfig from './window.js'
import ChatWindow from './chat.js'
import EmojiSelector from './emojiselector.js'
import Popup from './timedwindow.js'
import Icon from './Icon.js'

/**
 * Environment class for managing windows and icons in a desktop-like environment.
 * @class
 */
export default class Environment {

  /**
   * @property {HTMLDivElement} environment - The environment container DOM element
   * @default null 
   */
  environment = null

  /**
   * @property {string} background_color - The background color of the Environment container
   * @default '#FAF9F6'
   */
  background_color = '#FAF9F6'

  /**
   * @property {HTMLDivElement} taskbar - The taskbar DOM element
   * @default null
   */
  taskbar = null

  /**
   * @property {string} taskbar_background_color - The background color of the taskbar
   * @default '#333'
   */
  taskbar_background_color = '#333'

  /**
   * @property {string} taskbar_text_color - The text color of the taskbar
   * @default '#fff'
   */
  taskbar_text_color = '#fff'

  /**
   * @property {Map<String, Window>} windows - A map of all windows in the environment keyed by their id
   * @default null
   */
  windows = null

  /**
   * @property {Map<string, Icon>} icons - A map of all icons in the environment keyed by their title
   * @default null
   */
  icons = null

  /**
   * @property {HTMLDivElement} iconContainer - The icon container DOM element
   * @default null
   */
  iconContainer = null


  /**
   * @param {boolean} autoRestore
   * @returns {Environment}
   * @constructor
   */
  constructor (autoRestore = false) {
    this.windows = new Map()
    this.icons = new Map()
    this.zIndexBase = 1000
    this.currentlyDragging = null
    this.username = 'Anonymous-' + Math.floor(Math.random() * 1000)

    // Set default colors
    this.background_color = '#FAF9F6'
    this.taskbar_background_color = '#333'
    this.taskbar_text_color = '#fff'

    /**
     * @property {typeof Window, WindowConfig>} windowTypes - The types of windows that can be created
     */
    this.windowTypes = new Map([
      [Window.name, {
        width: 600,
        height: 400,
        icon: '',
        title: 'Window',
        content: '',
        styles: {},
        events: {},
        savedstate: {}
      }],
      [ChatWindow.name, {
        width: 600,
        height: 400,
        icon: '',
        title: 'Chat',
        channel: 'general',
        username: 'Anonymous',
        content: '',
        styles: {},
        events: {
          toggleEmojis: () => this.toggleEmojis(window),
          usernameChanged: (username) => {this.username = username}
        },
        savedstate: {}
      }],
      [Popup.name, {
        width: 300,
        height: 200,
        icon: '',
        title: 'Popup',
        content: '',
        styles: {},
        events: {},
        savedstate: {}
      }],
      [EmojiSelector.name, 
        {
          width: 300,
          height: 400,
          icon: '',
          title: 'Emojis',
          content: '',
          styles: {},
          events: {},
          savedstate: {}
        }
      ]
    ]);

    // Add custom font for code blocks
    const fontLink = document.createElement('link')
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap'
    fontLink.rel = 'stylesheet'
    document.head.appendChild(fontLink)

    // Page Environment Container
    this.environment = document.createElement('div')
    this.environment.id = 'window-environment'
    this.environment.style.cssText = `
      height: 100vh;
      width: 100vw;
      overflow-x: hidden;
      overflow-y: hidden;
      background-color: ${this.background_color};
      `

    // Taskbar DOM element
    this.taskbar = document.createElement('div')
    this.taskbar.id = 'taskbar'
    this.taskbar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      max-width: 100vw;
      display: flex;
      min-height: 30px;
      align-items: center;
      padding: 0 10px;
      box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      background-color: ${this.taskbar_background_color};
      color: ${this.taskbar_text_color};
      `

    // Icon container DOM element
    this.iconContainer = document.createElement('div')
    this.iconContainer.id = 'icon-container'
    this.iconContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 40px);
      z-index: ${this.zIndexBase - 1};
      pointer-events: auto;
    `
    this.environment.appendChild(this.iconContainer)

    // Add default icons
    this.addDefaultTaskbarIcons()
    this.addDefaultIcons()

    // Bind methods
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.saveState = this.saveState.bind(this)

    // Global event listeners
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('beforeunload', this.saveState)

    if (autoRestore && localStorage.getItem('windowEnvironmentState')) {
      this.restoreState()
    }

    // Append environment to the document
    document.body.appendChild(this.environment)
    // Append taskbar to the environment container
    this.environment.appendChild(this.taskbar)
  }

  addDefaultTaskbarIcons () {
    const icon = this.createTaskbarIcon('Window', Window)
    this.taskbar.appendChild(icon)

    // Add "Add" button
    const addButton1 = document.createElement('div')
    addButton1.className = 'taskbar-item add-app'
    addButton1.textContent = '+'
    
    this.taskbar.appendChild(addButton1)
  }

  /**
   * @param {object} iconConfig - icon configuration object
   * @param {string} iconConfig.title - icon title
   * @param {string} iconConfig.image - icon image path
   * @param {number} iconConfig.x - icon x position
   * @param {number} iconConfig.y - icon y position
   * @param {string} iconConfig.type - window type
   * @param {number} iconConfig.height - window height
   * @param {number} iconConfig.width - window width
   * @param {Function} iconConfig.handler - icon click handler
   * @returns {Icon} icon instance
   */
  addIcon ({
    title,
    image,
    x,
    y,
    type,
    height,
    width,
    handler
  }) {
    const icon = new Icon(title, image, () => this.newWindow(type, this.windowTypes.get(type.name)))
    icon.setPosition(x, y)
    this.iconContainer.appendChild(icon.element)
    this.icons.set(title, icon)
    return icon
  }

  addDefaultIcons () {
    const defaultIcons = [
      {
        title: 'Chat',
        image: 'images/0.png',
        x: 20,
        y: 80,
        type: ChatWindow,
        height: 700,
        width: 350
      },
    ]
    defaultIcons.forEach(icon => {
      this.addIcon(icon)
    })
  }

  createTaskbarIcon (title, WindowClass) {
    const taskbarItem = document.createElement('div')
    taskbarItem.className = 'taskbar-item'
    taskbarItem.textContent = title
    taskbarItem.onclick = () => this.newWindow(WindowClass, this.windowTypes.get(WindowClass.name))
    return taskbarItem
  }

  pinWindow (window) {
    const taskbarItem = document.createElement('div')
    taskbarItem.className = 'taskbar-item'
    taskbarItem.textContent = window.title
    taskbarItem.onclick = () => window.toggleMinimize()
    this.taskbar.appendChild(taskbarItem)
    this.icons.set(window.id, taskbarItem)
  }

  removeWindow (window) {
    if (this.windows.has(window.id)) {
      this.windows.delete(window.id)
      this.environment.removeChild(window.element)

      this.taskbar.removeChild(this.icons.get(window.id))
      this.icons.delete(window.id)

      window.destroy()

      this.updateZIndices()
      this.saveState()
    }
  }

  /**
   * Create a new window and add it to the environment
   * @param {typeof Window} WindowClass - window class/subclass type
   * @param {WindowConfig} config - window configuration object
   */
  newWindow (WindowClass = Window, config = {}) {
    const window = this.createWindow(crypto.randomUUID(), WindowClass, config)
    this.pinWindow(window)
    this.bringToFront(window)
    this.updateZIndices()
    this.saveState()
  }

  /**
   * Factory method for creating windows by passed type.
   * @param {string} id - unique window id
   * @param {WindowConfig} config - window configuration object
   * @param {typeof Window} WindowClass - window class/subclass type
   * @returns {Window} window or window subclass
   */
  createWindow (
    id,
    WindowClass = Window,
    config = {}
  ) {


    // Check if window with this id already exists
    if (this.windows.has(id)) {
      console.error(`Window with id ${id} already exists. Skipping creation.`)
      return this.windows.get(id)
    }

    // Check if window class is registered in windowTypes
    if (!this.windowTypes.has(WindowClass.name)) {
      console.error(`${WindowClass.name} class not registered in windowTypes`)
      
      // Check for window class inheritence
      if (WindowClass.prototype instanceof Window) {
        console.warn('Window class is a subclass of Window - Registering new Type')
        this.windowTypes.set(WindowClass, {
          width: config.width || 600,
          height: config.height || 400,
          title: config.title || '',
          icon: config.icon || '',
          styles: config.styles || {},
          events: config.events || {},
          savedstate: config.savedstate || {}
        })
      } else {
        console.error('Window class is not a subclass of Window - Using default Window class.')
        WindowClass = Window
      }

    } else {
      // Merge config with default config - if attributes are missing, use default
      const defaultconfig = this.windowTypes.get(WindowClass)
      for (const defaultKey in defaultconfig) {
        config[defaultKey] = config[defaultKey] || defaultconfig[defaultKey]
      }
    }

    let window = null

    window = new WindowClass(id, config)

    Object.entries(config.events).forEach(([event, handler]) => {
      window.on(event, handler)
    })

    // Set up event listeners
    window.on('close', () => this.removeWindow(window))
    window.on('focus', () => this.bringToFront(window))
    window.on('dragStart', () => this.startDragging(window))
    window.on('minimize', () => this.saveState())
    window.on('drag', () => this.saveState())
    window.on('dragEnd', () => this.saveState())
    window.on('popup', (data) => this.newWindow(`${crypto.randomUUID()}-${id}`, data, Popup))

    this.windows.set(window.id, window)
    this.environment.appendChild(window.element)
    this.updateZIndices()
    this.saveState()

    return window
  }

  toggleEmojis (window) {
    if (!window.emojiSelector) {
      window.emojiSelector = this.createWindow(
        `emoji-${this.id}`,
        '',
        '',
        300,
        400,
        null,
        EmojiSelector
      )

      window.initEmojiSelector()
      this.bringToFront(window.emojiSelector)
    } else {
      // If already open, close it
      window.emojiSelector.emit('close')
      window.emojiSelector = null
    }
  }

  bringToFront (window) {
    const windowArray = Array.from(this.windows.values())
    const index = windowArray.indexOf(window)
    if (index !== -1) {
      windowArray.splice(index, 1)
      windowArray.push(window)
      this.windows.clear()
      windowArray.forEach(w => this.windows.set(w.id, w))
      this.updateZIndices()
      this.saveState()
    }
  }

  updateZIndices () {
    let index = 0
    this.windows.forEach(window => {
      window.setZIndex(this.zIndexBase + index)
      index++
    })
  }

  startDragging (window) {
    this.currentlyDragging = window
    this.bringToFront(window)
  }

  onMouseMove (event) {
    if (this.currentlyDragging) {
      this.currentlyDragging.drag(event)
    }
  }

  onMouseUp (event) {
    if (this.currentlyDragging) {
      this.currentlyDragging.dragEnd(event)
      this.currentlyDragging = null
    }
  }

  saveState () {
    const state = {
      windows: Array.from(this.windows.values()).map(window => ({
        ...window.getState(),
        className: window.constructor.name // Store the class name
      }))
    }
    localStorage.setItem('windowEnvironmentState', JSON.stringify(state))
  }

  async restoreState () {
    try {
      const savedState = localStorage.getItem('windowEnvironmentState')
      if (savedState) {
        const state = JSON.parse(savedState)
        for (const windowState of state.windows) {
          // Import the appropriate window class based on the saved className
          const WindowClass = windowState.className // Default to base Window class
          this.createWindow(
            windowState.id,
            windowState.title,
            windowState.content,
            windowState.width,
            windowState.height,
            windowState,
            WindowClass
          )
        }
      }
    } catch (error) {
      console.error('Error restoring window state:', error)
    }
  }

  clearSavedState () {
    localStorage.removeItem('windowEnvironmentState')
  }
}
