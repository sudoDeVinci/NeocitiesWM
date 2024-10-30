import Window from './window.js';
import ChatWindow from './chat.js';

export default class Environment {
  constructor(autoRestore = false) {
    this.windows = new Map();
    this.zIndexBase = 1000;
    this.currentlyDragging = null;

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
    if (WindowClass === ChatWindow) {
      window = new ChatWindow(id, width, height, 'default', savedState);
    } else {
      window = new WindowClass(id, title, content, width, height, savedState);
    }

    // Set up event listeners
    window.on('close', () => this.removeWindow(window));
    window.on('focus', () => this.bringToFront(window));
    window.on('dragStart', () => this.startDragging(window));
    window.on('minimize', () => this.saveState());
    window.on('drag', () => this.saveState());
    window.on('dragEnd', () => this.saveState());

    this.windows.set(window.id, window);
    document.body.appendChild(window.element);
    this.updateZIndices();
    this.saveState();

    return window;
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
          if (windowState.className === 'ChatWindow') {
            const { default: ChatWindow } = await import('./chat.js');
            WindowClass = ChatWindow;
          }

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
