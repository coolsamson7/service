import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { I18nLoader } from "../i18n-loader";
import { Translation, TranslationService } from "../../translation";

@Injectable({providedIn: 'root'})
export class ServerTranslationLoader implements I18nLoader {
    // constructor

    constructor(private translationService: TranslationService) {
    }

    // private

    // implement I18nLoader
    
    loadNamespace(locale : Intl.Locale, namespace : string) : Observable<any> {
        // local function

        const handleTranslations = (namespace: string, translations: Translation[]) => {
            const result = {}

            const findOrCreate = (name: string, folders: any) => {
                let folder = folders[name]

                if (!folder) {
                    folder = {}
                    folders[name] = folder
                }

                return folder
            }

            // create namespace

            const parent = result
            //for ( let leg of namespace.split("."))
            //    parent = findOrCreate(leg, parent)

            // add translations

            for ( const translation of translations) {
                let namespace = parent
                const legs = translation.key.split(".")
                for (let i = 0; i < legs.length - 1; i++)
                    namespace = findOrCreate(legs[i], namespace)

                // @ts-ignore
                namespace[legs[legs.length - 1]] = translation.value
            }

            return result
        }

        // go

        return this.translationService.getTranslations(locale.toString(), namespace)
            .pipe(
                map(translations => handleTranslations(namespace, translations))
            )
    }
}
