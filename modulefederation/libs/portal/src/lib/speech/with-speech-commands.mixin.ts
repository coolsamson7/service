/* eslint-disable @typescript-eslint/no-empty-interface */

import { inject } from "@angular/core";
import { GConstructor } from "../common";
import { registerMixins } from "../mixin/mixin";
import { SpeechCommandManager } from "./speech-command-manager";
import { CommandDescriptor, CommandManager } from "../command";
import { AbstractFeature } from "../feature";

export interface WithSpeechCommands {
}

export function WithSpeechCommands<T extends GConstructor<CommandManager & AbstractFeature>>(base: T) :GConstructor<WithSpeechCommands> &  T  {
    return registerMixins(class WithSpeechCommandsClass extends base implements WithSpeechCommands {
      // instance data

     speechCommandManager = inject(SpeechCommandManager)

      // constructor

      constructor(...args: any[]) {
        super(...args);
      }

      // private

      getSpeechCommandManager() {
        if ( !this.speechCommandManager)
            this.speechCommandManager = this.injector.get(SpeechCommandManager);

        return this.speechCommandManager
      }

      // override CommandManager

      override createdCommand(command: CommandDescriptor) : void {
         if ( command.speech )
            this.onDestroy(this.getSpeechCommandManager().addCommand(command.speech!, (args) => {
                if ( command.enabled )
                    command.runWithContext(command.createContext([args], {fromSpeech: true}))
            }))
      }

      // implement WithSpeechCommands

    
    }, WithSpeechCommands)
  }
