import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export type TranslationTree = any;

/**
 * this interface covers the strategy how missing translation values should appear on screen.
 */
export abstract class MissingTranslationHandler {
    /**
     * return a string that will be shown for the requested i18n key in case of missing translations.
     * @param key the i18n key
     */
    abstract resolve(key : string) : string;
}

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
 * A <code>Translator</code> is repsonsible to load and fetch i18n values given keys that consist of a namespace and a path.
 */
export abstract class Translator {
    /**
     * load a '.' separated namespace and return the complete subtree.
     * @param namespace
     */
    abstract loadNamespace(namespace : string) : Observable<TranslationTree>;

    /**
     * return an observable containing the translated key or the transformed key in case of missing values
     * @param key the translation key
     */
    abstract translate$(key : string) : Observable<string>;

    /**
     * return the i18n value or the transformed key in case of missing values
     * @param key
     */
    abstract translate(key : string) : string;

    /**
     * return an observable containing all values for the specific namespace
     * @param namespace
     */
    abstract findTranslationFor$(namespace : string) : Observable<TranslationTree>;

    /**
     * return all values for the specific namespace, assuming that they have been already loaded
     * @param namespace
     */
    abstract findTranslationFor(namespace : string) : TranslationTree;
}

/**
 * an {@link AbstractCachingTranslator} is an abstract base class for translators that cache loaded translations
 */
export abstract class AbstractCachingTranslator extends Translator {
    // instance data

    protected cachedNamespaces : { [key : string] : any } = {};

    // constructor

    protected constructor(protected missingTranslationHandler : MissingTranslationHandler) {
        super();
    }

    // protected

    /**
     * @inheritdoc
     */
    findTranslationFor(namespace : string) : TranslationTree {
        return this.cachedNamespaces[namespace];
    }

    // private

    // namespace.name.type OR

    /**
     * @inheritdoc
     */
    translate(key : string) : string {
        const {namespace, path} = this.extractNamespace(key);

        const translation = this.get(this.cachedNamespaces[namespace], path);

        // @ts-ignore
        return translation || this.missingTranslationHandler.resolve(key);
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
