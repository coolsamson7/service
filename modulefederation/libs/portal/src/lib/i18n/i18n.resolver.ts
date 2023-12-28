import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Translator } from './translator';

/**
 * this resolver will make sure that all necessary feature i18n namespaces are loaded upfront.
 */
@Injectable({
    providedIn: 'root'
})
export class I18nResolver implements Resolve<Observable<any>> {
    // constructor

    constructor(private translator : Translator) {
    }

    // implement Resolve

    /**
     * @inheritdoc
     */
    resolve(route : ActivatedRouteSnapshot) : Observable<any> { // TODO
        /*if (route.data.metadata.i18n?.length) {
          return forkJoin(route.data.metadata.i18n.map((namespace) => this.translator.loadNamespace(namespace)));
        }
        else {*/
        return of(true);
        //}
    }
}
