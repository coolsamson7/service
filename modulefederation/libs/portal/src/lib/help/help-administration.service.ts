/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Wed Dec 27 11:23:47 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { AbstractHTTPService, Service } from "../common/communication"

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/help-administration/"})
export class HelpAdministrationService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods

	public readEntries() : Observable<string[]> {
		return this.get<string[]>(`read-entries/`)
	}

	public saveHelp(feature : string, help : string) : Observable<any> {
		return this.post<string>(`save-help/${feature}`, help)
	}

	public deleteHelp(feature : string) : Observable<any> {
		return this.get<string>(`delete-help/${feature}`)
	}

	public readHelp(feature : string) : Observable<string> {
  		return this.get<string>(`read-help/${feature}`)
  	}
}
