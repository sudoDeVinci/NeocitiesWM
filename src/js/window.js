// Event emitter for window events
class WindowEventEmitter {
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

export default class Window extends WindowEventEmitter {
  /**
   * @param {string} id 
   * @param {string} title 
   * @param {string} content 
   * @param {number} width 
   * @param {number} height 
   * @param {object} savedState 
   */
  constructor(
    id,
    title,
    content,
    width = 400,
    height = 300,
    savedState = null
  ) {
    super();
    this.id = id;
    this.title = title;
    this.content = content;

    if (savedState) {
      this.width = savedState.width;
      this.height = savedState.height;
      this.x = savedState.x;
      this.y = savedState.y;
      this.isMinimized = savedState.isMinimized;
      this.zIndex = savedState.zIndex;
    } else {
      this.width = width;
      this.height = height;

      this.x = Math.min(
        Math.max(0, Math.random() * (window.innerWidth - width - 100)),
        window.innerWidth - width - 100
      );
      this.y = Math.min(
        Math.max(50, Math.random() * (window.innerHeight - height - 100)),
        window.innerHeight - height - 100
      );
      
      this.isMinimized = false;
    }

    // Initialize drag state
    this.isDragging = false;
    this.initialX = 0;
    this.initialY = 0;
    this.initialMouseX = 0;
    this.initialMouseY = 0;

    this.createElement();

    // Adjust initial positioning to ensure it's within viewport
    this.x = Math.min(
      Math.max(0, this.x),
      Math.max(0, window.innerWidth - width)
    );
    this.y = Math.min(
      Math.max(0, this.y),
      Math.max(0, window.innerHeight - height)
    );

    if (this.isMinimized) {
      this.minimize();
    }

    // Add resize event listener
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'window';
    this.element.style.cssText = `
        position: fixed;
        left: ${this.x}px;
        top: ${this.y}px;
        width: ${this.width}px;
        height: ${this.height}px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        overflow: hidden;
      `;

    this.titleBar = document.createElement('div');
    this.titleBar.className = 'window-title-bar';
    this.titleBar.style.cssText = `
        padding: 8px;
        background-color: #333;
        color: white;
        border-bottom: 1px solid #ddd;
        cursor: move;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
      `;

    const titleText = document.createElement('div');
    titleText.textContent = this.title;
    this.titleBar.appendChild(titleText);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';

    const minimizeButton = document.createElement('button');
    minimizeButton.textContent = '−';
    minimizeButton.style.cssText = `
        border: none;
        background: none;
        font-size: 20px;
        font-weight: bolder;
        color: white;
        cursor: pointer;
        padding: 0 5px;
        margin-right: 5px;
      `;
    minimizeButton.onclick = e => {
      e.stopPropagation();
      this.toggleMinimize();
    };
    buttonContainer.appendChild(minimizeButton);

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        border: none;
        background: none;
        font-size: 20px;
        font-weight: bolder;
        color: white;
        cursor: pointer;
        padding: 0 5px;
        margin-right: 5px;
      `;
    closeButton.onclick = e => {
      e.stopPropagation();
      this.emit('close', this);
    };
    buttonContainer.appendChild(closeButton);
    this.titleBar.appendChild(buttonContainer);

    this.contentArea = document.createElement('div');
    this.contentArea.className = 'window-content';
    this.contentArea.style.cssText = `
        padding: 16px;
        overflow: auto;
        height: calc(100% - 37px);
      `;
    this.contentArea.innerHTML = this.content;

    this.titleBar.onmousedown = e => {
      e.preventDefault();
      this.startDrag(e);
    };
    this.element.appendChild(this.titleBar);
    this.element.appendChild(this.contentArea);

    this.element.onclick = () => this.emit('focus', this);
  }

  // New method to handle window repositioning on resize
  handleResize() {
    // Ensure the window stays within the new viewport boundaries
    const maxX = Math.max(0, window.innerWidth - this.width);
    const maxY = Math.max(0, window.innerHeight - this.height);

    // Adjust x and y coordinates if they're now out of bounds
    this.x = Math.min(this.x, maxX);
    this.y = Math.min(this.y, maxY);

    // Update the window's position
    this.updatePosition();
  }

  startDrag(event) {
    this.isDragging = true;
    this.initialX = this.x;
    this.initialY = this.y;
    this.initialMouseX = event.clientX;
    this.initialMouseY = event.clientY;
    this.emit('dragStart', this);
  }

  /**
   * 
   * @param {Event} event 
   * @returns 
   */
  drag(event) {
    if (!this.isDragging) return;

    // Calculate the distance moved
    const deltaX = event.clientX - this.initialMouseX;
    const deltaY = event.clientY - this.initialMouseY;

    // Calculate new position
    let newX = this.initialX + deltaX;
    let newY = this.initialY + deltaY;

    // Constrain to viewport bounds
    newX = Math.max(0, Math.min(newX, window.innerWidth - this.width));
    newY = Math.max(0, Math.min(newY, window.innerHeight - this.height));

    this.x = newX;
    this.y = newY;
    this.updatePosition();
    this.emit('drag', this);
  }

  dragEnd(event) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.emit('dragEnd', this);
  }

  toggleMinimize() {
    if (this.isMinimized) {
      this.restore();
    } else {
      this.minimize();
    }
    this.emit('minimize', this);
  }

  minimize() {
    this.isMinimized = true;
    this.element.style.display = 'none';
  }

  restore() {
    this.isMinimized = false;
    this.element.style.display = 'block';
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  setZIndex(index) {
    this.zIndex = index;
    this.element.style.zIndex = index;
  }

  getState() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      isMinimized: this.isMinimized,
      zIndex: this.zIndex,
    };
  }

  destroy() {
    this.element.remove();
  }
}
