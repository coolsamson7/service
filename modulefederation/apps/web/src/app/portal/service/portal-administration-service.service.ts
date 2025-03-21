/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { AbstractHTTPService, Manifest, Service } from "@modulefederation/portal";
import { Address, Application, ApplicationVersion, Microfrontend, MicrofrontendInstance, MicrofrontendVersion } from "../model";
import { MicrofrontendRegistryResult, RegistryResult } from "../model/registry-result.interface";

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

    public registerManifest(manifest : Manifest) : Observable<RegistryResult> {
      return this.post<RegistryResult>(`register-manifest`, manifest)
  }

    public removeMicrofrontend(url : Address) : Observable<any> {
        return this.post<any>('remove-microfrontend', url)
    }

    public saveManifest(manifest : Manifest) : Observable<Manifest> {
        return this.post<Manifest>(`save-manifest`, manifest)
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

  // NEW

  // stage

  readStages() : Observable<string[]>{
    return this.get<any>(`read-stages`)
  }

  // application

  createApplication(application: Application) : Observable<Application>{
    return this.post<Application>(`create-application`, application)
  }

  readApplication(application: String) : Observable<Application> {
    return this.get<Application>(`read-application/${application}`)
  }

  updateApplication(application: Application) : Observable<Application> {
    return this.post<any>(`update-application`, application)
  }

  deleteApplication(application: String) :Observable<any> {
    return this.get<any>(`delete-application/${application}`)
  }

  readApplications() : Observable<Application[]>{
    return this.get<any>(`read-applications`)
  }

  // application version

  createApplicationVersion(application: string, applicationVersion: ApplicationVersion) : Observable<ApplicationVersion> {
      return this.post<ApplicationVersion>(`create-application-version/${application}`, applicationVersion)
  }

  updateApplicationVersion(application: ApplicationVersion) : Observable<ApplicationVersion> {
      return this.post<ApplicationVersion>(`update-application-version`, application)
  }

  deleteApplicationVersion( application: String, version: string) : Observable<any> {
      return this.get<any>(`delete-application-version/${application}/${version}`)
  }

  // microfrontend

  readMicrofrontend(microfrontend: string) : Observable<Microfrontend> {
    return this.get<Microfrontend>(`read-microfrontend/${microfrontend}`)
  }

  readMicrofrontends() : Observable<Microfrontend[]> {
    return this.get<Microfrontend[]>(`read-microfrontends`)
  }

  updateMicrofrontend(microfrontend: Microfrontend) : Observable<Microfrontend> {
      return this.post<Microfrontend>(`update-microfrontend`, microfrontend)
  }

   deleteMicrofrontend( microfrontend: String, force: boolean) : Observable<boolean> {
        return this.get<any>(`delete-microfrontend/${microfrontend}/${force}`)
   }

  // microfrontend versions

  readMicrofrontendVersions() : Observable<MicrofrontendVersion[]>  {
    return this.get<MicrofrontendVersion[]>(`read-microfrontend-versions`)
  }

  readMicrofrontendVersion(microfrontend: string, version: string) : Observable<MicrofrontendVersion>  {
    return this.get<MicrofrontendVersion>(`read-microfrontend-version/${microfrontend}/${version}`)
  }

  updateMicrofrontendVersion(version : MicrofrontendVersion) : Observable<MicrofrontendVersion>  {
    return this.post<MicrofrontendVersion>(`update-microfrontend-version`, version)
  }

  deleteMicrofrontendVersion( microfrontend: String, version : String) : Observable<any> {
    return this.get<any>(`delete-microfrontend-version/${microfrontend}/${version}`)
  }

  // microfrontend instances

  updateMicrofrontendInstance(instance: MicrofrontendInstance) : Observable<MicrofrontendInstance>  {
    return this.post<MicrofrontendInstance>(`update-microfrontend-instance`, instance)
  }

  registerMicrofrontendInstance(manifest: Manifest) : Observable<MicrofrontendRegistryResult>  {
    return this.post<MicrofrontendRegistryResult>(`register-microfrontend-instance`, manifest)
  }

  deleteMicrofrontendInstance( microfrontend: String, version : String, instance : String) : Observable<any> {
    return this.get<any>(`delete-microfrontend-instance/${microfrontend}/${version}/${instance}`)
  }

  // TEST

  computeApplicationVersionConfiguration(application: number) : Observable<any> {
    return this.get<any>(`compute-application-version-configuration/${application}`)
  }
}
