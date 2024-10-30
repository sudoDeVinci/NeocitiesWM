# NeocitiesWM - Neocities Window Manager

## Usage

Set up an environment for the client.

```Javascript
// Create environment with autoRestore true
const env = new Environment(true);
```

The one argument is whether the environment state is automatically saved and restored on theclient's side.

To create a window, use the ```.createWindow``` method. We pass the following to the method:
- id 
- title 
- content 
- width 
- height
- window-type

width, height and window-type have simple defaults. The final argument, window-type, let's us pass any object class we make which inherits the Window class. If left blank/null, this default to the base window class.

