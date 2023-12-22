/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { Deployment, Service } from "@modulefederation/portal";
import { AbstractHTTPService } from "@modulefederation/portal";

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
}
