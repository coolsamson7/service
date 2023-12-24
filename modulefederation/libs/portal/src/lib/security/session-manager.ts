import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Authentication } from './authentication';
import { SessionListener } from "./session-listener";
import { Session } from "./session.interface";
import { Ticket } from "./ticket.interface";
import { AuthenticationRequest } from "./authentication-request.interface";


/**
 * The session manager is the central service that keeps information on the current session.
 */
@Injectable({providedIn: 'root'})
export class SessionManager<U = any, T extends Ticket = Ticket> {
    // instance data

    private session? : Session<U, T>;
    private listeners : SessionListener<Session<U, T>>[] = [];

    // constructor

    constructor(private authentication : Authentication<U, T>) {
    }

    // public

    login() {
    }

    logout() {
    }

    /**
     * retrieve a session locale value
     * @param key the key
     */
    get<TYPE>(key : string) : TYPE {
        return this.session!![key];
    }

    /**
     * set a session locale value
     * @param key the key
     * @param value the value
     */
    set<TYPE>(key : string, value : TYPE) : void {
        this.session!![key] = value;
    }

    /**
     * add a {@link SessionListener}
     * @param listener the listener
     * @return the unsubscribe function
     */
    addListener(listener : SessionListener<Session<U, T>>) : () => void {
        this.listeners.push(listener);

        return () => {
            this.removeListener(listener);
        };
    }

    /**
     * remove a {@link SessionListener}
     * @param listener the listener
     */
    removeListener(listener : SessionListener<Session<U, T>>) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    /**
     * return <code>true</code>, if there is an active session, <code>false</code> otherwise
     */
    hasSession() : boolean {
        return this.session != undefined;
    }

    /**
     * return the current session
     */
    currentSession() : Session<U, T> {
        return this.session!!;
    }

    /**
     * return the current user.
     */
    getUser() : U {
        return this.session?.user!!;
    }

    /**
     * open a session by delegating to the configured {@link Authentication} object and return the created {@link Session}
     * @param request the request
     */
    openSession(request : AuthenticationRequest) : Observable<Session<U, T>> {
        return this.authentication.authenticate(request)
            .pipe(
                tap((session) => this.setSession(session))
            );
    }

    /**
     * set the current session
     * @param session
     */
    setSession(session : Session<U, T>) {
        // listener

        for (const listener of this.listeners)
            listener.opening(session);

        this.session = session;

        // listener

        for (const listener of this.listeners)
            listener.opened(this.session);
    }

    /**
     * close the active session
     */
    closeSession() : Observable<boolean> {
        if (this.session) {
            const session = this.session;

            for (const listener of this.listeners)
                listener.closing(session);

            this.session = undefined;

            for (const listener of this.listeners)
                listener.closed(session);
        }

        return of(true);
    }
}

@Injectable({providedIn: 'root'})
export class StandardSessionManager<U = any, T extends Ticket = Ticket> extends SessionManager<U, T> {
}
