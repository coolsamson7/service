/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { Deployment } from "../model/deployment.interface"
import { Service } from "../../common/communication/register-service.decorator";
import { AbstractHTTPService } from "../../common/communication/abstract-http-service";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-administration/"})
export class PortalDeploymentService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods

	public getDeployment() : Observable<Deployment> {
		return this.get<Deployment>(`deployment`)
	}
}
