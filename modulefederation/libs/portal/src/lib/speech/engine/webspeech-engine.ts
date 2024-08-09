/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
import { Inject, Injectable, NgZone } from "@angular/core";
import { SpeechEngine } from "../speech-engine";
import { SpeechRecognitionManager } from "../speech-recognition-manager";
import { SpeechRecognitionConfig, SpeechRecognitionConfigInjectionToken } from "../speech-recognition.module";
import { TraceLevel, Tracer } from "@modulefederation/common";


//import "@types/webspeechapi"

interface SpeechRecognition extends EventTarget {
    grammars: SpeechGrammarList;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    serviceURI: string;

    start(): void;
    stop(): void;
    abort(): void;

    onaudiostart: (ev: Event) => any;
    onsoundstart: (ev: Event) => any;
    onspeechstart: (ev: Event) => any;
    onspeechend: (ev: Event) => any;
    onsoundend: (ev: Event) => any;
    onaudioend: (ev: Event) => any;
    onresult: (ev: SpeechRecognitionEvent) => any;
    onnomatch: (ev: SpeechRecognitionEvent) => any;
    onerror: (ev: SpeechRecognitionError) => any;
    onstart: (ev: Event) => any;
    onend: (ev: Event) => any;
}
interface SpeechRecognitionStatic {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
}
declare var SpeechRecognition: SpeechRecognitionStatic;
declare var webkitSpeechRecognition: SpeechRecognitionStatic;

interface SpeechRecognitionError extends Event {
    error: string;
    message: string;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;

    isFinal: boolean;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
    interpretation: any;
    emma: Document;
}

interface SpeechGrammar {
    src: string;
    weight: number;
}
interface SpeechGrammarStatic {
    prototype: SpeechGrammar;
    new (): SpeechGrammar;
}
declare var SpeechGrammar: SpeechGrammarStatic;
declare var webkitSpeechGrammar: SpeechGrammarStatic;

interface SpeechGrammarList {
    length: number;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
    addFromURI(src: string, weight: number): void;
    addFromString(string: string, weight: number): void;
}
interface SpeechGrammarListStatic {
    prototype: SpeechGrammarList;
    new (): SpeechGrammarList;
}
declare var SpeechGrammarList: SpeechGrammarListStatic;
declare var webkitSpeechGrammarList: SpeechGrammarListStatic;

// class

@Injectable({providedIn: 'root'})
export class WebkitSpeechEngine extends SpeechEngine {
    // instance data

    autoRestart = true
    lastStartedAt = 0;
    autoRestartCount = 0;
    running = false
    speechRecognition: SpeechRecognition

    // constructor

    constructor(@Inject(SpeechRecognitionConfigInjectionToken) configuration : SpeechRecognitionConfig, private speechRecognitionManager: SpeechRecognitionManager, private zone: NgZone) {
        super();

        this.speechRecognition = this.setup(configuration, speechRecognitionManager)

        speechRecognitionManager.setEngine(this)
    }

    // private

    private setup(configuration : SpeechRecognitionConfig, speechRecognitionManager: SpeechRecognitionManager,) : SpeechRecognition {
        const engine : SpeechRecognition = new (<any>window).webkitSpeechRecognition()

        const events$ = speechRecognitionManager.events$

        // configure

        engine.lang = configuration.lang
        engine.interimResults = configuration.interimResults
        engine.continuous = configuration.continuous
        engine.maxAlternatives = 0

        // add listeners

        for (const eventName of ["start"])
            engine.addEventListener(eventName, event =>  this.zone.run(() => {
                if ( Tracer.ENABLED)
                    Tracer.Trace("speech", TraceLevel.MEDIUM, "process start event")

                this.running = true;
                events$.next({type: eventName, event: event})
            }))

        for (const eventName of ["end"])
            engine.addEventListener(eventName, event => this.zone.run(() => {
                if ( Tracer.ENABLED)
                    Tracer.Trace("speech", TraceLevel.MEDIUM, "process end event")

                this.running = false;
                events$.next({type: eventName, event: event})

                if (this.autoRestart) {
                    const timeSinceLastStart = new Date().getTime() - this.lastStartedAt;
                    this.autoRestartCount += 1;

                    if (this.autoRestartCount % 10 === 0) {
                        // give up
                        return
                    }
                    else if (timeSinceLastStart < 1000)
                        setTimeout(() => this.start(), 1000 - timeSinceLastStart)
                    else
                        this.start()
                }
            }))

        for (const eventName of ["nomatch"])
            engine.addEventListener(eventName, event =>  this.zone.run(() => events$.next({type: eventName, event: event})))

        for (const eventName of ["error"])
            engine.addEventListener(eventName, event => this.zone.run(() => {
                if ( Tracer.ENABLED)
                    Tracer.Trace("speech", TraceLevel.MEDIUM, "error event '{0}'", (<SpeechRecognitionError>event).error)

                switch((<SpeechRecognitionError>event).error) {
                    case 'not-allowed':
                    case 'service-not-allowed':
                      // if permission to use the mic is denied, turn off auto-restart
                      this.autoRestart = false
                      break

                    default:
                      // noop
                }

                events$.next({type: eventName, event: event})
         }))

        engine.onresult = event =>  {
            if ( event.results[event.resultIndex][0].confidence > 0.7) {
                const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase() // why trim, no idea....i see leading blanks

                this.zone.run(() => {
                    if ( Tracer.ENABLED)
                        Tracer.Trace("speech", TraceLevel.MEDIUM, "process speech result '{0}'", transcript)

                    this.speechRecognitionManager.callListener({
                        type: "result",
                        event: event,
                        result: transcript
                    })})
            } // if
        }

        // done

        return engine
    }

    // implement SpeechEngine

    override start(): void {
       this.autoRestart = true
       this.lastStartedAt = new Date().getTime();
       this.speechRecognition.start()
    }

    override stop(): void {
        this.autoRestart = false
        this.autoRestartCount = 0
        this.speechRecognition.stop()
    }

    override isRunning(): boolean {
        return this.running
    }

    override setLocale(locale: string) {
        this.speechRecognition.lang = locale
    }
}
