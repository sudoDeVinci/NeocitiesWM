(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();class x{#e={};on(e,t){this.#e[e]||(this.#e[e]=[]),this.#e[e].push(t)}emit(e,t){this.#e[e]&&this.#e[e].forEach(s=>s(t))}}class d extends x{minimizeButton=null;closeButton=null;element=null;id=null;content=null;titleBar=null;titleText=null;contentArea=null;x=100;y=100;isMinimized=!1;isDragging=!1;zIndex=0;height=null;width=null;constructor(e,t){if(super(),this.id=e,this.title=t.title,this.content=t.content,t.savedState){const s=t.savedState;this.width=s.width,this.height=s.height,this.x=s.x,this.y=s.y,this.isMinimized=s.isMinimized,this.zIndex=s.zIndex}else this.width=t.width,this.height=t.height,this.x=Math.min(Math.max(0,Math.random()*(window.innerWidth-this.width-100)),window.innerWidth-this.width-100),this.y=Math.min(Math.max(50,Math.random()*(window.innerHeight-this.height-100)),window.innerHeight-this.height),this.isMinimized=!1,this.background_color=t.styles.background_color||"#FAF9F6",this.titlebar_background_color=t.styles.titlebar_background_color||"#333",this.titlebar_text_color=t.styles.title||"#fff";this.isDragging=!1,this.initialX=0,this.initialY=0,this.initialMouseX=0,this.initialMouseY=0,this.createElement(),this.x=Math.min(Math.max(0,this.x),Math.max(0,window.innerWidth-this.width)),this.y=Math.min(Math.max(0,this.y),Math.max(0,window.innerHeight-this.height)),this.isMinimized&&this.minimize(),window.addEventListener("resize",this.handleResize.bind(this)),this.createResizeHandles()}createElement(){this.element=document.createElement("div"),this.element.className="window",this.element.style.cssText=`
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
      `,this.titleBar=document.createElement("div"),this.titleBar.className="window-title-bar",this.titleBar.style.cssText=`
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
      `,this.titleText=document.createElement("div"),this.titleText.className="window-title-bar-text",this.titleText.textContent=this.title,this.titleBar.appendChild(this.titleText);const e=document.createElement("div");e.style.display="flex",this.minimizeButton=document.createElement("button"),this.minimizeButton.className="window-minimize-button",this.minimizeButton.textContent="−",this.minimizeButton.style.cssText=`
        border: none;
        background: none;
        font-size: 20px;
        font-weight: bolder;
        color: white;
        cursor: pointer;
        padding: 0 5px;
        margin-right: 5px;
      `,this.minimizeButton.onclick=t=>{t.stopPropagation(),this.toggleMinimize()},e.appendChild(this.minimizeButton),this.closeButton=document.createElement("button"),this.closeButton.className="window-close-button",this.closeButton.textContent="×",this.closeButton.style.cssText=`
        border: none;
        background: none;
        font-size: 20px;
        font-weight: bolder;
        color: white;
        cursor: pointer;
        padding: 0 5px;
        margin-right: 5px;
      `,this.closeButton.onclick=t=>{t.stopPropagation(),this.emit("close",this)},e.appendChild(this.closeButton),this.titleBar.appendChild(e),this.contentArea=document.createElement("div"),this.contentArea.className="window-content",this.contentArea.style.cssText=`
        padding: 16px;
        overflow: auto;
        height: calc(100% - 37px);
      `,this.contentArea.innerHTML=this.content,this.titleBar.onmousedown=t=>{t.preventDefault(),this.startDrag(t)},this.element.appendChild(this.titleBar),this.element.appendChild(this.contentArea),this.element.onclick=()=>this.emit("focus",this)}createResizeHandles(){[{cursor:"nwse-resize",position:"top-left",dx:-1,dy:-1},{cursor:"ns-resize",position:"top-center",dx:0,dy:-1},{cursor:"nesw-resize",position:"top-right",dx:1,dy:-1},{cursor:"ew-resize",position:"middle-left",dx:-1,dy:0},{cursor:"ew-resize",position:"middle-right",dx:1,dy:0},{cursor:"nesw-resize",position:"bottom-left",dx:-1,dy:1},{cursor:"ns-resize",position:"bottom-center",dx:0,dy:1},{cursor:"nwse-resize",position:"bottom-right",dx:1,dy:1}].forEach(t=>{const s=document.createElement("div");switch(s.className=`resize-handle resize-${t.position}`,s.style.cssText=`
        position: absolute;
        background: transparent;
        z-index: 10;
        cursor: ${t.cursor};
      `,t.position){case"top-left":s.style.top="-5px",s.style.left="-5px",s.style.width="15px",s.style.height="15px";break;case"top-center":s.style.top="-5px",s.style.left="calc(50% - 5px)",s.style.width="10px",s.style.height="10px";break;case"top-right":s.style.top="-5px",s.style.right="-5px",s.style.width="15px",s.style.height="15px";break;case"middle-left":s.style.top="calc(50% - 5px)",s.style.left="-5px",s.style.width="10px",s.style.height="10px";break;case"middle-right":s.style.top="calc(50% - 5px)",s.style.right="-5px",s.style.width="10px",s.style.height="10px";break;case"bottom-left":s.style.bottom="-5px",s.style.left="-5px",s.style.width="15px",s.style.height="15px";break;case"bottom-center":s.style.bottom="-5px",s.style.left="calc(50% - 5px)",s.style.width="10px",s.style.height="10px";break;case"bottom-right":s.style.bottom="-5px",s.style.right="-5px",s.style.width="15px",s.style.height="15px";break}s.addEventListener("mousedown",i=>this.startResize(i,t.dx,t.dy)),this.element.appendChild(s)})}handleResize(){const e=Math.max(0,window.innerWidth-this.width),t=Math.max(0,window.innerHeight-this.height);this.x=Math.min(this.x,e),this.y=Math.min(this.y,t),this.updatePosition()}startDrag(e){this.isDragging=!0,this.initialX=this.x,this.initialY=this.y,this.initialMouseX=e.clientX,this.initialMouseY=e.clientY,this.emit("dragStart",this)}drag(e){if(!this.isDragging)return;const t=e.clientX-this.initialMouseX,s=e.clientY-this.initialMouseY;let i=this.initialX+t,n=this.initialY+s;i=Math.max(0,Math.min(i,window.innerWidth-this.width)),n=Math.max(0,Math.min(n,window.innerHeight-this.height)),this.x=i,this.y=n,this.updatePosition(),this.emit("drag",this)}dragEnd(){this.isDragging&&(this.isDragging=!1,this.emit("dragEnd",this))}toggleMinimize(){this.isMinimized?this.restore():this.minimize(),this.emit("minimize",this)}minimize(){this.isMinimized=!0,this.element.style.display="none"}restore(){this.isMinimized=!1,this.element.style.display="block"}updatePosition(){this.element.style.left=`${this.x}px`,this.element.style.top=`${this.y}px`}setZIndex(e){this.zIndex=e,this.element.style.zIndex=e}getState(){return{id:this.id,title:this.title,content:this.content,width:this.width,height:this.height,x:this.x,y:this.y,isMinimized:this.isMinimized,zIndex:this.zIndex}}destroy(){this.element.remove()}startResize(e,t,s){e.stopPropagation(),e.preventDefault(),this.isResizing=!0,this.initialWidth=this.width,this.initialHeight=this.height,this.initialX=this.x,this.initialY=this.y,this.initialMouseX=e.clientX,this.initialMouseY=e.clientY,this.resizeDirX=t,this.resizeDirY=s,document.addEventListener("mousemove",this.resize.bind(this)),document.addEventListener("mouseup",this.endResize.bind(this))}resize(e){if(!this.isResizing)return;const t=e.clientX-this.initialMouseX,s=e.clientY-this.initialMouseY;let i=this.initialWidth,n=this.height,o=this.x,r=this.y;this.resizeDirX!==0&&(i=Math.max(200,this.initialWidth+t*this.resizeDirX),this.resizeDirX<0&&(o=this.initialX+(this.initialWidth-i))),this.resizeDirY!==0&&(n=Math.max(100,this.initialHeight+s*this.resizeDirY),this.resizeDirY<0&&(r=this.initialY+(this.initialHeight-n))),o=Math.max(0,Math.min(o,window.innerWidth-i)),r=Math.max(0,Math.min(r,window.innerHeight-n)),this.width=i,this.height=n,this.x=o,this.y=r,this.element.style.width=`${this.width}px`,this.element.style.height=`${this.height}px`,this.updatePosition(),this.contentArea.style.height="calc(100% - 37px)"}endResize(){this.isResizing&&(this.isResizing=!1,document.removeEventListener("mousemove",this.resize),document.removeEventListener("mouseup",this.endResize),this.emit("resize",this))}}class p extends d{constructor(e,t){t.title=`Chat - ${t.channel}`,t.content='<div class="chat-container"></div>',super(e,t),this.username=t.username||this.getUsername(),this.channel=t.channel||"general",this.messages=this.loadCachedMessages()||[],this.setupChatUI(),this.connectWebSocket(),setTimeout(()=>{for(const s of this.messages)s.type==="message"&&this.displayMessage(s)},250),this.senderColor=t.senderColor||localStorage.getItem("senderColor")||"#e3f2fd",this.receiverColor=t.receiverColor||localStorage.getItem("receiverColor")||"#f5f5f5",this.addColorPickers()}loadCachedMessages(){const e=`chat-messages-${this.channel}`,t=localStorage.getItem(e);return t?JSON.parse(t):null}saveCachedMessages(){const e=this.messages.filter(s=>s.type==="message"&&s.username!=="System"),t=`chat-messages-${this.channel}`;localStorage.setItem(t,JSON.stringify(e.slice(-50)))}addColorPickers(){const e=document.createElement("div");e.className="chat-controls",e.innerHTML=`
      <div class="color-pickers">
        <div class="picker-group">
          <label>Your messages:</label>
          <input type="color" id="sender-color" value="${this.senderColor}">
        </div>
        <div class="picker-group">
          <label>Others' messages:</label>
          <input type="color" id="receiver-color" value="${this.receiverColor}">
        </div>
      </div>
    `,this.contentArea.querySelector(".chat-container").prepend(e);const s=e.querySelector("#sender-color"),i=e.querySelector("#receiver-color");s.addEventListener("change",n=>{this.senderColor=n.target.value,localStorage.setItem("senderColor",this.senderColor),this.updateMessageColors()}),i.addEventListener("change",n=>{this.receiverColor=n.target.value,localStorage.setItem("receiverColor",this.receiverColor),this.updateMessageColors()})}updateMessageColors(){this.contentArea.querySelectorAll(".chat-message").forEach(t=>{t.classList.contains("chat-message")&&(t.classList.contains("sent")?t.style.backgroundColor=this.senderColor:t.classList.contains("received")?t.style.backgroundColor=this.receiverColor:t.style.backgroundColor="#f9f9f9")})}updateMessageUsername(e,t){if(!e||!t||e===t)return;localStorage.setItem("chat-username",t),this.messages.forEach(i=>{i.username===e&&(i.username=t)}),this.saveCachedMessages(),this.contentArea.querySelectorAll(".chat-message").forEach(i=>{if(!i.classList.contains("chat-message"))return;const n=i.querySelector(".message-sender");n.textContent===e&&(n.textContent=t)})}setupChatUI(){const e=this.element.querySelector(".chat-container");e.style.cssText=`
      display: flex;
      flex-direction: column;
      max-height: 600px;
      max-width: 100%;
      width:100%;
      overflow-y: auto;
      overflow-x: hidden;
    `,this.messageContainer=document.createElement("div"),this.messageContainer.style.cssText=`
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      background: #f9f9f9;
      margin-bottom: 10px;
      max-height: 350px;
      max-width: 300px;
    `,e.appendChild(this.messageContainer);const t=document.createElement("div");t.style.cssText=`
      flex: 1;
      padding: 10px;
      border-top: 1px solid #ddd;
      background: white;
    `,this.messageInput=document.createElement("textarea"),this.messageInput.style.cssText=`
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: none;
      margin-bottom: 8px;
      max-height: 300px;
      max-width: 250px;
      width: 100%;
    `,this.messageInput.placeholder="Type your message...",this.messageInput.rows=3;const s=document.createElement("button");s.textContent="Send",s.style.cssText=`
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 0rem;
    `,s.onclick=()=>this.sendMessage(),this.messageInput.onkeydown=o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),this.sendMessage())},t.appendChild(this.messageInput),t.appendChild(s),e.appendChild(t);const i=document.createElement("button");i.textContent="😊",i.style.cssText=`
      padding: 8px 16px;
      margin-right: 8px;
      margin-bottpm: 10px;
      background: #f0f0f0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `,i.onclick=()=>this.emit("toggleEmojis",this),t.insertBefore(i,t.lastChild);const n=document.createElement("button");n.textContent="New name",n.style.cssText=`
      padding: 8px 16px;
      margin-right: 8px;
      margin-bottpm: 10px;
      background: #f0f0f0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `,n.onclick=()=>this.changeUsername(),t.insertBefore(n,t.lastChild),this.messageInput=t.querySelector("textarea"),e.scrollTop=e.scrollHeight}parseMessageContent(e){const t=[];let s=0;const i=/```([\s\S]*?)```/g;let n;for(;(n=i.exec(e))!==null;)n.index>s&&t.push({type:"text",content:e.slice(s,n.index)}),t.push({type:"code",content:n[1].trim()}),s=n.index+n[0].length;return s<e.length&&t.push({type:"text",content:e.slice(s)}),t}displayMessage(e){const t=document.createElement("div");let s="#f9f9f9";e.username===this.username?s=this.senderColor:e.username==="System"&&e.username==="The Server"&&(s="#f9f9f9"),t.style.cssText=`
      margin-bottom: 10px;
      padding: 8px;
      border-radius: 4px;
      background: ${s};
      border: 1px solid #ddd;
    `;const i=document.createElement("div");i.className="message-sender",i.style.cssText=`
      padding: 4px 8px;
      max-width: 180px;
      overflow-x: hidden;
      font-weight: bold;
      margin-bottom: 4px;
      color: #666;
    `,i.textContent=e.username,t.appendChild(i);const n=document.createElement("div");this.parseMessageContent(e.data).forEach(l=>{const a=document.createElement("div");l.type==="code"?a.style.cssText=`
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
        `:a.style.cssText=`
          margin: 4px 0;
          line-height: 1.5;
          max-width: 215px;
          overflow-x: hidden;
          overflow-wrap: break-word;
        `,a.textContent=l.content,n.appendChild(a)}),t.className="chat-message",e.username===this.getUsername()?t.classList.add("sent"):e.username==="System"||e.username==="The Server"?t.classList.add("system"):t.classList.add("received"),t.appendChild(n),this.messageContainer.appendChild(t),this.messageContainer.scrollTop=this.messageContainer.scrollHeight;const r=this.element.querySelector(".chat-container");r.scrollTop=r.scrollHeight}initEmojiSelector(){if(!this.emojiSelector)return;const e=this.element.getBoundingClientRect();this.emojiSelector.x=e.right+10,this.emojiSelector.y=e.top,this.emojiSelector.on("emojiSelected",({emoji:t})=>{const s=this.messageInput,i=s.selectionStart,n=s.selectionEnd,o=s.value;s.value=o.substring(0,i)+t+o.substring(n),s.focus(),s.selectionStart=s.selectionEnd=i+t.length}),this.emojiSelector.handleResize()}connectWebSocket(){this.ws=new WebSocket(""),this.ws.onopen=()=>{this.addSystemMessage("Connecting to chat server")},this.ws.onmessage=e=>{const t=JSON.parse(e.data);t.type!=="heartbeat"&&this.addMessage(t)},this.ws.onclose=()=>{this.addSystemMessage("Disconnected from chat server"),setTimeout(()=>this.connectWebSocket(),5e3)}}addMessage(e){this.messages.push(e),this.messages.length>50&&this.messages.shift(),e.type==="message"&&e.username!=="System"&&this.saveCachedMessages(),this.displayMessage(e)}addSystemMessage(e){const t={type:"system",data:e,username:"System"};this.addMessage(t)}sendMessage(){this.ws.readyState!==WebSocket.OPEN&&setTimeout(()=>this.connectWebSocket(),3e3);const e=this.messageInput.value.trim();if(!e)return;const t={type:"message",data:e,username:this.username,channel:this.channel,key:""};this.ws.send(JSON.stringify(t)),this.messageInput.value=""}changeChannel(e){this.channel=e,this.messages=this.loadCachedMessages()||[],this.setupChatUI(),this.addSystemMessage(`Switched to channel: ${e}`),this.connectWebSocket(),setTimeout(()=>{for(const t of this.messages)t.type==="message"&&this.displayMessage(t)},500)}destroy(){this.ws&&this.ws.close();const e=this.username,t=localStorage.getItem("chat-username");t&&e!==t&&(console.log(`name changed from ${e} to ${t}`),this.updateMessageUsername(e,t)),super.destroy()}getUsername(){let e=this.username;return e||(e=localStorage.getItem("chat-username")),e||(e=prompt("Please enter your username:"),e||(e="Anonymous-"+Math.floor(Math.random()*1e3)),localStorage.setItem("chat-username",e)),this.username=e,e}changeUsername(){const e=this.username,t=prompt("Enter new username:");return t&&t!==e&&this.updateMessageUsername(e,t),this.username=t,t}}class u extends d{constructor(e,t){super(e,t),this.categories={Smileys:["😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘"],Gestures:["👍","👎","👌","✌️","🤞","🤜","🤛","👏","🙌","👐","🤲","🤝","🙏"],Heart:["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💔","❣️","💕","💞","💓","💗","💖"],Animals:["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸"],Food:["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍈","🍒","🍑","🥭","🍍","🥥"]},this.setupUI()}setupUI(){this.element.style.overflowY="hidden",this.contentArea.style.overflowY="hidden";const e=document.createElement("div");e.style.cssText=`
      padding: 10px;
      height: 100%;
      overflow-y: auto;
    `;const t=document.createElement("div");t.style.cssText=`
      position: sticky;
      top: 0;
      background: white;
      padding: 5px 0;
      margin-bottom: 10px;
      z-index: 1;
    `;const s=document.createElement("input");s.type="text",s.placeholder="Search emojis...",s.style.cssText=`
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 10px;
      max-width: 325px;
    `,t.appendChild(s),e.appendChild(t),Object.entries(this.categories).forEach(([i,n])=>{const o=document.createElement("div");o.className="emoji-category",o.style.marginBottom="20px";const r=document.createElement("h3");r.textContent=i,r.style.cssText=`
        margin: 0 0 10px 0;
        color: #666;
        font-size: 14px;
      `;const l=document.createElement("div");l.style.cssText=`
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 5px;
      `,n.forEach(a=>{const c=document.createElement("button");c.textContent=a,c.style.cssText=`
          font-size: 20px;
          padding: 5px;
          border: 1px solid #eee;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: #f0f0f0;
          }
        `,c.onclick=()=>{this.emit("emojiSelected",{emoji:a})},l.appendChild(c)}),o.appendChild(r),o.appendChild(l),e.appendChild(o),s.focus()}),s.oninput=i=>{const n=i.target.value.toLowerCase();e.querySelectorAll(".emoji-category").forEach(r=>{const l=r.querySelectorAll("button");let a=!1;l.forEach(c=>{const m=c.textContent.toLowerCase().includes(n);c.style.display=m?"block":"none",m&&(a=!0)}),r.style.display=a?"block":"none"})},this.contentArea.appendChild(e)}}class y{constructor(){this.listeners={}}on(e,t){this.listeners[e]||(this.listeners[e]=[]),this.listeners[e].push(t)}emit(e,t){this.listeners[e]&&this.listeners[e].forEach(s=>s(t))}}class f extends y{#e=null;#s=0;#i=0;#t=!1;#n=null;#o=null;constructor({onComplete:e=null,onReset:t=null,format:s="seconds"}={}){super(),this.#n=e,this.#o=t,this.format=s}start(e){if(!e||e<=0)throw new Error("Duration must be a positive number");if(this.#e!==null)throw new Error("Timer is already running");this.#i=e*1e3,this.#s=this.#i,this.#t=!1,this.#r()}stop(){this.#e&&(clearInterval(this.#e),this.#e=null),this.#s=0,this.#t=!1}reset(e=!1){const t=this.isRunning();this.#e&&(clearInterval(this.#e),this.#e=null),this.#s=this.#i,this.#t=!1,this.#o&&this.#o(this.#i/1e3),(e||t)&&this.#r()}pause(){this.#e&&!this.#t&&(clearInterval(this.#e),this.#e=null,this.#t=!0)}resume(){this.#t&&(this.#t=!1,this.#r())}getTimeRemaining(){return Math.ceil(this.#s/1e3)}getInitialDuration(){return this.#i/1e3}isRunning(){return this.#e!==null&&!this.#t}#r(){this.#e=setInterval(()=>{if(!this.#t){this.#s=Math.max(0,this.#s-100);const e=Math.ceil(this.#s/1e3);this.emit("tick",e),this.#s<=0&&(this.stop(),this.#n&&this.#n())}},100)}}class g extends d{constructor(e,t){super(e,t),this.element.style.boxShadow=t.styles.boxShadow||"0 4px 20px rgba(0,0,0,0.15)",this.element.style.borderRadius=t.styles.borderRadius||"12px",this.element.style.border=t.styles.border||"none",this.titleBar.style.backgroundColor=t.styles.backgroundColor||"#4338ca",this.titleBar.style.borderTopLeftRadius=t.styles.borderTopLeftRadius||"12px",this.titleBar.style.borderTopRightRadius=t.styles.borderTopRightRadius||"12px",this.timer=new f({onComplete:()=>{this.element.style.transition="opacity 0.5s ease-out",this.element.style.opacity="0",setTimeout(()=>this.emit("close",this),500)},format:"seconds"}),this.timer.on("tick",r=>this.updateTitleBarDisplay(r));const s=document.createElement("div");s.style.cssText=`
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 10px;
      text-align: center;
      background: linear-gradient(to bottom, #ffffff, #f7f7f7);
    `;const i=document.createElement("div");i.style.cssText=`
      font-size: 3em;
      margin-bottom: 10px;
    `,i.textContent=this.getAppropriateIcon(content.type);const n=document.createElement("div");n.style.cssText=`
      font-size: 1.25em;
      font-weight: bold;
      color: #374151;
      margin-bottom: 10px;
      line-height: 1.5;
    `,n.innerHTML=this.content,s.appendChild(i),s.appendChild(n),this.contentArea.appendChild(s),this.element.appendChild(this.contentArea),this.timer.start(15)}getAppropriateIcon(e){return e.toLowerCase()==="win"?"🏆":e.toLowerCase()==="time"?"⏰":e.toLowerCase()==="star"?"🌟":e.toLowerCase()==="warning"?"⚠️":"ℹ️"}updateTitleBarDisplay(e){this.titletextdiv=this.titleBar.getElementsByClassName("window-title-bar-text")[0],this.titletextdiv.textContent=`Closing in ${e}s`}}class w{constructor(e,t,s){this.element=document.createElement("div"),this.element.className="desktop-icon",this.image=document.createElement("img"),this.image.src=t,this.image.alt=e,this.label=document.createElement("span"),this.label.textContent=e,this.element.appendChild(this.image),this.element.appendChild(this.label),s&&this.element.addEventListener("dblclick",s),this.element.style.cssText=`
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 80px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.2s;
    `,this.element.addEventListener("mouseenter",()=>{this.element.style.backgroundColor="rgba(255, 255, 255, 0.1)"}),this.element.addEventListener("mouseleave",()=>{this.element.style.backgroundColor="transparent"}),this.image.style.cssText=`
      width: 60px;
      height: 60px;
      margin-bottom: 4px;
      border-radius: 4px;
    `,this.label.style.cssText=`
      color: white;
      text-align: center;
      font-size: 12px;
      text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
      word-wrap: break-word;
      max-width: 76px;
    `}setPosition(e,t){this.element.style.left=`${e}px`,this.element.style.top=`${t}px`}}class b{environment=null;background_color="#FAF9F6";taskbar=null;taskbar_background_color="#333";taskbar_text_color="#fff";windows=null;icons=null;iconContainer=null;constructor(e=!1){this.windows=new Map,this.icons=new Map,this.zIndexBase=1e3,this.currentlyDragging=null,this.username="Anonymous-"+Math.floor(Math.random()*1e3),this.background_color="#FAF9F6",this.taskbar_background_color="#333",this.taskbar_text_color="#fff",this.windowTypes=new Map([[d.name,{width:600,height:400,icon:"",title:"Window",content:"",styles:{},events:{},savedstate:{}}],[p.name,{width:600,height:400,icon:"",title:"Chat",channel:"general",username:"Anonymous",content:"",styles:{},events:{toggleEmojis:()=>this.toggleEmojis(window),usernameChanged:s=>{this.username=s}},savedstate:{}}],[g.name,{width:300,height:200,icon:"",title:"Popup",content:"",styles:{},events:{},savedstate:{}}],[u.name,{width:300,height:400,icon:"",title:"Emojis",content:"",styles:{},events:{},savedstate:{}}]]);const t=document.createElement("link");t.href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap",t.rel="stylesheet",document.head.appendChild(t),this.environment=document.createElement("div"),this.environment.id="window-environment",this.environment.style.cssText=`
      height: 100vh;
      width: 100vw;
      overflow-x: hidden;
      overflow-y: hidden;
      background-color: ${this.background_color};
      `,this.taskbar=document.createElement("div"),this.taskbar.id="taskbar",this.taskbar.style.cssText=`
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
      `,this.iconContainer=document.createElement("div"),this.iconContainer.id="icon-container",this.iconContainer.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 40px);
      z-index: ${this.zIndexBase-1};
      pointer-events: auto;
    `,this.environment.appendChild(this.iconContainer),this.addDefaultTaskbarIcons(),this.addDefaultIcons(),this.onMouseMove=this.onMouseMove.bind(this),this.onMouseUp=this.onMouseUp.bind(this),this.saveState=this.saveState.bind(this),document.addEventListener("mousemove",this.onMouseMove),document.addEventListener("mouseup",this.onMouseUp),window.addEventListener("beforeunload",this.saveState),e&&localStorage.getItem("windowEnvironmentState")&&this.restoreState(),document.body.appendChild(this.environment),this.environment.appendChild(this.taskbar)}addDefaultTaskbarIcons(){const e=this.createTaskbarIcon("Window",d);this.taskbar.appendChild(e);const t=document.createElement("div");t.className="taskbar-item add-app",t.textContent="+",this.taskbar.appendChild(t)}addIcon({title:e,image:t,x:s,y:i,type:n,height:o,width:r,handler:l}){const a=new w(e,t,()=>this.newWindow(n,this.windowTypes.get(n.name)));return a.setPosition(s,i),this.iconContainer.appendChild(a.element),this.icons.set(e,a),a}addDefaultIcons(){[{title:"Chat",image:"images/0.png",x:20,y:80,type:p,height:700,width:350}].forEach(t=>{this.addIcon(t)})}createTaskbarIcon(e,t){const s=document.createElement("div");return s.className="taskbar-item",s.textContent=e,s.onclick=()=>this.newWindow(t,this.windowTypes.get(t.name)),s}pinWindow(e){const t=document.createElement("div");t.className="taskbar-item",t.textContent=e.title,t.onclick=()=>e.toggleMinimize(),this.taskbar.appendChild(t),this.icons.set(e.id,t)}removeWindow(e){this.windows.has(e.id)&&(this.windows.delete(e.id),this.environment.removeChild(e.element),this.taskbar.removeChild(this.icons.get(e.id)),this.icons.delete(e.id),e.destroy(),this.updateZIndices(),this.saveState())}newWindow(e=d,t={}){const s=this.createWindow(crypto.randomUUID(),e,t);this.pinWindow(s),this.bringToFront(s),this.updateZIndices(),this.saveState()}createWindow(e,t=d,s={}){console.log(`Trying to get classname for Window: ${t.name}`);for(const n of this.windowTypes.keys())console.log(`Key: ${n}`);if(this.windows.has(e))return console.error(`Window with id ${e} already exists. Skipping creation.`),this.windows.get(e);if(!this.windowTypes.has(t.name))console.error(`${t.name} class not registered in windowTypes`),t.prototype instanceof d?(console.warn("Window class is a subclass of Window - Registering new Type"),this.windowTypes.set(t,{width:s.width||600,height:s.height||400,title:s.title||"",icon:s.icon||"",styles:s.styles||{},events:s.events||{},savedstate:s.savedstate||{}})):(console.error("Window class is not a subclass of Window - Using default Window class."),t=d);else{const n=this.windowTypes.get(t);for(const o in n)s[o]=s[o]||n[o]}let i=null;return i=new t(e,s),Object.entries(s.events).forEach(([n,o])=>{i.on(n,o)}),i.on("close",()=>this.removeWindow(i)),i.on("focus",()=>this.bringToFront(i)),i.on("dragStart",()=>this.startDragging(i)),i.on("minimize",()=>this.saveState()),i.on("drag",()=>this.saveState()),i.on("dragEnd",()=>this.saveState()),i.on("popup",n=>this.newWindow(`${crypto.randomUUID()}-${e}`,n,g)),this.windows.set(i.id,i),this.environment.appendChild(i.element),this.updateZIndices(),this.saveState(),i}toggleEmojis(e){e.emojiSelector?(e.emojiSelector.emit("close"),e.emojiSelector=null):(e.emojiSelector=this.createWindow(`emoji-${this.id}`,"","",300,400,null,u),e.initEmojiSelector(),this.bringToFront(e.emojiSelector))}bringToFront(e){const t=Array.from(this.windows.values()),s=t.indexOf(e);s!==-1&&(t.splice(s,1),t.push(e),this.windows.clear(),t.forEach(i=>this.windows.set(i.id,i)),this.updateZIndices(),this.saveState())}updateZIndices(){let e=0;this.windows.forEach(t=>{t.setZIndex(this.zIndexBase+e),e++})}startDragging(e){this.currentlyDragging=e,this.bringToFront(e)}onMouseMove(e){this.currentlyDragging&&this.currentlyDragging.drag(e)}onMouseUp(e){this.currentlyDragging&&(this.currentlyDragging.dragEnd(e),this.currentlyDragging=null)}saveState(){const e={windows:Array.from(this.windows.values()).map(t=>({...t.getState(),className:t.constructor.name}))};localStorage.setItem("windowEnvironmentState",JSON.stringify(e))}async restoreState(){try{const e=localStorage.getItem("windowEnvironmentState");if(e){const t=JSON.parse(e);for(const s of t.windows){const i=s.className;this.createWindow(s.id,s.title,s.content,s.width,s.height,s,i)}}}catch(e){console.error("Error restoring window state:",e)}}clearSavedState(){localStorage.removeItem("windowEnvironmentState")}}localStorage.removeItem("windowEnvironmentState");const v=new b(!0);v.clearSavedState();
