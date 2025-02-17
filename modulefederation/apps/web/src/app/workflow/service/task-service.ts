import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Observable } from 'rxjs';
import { AbstractHTTPService, Service } from "@modulefederation/portal";

export interface Task {
  name: string,
  id: string
}

export interface TaskFilter {
  active?: boolean,
  user?: string
}

@Injectable({providedIn: 'root'})
@Service({domain: "workflow", prefix: "/bpmn/task"})
export class TaskService extends AbstractHTTPService {
  // constructor

  constructor(injector : Injector) {
      super(injector);
  }

  // methods

  getTasks(filter: TaskFilter) : Observable<Task[]> {
    return this.post<Task[]>("/tasks", filter)
  }
}