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
   * @param portalId the id of the portal
   * @param session the current session
   */
  abstract load(portalId: string, session?: Session): State

  /**
   * save the sate 
   * @param state the state object
   * @param portalId the portal id
   * @param session the current session
   */
  abstract save(state: State, portalId: string, session?: Session): void
}


@Injectable()
export class LocalStorageStateStorage extends StateStorage {
  // implement StateStorage

  /**
   * @inheritdoc
   */
  load(portalId: string, session?: Session): State {
    if (Tracer.ENABLED) Tracer.Trace('state', TraceLevel.MEDIUM, 'load state from local storage');

    const key = this.getKey(portalId, session);

    return JSON.parse(localStorage.getItem(key) || 'null') as State;
  }

  /**
   * @inheritdoc
   */
  save(state: State, portalId: string, session?: Session) {
    if (Tracer.ENABLED) Tracer.Trace('state', TraceLevel.MEDIUM, 'save state to local storage');

    const key = this.getKey(portalId, session);

    localStorage.setItem(key, JSON.stringify(state))
  }

  // private

  private getKey(portalId: string, session?: Session): string {
    let key = `portal-${portalId}`

    if (session) key = key + `-${session.user.account}`

    return key;
  }
}
