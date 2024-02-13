/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
import { Inject, Injectable, NgZone } from "@angular/core";
import { SpeechEngine } from "../speech-engine";
import { SpeechRecognitionManager } from "../speech-recognition-manager";
import { SpeechRecognitionConfig, SpeechRecognitionConfigInjectionToken } from "../speech-recognition.module";
import { TraceLevel, Tracer } from "../../tracer";


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
                this.running = true;
                events$.next({type: eventName, event: event})
            }))

        for (const eventName of ["end"])
            engine.addEventListener(eventName, event => this.zone.run(() => {
                this.running = false;
                events$.next({type: eventName, event: event})
            }))

        for (const eventName of ["nomatch"])
            engine.addEventListener(eventName, event =>  this.zone.run(() => events$.next({type: eventName, event: event})))

        for (const eventName of ["error"])
            engine.addEventListener(eventName, event =>  this.zone.run(() => events$.next({type: eventName, event: event})))

        engine.onresult = event =>  {
            if ( event.results[event.resultIndex][0].confidence > 0) {
                const transcript = event.results[event.resultIndex][0].transcript

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
       this.speechRecognition.start()
    }

    override stop(): void {
        this.speechRecognition.stop()
    }

    override isRunning(): boolean {
        return this.running
    }

    override setLocale(locale: string) {
        this.speechRecognition.lang = locale
    }
}
