/* eslint-disable no-var */
import { Injectable, Injector, inject } from "@angular/core";
import { Observable, Subject, of } from "rxjs";
import { SpeechEngine, SpeechEvent } from "./speech-engine";
import { LocaleManager, OnLocaleChange } from "../locale";


@Injectable({providedIn: 'root'})
export class SpeechRecognitionManager implements OnLocaleChange {
    // instance data

    events$ : Subject<SpeechEvent> = new Subject<SpeechEvent>();
    result$ : Subject<SpeechEvent> = new Subject<SpeechEvent>();

    private engine! : SpeechEngine

    // constructor

    constructor(injector: Injector) {
        setTimeout(() => injector.get(SpeechEngine).start(), 0)

        injector.get(LocaleManager).subscribe(this)
    }

    setEngine(engine : SpeechEngine) {
        this.engine = engine
    }

    // public

    isRunning() {
        return this.engine ? this.engine.isRunning() : false
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

     // implement OnLocaleChange
    
     onLocaleChange(locale: Intl.Locale): Observable<any> {
        this.engine.setLocale(locale.baseName)

        return of()
    }
}
