import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

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

@Injectable({providedIn: "root"})
export class BPMNAdministrationService  {
  // constructor

  public constructor(private http: HttpClient) {}

  // methods

  getProcessDefinitions() : Observable<ProcessDescriptor[]> {
    const base = "http://localhost:8080/bpmn/administration/processes"
    return this.http.get<ProcessDescriptor[]>(base)
  }

  readProcessDefinition(descriptor: ProcessDescriptor) : Observable<ProcessDefinitionXML> {
    const base = `http://localhost:8080/bpmn/administration/read-process-definition/${descriptor.deployment}/${descriptor.resourceName}`

    return this.http.get<ProcessDefinitionXML>(base)
  }

  //@PostMapping("update-process-definition/{deployment}/{resourceName}")
  //fun updateProcessDefinition(@PathVariable  deployment: String, @PathVariable resourceName: String, @RequestBody xml: String) {

  updateProcessDefinition(descriptor: ProcessDescriptor, xml: string) : Observable<void> {
    const base = `http://localhost:8080/bpmn/administration/update-process-definition/${descriptor.deployment}/${descriptor.resourceName}`

    return this.http.post<void>(base, { xml: xml })
  }
}
