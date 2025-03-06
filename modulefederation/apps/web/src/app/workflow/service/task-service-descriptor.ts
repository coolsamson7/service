import { Injectable, Injector } from "@angular/core";
import { Observable } from 'rxjs';
import { AbstractHTTPService, Service } from "@modulefederation/portal";


export interface ServiceTaskParameter {
  name: string,
  type: string,
  description: string
}

export interface ServiceTaskDescriptor {
  name: string,
  description: string,
  input: ServiceTaskParameter[], 
  output:  ServiceTaskParameter[],
}


@Injectable({providedIn: 'root'})
@Service({domain: "workflow", prefix: "/bpmn/service-task"})
export class TaskDescriptorService extends AbstractHTTPService {
  // constructor

  constructor(injector : Injector) {
      super(injector);
  }

  // methods

  getTasks() : Observable<ServiceTaskDescriptor[]> {
    return this.get<ServiceTaskDescriptor[]>(`/service-tasks`)
  }
}
