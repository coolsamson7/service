/* eslint-disable @typescript-eslint/no-empty-interface */

import { GConstructor ,registerMixins, hasMixin } from "@modulefederation/common";

import { CommandToolbarComponent } from "./command-toolbar.component";
import { CommandManager } from "../command";
import { AbstractFeature } from "../feature";


export interface WithCommandToolbar {
    commandToolbar?: CommandToolbarComponent

    buildToolbar() :void

    addCommand2Toolbar(command: string) :WithCommandToolbar
}

export function WithCommandToolbar<T extends GConstructor<CommandManager & AbstractFeature>>(base: T) :GConstructor<WithCommandToolbar> &  T  {
    return registerMixins(class WithCommandToolbarClass extends base implements WithCommandToolbar {
        // instance data

        commandToolbar? : CommandToolbarComponent

        // constructor

        constructor(...args: any[]) {
            super(...args);
        }

        // private

        private findToolbar() {
          if (!this.commandToolbar) {
            for ( let parent = this.parent; parent != undefined && this.commandToolbar === undefined; parent = parent?.parent) 
              if ( hasMixin(parent, WithCommandToolbar))
                this.commandToolbar = (<WithCommandToolbar><unknown>parent).commandToolbar
                  
            if ( !this.commandToolbar)
              throw new Error("someone should declare a <command-toolbar>")
          }
        }

        // override OnInit

        override ngAfterViewInit() {
         super.ngAfterViewInit();

         this.findToolbar()

         this.buildToolbar()
      }

      // implement WithCommandToolbar

      buildToolbar() :void {
      }

      addCommand2Toolbar(command: string) : WithCommandToolbar {
        const revert = this.commandToolbar!.addCommand(this.getCommand(command))

        this.onDestroy(revert)

        return this
      }

    }, WithCommandToolbar)
  }
