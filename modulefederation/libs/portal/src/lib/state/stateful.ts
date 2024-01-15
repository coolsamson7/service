import { State } from "./state"

export interface Stateful {
    state?: State

    applyState(state: any) : void 

    writeState(state: any) : void // TODO store

    mergeState(newStateData: any, previousStateData: any): void

    stateID() : any

    loadState() : void

    saveState() : void
}