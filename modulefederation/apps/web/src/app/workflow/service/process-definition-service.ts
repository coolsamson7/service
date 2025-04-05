import { Injectable, Injector } from "@angular/core";
import { AbstractHTTPService, Service } from "@modulefederation/portal";
import { Observable } from 'rxjs';


 export interface PropertyDescriptor {
  name: string,
  type: string,
  constraint: string,
  value?: any
 }

 export interface SchemaDescriptor {
  properties: PropertyDescriptor[]
 }

 export interface TaskSchema {
    process: SchemaDescriptor,
    input: SchemaDescriptor,
    output: SchemaDescriptor,
}
  

 @Injectable({providedIn: 'root'})
 @Service({domain: "admin", prefix: "/process-definition/"})
 export class ProcessDefinitionService extends AbstractHTTPService {
     // constructor
 
     constructor(injector : Injector) {
         super(injector);
     }
 
     // methods


    processSchema(process: String, deployment: number) : Observable<SchemaDescriptor> {
        return this.get<SchemaDescriptor>(`process-schema/${process}/${deployment}`)
    }

    taskInputSchema(process: String, deployment: number, task: String) : Observable<SchemaDescriptor> {
      return this.get<SchemaDescriptor>(`task-input-schema/${process}/${deployment}/${task}`)
    }

    taskSchema(process: String, deployment: number, task: String) : Observable<TaskSchema> {
        return this.get<TaskSchema>(`task-schema/${process}/${deployment}/${task}`)
      }
 } 

