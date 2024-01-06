import { Injectable } from '@angular/core';

import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LocaleManager, OnLocaleChange } from '../locale';
import { Translations, Translator } from './translator';
import { I18nLoader } from './i18n-loader';
import { Interpolator } from "./interpolator";
import { MissingTranslationHandler } from "./missing-translation-handler";

/**
 * The default implementation of a {@link MissingTranslationHandler} that simply wraps the key with '##' around it.
 */
@Injectable({providedIn: 'root'})
export class DefaultMissingTranslationHandler implements MissingTranslationHandler {
  resolve(key : string) : string {
    return `##${key}##`;
  }
}

/**
 * an {@link AbstractCachingTranslator} is an abstract base class for translators that cache loaded translations
 */
export abstract class AbstractCachingTranslator extends Translator {
  // instance data

  protected cachedNamespaces : { [key : string] : any } = {};

  // constructor

  protected constructor(protected missingTranslationHandler : MissingTranslationHandler, private interpolator: Interpolator) {
    super();
  }

  // protected

  /**
   * @inheritdoc
   */
  findTranslationFor(namespace : string) : Translations {
    return this.cachedNamespaces[namespace];
  }

  // private

  protected interpolate(str?: string, options?: any) {
    return str ? options != null ? this.interpolator.interpolate(str!!, options) : str : str
  }

  /**
   * @inheritdoc
   */
  translate(key : string, options: any = null) : string {
    const {namespace, path} = this.extractNamespace(key);

    const translation = this.get(this.cachedNamespaces[namespace], path);

    // @ts-ignore
    return this.interpolate(translation) || this.missingTranslationHandler.resolve(key);
  }

  // implement Translator

  protected isLoaded(namespace : string) : boolean {
    return this.cachedNamespaces[namespace] != undefined;
  }

  // name.space:path.name.type
  protected extractNamespace(key : string) : { namespace : string; path : string } {
    let namespace : string;
    let path : string;
    const colon = key.indexOf(':');
    if (colon > 0) {
      namespace = key.substring(0, colon);
      path = key.substring(colon + 1);
    }
    else {
      // assume that everything but the last 2 is the namespace

      const byDots = key.split('.');

      const type = byDots.pop();
      const name = byDots.pop();

      namespace = byDots.join('.');
      path = `${name}.${type}`;
    }

    return {namespace: namespace, path: path};
  }

  protected get<T>(object : any, key : string, defaultValue : T | undefined = undefined) : T | undefined {
    const path = key.split(".")

    let index = 0
    const length = path.length

    while (object != null && index < length) object = Reflect.get(object, path[index++])

    return index && index == length ? <T>object : defaultValue
  }
}

/**
 * the {@link StandardTranslator} is a caching translator that delegates loading requests to a {@link I18nLoader}
 */
@Injectable({providedIn: 'root'})
export class StandardTranslator extends AbstractCachingTranslator implements OnLocaleChange {
    // instance data

    private locale = new Intl.Locale('en-US');

    // constructor

    constructor(
        private loader : I18nLoader,
        missingTranslationHandler : MissingTranslationHandler,
        interpolator: Interpolator,
        localeManager : LocaleManager
    ) {
        super(missingTranslationHandler, interpolator);

        localeManager.subscribe(this, -1);
    }

    // public

    loadNamespace(namespace : string) : Observable<Translations> {
        return this.loader
            .loadNamespace(this.locale, namespace)
            .pipe(
              catchError((err) => {
                // make sure that we don't end up in an endlsess loop
                this.cachedNamespaces[namespace] = {}
                throw err
              }),
              tap((translations) => (this.cachedNamespaces[namespace] = translations))
            );
    }

    // override

    translate$(key : string, options: any = null) : Observable<string> {
        const {namespace, path} = this.extractNamespace(key);

        const translations = this.cachedNamespaces[namespace];

        if (translations)
            return of(this.interpolate(this.get(translations, path), options) || this.missingTranslationHandler.resolve(key));
        else
            return this.loadNamespace(namespace).pipe(
                map((namespace) => this.interpolate(this.get(namespace, path), options) || this.missingTranslationHandler.resolve(key))
            );
    }

    findTranslationFor$(namespace : string) : Observable<Translations> {
        const translations = this.cachedNamespaces[namespace];
        if (translations) return of(translations);
        else return this.loadNamespace(namespace);
    }

    // implement OnLocaleChange

    /**
     * @inheritdoc
     */
    onLocaleChange(locale : Intl.Locale) : Observable<any> {
        this.locale = locale;

        const namespaces = Object.keys(this.cachedNamespaces);
        this.cachedNamespaces = {};

        // reload all namespaces

        return forkJoin(namespaces.map((namespace) => this.loadNamespace(namespace)));
    }
}
