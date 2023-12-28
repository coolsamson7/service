import { Injectable } from '@angular/core';

import { FormatterRegistry } from './formatter';
import { PlaceholderParser } from './interpolator.parser';
import { LRUCache, StringBuilder } from '../common';

/**
 * @ignore
 */
export interface Format {
    format : string;
    parameters? : { [key : string] : any };
}

/**
 * @ignore
 */
export interface Placeholder {
    name : string;
    format? : Format;
}

/**
 * The service <code>Interpolator</code> is a tiny templating engine that will replace placeholders by real values.
 * The replacements can refer to specific formatters that can respect specific formatting options.
 *
 */
@Injectable({providedIn: 'root'})
export class Interpolator {
    // instance data

    cache : LRUCache<(parameters : any) => string> = new LRUCache();
    useCaching = true;

    // constructor

    constructor(private parser : PlaceholderParser, private formatterRegistry : FormatterRegistry) {
    }

    // private

    interpolate(input : string, parameters : any) : string {
        if (this.useCaching) return this.interpolator(input)(parameters);

        let start = 0;
        let index = input.indexOf('{');
        if (index >= 0) {
            const builder = new StringBuilder();

            while (index >= 0) {
                // add up to first bracket

                builder.append(input.substring(start, index));

                start = index;
                index = input.indexOf('}', index + 1);

                // add bracket

                builder.append(this.interpolatePlaceholder(input.substring(start, index + 1), parameters));

                // next

                start = index + 1;
                index = input.indexOf('{', start);
            } // while

            // add end

            builder.append(input.substring(start));

            // done

            return builder.toString();
        }
        else return input;
    }

    interpolatePlaceholder(input : string, parameters : any) : string {
        const placeholder = this.parser.parse(input);

        return this.formatterRegistry.format(
            placeholder.format!!.format,
            parameters[placeholder.name],
            placeholder.format!!.parameters
        );
    }

    // public

    private interpolator(input : string) : (parameters : any) => string {
        let interpolator = this.cache.get(input);
        if (!interpolator) interpolator = this.cache.put(input, this.compile(input));

        return interpolator;
    }

    private compile(input : string) : (parameters : any) => string {
        const components : any[] = [];

        let start = 0;
        let index = input.indexOf('{');
        if (index >= 0) {
            while (index >= 0) {
                // add up to first bracket

                components.push({start: start, end: index});

                start = index;
                index = input.indexOf('}', index + 1);

                // add bracket

                const placeholder = input.substring(start, index + 1);
                components.push(this.parser.parse(placeholder));

                // next

                start = index + 1;
                index = input.indexOf('{', start);
            } // while

            // add end

            components.push({start: start, end: input.length});
        }
        else {
            components.push({start: 0, end: input.length});
        }

        return (parameters : any) : string => {
            const builder = new StringBuilder();

            for (const element of components) {
                if (element.start !== undefined) builder.append(input.substring(element.start, element.end));
                else {
                    let parameter = parameters[element.name];

                    if (parameter == undefined) throw new Error('unknown parameter ' + element.name);

                    // either we get a literal value of a Format with {value: .. format: parameters...}

                    let type : string;
                    let formatParams = undefined;

                    // supplied format

                    if (parameter.format !== undefined) {
                        type = parameter.format;
                        formatParams = parameter.parameters;
                        parameter = parameter.value;
                    }

                    // from spec
                    else if (element.format) {
                        type = element.format.format;
                        formatParams = element.format.parameters;
                    }

                    // from value
                    else {
                        if (parameter instanceof Date) type = 'date';
                        else type = typeof parameters[element.name]; //
                    }

                    builder.append(this.formatterRegistry.format(type, parameter, formatParams));
                }
            } // for

            return builder.toString();
        };
    }
}
