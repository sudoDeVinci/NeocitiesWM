import Environment from './environment.js'
import ChatWindow from './chat.js';
import Window from './window.js';


if (typeof localStorage !== 'undefined') {
  localStorage.setItem('key', 'value');
} else if (typeof sessionStorage !== 'undefined') {
  // Fallback to sessionStorage if localStorage is not supported
  sessionStorage.setItem('key', 'value');
} else {
  // If neither localStorage nor sessionStorage is supported
  console.log('Web Storage is not supported in this environment.');
}


// Clear any existing state if needed
localStorage.removeItem('windowEnvironmentState');

// Create environment with autoRestore true
const env = new Environment(true);

/* Create a chat window
env.createWindow('chat1', 'Chat Window', '', null, null, null, ChatWindow);

env.createWindow(
  'window1',
  'Random Window',
  "<h1>IT'S ALIVE.</h1>",
  400,
  300,
  null,
  Window
);
*/