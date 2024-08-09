/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { equals, GConstructor, hasMixin, registerMixins } from "@modulefederation/common";
import { AbstractFeature } from "../feature";
import { State } from "./state";
import { Stateful } from "./stateful";

export interface StateAdministration<S> extends  Stateful<S> {
    foo() : void;
}

export function WithState<S>() {
    return function <T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<Stateful> &  T  {
    return registerMixins(class WithStateClass extends base implements StateAdministration<S> {
        // instance data

        state?: State<S>

        foo() : void {}

        // constructor
      
        constructor(...args: any[]) {
            super(...args);

            if (this.parent && !hasMixin(this.parent, WithState))
               throw new Error("parent must include WithState")

            this.afterViewInit(() => this.setupState()) // afterContentInit
            this.onDestroy(() => this.storeState())
        }

        // private

        private rootStateManager() : WithStateClass {
            let manager = this as WithStateClass
            while (manager.parentStateManager())
                manager = manager.parentStateManager()!

            return manager
        }

        private parentStateManager() : WithStateClass | undefined {
            return this.parent as WithStateClass
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
    
        private findState4(manager: WithStateClass): State<S> | undefined {
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