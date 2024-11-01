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
    super(id, title, content, 320, 600, savedState);

    this.channel = channel;
    this.messages = this.loadCachedMessages() || [];
    this.setupChatUI();
    this.connectWebSocket();
  }

  loadCachedMessages() {
    const key = `chat-messages-${this.channel}`;
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  }

  saveCachedMessages() {
    // Filter out system messages and only keep user messages
    const userMessages = this.messages.filter(message => 
      message.type === 'message' && message.username !== 'System'
    );
    
    const key = `chat-messages-${this.channel}`;
    // Keep last 50 user messages
    localStorage.setItem(key, JSON.stringify(userMessages.slice(-50)));
  }

  setupChatUI() {
    const container = this.element.querySelector('.chat-container');
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      max-height: 600px;
      max-width: 300px;
      width:100%;
      overflow-y: auto;
      overflow-x: hidden;
    `;

    // Message history container
    this.messageContainer = document.createElement('div');
    this.messageContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      background: #f9f9f9;
      margin-bottom: 10px;
      max-height: 350px;
      max-width: 300px;
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
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: none;
      margin-bottom: 8px;
      max-height: 300px;
      max-width: 250px;
      width: 100%;
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

    // Add emoji button next to the send button
    const emojiButton = document.createElement('button');
    emojiButton.textContent = '😊';
    emojiButton.style.cssText = `
      padding: 8px 16px;
      margin-right: 8px;
      background: #f0f0f0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `;

    emojiButton.onclick = () => this.emit('toggleEmojis', this);
    inputContainer.insertBefore(emojiButton, inputContainer.lastChild);

    // Store reference to input for emoji insertion
    this.messageInput = inputContainer.querySelector('textarea');
    
    container.scrollTop = container.scrollHeight;
  }

  parseMessageContent(text) {
    const fragments = [];
    let currentIndex = 0;
    const codeBlockRegex = /```([\s\S]*?)```/g;
    
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        fragments.push({
          type: 'text',
          content: text.slice(currentIndex, match.index)
        });
      }
      
      // Add code block
      fragments.push({
        type: 'code',
        content: match[1].trim()
      });
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      fragments.push({
        type: 'text',
        content: text.slice(currentIndex)
      });
    }
    
    return fragments;
  }

  displayMessage(message) {
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
      padding: 4px 8px;
      max-width: 180px;
      overflow-x: hidden;
      font-weight: bold;
      margin-bottom: 4px;
      color: #666;
    `;
    header.textContent = message.username;
    messageElement.appendChild(header);

    const content = document.createElement('div');
    const fragments = this.parseMessageContent(message.data);
    
    fragments.forEach(fragment => {
      const element = document.createElement('div');
      if (fragment.type === 'code') {
        element.style.cssText = `
          font-family: 'Fira Code', monospace;
          font-size: 0.95em;
          line-height: 1.4;
          white-space: pre-wrap;
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 12px;
          border-radius: 6px;
          margin: 8px 0;
          border-left: 4px solid #007acc;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          tab-size: 2;
          -moz-tab-size: 2;
        `;
      } else {
        element.style.cssText = `
          margin: 4px 0;
          line-height: 1.5;
          max-width: 215px;
          overflow-x: hidden;
          overflow-wrap: break-word;
        `;
      }
      element.textContent = fragment.content;
      content.appendChild(element);
    });

    messageElement.appendChild(content);
    this.messageContainer.appendChild(messageElement);
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    const container = this.element.querySelector('.chat-container');
    container.scrollTop = container.scrollHeight;
  }



  initEmojiSelector() {
    if (!this.emojiSelector) return;
    
    // Position it next to the chat window
    const chatRect = this.element.getBoundingClientRect();
    this.emojiSelector.x = chatRect.right + 10;
    this.emojiSelector.y = chatRect.top;
    //this.emojiSelector.updatePosition();

    // Handle emoji selection
    this.emojiSelector.on('emojiSelected', ({ emoji }) => {
      // Insert emoji at cursor position or at end
      const input = this.messageInput;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = input.value;

      input.value = text.substring(0, start) + emoji + text.substring(end);
      input.focus();
      input.selectionStart = input.selectionEnd = start + emoji.length;
    });

    this.emojiSelector.handleResize();
    // this.emojiSelector.emit('focus', this.emojiSelector);
  }

  connectWebSocket() {
    this.ws = new WebSocket('wss://courselab.lnu.se/message-app/socket');

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
    if (this.messages.length > 50) {
      this.messages.shift();
    }
    // Only save to cache if it's a user message
    if (message.type === 'message' && message.username !== 'System') {
      this.saveCachedMessages();
    }
    this.displayMessage(message);
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
      key: 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd',
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
