/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Wed Dec 27 11:23:47 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { AbstractHTTPService, Service } from "../common/communication"
import { Translation } from "./translation.interface";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-i18n/"})
export class TranslationService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods

	public getTranslations(locale : string, namespace : string) : Observable<Translation[]> {
		return this.get<Translation[]>(`get-translations/${locale}/${namespace}`)
	}
}
