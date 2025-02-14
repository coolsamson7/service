import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';


@Injectable({providedIn: "root"})
export class BPMNRuntimeService  {
  // constructor

  public constructor(private http: HttpClient) {}

  // methods

  startProcess(processDefinitionKey: string) : Observable<void> {
    const base = `http://localhost:8080/bpmn/runtime/start/${processDefinitionKey}`

    return this.http.get<void>(base)
  }
}
