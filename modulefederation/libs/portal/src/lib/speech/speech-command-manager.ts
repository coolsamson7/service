/* eslint-disable no-var */
import { Injectable } from "@angular/core";
import { SpeechRecognitionManager } from "./speech-recognition-manager";
import { SpeechEvent } from "./speech-engine";
import { TraceLevel, Tracer } from "../tracer";


interface CommandEntry {
    command: string
    re: RegExp
    callback: (...args: any[]) => void
}

@Injectable({providedIn: 'root'})
export class SpeechCommandManager {
    // instance data

    commands : CommandEntry[] = []

    // constructor

    constructor(speechRecognition : SpeechRecognitionManager) {
        speechRecognition.result$.subscribe(event => this.dispatchEvent(event))

        // TODO

        speechRecognition.events$.subscribe(event => console.log(event))
    }

    // public

    addCommand(command: string, callback:  (...args: any[]) => void) : () => void {
        if ( Tracer.ENABLED)
            Tracer.Trace("speech.commands", TraceLevel.MEDIUM, "add speech command {0}", command)

        const entry = {
            command: command,
            re: new RegExp(command, "i"),
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

    private dispatchEvent(event: SpeechEvent) {
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

                return
           } // if
        }
    }
}