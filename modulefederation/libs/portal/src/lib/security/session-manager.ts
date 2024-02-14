import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Authentication } from './authentication';
import { Session } from "./session.interface";
import { Ticket } from "./ticket.interface";
import { AuthenticationRequest } from "./authentication-request.interface";
import { Tracer, TraceLevel } from '../tracer';

export interface SessionEvent<U=any,T extends Ticket = Ticket> {
    type: "opening" | "opened" | "closing" | "closed"
    session: Session<U,T> 
}

/**
 * The session manager is the central service that keeps information on the current session.
 */
@Injectable({providedIn: 'root'})
export class SessionManager<U = any, T extends Ticket = Ticket> {
    // instance data

    public ready$ = new ReplaySubject<boolean>();
    public authenticated$ = new BehaviorSubject<boolean>(false);
    public session$ = new BehaviorSubject<Session<any,Ticket> | undefined>(undefined);
    public events$ = new Subject<SessionEvent<any,Ticket>>();

    private session? : Session<U, T>;

    // constructor

    constructor(private authentication : Authentication<U, T>) {
    }

    // public

    start() {
        if ( Tracer.ENABLED)
           Tracer.Trace("session", TraceLevel.HIGH, "start")

        this.ready$.next(true)
    }

    login() {
        // noop
    }

    logout() {
        // noop
    }

    /**
     * retrieve a session locale value
     * @param key the key
     */
    get<TYPE>(key : string) : TYPE {
        return this.session![key];
    }

    /**
     * set a session locale value
     * @param key the key
     * @param value the value
     */
    set<TYPE>(key : string, value : TYPE) : void {
        this.session![key] = value;
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
        return this.session!;
    }

    /**
     * return the current user.
     */
    getUser() : U {
        return this.session?.user!;
    }

    /**
     * open a session by delegating to the configured {@link Authentication} object and return the created {@link Session}
     * @param request the request
     */
    openSession(request : AuthenticationRequest) : Observable<Session<U, T>> {
        if ( Tracer.ENABLED)
           Tracer.Trace("session", TraceLevel.HIGH, "open session")

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
        if ( Tracer.ENABLED)
           Tracer.Trace("session", TraceLevel.HIGH, "set session")

        this.authenticated$.next(true)

        // listener

        this.events$.next({
            type: "opening",
            session: session
        })

        this.session$.next(this.session = session)

        // listener

        this.events$.next({
            type: "opened",
            session: session
        })
    }

    /**
     * close the active session
     */
    closeSession() : Observable<boolean> {
        if ( Tracer.ENABLED)
           Tracer.Trace("session", TraceLevel.HIGH, "close session")

        if (this.session) {
            const session = this.session;

            this.events$.next({
                type: "closing",
                session: session
            })

            this.session$.next(this.session = undefined)

            this.authenticated$.next(false)

            this.events$.next({
                type: "closed",
                session: session
            })
        }

        return of(true);
    }
}

@Injectable({providedIn: 'root'})
export class StandardSessionManager<U = any, T extends Ticket = Ticket> extends SessionManager<U, T> {
}
