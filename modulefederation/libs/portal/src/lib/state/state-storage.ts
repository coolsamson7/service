import { Injectable } from "@angular/core";
import { Session } from "../security";
import { TraceLevel, Tracer } from "../tracer";
import { State } from "./state";

/**
 * a <code>StateStorage</code> is responsible to save and load states
 */
export abstract class StateStorage {
  /**
   * load the state of a portal
   * @param application the id of the application
   * @param session the current session
   */
  abstract load(application: string, session?: Session): State

  /**
   * save the sate 
   * @param state the state object
   * @param application the application name
   * @param session the current session
   */
  abstract save(state: State, application: string, session?: Session): void
}


@Injectable()
export class LocalStorageStateStorage extends StateStorage {
  // implement StateStorage

  /**
   * @inheritdoc
   */
  load(application: string, session?: Session): State {
    if (Tracer.ENABLED) Tracer.Trace('state', TraceLevel.MEDIUM, 'load state from local storage');

    const key = this.getKey(application, session);

    return JSON.parse(localStorage.getItem(key) || 'null') as State;
  }

  /**
   * @inheritdoc
   */
  save(state: State, application: string, session?: Session) {
    if (Tracer.ENABLED) Tracer.Trace('state', TraceLevel.MEDIUM, 'save state to local storage');

    const key = this.getKey(application, session);

    localStorage.setItem(key, JSON.stringify(state))
  }

  // private

  private getKey(application: string, session?: Session): string {
    let key = `${application}`

    if (session) key = key + `-${session.user.account}`

    return key;
  }
}
