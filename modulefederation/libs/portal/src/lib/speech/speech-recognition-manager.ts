/* eslint-disable no-var */
import { Injectable, Injector } from "@angular/core";
import { Observable, Subject, of } from "rxjs";
import { SpeechEngine, SpeechEvent } from "./speech-engine";
import { LocaleManager, OnLocaleChange } from "../locale";

export type SpeechEventListener  = (event: SpeechEvent) => boolean

interface SpeechEventListenerEntry {
   listener: SpeechEventListener
   priority: number
}

@Injectable({providedIn: 'root'})
export class SpeechRecognitionManager implements OnLocaleChange {
    // instance data

    events$ : Subject<SpeechEvent> = new Subject<SpeechEvent>();

    private engine! : SpeechEngine

    listener: SpeechEventListenerEntry[] = []
    dirty = false

    // constructor

    constructor(injector: Injector) {
        setTimeout(() => injector.get(SpeechEngine).start(), 0)

        injector.get(LocaleManager).subscribe(this)
    }

    // public

    setEngine(engine : SpeechEngine) {
        this.engine = engine
    }

    callListener(event: SpeechEvent) {
        for ( const listener of this.getListener())
           if ( listener.listener(event))
            return
    }

    // private

    getListener() :SpeechEventListenerEntry[] {
        if ( this.dirty) {
            this.dirty = false

            this.listener.sort((a, b) => a.priority == b.priority ? 0 : a.priority < b.priority ? -1 : 1)
        }

        return this.listener
    }

    // public

    addListener(listener: SpeechEventListener, priority = 0): () => void {
        const entry = {
            listener: listener,
            priority: priority
        }

        this.listener.push(entry);

        this.dirty = true

        return () => this.listener.splice(this.listener.indexOf(entry), 1)
    }

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

        // rerun needed for some engines

        if ( this.isRunning()) {
            this.stop()
            this.start()
        }

        return of()
    }
}
