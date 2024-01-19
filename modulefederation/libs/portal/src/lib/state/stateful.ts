import { State } from "./state"

export interface Stateful<S=any> {
    state?: State

    storeState() : void

    applyState(state: S) : void 

    writeState(state: S) : void

    mergeState(newStateData: any, previousStateData: any): void

    stateID() : any

    createState(previousStateData?: any): State

    loadState() : void

    saveState() : void
}