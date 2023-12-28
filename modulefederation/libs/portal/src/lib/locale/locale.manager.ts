import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, from, mergeMap } from 'rxjs';
import { LocaleConfig, LocaleConfigInjectionToken } from './locale.module';
import { OnLocaleChange } from './translatable.decorator';

/**
 * @ignore
 */
interface Listener {
    onLocaleChange : OnLocaleChange;
    priority : number;
}

/**
 * The <code>LocaleManager</code> keeps track of the current locale as a behavior subject and knwos about the array of supported locales.
 * Interested parties can subscribe to the current value.
 */
@Injectable({providedIn: 'root'})
export class LocaleManager {
    // instance data

    locale$ : BehaviorSubject<Intl.Locale> = new BehaviorSubject<Intl.Locale>(new Intl.Locale('en'));
    supportedLocales : string[];
    listeners : Listener[] = [];
    dirty = false;

    // static methods

    constructor(@Inject(LocaleConfigInjectionToken) configuration : LocaleConfig) {
        this.setLocale(configuration.locale || 'en');
        this.supportedLocales = configuration.supportedLocales ?? [this.getLocale().baseName];

        this.locale$
            .pipe(
                mergeMap((locale) => from(this.getListeners())),
                concatMap((l) => l.onLocaleChange.onLocaleChange(this.locale$.value))
            )
            .subscribe();
    }

    // constructor

    /**
     * return the browser locale
     */
    static getBrowserLocale() : Intl.Locale {
        if (navigator.languages && navigator.languages.length)
            return new Intl.Locale(navigator.languages[0]);  // latest versions of Chrome and Firefox set this correctly

        else { // @ts-ignore
            if (navigator['userLanguage']) { // @ts-ignore
                return new Intl.Locale(navigator['userLanguage']);
            }  // IE only

            else
                return new Intl.Locale(navigator.language);
        } // latest versions of Chrome, Firefox, and Safari set this correctly
    }

    // private

    /**
     * add the specified listener to the list of listeners that will be informed on every locale change.
     * @param onLocaleChange the listener
     * @param priority the priority. Smaller priorities are called earlier.
     */
    subscribe(onLocaleChange : OnLocaleChange, priority : number = 10) : void {
        this.listeners.push({onLocaleChange: onLocaleChange, priority: priority});
        this.dirty = true;
    }

    // public

    /**
     * set the current locale
     * @param locale either  string or a Intl.Locale object
     */
    setLocale(locale : string | Intl.Locale) {
        if (typeof locale == 'string') locale = new Intl.Locale(locale);

        this.locale$.next(locale);
    }

    /**
     * return the current locale
     */
    getLocale() : Intl.Locale {
        return this.locale$.value;
    }

    /**
     * return the list of supported locale codes
     */
    getLocales() : string[] {
        return this.supportedLocales;
    }

    private getListeners() : Listener[] {
        if (this.dirty) {
            this.listeners.sort((a, b) => (a.priority == b.priority ? 0 : a.priority < b.priority ? -1 : 1));
            this.dirty = false;
        }

        return this.listeners;
    }
}
