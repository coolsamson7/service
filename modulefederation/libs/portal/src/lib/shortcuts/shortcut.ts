/**
 * @ignore
 */
export interface Key {
    keyCode : number;
    alt : boolean;
    ctrl : boolean;
    shift : boolean;
    meta : boolean;
}

/**
 * A <code>Shortcut</code> includes the shortcut and the desired callback.
 */
export interface Shortcut {
    /**
     * the shortcut as a string which is a '+' separated value consisting of key names ( numbers, characters, or special keys like 'delete' )  or modifiers ( 'alt', 'ctrl', 'shift', 'meta' )
     * Example: 'ctrl + e'. In addition to key names it is also possible to include keycodes such as 'key:13'
     */
    shortcut : string;

    /**
     * optional function property that controls, if a short should be handled or not ( depending on focus, etc. )
     */
    handles? : (event : KeyboardEvent) => boolean;
    /**
     * internal representation of the parsed shortcut.
     */
    keys? : Key;
    /**
     * the callback function.
     */
    onShortcut : () => void;
}
