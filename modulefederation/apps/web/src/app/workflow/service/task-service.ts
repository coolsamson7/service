import { Injectable, Injector } from "@angular/core";
import { Observable } from 'rxjs';
import { AbstractHTTPService, Service } from "@modulefederation/portal";
import { SchemaDescriptor } from "./process-definition-service";

export interface Task {
  id: string,
  processDefinitionId: string,
  processId: string,
  name: string,
  description: string, 
  owner : string,
  assignee: string,
  form: string,

  // set for the form

  process?: any,
  input?: any
  output?: any
  validate?: () => boolean
  finish? : () => void
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
  input: SchemaDescriptor,
  output: SchemaDescriptor
}

export interface TaskOutput {
  process: any
  output: any
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

  completeTask(processDefinition: string, processId: string, id: string, name: string, output: TaskOutput) : Observable<Task[]> {
    return this.post<Task[]>(`/complete/${processDefinition}/${processId}/${id}/${name}`, output)
  }

  taskVariables(task: Task, processVariables: string[]) : Observable<Variables> {
    return this.post<Variables>(`/task-variables/${task.processDefinitionId}/${task.id}/${task.name}`, processVariables)
  }
}
