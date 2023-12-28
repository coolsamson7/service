import { Injectable } from '@angular/core';

import { forkJoin, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocaleManager, OnLocaleChange } from '../../locale';
import { AbstractCachingTranslator, MissingTranslationHandler, TranslationTree } from '../translator';
import { I18nLoader } from '../i18n.loader';

/**
 * the {@link DefaultTranslator} is a caching translator that delegates loading requests to a {@link I18nLoader}
 */
@Injectable({providedIn: 'root'})
export class DefaultTranslator extends AbstractCachingTranslator implements OnLocaleChange {
    // instance data

    private locale = new Intl.Locale('en-US');

    // constructor

    constructor(
        private loader : I18nLoader,
        missingTranslationHandler : MissingTranslationHandler,
        localeManager : LocaleManager
    ) {
        super(missingTranslationHandler);

        localeManager.subscribe(this, -1);
    }

    // public

    loadNamespace(namespace : string) : Observable<TranslationTree> {
        return this.loader
            .loadNamespace(this.locale, namespace)
            .pipe(tap((translations) => (this.cachedNamespaces[namespace] = translations)));
    }

    // override

    translate$(key : string) : Observable<string> {
        const {namespace, path} = this.extractNamespace(key);

        const translations = this.cachedNamespaces[namespace];

        if (translations)
            return of(this.get(translations, path) || this.missingTranslationHandler.resolve(key));
        else
            return this.loadNamespace(namespace).pipe(
                map((namespace) => this.get(namespace, path) || this.missingTranslationHandler.resolve(key))
            );
    }

    findTranslationFor$(namespace : string) : Observable<TranslationTree> {
        const translations = this.cachedNamespaces[namespace];
        if (translations) return of(translations);
        else return this.loadNamespace(namespace);
    }

    // implement OnLocaleChange

    /**
     * @inheritdoc
     */
    onLocaleChange(locale : Intl.Locale) : Observable<any> { console.log("######### " + locale.toString());
        this.locale = locale;

        const namespaces = this.cachedNamespaces;
        this.cachedNamespaces = {};

        // reload all namespaces

        return forkJoin(Object.keys(namespaces).map((n) => this.loadNamespace(n)));
    }
}
