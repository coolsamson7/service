import { Injectable } from '@angular/core';
import { FormatOptions, ValueFormatter } from './formatter.interfaces';

/**
 * The <code>FormatterRegistry</code> is the registry for known formatters and the main api for formatting requests.
 */
@Injectable({providedIn: 'root'})
export class FormatterRegistry {
    // instance data

    private registry : { [type : string] : ValueFormatter<any, any> } = {};

    // constructor

    constructor() {
    }

    // public

    /**
     * format a given value.
     * @param type the formatter name
     * @param value the value
     * @param options formatter options
     */
    format(type : string, value : any, options : FormatOptions) : string {
        const formatter = this.registry[type];

        if (formatter) return formatter.format(value, options);
        else throw new Error(`unknown formatter "${type}", did you forget to import the FormatterModule?`);
    }

    /**
     * register a specific formatter
     * @param type the formatter name
     * @param formatter the formatter
     */
    register(type : string, formatter : ValueFormatter<any, any>) {
        this.registry[type] = formatter;
    }
}
