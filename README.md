# NeocitiesWM - Neocities Window Manager

## Usage
Set up an environment for the client.

```Javascript
// Create environment with autoRestore true
const env = new Environment(true);
```

## TODO

### Custom Window Types
We want users to be able to create custom window types with custom events emitted and handled by the environment.
- [ ] Environment.NewWindowType(CustomWindowType, events):
    - [ ] Change existing window definitions to accept argument in object form rather than separately.
    - [ ] Change Environment class to track Window Subclass types in a HashMap; keys is the type, value is an object of custom events and their callbacks.

```Javascript
/**
 * Some User-Defined Custom Window Type
 * @extends Window
 * ...
 * @fires CustomWindowType#CustomEvent
 * ...
 */
class CustomWindowType extends Window {
    ...
}

/**
 * Events emitted by the Window Type along w/ the callbacks.
 * @type {object.<string, Array<Function>>}
 */
event = {
    'event': [() => {}, ()=>{}, ...]
}

Environment.NewWindowType(CustomWindowType, events)
``` 

### Styling Window Types
We want to make dynamically styling elements easier for a user.
All managed elements are constructed from discrete layered elements that can be individually accessed and styled.

#### Windows

![Example](/public/images/window.png)


#### Environment

![Example](/public/images/environment.png)


#### TaskBar
