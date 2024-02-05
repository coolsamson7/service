import { Observable } from 'rxjs';

export type Translations = any;

/**
 * A <code>Translator</code> is repsonsible to load and fetch i18n values given keys that consist of a namespace and a path.
 */
export abstract class Translator {
    /**
     * load a '.' separated namespace and return the complete subtree.
     * @param namespace
     */
    abstract loadNamespace(namespace : string) : Observable<Translations>;

    /**
     * return an observable containing the translated key or the transformed key in case of missing values
     * @param key the translation key
     * @param options interpolator options
     */
    abstract translate$(key : string, options?: any) : Observable<string>;

    /**
     * return the i18n value or the transformed key in case of missing values
     * @param key
     * @param options interpolator options
     */
    abstract translate(key : string, options?: any) : string;

    /**
     * return an observable containing all values for the specific namespace
     * @param namespace
     */
    abstract findTranslationsFor$(namespace : string) : Observable<Translations>;

    /**
     * return all values for the specific namespace, assuming that they have been already loaded
     * @param namespace
     */
    abstract findTranslationsFor(namespace : string) : Translations;

    abstract hasTranslationsFor$(key : string) : Observable<boolean>
}
