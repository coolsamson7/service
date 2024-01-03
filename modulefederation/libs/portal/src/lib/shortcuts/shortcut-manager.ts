import { Injectable } from '@angular/core';
import { Key, Shortcut } from './shortcut';
import { TraceLevel, Tracer } from '../tracer';
import { StringBuilder } from '../common';

/**
 * @ignore
 */
declare type ShortcutArray = Shortcut[];

/**
 * @ignore
 */
const COMMON_KEY_CODES = {
    delete: 8,
    tab: 9,
    enter: 13,
    return: 13,
    esc: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    ';': 186,
    '=': 187,
    ',': 188,
    '-': 189,
    '.': 190,
    '/': 191,
    '`': 192,
    '[': 219,
    '\\': 220,
    ']': 221,
    "'": 222,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123
};

/**
 * A <code>ShortcutManager</code> manages shortcuts and is able to dispatch key events accordingly.
 * Internally shortcuts are stacked, since modal dialogs introduce new "layers" with possibly local shortcuts!
 */
@Injectable({providedIn: 'root'})
export class ShortcutManager {
    // instance data

    private currentShortcuts : ShortcutArray | undefined = undefined;
    private shortcuts : ShortcutArray[] = [];
    private char2code : { [char : string] : number } = COMMON_KEY_CODES;

    // constructor

    constructor(private tracer : Tracer) {
        this.setupCharKeyCodes();

        // first level is active

        this.pushLevel();
    }

    // public

    /**
     * register a shortcut
     * @param shortcut the shortcut
     * @see unregister
     */
    public register(shortcut : Shortcut) : (() => void) | undefined {
        if (Tracer.ENABLED) this.tracer.trace('portal', TraceLevel.HIGH, 'register shortcut {0}', shortcut.shortcut);

        shortcut.keys = this.toKey(shortcut.shortcut);

        // Be lenient

        if (!shortcut.keys) return undefined;

        // append shortcut to highest layer

        this.currentShortcuts!!.push(shortcut);

        return () => {
            this.unregister(shortcut);
        };
    }

    /**
     * unregister a shortcut
     * @param shortcut the specific shortcut
     * @see Shortcut
     */
    public unregister(shortcut : Shortcut) : void {
        const index = this.currentShortcuts!!.indexOf(shortcut);
        if (index >= 0) this.currentShortcuts!!.splice(index, 1);
    }

    /**
     * push another layer of shortcuts
     */
    public pushLevel() : void {
        if (Tracer.ENABLED) this.tracer.trace('portal', TraceLevel.HIGH, 'push shortcut level');

        this.shortcuts.push((this.currentShortcuts = []));
    }

    /**
     * pop the current shortcut layer
     */
    public popLevel() : void {
        if (Tracer.ENABLED) this.tracer.trace('portal', TraceLevel.HIGH, 'pop shortcut level');

        this.shortcuts.splice(this.shortcuts.length - 1, 1);
        this.currentShortcuts = this.shortcuts.length > 0 ? this.shortcuts[this.shortcuts.length - 1] : undefined;
    }

    // public

    /**
     * handle a keydown event by searching the current shortcut layer and possibly executing the found callback.
     * @param event the keyboard event
     */
    public handleKeydown(event : KeyboardEvent) : void {
        if (!this.shouldHandle(event)) return;

        // local function

        const toString = (key : Key) : string => {
            //keyCode: number;

            const builder = new StringBuilder();

            if (key.alt) builder.append('alt + ');
            if (key.ctrl) builder.append('ctrl + ');
            if (key.shift) builder.append('shift + ');
            if (key.meta) builder.append('meta + ');

            builder.append(this.code2Char(key.keyCode));

            return builder.toString();
        };

        const toKey = (e : KeyboardEvent) : Key => {
            return {
                keyCode: e.keyCode,
                meta: e.metaKey || false,
                alt: e.altKey || false,
                ctrl: e.ctrlKey || false,
                shift: e.shiftKey || false
            };
        };

        const match = (k1 : Key, k2 : Key) : boolean => {
            return (
                k1.keyCode === k2.keyCode &&
                k1.ctrl === k2.ctrl &&
                k1.alt === k2.alt &&
                k1.meta === k2.meta &&
                k1.shift === k2.shift
            );
        };

        const key = toKey(event);

        if (Tracer.ENABLED) this.tracer.trace('portal', TraceLevel.HIGH, 'check for shortcut {0}', toString(key));

        const shortCuts = this.currentShortcuts!!.filter((shortcut) => match(key, shortcut.keys!!));

        for (const shortCut of shortCuts) {
            if (!shortCut.handles || shortCut.handles(event)) {
                if (Tracer.ENABLED)
                    this.tracer.trace('views', TraceLevel.HIGH, 'execute shortcut {0}', toString(shortCut.keys!!));

                event.preventDefault();

                shortCut.onShortcut(); // yipeee
                return;
            }
        }
    }

    // private

    private code2Char(code : number) : string {
        const key = Object.keys(this.char2code).find((key) => this.char2code[key] == code);
        return key ? key : code.toString();
    }

    private shouldHandle(event : KeyboardEvent) : boolean {
        // @ts-ignore
        return event.keyCode && this.currentShortcuts.length > 0;
    }

    private setupCharKeyCodes() {
        // local function

        // @ts-ignore
        const map = (char2code, keys, initialCode) => {
            for (let i = 0; i < keys.length; i++) char2code[keys[i]] = initialCode + i;
        };

        // fill codes for numbers and characters

        map(this.char2code, '1234567890', 49); // numbers
        map(this.char2code, 'abcdefghijklmnopqrstuvwxyz', 65); // characters
    }

    // will accept 'ctrl+meta+e', 'ctrl+key:16', ...
    private toKey(shortCut : string) : Key | undefined {
        const modifierKeys = {
            shift: 'shift',
            ctrl: 'ctrl',
            meta: 'meta',
            alt: 'alt'
        };

        const keys : any = {
            shift: false,
            ctrl: false,
            meta: false,
            alt: false
        };

        // default modifiers to unset.

        for (let name of shortCut.split('+')) {
            name = name.trim().toLowerCase();

            // @ts-ignore
            const modifierKey = modifierKeys[name];

            if (modifierKey) keys[modifierKey] = true;
            else {
                if (name.indexOf('key:') >= 0) keys.keyCode = parseInt(name.replace('key:', ''));
                else keys.keyCode = this.char2code[name];

                // in case someone tries for a weird key.

                if (!keys.keyCode) return undefined;
            }
        }

        return keys;
    }
}
