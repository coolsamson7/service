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

        let handleTranslations = (namespace: string, translations: Translation[]) => {
            console.log(translations)

            let result = {}

            let findOrCreate = (name: string, folders: any) => {
                let folder = folders[name]

                if (!folder) {
                    folder = {}
                    folders[name] = folder
                }

                return folder
            }

            // create namespace

            let parent = result
            //for ( let leg of namespace.split("."))
            //    parent = findOrCreate(leg, parent)

            // add translations

            for ( let translation of translations) {
                let namespace = parent
                let legs = translation.key.split(".")
                for (let i = 0; i < legs.length - 1; i++)
                    namespace = findOrCreate(legs[i], namespace)

                // @ts-ignore
                namespace[legs[legs.length - 1]] = translation.value
            }

            console.log(result)

            return result
        }

        // go

        return this.translationService.getTranslations(locale.toString(), namespace)
            .pipe(
                map(translations => handleTranslations(namespace, translations))
            )
    }
}
