import { map, Subscription, switchMap } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { Translator } from './translator';
import { Interpolator } from './interpolator';
import { LocaleManager } from '../locale';

/**
 * a pipe that will translate and possibly interpolate any placeholders given the current locale.
 */
@Pipe({
    name: 'translate',
    pure: false // well, too bad....
})
export class TranslatePipe implements PipeTransform {
    // instance data

    private subscription : Subscription | null = null;
    private translated = '';

    // constructor

    constructor(private i18n : Translator, private interpolator : Interpolator, private localeManager : LocaleManager) {
    }

    // implement PipeTransform

    /**
     * @inheritdoc
     */
    transform(key : string, options? : any) : string {
        if (!key) return '- empty key - ';

        this.subscription?.unsubscribe();

        // @ts-ignore
        this.subscription = this.localeManager.locale$
            .pipe(
                switchMap(() => this.i18n.translate$(key)),
                map((translated) => this.interpolate(translated, options))
            )
            .subscribe((translated) => {
                this.translated = translated;
            });

        return this.translated;
    }

    private interpolate(text : string, options : any) {
        return options ? this.interpolator.interpolate(text, options) : text;
    }
}
