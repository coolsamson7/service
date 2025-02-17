import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { AbstractHTTPService, Service } from "@modulefederation/portal";
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
@Service({domain: "workflow", prefix: "/bpmn/runtime/"})
export class RuntimeService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector);
    }

    // methods

    startProcess(processDefinitionKey: string) : Observable<void> {
      return this.get<void>(`start/${processDefinitionKey}`)
    }
} 