import { State } from "./state"

export interface Stateful {
    state?: State

    storeState() : void

    applyState(state: any) : void 

    writeState(state: any) : void

    mergeState(newStateData: any, previousStateData: any): void

    stateID() : any

    createState(previousStateData?: any): State

    loadState() : void

    saveState() : void
}