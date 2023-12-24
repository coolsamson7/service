import { Injectable, Injector } from "@angular/core";
import { Deployment, DeploymentLoader } from "../deployment";

import { Observable } from "rxjs";
import { AbstractHTTPService, Service } from "../common";
import { SessionManager, Ticket } from "../security";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-administration"})
export class PortalDeploymentService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector);
    }

    // public

    public getDeployment(session : Boolean) : Observable<Deployment> {
        return this.get<Deployment>(`/deployment/${session}`);
    }
}

@Injectable({providedIn: 'root'})
export class HTTPDeploymentLoader extends DeploymentLoader {
    // constructor

    constructor(private deploymentService : PortalDeploymentService, private sessionManager : SessionManager<any, Ticket>) {
        super();
    }

    // implement DeploymentLoader
    load() : Promise<Deployment> {
        // @ts-ignore
        return this.deploymentService.getDeployment(this.sessionManager.hasSession()).toPromise()
    }
}
