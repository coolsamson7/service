import { Inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, shareReplay } from 'rxjs/operators';
import { I18nLoader } from '../i18n-loader';
import { TranslationLoaderConfig, TranslationLoaderConfigInjectionToken } from '../i18n.module';
import { TraceLevel, Tracer } from "../../tracer";

/**
 * a {@link I18nLoader} that will load translations form the static assets
 */
@Injectable({providedIn: 'root'})
export class AssetTranslationLoader implements I18nLoader {
    // instance data

    private loading : { [key : string] : Observable<any> } = {};
    private path = '/assets/i18n/';

    // constructor

    constructor(
        @Inject(TranslationLoaderConfigInjectionToken) configuration : TranslationLoaderConfig,
        private http : HttpClient
    ) {
        // @ts-ignore
        this.path = configuration.path;
    }

    // implement I18nLoader

    /**
     * @inheritdoc
     */
    loadNamespace(locale : Intl.Locale, namespace : string) : Observable<any> {
        if (!namespace) {
            return of(null);
        }

        const key = `${locale.baseName}.${namespace}`;
        const loading = this.loading[key];

        if (loading) {
            return loading;
        }
        else {
            if ( Tracer.ENABLED)
                Tracer.Trace("portal.i18n", TraceLevel.MEDIUM, `loading namespace '${namespace}' for locale '${locale.baseName}'`);

            const request = this.http.get(`${this.path}${namespace}/${locale.baseName}.json`).pipe(
                catchError((e) => {
                    console.error(e);
                    return of(key);
                }),
                shareReplay()
            );

            this.loading[key] = request;

            return request;
        }
    }
}
