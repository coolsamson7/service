/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Jan 05 12:24:44 CET 2024 with typescript V1.0
 */

import { Injectable, Injector } from "@angular/core"

import { Observable } from "rxjs"
import { AbstractHTTPService, Service } from "@modulefederation/portal";
import { UserProfile } from "./user-profile.interface";

@Injectable({providedIn: 'root'})
@Service({domain: "administration", prefix: "/user-administration/"})
export class UserProfileAdministrationService extends AbstractHTTPService {
	// constructor

	constructor(injector: Injector) {
		super(injector)
	}

	// public methods

	public createProfile(user : UserProfile) : Observable<UserProfile> {
		return this.post<UserProfile>(`create-profile`, user)
	}

	public readProfile(id : string) : Observable<UserProfile> {
		return this.get<UserProfile>(`read-profile/${id}`)
	}

	public updateProfile(user : UserProfile) : Observable<UserProfile> {
		return this.post<UserProfile>(`update-profile`, user)
	}
}
