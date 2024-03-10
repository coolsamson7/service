/* eslint-disable @typescript-eslint/no-empty-interface */

import { inject } from "@angular/core";
import { GConstructor, CommandManager, AbstractFeature, registerMixins, CommandAdministration } from "@modulefederation/portal";
import { CommandToolbarComponent } from "./command-toolbar.component";


export interface WithCommandToolbar {
    commandToolbar?: CommandToolbarComponent
}

export function WithCommandToolbar<T extends GConstructor<CommandManager & AbstractFeature>>(base: T) :GConstructor<WithCommandToolbar> &  T  {
    return registerMixins(class WithCommandToolbarClass extends base implements WithCommandToolbar {
        // instance data

        commandToolbar? : CommandToolbarComponent

        // constructor

        constructor(...args: any[]) {
            super(...args);
        }

      // override OnInit

      override ngOnInit() {
         super.ngOnInit();

         if ( this.commandToolbar ) {
           const administration : CommandAdministration = (<CommandAdministration><unknown>this as any)

           administration.getCommands({}).forEach(command => {
            const revert = this.commandToolbar!.addCommand(command)

            this.onDestroy(revert)
           })
         }
      }

      // implement WithCommandToolbar

    }, WithCommandToolbar)
  }
