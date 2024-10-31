import Window from './window.js';
import ChatWindow from './chat.js';
import EmojiSelector from './emojiselector.js';

export default class Environment {
  constructor(autoRestore = false) {
    this.windows = new Map();
    this.zIndexBase = 1000;
    this.currentlyDragging = null;

    // Taskbar DOM element
    this.taskbar = document.createElement('div');
    this.taskbar.id = 'taskbar';

    // Add default icons
    this.addDefaultTaskbarIcons();

    // Append taskbar to the document
    document.body.appendChild(this.taskbar);

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
  }

  // Add default icons to taskbar
  addDefaultTaskbarIcons() {
    const defaultApps = [
        { id: 'chat', title: 'Chat' , type: ChatWindow, height: 600, width: 300},
        { id: 'browser', title: 'Browser' , type: Window, height: 600, width: 800},
    ];

    defaultApps.forEach(app => {
        const icon = this.createTaskbarIcon(app.id, app.title, app.type, app.height, app.width);
        this.taskbar.appendChild(icon);
    });

    // Add "Add" button
    const addButton = document.createElement('div');
    addButton.className = 'taskbar-item add-app';
    addButton.textContent = '+';
    //addButton.onclick = () => this.addAppPrompt(); // Open a prompt to add new apps
    this.taskbar.appendChild(addButton);
  }

  // Helper to create taskbar icons
  createTaskbarIcon(id, title, type, width, height) {
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.textContent = title;
    taskbarItem.onclick = () => this.createWindow(id, title, '', height, width, null, type);
    return taskbarItem;
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
    document.body.appendChild(window.element);
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
    } else {
       // If already open, close it
      window.emojiSelector.emit('close');
      window.emojiSelector = null;
    }
  }

  removeWindow(window) {
    if (this.windows.has(window.id)) {
      window.destroy();
      this.windows.delete(window.id);
      this.updateZIndices();
      this.saveState();
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
          let WindowClass = Window; // Default to base Window class
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
