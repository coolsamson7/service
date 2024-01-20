import { State } from "./state"

export interface Stateful<S=any> {
    state?: State<S>

    storeState() : void

    applyState(state: S) : void 

    writeState(state: S) : void

    mergeState(newState: S, previousState: S): void

    stateID() : any

    createState(previous?: S): State<S>

    loadState() : void

    saveState() : void
}