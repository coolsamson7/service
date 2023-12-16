/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { RegisterService } from "../../common/communication/register-service.decorator";
import { AbstractHTTPService } from "../../common/communication/abstract-http-service";
import { Deployment, Manifest } from "../model";

@Injectable({providedIn: 'root'})
@RegisterService({domain: "admin", prefix: "/portal-administration/"})
export class PortalAdministrationService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods

    public addManifest(url: String) : Observable<Manifest> {
        return this.post<Manifest>(`add-manifest/`, url)
    }

    public removeManifest(url: String) : Observable<Deployment> {
        return this.post<Deployment>(`remove-manifest/`, url)
    }

    public saveManifest(manifest: Manifest) : Observable<Manifest> {
        return this.post<Manifest>(`save-manifest`, manifest)
    }
}
