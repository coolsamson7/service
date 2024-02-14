/* eslint-disable @typescript-eslint/no-empty-interface */

import { inject } from "@angular/core";
import { GConstructor } from "../common";
import { registerMixins } from "../mixin/mixin";
import { SpeechCommandManager } from "./speech-command-manager";
import { CommandAdministration, CommandDescriptor, CommandManager } from "../command";
import { AbstractFeature } from "../feature";
import { Observable, of } from "rxjs";

export interface WithSpeechCommands {
    // hmm...nothing so far
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
            if ( command.speech ) {
                const remove = this.getSpeechCommandManager().addCommand(
                    command.speech!, 
                    (args) => command.runWithContext(command.createContext([args], {fromShortcut: true})), // we simply use the same marker to trigger the ripple effect
                    () => command.enabled
                )

                command.speechSubscription = remove
                this.onDestroy(() => {if (command.speechSubscription) command.speechSubscription!()})
            }
        }

        // override OnLocaleChange

        override onLocaleChange(locale: Intl.Locale): Observable<any> {
            super.onLocaleChange(locale) // will set the new localized 

            for ( const command of (<CommandAdministration><any>this).getCommands({})) {
                // possibly unsubscribe shortcut

                if ( command.speechSubscription ) {
                    command.speechSubscription()
                    command.speechSubscription = undefined
                }

                if ( command.speech )
                    command.speechSubscription = this.getSpeechCommandManager().addCommand(
                        command.speech, 
                        (args) => command.runWithContext(command.createContext([args], {fromShortcut: true})), // we simply use the same marker to trigger the ripple effect
                        () => command.enabled)
            }
                
            return of()
        }

      // implement WithSpeechCommands

    
    }, WithSpeechCommands)
  }
