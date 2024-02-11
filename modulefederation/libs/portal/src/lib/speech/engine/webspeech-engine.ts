/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
import { Inject, Injectable, NgZone } from "@angular/core";
import { SpeechEngine } from "../speech-engine";
import { SpeechRecognitionManager } from "../speech-recognition-manager";
import { SpeechRecognitionConfig, SpeechRecognitionConfigInjectionToken } from "../speech-recognition.module";


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

    constructor(@Inject(SpeechRecognitionConfigInjectionToken) configuration : SpeechRecognitionConfig, speechRecognitionManager: SpeechRecognitionManager, private zone: NgZone) {
        super();

        this.speechRecognition = this.setup(configuration, speechRecognitionManager)

        speechRecognitionManager.setEngine(this)
    }

    // private

    private setup(configuration : SpeechRecognitionConfig, speechRecognitionManager: SpeechRecognitionManager,) : SpeechRecognition {
        const engine : SpeechRecognition = new (<any>window).webkitSpeechRecognition()

        const events$ = speechRecognitionManager.events$
        const result$ = speechRecognitionManager.result$

        // configure

        engine.lang = configuration.lang
        engine.interimResults = configuration.interimResults
        engine.continuous = configuration.continuous

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

        for (const eventName of ["result"])
            engine.addEventListener(eventName, event =>  this.zone.run(() => result$.next({
                type: eventName, 
                event: event, 
                result:  (<SpeechRecognitionEvent>event).results[0][0].transcript
            })))

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
}