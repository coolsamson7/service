import { Injectable } from '@angular/core';
import { Formatter } from '../formatter.decorator';
import { FormatOptions, ValueFormatter } from '../value-formatter';
import { LocaleManager } from '../../../locale';

type StringFormatOptions = FormatOptions;

/**
 * formatter for strings
 */
@Formatter('string')
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
