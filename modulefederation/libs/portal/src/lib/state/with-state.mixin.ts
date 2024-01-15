/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GConstructor } from "../common/lang/constructor.type";
import { AbstractFeature } from "../feature";
import { registerMixins } from "../mixin/mixin";
import { State } from "./state";
import { Stateful } from "./stateful";


export function WithState<T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<Stateful> &  T  {
    return registerMixins(class StateManager extends base implements Stateful {
        // instance data

        state?: State

        // constructor
      
        constructor(...args: any[]) {
            super(args);

            this.afterContentInit(() => this.setupState())
            this.onDestroy(() => this.triggerWriteState())
        }

        // private

        private rootStateManager() : StateManager{
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
                parent.addChildState((this.state = this.createState()))

                this.writeState(this.state?.data)
              }
            } 
            else {
              // no parent controller, but has state from constructor or predefined state object
        

              if (this.state)
                this.applyState(this.state.data);
              else {
                this.state = this.createState();

                this.triggerWriteState()
              }
            }
          }

        // TODO
          
        private matchingIDs(id1: any, id2: any): boolean {
            return id1.component == id2.component // TODO isEqual(id1, id2);
        }
    
        private createState(previousStateData?: any): State {
            return {
                owner: this.stateID(),
                data: previousStateData ? this.mergeState({}, previousStateData) : {},
                children: []
            };
        }

        private triggerWriteState() {
            this.writeState(this.state?.data)

           //this.rootStateManager().???
        }
    
        private addChildState(state: State): void {
            if (this.state?.children) 
                this.state.children.push(state);
            else 
                this.state!.children = [state];
        }
    
        private findState4(manager: StateManager): State | undefined {
            const id = manager.stateID();

            return (this.state?.children || []).find((state) => this.matchingIDs(state.owner, id));
        }
    
        // implement Stateful


        loadState() {}

        saveState() {}

        applyState(state: any) : void {
            // noop
        }
        
        writeState(state: any) : void {
            // noope
        }

        mergeState(newStateData: any, previousStateData: any):any {
            return newStateData;
        }

        stateID(): any {
            return {
                component: this.getSelector()
            };
        }
    }, WithState)
  }