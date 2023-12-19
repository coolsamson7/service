import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Authentication } from './authentication';
import { SessionListener } from "./session-listener";
import { Session } from "./session.interface";
import { User } from "./user.interface";
import { Ticket } from "./ticket.interface";
import { AuthenticationRequest } from "./authentication-request.interface";



/**
 * The session manager is the central service that keeps information on the current session.
 */
@Injectable({ providedIn: 'root' })
export class SessionManager {
  // instance data

  private session?: Session<User, Ticket>;
  private listeners: SessionListener[] = [];

  // constructor

  constructor(private authentication: Authentication<User, Ticket>) {
  }

  // private

  // public

  /**
   * retrieve a session locale value
   * @param key the key
   */
  get<T>(key: string): T {
    return this.session!![key];
  }

  /**
   * set a session locale value
   * @param key the key
   * @param value the value
   */
  set<T>(key: string, value: T): void {
    this.session!![key] = value;
  }

  /**
   * add a {@link SessionListener}
   * @param listener the listener
   * @return the unsubscribe function
   */
  addListener(listener: SessionListener) : () => void {
    this.listeners.push(listener);

    return () => {
      this.removeListener(listener);
    };
  }

  /**
   * remove a {@link SessionListener}
   * @param listener the listener
   */
  removeListener(listener: SessionListener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }

  /**
   * return <code>true</code>, if there is an active session, <code>false</code> otherwise
   */
  hasSession(): boolean {
    return this.session != undefined;
  }

  /**
   * return the current session
   */
  currentSession(): Session<User, Ticket> {
    return this.session!!;
  }

  /**
   * return the current user.
   */
  getUser(): User {
    return this.session?.user!!;
  }

  /**
   * open a session by delegating to the configured {@link Authentication} object and return the created {@link Session}
   * @param request the request
   */
  openSession(request: AuthenticationRequest): Observable<Session<User, Ticket>> {
    return this.authentication.authenticate(request).pipe(
      tap((session) => {
        for (const listener of this.listeners)
            listener.opening(this.session!!);

        this.session = session;

        for (const listener of this.listeners)
            listener.opened(this.session);
      })
    );
  }

  /**
   * close the active session
   */
  closeSession(): Observable<boolean> {
    if (this.session) {
      const session = this.session;

      for (const listener of this.listeners) listener.closing(session);

      this.session = undefined;

      for (const listener of this.listeners) listener.closed(session);
    }

    return of(true);
  }
}
