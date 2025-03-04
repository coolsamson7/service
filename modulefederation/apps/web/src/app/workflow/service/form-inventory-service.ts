/** 
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Wed Feb 19 12:53:14 CET 2025 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Service, AbstractHTTPService } from "@modulefederation/portal"
import { Observable } from "rxjs"


export interface Form {
	id : string,
	deployment : number,
	name : string,
	bpmn: string,
	xml : string
}

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/form/"})
export class FormInventoryService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods

	public create(form : Form) : Observable<Form> {
		return this.post<Form>(`create`, form)
	}

	public deleteForm(id : number) : Observable<void> {
		return this.get<void>(`delete/${id}`)
	}

	public update(form : Form) : Observable<Form> {
		return this.post<Form>(`update`, form)
	}

	public read(id: string, deployment: number, name: string) : Observable<Form> {
		return this.get<Form>(`read/${id}/${deployment}/${name}`)
	}


	public find4Process(id: string, deployment: number, name: string) : Observable<Form> {
		return this.get<Form>(`find-4-process/${id}/${deployment}/${name}`)
	}
}