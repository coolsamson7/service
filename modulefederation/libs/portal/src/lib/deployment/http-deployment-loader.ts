import { Injectable, Injector } from "@angular/core";
import { Deployment, DeploymentLoader, DeploymentRequest } from "../deployment";

import { Observable } from "rxjs";
import { AbstractHTTPService, Service } from "../common/communication";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-deployment"})
export class PortalDeploymentService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector);
    }

    // public

    public computeDeployment(request: DeploymentRequest) : Observable<Deployment> {
        return this.post<Deployment>(`/compute-deployment`, request)
    }
}

@Injectable({providedIn: 'root'})
export class HTTPDeploymentLoader extends DeploymentLoader {
    // constructor

    constructor(private deploymentService : PortalDeploymentService) {
        super();
    }

    // implement DeploymentLoader

    load(request: DeploymentRequest) : Promise<Deployment> {
        // @ts-ignore
        return this.deploymentService.computeDeployment(request).toPromise()
    }
}
