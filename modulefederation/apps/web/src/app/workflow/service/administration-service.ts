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

 /*export interface PropertyDescriptor {
  name: string,
  type: string,
  value: any
 }

 export interface SchemaDescriptor {
  properties: PropertyDescriptor[]
 }
*/

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
  
    updateProcessDefinition(resource: String, xml: string) : Observable<ProcessDescriptor> {
      return this.post<ProcessDescriptor>(`/update-process-definition/${resource}`, { xml: xml })
    }

    /*

    processSchema(process: String) : Observable<SchemaDescriptor> {
        return this.get<SchemaDescriptor>(`/process-schema/${process}`)
    }

    taskSchema(process: String, task: String) : Observable<SchemaDescriptor> {
      return this.get<SchemaDescriptor>(`/task-schema/${process}/${task}`)
    }*/
 } 

