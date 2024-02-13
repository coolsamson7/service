/* eslint-disable no-var */
import { Injectable } from "@angular/core";
import { SpeechRecognitionManager } from "./speech-recognition-manager";
import { SpeechEvent } from "./speech-engine";
import { TraceLevel, Tracer } from "../tracer";
import { ButtonConfiguration, DialogService } from "../dialog";
import { ButtonDecorator, DialogBuilder } from "../dialog/dialog-builder";


interface CommandEntry {
    command: string
    re: RegExp
    callback: (...args: any[]) => void
}

declare type CommandEntryArray = CommandEntry[];


@Injectable({providedIn: 'root'})
export class SpeechCommandManager {
    // instance data

    commandStack : CommandEntryArray[] = []
    commands! : CommandEntry[]

    // constructor

    constructor(speechRecognition : SpeechRecognitionManager,  dialogs : DialogService) {
        DialogBuilder.addDecorator({
            decorate(button: ButtonConfiguration) : void {
                if ( button.speech) {
                    console.log(button)
                }
            },
        })

        speechRecognition.addListener(event => this.dispatchEvent(event), 0)

        dialogs.addListener({
            openDialog: () => {this.pushLevel()},
            closedDialog: () => {this.popLevel()}
        })

        this.pushLevel()

        // TODO

        speechRecognition.events$.subscribe(event => console.log(event))
    }

    // private

    pushLevel() {
        this.commandStack.push(this.commands = [])
    }

    popLevel() {
        this.commandStack.splice(this.commandStack.length - 1, 1);
        this.commands = this.commandStack[this.commandStack.length - 1];
    }

    // private

    private makeRE(command: string) {
        const optionalParam = /\((.*?)\)/g;
        const namedParam    = /:(\w+)/g
        const restParam    = /\*(\w+)/g;
    
        command = command
            .replace(optionalParam, '($1)?')
            .replace(namedParam, '(?<$1>\\w+)')
            .replace(restParam, '(?<$1>.*)')

  
        return new RegExp('^' + command + '$', 'i');
    }

    // public

    addCommand(command: string, callback:  (...args: any[]) => void) : () => void {
        if ( Tracer.ENABLED)
            Tracer.Trace("speech.commands", TraceLevel.MEDIUM, "add speech command {0}", command)

        const entry = {
            command: command,
            re: this.makeRE(command),
            callback: callback
        }

        this.commands.push(entry)

        return () =>  {
            if ( Tracer.ENABLED)
                Tracer.Trace("speech.commands", TraceLevel.MEDIUM, "remove speech command {0}", command)

            this.commands.splice(this.commands.indexOf(entry), 1)
        }
    }

    // private

    private dispatchEvent(event: SpeechEvent) :boolean {
         if ( Tracer.ENABLED)
            Tracer.Trace("speech.commands", TraceLevel.MEDIUM, "dispatch speech command '{0}'",  event.result)

        for ( const command of this.commands)
           if ( command.command == event.result || command.re.test(event.result!)) {

            let result: RegExpMatchArray | null
            if ((result = command.re.exec(event.result!))) {
                if ( result.groups ) 
                    command.callback(result.groups)
                else
                    command.callback()

                return true
           } // if
        } // if

        return false
    }
}