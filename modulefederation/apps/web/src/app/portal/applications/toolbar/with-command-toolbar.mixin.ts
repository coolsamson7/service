/* eslint-disable @typescript-eslint/no-empty-interface */

import { GConstructor ,registerMixins, hasMixin } from "@modulefederation/common";
import { CommandManager, AbstractFeature, CommandAdministration } from "@modulefederation/portal";
import { CommandToolbarComponent } from "./command-toolbar.component";


export interface WithCommandToolbar {
    commandToolbar?: CommandToolbarComponent

    buildToolbar() :void

    addCommand2Toolbar(command: string) :void
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
            for ( let parent = this.parent; parent != undefined; parent = parent?.parent) {
              if ( hasMixin(parent, WithCommandToolbar)) {
                this.commandToolbar = (<WithCommandToolbar><unknown>parent).commandToolbar
                break
              }
           }
          }
        }

        // override OnInit

        override ngOnInit() {
         super.ngOnInit();

         this.findToolbar()

         this.buildToolbar()
/*
         if ( this.commandToolbar ) {
           const administration : CommandAdministration = (<CommandAdministration><unknown>this as any)

           administration.getCommands({}).forEach(command => {
            const revert = this.commandToolbar!.addCommand(command)

            this.onDestroy(revert)
           })
         }*/
      }

      // implement WithCommandToolbar

      buildToolbar() :void {
      }

      addCommand2Toolbar(command: string) :void {
        const administration : CommandAdministration = (<CommandAdministration><unknown>this as any)

        const revert = this.commandToolbar!.addCommand(this.getCommand(command))

         this.onDestroy(revert)
      }

    }, WithCommandToolbar)
  }
