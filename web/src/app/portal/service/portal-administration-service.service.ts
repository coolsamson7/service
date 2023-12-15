/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { RegisterService } from "../../common/communication/register-service.decorator";
import { AbstractHTTPService } from "../../common/communication/abstract-http-service";

@Injectable({providedIn: 'root'})
@RegisterService({domain: "admin", prefix: "/portal-administration/"})
export class PortalAdministrationService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods
}
