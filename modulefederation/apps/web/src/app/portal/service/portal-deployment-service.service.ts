/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { AbstractHTTPService, Deployment, DeploymentRequest, Service } from "@modulefederation/portal";
import { MicrofrontendInstance } from "../model";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-deployment/"})
export class PortalDeploymentService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector)
    }

    // public methods

    public computeDeployment(request: DeploymentRequest) : Observable<Deployment> {
        return this.post<Deployment>(`compute-deployment`, request)
    }

    public findShellInstances(application: number) : Observable<MicrofrontendInstance[]> {
        return this.get<MicrofrontendInstance[]>(`shell-instances/${application}`)
    }
}
