/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { AbstractHTTPService, Deployment, Service } from "@modulefederation/portal";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-administration/"})
export class PortalDeploymentService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector)
    }

    // public methods

    public getDeployment(session : boolean) : Observable<Deployment> {
        return this.get<Deployment>(`deployment/${session}`)
    }

    public computeDeployment(application: string, version: string, session : boolean) : Observable<Deployment> {
        return this.get<Deployment>(`compute-deployment/${application}/${version}/${session}`)
    }
}
