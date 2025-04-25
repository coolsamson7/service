import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { AbstractHTTPService, Service } from "@modulefederation/portal";
import { Observable } from 'rxjs';

export interface DeploymentDescriptor {
  id: string,
  name: string,
  source: string
}

export interface ProcessDescriptor {
 deployment: string,
 id: string,
 name: string,
 key: string,
 resourceName: string
}

export interface ProcessDefinitionXML {
  xml: string
 }

 export interface PublishResult {
  descriptor?: ProcessDescriptor,
  errors: string[]
 }


 @Injectable({providedIn: 'root'})
 @Service({domain: "workflow", prefix: "/bpmn/administration"})
 export class AdministrationService extends AbstractHTTPService {
     // constructor

     constructor(injector : Injector) {
         super(injector);
     }

     // methods

     getProcessDefinitions() : Observable<ProcessDescriptor[]> {
      return this.get<ProcessDescriptor[]>(`/processes`)
    }

    readProcessDefinition(descriptor: ProcessDescriptor) : Observable<ProcessDefinitionXML> {
      return this.get<ProcessDefinitionXML>(`/read-process-definition/${descriptor.deployment}/${descriptor.resourceName}`)
    }

    updateProcessDefinition(resource: String, xml: string) : Observable<PublishResult> {
      return this.post<PublishResult>(`/update-process-definition/${resource}`, { xml: xml })
    }
 }

