import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

export interface Task {
  name: string,
  id: string
}

export interface TaskFilter {
  active?: boolean,
  user?: string
}

@Injectable({providedIn: "root"})
export class BPMNTaskService  {
  // constructor

  public constructor(private http: HttpClient) {}

  // methods

  getTasks(filter: TaskFilter) : Observable<Task[]> {
    const base = "http://localhost:8080/bpmn/task/tasks"

    return this.http.post<Task[]>(base, filter)
  }
}
