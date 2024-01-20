/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { equals } from "../common";
import { GConstructor } from "../common/lang/constructor.type";
import { AbstractFeature } from "../feature";
import { hasMixin, registerMixins } from "../mixin/mixin";
import { State } from "./state";
import { Stateful } from "./stateful";


export function WithState<S>() {
    return function <T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<Stateful> &  T  {
    return registerMixins(class StateManager extends base implements Stateful<S> {
        // instance data

        state?: State<S>

        // constructor
      
        constructor(...args: any[]) {
            super(...args);

            if (this.parent && !hasMixin(this.parent, WithState))
               throw new Error("parent must include WithState")

            this.afterContentInit(() => this.setupState())
            this.onDestroy(() => this.storeState())
        }

        // private

        private rootStateManager() : StateManager {
            let manager = this as StateManager
            while (manager.parentStateManager())
                manager = manager.parentStateManager()!

            return manager
        }

        private parentStateManager() : StateManager | undefined {
            return this.parent as StateManager
        }

        protected setupState() {
            const parent = this.parentStateManager()

            if (parent) {
              // parent - fetch state and restore if possible
        
              this.state = parent.findState4(this);
              if (this.state) 
                this.applyState(this.state.data);
              else {
                parent.addChildState((this.createState()))

                this.storeState()
              }
            } 
            else {
              // no parent, but has state from constructor or predefined state object
    
              if (this.state)
                this.applyState(this.state.data);
              else {
                this.createState();

                this.storeState()
              }
            }
          }
    
        private addChildState(state: State<any>): void {
            if (this.state?.children) 
                this.state.children.push(state);
            else 
                this.state!.children = [state];
        }
    
        private findState4(manager: StateManager): State<S> | undefined {
            const id = manager.stateID();

            return (this.state?.children || []).find((state) => equals(state.owner, id));
        }
    
        // implement Stateful

        loadState() {
            // noop
        }

        saveState() {
            // noop
        }

        storeState() : void {
            this.writeState(this.state!.data)

            this.rootStateManager().saveState()
        }

        createState(previousState?: S): State<S> {
            this.state = {
                owner: this.stateID(),
                data: previousState ? this.mergeState({} as S, previousState) : {} as S,
                children: []
            };

            return this.state!
        }

        applyState(state: S) : void {
            // noop
        }
        
        writeState(state: S) : void {
            // noope
        }

        mergeState(newState: S, previousState: S):S {
            return newState;
        }

        stateID(): any {
            return {
                component: this.getSelector()
            };
        }
    }, WithState)
  }
}