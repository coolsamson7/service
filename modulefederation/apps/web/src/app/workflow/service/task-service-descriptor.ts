import { Injectable, Injector } from "@angular/core";
import { from, Observable } from 'rxjs';
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
export class TaskDescriptorInventoryService extends AbstractHTTPService {
  // constructor

  constructor(injector : Injector) {
      super(injector);
  }

  // methods

  getTasks() : Observable<ServiceTaskDescriptor[]> {
    return this.get<ServiceTaskDescriptor[]>(`/service-tasks`)
  }
}

@Injectable({providedIn: 'root'})
export class TaskDescriptorService {
  // instance data

  private services : ServiceTaskDescriptor[] | undefined

  // constructor

  constructor(private service : TaskDescriptorInventoryService) {
  }

  // methods

  getTasks() : ServiceTaskDescriptor[] {
    if (!this.services) {
      this.services = []
      this.service.getTasks().subscribe(services => this.services = services)
    }

   
    return this.services
  }
}
