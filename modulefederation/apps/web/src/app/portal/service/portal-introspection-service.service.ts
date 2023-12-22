/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"

import { Manifest } from "../model";
import { AbstractHTTPService, Service } from "@modulefederation/portal";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-introspection/"})
export class PortalIntrospectionService extends AbstractHTTPService {
  // constructor

  constructor(injector : Injector) {
    super(injector)
  }

  // public methods

  public getManifests() : Observable<Manifest[]> {
    return this.get<Manifest[]>(`manifests`)
  }
}
