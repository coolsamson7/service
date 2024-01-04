/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { AbstractHTTPService, Manifest, Service } from "@modulefederation/portal";
import { Address } from "../model";
import { RegistryResult } from "../model/registry-result.interface";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-administration/"})
export class PortalAdministrationService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector)
    }


    // public methods
    public registerMicrofrontend(url : Address) : Observable<RegistryResult> {
        return this.post<RegistryResult>(`register-microfrontend`, url)
    }

    public removeMicrofrontend(url : Address) : Observable<any> {
        return this.post<any>('remove-microfrontend', url)
    }

    public saveManifest(manifest : Manifest) : Observable<Manifest> {
        return this.post<Manifest>(`save-manifest`, manifest)
    }

    public enableMicrofrontend(name : string, enabled : boolean) : Observable<Manifest> {
        return this.get<any>(`enable-microfrontend/${name}/${enabled}`)
    }

    public refresh() : Observable<any> {
        return this.get<any>(`refresh`)
    }

    // TEST TODO

  public throwDeclaredException() : Observable<any> {
    return this.get<any>(`throwDeclared`)
  }

  public throwException() : Observable<any> {
    return this.get<any>(`throw`)
  }

  public callBadURL() : Observable<any> {
    return this.get<any>(`xxx`)
  }


}
