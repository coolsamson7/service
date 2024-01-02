import { Injectable } from '@angular/core';
import { Formatter } from '../formatter.decorator';
import { ValueFormatter } from '../value-formatter';
import { LocaleManager } from '../../../locale';

/**
 * formatting options for numbers
 */
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
    /**
     * an optional locale
     */
    locale? : string;
}

/**
 * formatter for numbers
 */
@Formatter('number')
@Injectable({providedIn: 'root'})
export class NumberFormatter implements ValueFormatter<number, NumberFormatOptions> {
    // constructor

    constructor(private localeManager : LocaleManager) {
    }

    // implement ValueFormatter

    /**
     * @inheritdoc
     */
    format(value : number, format : NumberFormatOptions) : string {
        if (format?.locale) return new Intl.NumberFormat(format.locale, format).format(value);
        else return new Intl.NumberFormat(this.localeManager.getLocale().baseName, format).format(value);
    }
}
