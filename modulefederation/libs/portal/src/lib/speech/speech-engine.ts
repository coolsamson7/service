

export interface SpeechEvent {
    type: string,
    event: any,
    result?: string
}

export abstract class SpeechEngine {
    abstract start() : void
    abstract stop() : void
    abstract isRunning() : boolean
    abstract setLocale(lcoale: string) : void
}
