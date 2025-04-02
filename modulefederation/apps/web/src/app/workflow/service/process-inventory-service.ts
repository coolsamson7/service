/** 
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Wed Feb 19 12:53:14 CET 2025 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Service, AbstractHTTPService } from "@modulefederation/portal"
import { Observable } from "rxjs"
import { Form } from "./form-inventory-service"


export interface Process {
	deployment : number,
	id : string,
	name : string,
    bpmn : string,
	xml : string,
    forms: Form[]
}

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/process/"})
export class ProcessInventoryService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods

	public create(name : string, xml : string) : Observable<Process> {
		return this.post<Process>(`create/${name}`, xml)
	}

	public deleteProcess(id : string, deployment: number) : Observable<void> {
		return this.get<void>(`delete/${id}/${deployment}`)
	}

	public publish(id : string, deployment : number, bpmn : string) : Observable<Process> {
		return this.get<Process>(`publish/${id}/${deployment}/${bpmn}`)
	}

	public update(process : Process) : Observable<Process> {
		return this.post<Process>(`update`, process)
	}

	public read(id : string, deployment : number) : Observable<Process> {
		return this.get<Process>(`read/${id}/${deployment}`)
	}

	public readAll() : Observable<Process[]> {
		return this.get<Process[]>(`read-all`)
	}
}
