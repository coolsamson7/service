import { Injectable, Injector } from "@angular/core";
import { Observable } from 'rxjs';
import { AbstractHTTPService, Service } from "@modulefederation/portal";
import { SchemaDescriptor } from "./process-definition-service";

export interface Task {
  id: string,
  processId: string,
  name: string,
  description: string, 
  owner : string,
  assignee: string,
  form: string
}

export interface TaskFilter {
  active?: boolean,
  user?: string
  assigned?: boolean,
  unassigned?: boolean,
  assignee?: string
}

export interface Variables {
  process: SchemaDescriptor,
  input: SchemaDescriptor
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

  claimTask(id: string, user: string) : Observable<Task[]> {
    return this.get<Task[]>(`/claim/${id}/${user}`)
  }

  completeTask(id: string) : Observable<Task[]> {
    return this.get<Task[]>(`/complete/${id}`)
  }

  taskVariables(task: Task) : Observable<Variables> {
    return this.get<Variables>(`/task-variables/${task.processId}/${task.id}/${task.name}`)
  }
}
