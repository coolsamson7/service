import { Injectable, Injector } from "@angular/core";
import { Deployment, DeploymentLoader } from "../deployment";

import { Observable } from "rxjs";
import { AbstractHTTPService, Service } from "../common/communication";
import { SessionManager, Ticket } from "../security";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-administration"})
export class PortalDeploymentService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector);
    }

    // public

    public getDeployment(name: string, version: string, session : boolean) : Observable<Deployment> {
        return this.computeDeployment(name, version, session)
        //return this.get<Deployment>(`/deployment/${session}`);
    }

    public computeDeployment(application: string, version: string, session : boolean) : Observable<Deployment> {
        return this.get<Deployment>(`/compute-deployment/${application}/${version}/${session}`)
    }
}

@Injectable({providedIn: 'root'})
export class HTTPDeploymentLoader extends DeploymentLoader {
    // constructor

    constructor(private deploymentService : PortalDeploymentService, private sessionManager : SessionManager<any, Ticket>) {
        super();
    }

    // implement DeploymentLoader

    load(name: string, version: string) : Promise<Deployment> {
        // @ts-ignore
        return this.deploymentService.getDeployment(name, version, this.sessionManager.hasSession()).toPromise()
    }
}
