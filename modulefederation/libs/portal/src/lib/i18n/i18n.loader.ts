import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

/**
 * this interface needs to be implemented in order to load i18n values.
 */
@Injectable({providedIn: 'root'})
export abstract class I18nLoader {
    /**
     * load the specified namespace
     * @param locale the requested locale
     * @param namespace the requested namespace
     */
    abstract loadNamespace(locale : Intl.Locale, namespace : string) : Observable<any>;
}
