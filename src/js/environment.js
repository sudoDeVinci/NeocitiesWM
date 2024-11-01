import Window from './window.js';
import ChatWindow from './chat.js';
import EmojiSelector from './emojiselector.js';

export default class Environment {
  constructor(autoRestore = false) {
    this.windows = new Map();
    this.icons = new Map();
    this.zIndexBase = 1000;
    this.currentlyDragging = null;

    // Add custom font for code blocks
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Page Environment Container
    this.environment = document.createElement('div');
    this.environment.id = 'window-environment';
    this.environment.style.cssText = `
      dsplay: inline-block;
      width: 100vw;
      max-width: 100vw;
      height: 100vh;
      max-height: 100vh;
      `;

    // Taskbar DOM element
    this.taskbar = document.createElement('div');
    this.taskbar.id = 'taskbar';

    // Add default icons
    this.addDefaultTaskbarIcons();

    // Append taskbar to the document
    //document.body.appendChild(this.taskbar);

    // Bind methods
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.saveState = this.saveState.bind(this);

    // Global event listeners
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('beforeunload', this.saveState);

    if (autoRestore && localStorage.getItem('windowEnvironmentState')) {
      this.restoreState();
    }

    // Append environment to the document
    document.body.appendChild(this.environment);
    // Append taskbar to the environment container
    this.environment.appendChild(this.taskbar);
  }

  // Add default icons to taskbar
  addDefaultTaskbarIcons() {
    const defaultApps = [
        { title: 'Chat' , type: ChatWindow, height: 600, width: 300},
        { title: 'Browser' , type: Window, height: 600, width: 800}
    ];

    defaultApps.forEach(app => {
        const icon = this.createTaskbarIcon(app.title, app.type, app.width, app.height);
        this.taskbar.appendChild(icon);
    });

    // Add "Add" button
    const addButton1 = document.createElement('div');
    const addButton2 = document.createElement('div');
    const addButton3 = document.createElement('div');
    addButton1.className = 'taskbar-item add-app';
    addButton2.className = 'taskbar-item add-app';
    addButton3.className = 'taskbar-item add-app';
    addButton1.textContent = '+';
    addButton2.textContent = '+';
    addButton3.textContent = '+';
    //addButton.onclick = () => this.addAppPrompt(); // Open a prompt to add new apps
    this.taskbar.appendChild(addButton1);
    this.taskbar.appendChild(addButton2);
    this.taskbar.appendChild(addButton3);
  }

  // Helper to create taskbar icons
  createTaskbarIcon(title, type, width, height) {
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.textContent = title;
    taskbarItem.onclick = () => this.newWindow(title, '', width, height, null, type);
    return taskbarItem;
  }

  //Pin open windows to the taskbar
  pinWindow(window) {
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.textContent = window.title;
    taskbarItem.onclick = () => window.toggleMinimize();
    this.taskbar.appendChild(taskbarItem);
    this.icons.set(window.id, taskbarItem);
  }

  removeWindow(window) {
    if (this.windows.has(window.id)) {
      this.windows.delete(window.id);
      this.environment.removeChild(window.element);

      this.taskbar.removeChild(this.icons.get(window.id));
      this.icons.delete(window.id);

      window.destroy();
      
      this.updateZIndices();
      this.saveState();
    }
  }

  // Helper to create windows
  newWindow(title, content, width, height, savedState, WindowClass) {
    const window = this.createWindow(crypto.randomUUID(), title, content, width, height, savedState, WindowClass);
    this.pinWindow(window);
    this.bringToFront(window);
    this.updateZIndices();
    this.saveState();
  }

  createWindow(
    id,
    title,
    content,
    width = 400,
    height = 300,
    savedState = null,
    WindowClass = Window
  ) {
    // Check if window with this id already exists
    if (this.windows.has(id)) {
      console.warn(`Window with id ${id} already exists. Skipping creation.`);
      return this.windows.get(id);
    }

    let window = null;

    switch (WindowClass) {
      case ChatWindow:
        window = new ChatWindow(id, width, height, 'default', savedState);
        break;

      case EmojiSelector:
        window = new EmojiSelector(id, savedState);
        break;
        
      case null:
      case Window:
      default:
        window = new Window(id, title, content, width, height, savedState);
    }

    // Set up event listeners
    window.on('close', () => this.removeWindow(window));
    window.on('focus', () => this.bringToFront(window));
    window.on('dragStart', () => this.startDragging(window));
    window.on('toggleEmojis', () => this.toggleEmojis(window));
    window.on('minimize', () => this.saveState());
    window.on('drag', () => this.saveState());
    window.on('dragEnd', () => this.saveState());

    this.windows.set(window.id, window);
    this.environment.appendChild(window.element);
    this.updateZIndices();
    this.saveState();

    return window;
  }

  toggleEmojis(window) {
    if (!window.emojiSelector) {
      window.emojiSelector = this.createWindow(
        `emoji-${this.id}`,
        '',
        '',
        300,
        400,
        null,
        EmojiSelector
      );
      
      window.initEmojiSelector();
      this.bringToFront(window.emojiSelector);
    } else {
       // If already open, close it
      window.emojiSelector.emit('close');
      window.emojiSelector = null;
    }
  }

  bringToFront(window) {
    const windowArray = Array.from(this.windows.values());
    const index = windowArray.indexOf(window);
    if (index !== -1) {
      windowArray.splice(index, 1);
      windowArray.push(window);
      this.windows.clear();
      windowArray.forEach(w => this.windows.set(w.id, w));
      this.updateZIndices();
      this.saveState();
    }
  }

  updateZIndices() {
    let index = 0;
    this.windows.forEach(window => {
      window.setZIndex(this.zIndexBase + index);
      index++;
    });
  }

  startDragging(window) {
    this.currentlyDragging = window;
    this.bringToFront(window);
  }

  onMouseMove(event) {
    if (this.currentlyDragging) {
      this.currentlyDragging.drag(event);
    }
  }

  onMouseUp(event) {
    if (this.currentlyDragging) {
      this.currentlyDragging.dragEnd(event);
      this.currentlyDragging = null;
    }
  }

  saveState() {
    const state = {
      windows: Array.from(this.windows.values()).map(window => ({
        ...window.getState(),
        className: window.constructor.name, // Store the class name
      })),
    };
    localStorage.setItem('windowEnvironmentState', JSON.stringify(state));
  }

  async restoreState() {
    try {
      const savedState = localStorage.getItem('windowEnvironmentState');
      if (savedState) {
        const state = JSON.parse(savedState);
        for (const windowState of state.windows) {
          // Import the appropriate window class based on the saved className
          let WindowClass = windowState.className; // Default to base Window class
          this.createWindow(
            windowState.id,
            windowState.title,
            windowState.content,
            windowState.width,
            windowState.height,
            windowState,
            WindowClass
          );
        }
      }
    } catch (error) {
      console.error('Error restoring window state:', error);
    }
  }

  clearSavedState() {
    localStorage.removeItem('windowEnvironmentState');
  }
}
