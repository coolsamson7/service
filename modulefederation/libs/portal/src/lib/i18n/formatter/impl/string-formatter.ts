import { Injectable } from '@angular/core';
import { RegisterFormatter } from '../register-formatter.decorator';
import { FormatOptions, ValueFormatter } from '../formatter.interfaces';
import { LocaleManager } from '../../../locale';

type StringFormatOptions = FormatOptions;

/**npm start
 * formatter for strings
 */
@RegisterFormatter('string')
@Injectable({providedIn: 'root'})
export class StringFormatter implements ValueFormatter<string, StringFormatOptions> {
    // constructor

    constructor(private localeManager : LocaleManager) {
    }

    // implement ValueFormatter

    /**
     * @inheritdoc
     */
    format(value : string, format : StringFormatOptions) : string {
        return value;
    }
}
