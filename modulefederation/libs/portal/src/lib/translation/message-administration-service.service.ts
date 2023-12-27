/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Wed Dec 27 11:23:47 CET 2023 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"
import { Observable } from "rxjs"
import { Message } from "./message.interface"
import { AbstractHTTPService, Service } from "../common/communication"
import { MessageChanges } from "./message-changes.interface";

@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/portal-messages/"})
export class MessageAdministrationService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods

    public createMessage(message : Message) : Observable<void> {
        return this.post<void>(`create-message`, message)
    }

    public deleteMessage(id : number) : Observable<void> {
        return this.get<void>(`delete-message/${id}`)
    }

    public readMessages(namespace : string, locale : string) : Observable<Message[]> {
        return this.get<Message[]>(`read-messages/${namespace}/${locale}`)
    }

    public readAllMessages(namespace : string) : Observable<Message[]> {
        return this.get<Message[]>(`read-all-messages/${namespace}`)
    }

    public updateMessage(message : Message) : Observable<void> {
        return this.post<void>(`update-message`, message)
    }

    public readNamespaces() : Observable<string[]> {
        return this.get<string[]>(`read-namespaces`)
    }

    public readLocales() : Observable<string[]> {
        return this.get<string[]>(`read-locales`)
    }

    public saveChanges(changes: MessageChanges) : Observable<Message[]> {
        return this.post<Message[]>(`save-changes`, changes)
    }
}
