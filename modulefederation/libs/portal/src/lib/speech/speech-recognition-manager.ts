/* eslint-disable no-var */
import { Injectable, Injector, inject } from "@angular/core";
import { Subject } from "rxjs";
import { SpeechEngine, SpeechEvent } from "./speech-engine";


@Injectable({providedIn: 'root'})
export class SpeechRecognitionManager {
    // instance data

    events$ : Subject<SpeechEvent> = new Subject<SpeechEvent>();
    result$ : Subject<SpeechEvent> = new Subject<SpeechEvent>();
    
    private engine! : SpeechEngine

    // constructor

    constructor(injector: Injector) {
        setTimeout(() => injector.get(SpeechEngine).start(), 0)
    }

    setEngine(engine : SpeechEngine) {
        this.engine = engine
    }

    // public

    isRunning() {
        return this.engine.isRunning()
    }

    start() {
        if ( !this.isRunning()) {
            this.engine.start()
        }
    }

    stop() {
        if ( this.isRunning()) {
            this.engine.stop()
        }
    }
}