import { Injectable, Injector } from "@angular/core";
import { Deployment, DeploymentLoader } from "../deployment";

import { Observable } from "rxjs";
import { AbstractHTTPService, RegisterService } from "../common";

@Injectable({providedIn: 'root'})
@RegisterService({domain: "admin", prefix: "/portal-administration"})
export class PortalDeploymentService extends AbstractHTTPService {
  // constructor

  constructor(injector : Injector) {
    super(injector);
  }

  // public

  public getDeployment() : Observable<Deployment> {
    return this.get<Deployment>(`/deployment`);
  }
}

@Injectable({providedIn: 'root'})
export class HTTPDeploymentLoader extends DeploymentLoader {
  // constructor

  constructor(private deploymentService: PortalDeploymentService) {
    super();
  }

  // implement DeploymentLoader
  load() : Promise<Deployment> {
    // @ts-ignore
    return this.deploymentService.getDeployment().toPromise()
  }
}
