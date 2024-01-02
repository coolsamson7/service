import { Injectable } from '@angular/core';
import { ValueFormatter } from '../value-formatter';
import { LocaleManager } from '../../../locale';
import { Formatter } from "../formatter.decorator";

/**
 * formatting options for dates
 */
export interface DateTimeFormatOptions extends Intl.DateTimeFormatOptions {
    /**
     * an optional locale
     */
    locale? : string;
}

/**
 * formatter for dates according to the Intl.DateTimeFormat
 */
@Formatter('date')
@Injectable({providedIn: 'root'})
export class DateFormatter implements ValueFormatter<Date, DateTimeFormatOptions> {
    // constructor

    constructor(private localeManager : LocaleManager) {
    }

    // implement ValueFormatter

    /**
     * @inheritdoc
     */
    format(value : Date, format : DateTimeFormatOptions) : string {
        if (format?.locale) return new Intl.DateTimeFormat(format.locale, format).format(value);
        else return new Intl.DateTimeFormat(this.localeManager.getLocale().baseName, format).format(value);
    }
}
