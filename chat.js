import Window from './window.js';

export default class ChatWindow extends Window {
  constructor(
    id,
    width = 400,
    height = 300,
    channel = 'default',
    savedState = null
  ) {
    const title = `Chat - ${channel}`;
    const content = '<div class="chat-container"></div>';
    super(id, title, content, width, height, savedState);

    this.channel = channel;
    this.messages = [];
    this.setupChatUI();
    this.connectWebSocket();
  }

  setupChatUI() {
    const container = this.element.querySelector('.chat-container');
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
    `;

    // Message history container
    this.messageContainer = document.createElement('div');
    this.messageContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      background: #f9f9f9;
      margin-bottom: 10px;
    `;
    container.appendChild(this.messageContainer);

    // Input area
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      flex: 1;
      padding: 10px;
      border-top: 1px solid #ddd;
      background: white;
    `;

    this.messageInput = document.createElement('textarea');
    this.messageInput.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: none;
      margin-bottom: 8px;
    `;
    this.messageInput.placeholder = 'Type your message...';
    this.messageInput.rows = 3;

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.style.cssText = `
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 0rem;
    `;
    sendButton.onclick = () => this.sendMessage();

    this.messageInput.onkeydown = e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    };

    inputContainer.appendChild(this.messageInput);
    inputContainer.appendChild(sendButton);
    container.appendChild(inputContainer);
  }

  connectWebSocket() {
    this.ws = new WebSocket('YOUR SOCKET HERE');
    this.ws.onopen = () => {
      this.addSystemMessage('Connected to chat server');
    };

    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.type === 'heartbeat') return;

      this.addMessage(message);
    };

    this.ws.onclose = () => {
      this.addSystemMessage('Disconnected from chat server');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  addMessage(message) {
    this.messages.push(message);
    if (this.messages.length > 20) {
      this.messages.shift();
    }

    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      margin-bottom: 10px;
      padding: 8px;
      border-radius: 4px;
      background: ${
        message.username === ChatWindow.getUsername() ? '#e3f2fd' : 'white'
      };
      border: 1px solid #ddd;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      font-weight: bold;
      margin-bottom: 4px;
      color: #666;
    `;
    header.textContent = message.username;

    const content = document.createElement('div');
    content.textContent = message.data;

    messageElement.appendChild(header);
    messageElement.appendChild(content);
    this.messageContainer.appendChild(messageElement);
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }

  addSystemMessage(text) {
    const message = {
      type: 'system',
      data: text,
      username: 'System',
    };
    this.addMessage(message);
  }

  sendMessage() {
    const text = this.messageInput.value.trim();
    if (!text) return;

    const message = {
      type: 'message',
      data: text,
      username: ChatWindow.getUsername(),
      channel: this.channel,
      key: '',
    };

    this.ws.send(JSON.stringify(message));
    this.messageInput.value = '';
  }

  destroy() {
    if (this.ws) {
      this.ws.close();
    }
    super.destroy();
  }

  static getUsername() {
    let username = localStorage.getItem('chat-username');
    if (!username) {
      username = prompt('Please enter your username:');
      if (username) {
        localStorage.setItem('chat-username', username);
      } else {
        username = 'Anonymous-' + Math.floor(Math.random() * 1000);
        localStorage.setItem('chat-username', username);
      }
    }
    return username;
  }

  static changeUsername() {
    const newUsername = prompt('Enter new username:');
    if (newUsername) {
      localStorage.setItem('chat-username', newUsername);
    }
    return newUsername;
  }
}
