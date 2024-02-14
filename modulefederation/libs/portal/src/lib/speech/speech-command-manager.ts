/* eslint-disable no-var */
import { Injectable } from "@angular/core";
import { SpeechRecognitionManager } from "./speech-recognition-manager";
import { SpeechEvent } from "./speech-engine";
import { TraceLevel, Tracer } from "../tracer";
import { ButtonConfiguration, ButtonData, DialogService } from "../dialog";
import { CommonDialog } from "../dialog/dialog-builder";
import { StringBuilder } from "../common";

interface CommandEntry {
    command: string
    re: RegExp
    enabled:  () => boolean
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
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const This = this

        ;(window as any)["commands"] = () => this.report()
        
        CommonDialog.addDecorator({
            decorate(button: ButtonConfiguration, _dialog: CommonDialog) : void {
                if ( button.speech ) {
                    This.addCommand(
                        button.speech,  
                        (...args: any[]) => (<ButtonData>button).run(), 
                        () => true
                        )
                    }
            },
        })

        speechRecognition.addListener(event => this.dispatchEvent(event), 0)

        dialogs.addListener({
            openDialog: () => {this.pushLevel()},
            closedDialog: () => {this.popLevel()}
        })

        this.pushLevel()
    }

    // private

    report() {
        const builder = new StringBuilder()
        for ( const command of this.commands)
            builder
                .append("command ").append(command.command)
                .append(command.enabled() ? " enabled" : "")
                .append("\n")

        console.log(builder.toString())
    }

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
    
        const compiledCommand = command
            .replace(optionalParam, '($1)?')
            .replace(namedParam, '(?<$1>\\w+)')
            .replace(restParam, '(?<$1>.*)')

        if ( Tracer.ENABLED)
            Tracer.Trace("speech.commands", TraceLevel.HIGH, "compiled speech command {0} to {1}", command,  '^' + compiledCommand + '$')
  
        return new RegExp('^' + compiledCommand + '$', 'i');
    }

    // public

    addCommand(command: string, callback: (...args: any[]) => void, enabled: () => boolean) : () => void {
        if ( Tracer.ENABLED)
            Tracer.Trace("speech.commands", TraceLevel.MEDIUM, "add speech command {0}", command)

        const entry = {
            command: command,
            re: this.makeRE(command),
            enabled: enabled,
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
           if ( command.re.test(event.result!) && command.enabled()) {

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