import { TraceLevel } from './trace-level.enum';
import { Trace } from './trace';
import { TraceEntry } from './trace-entry';
import { Injectable } from "@angular/core";
import { TracerModule } from './tracer.module';
import { StackFrame, Stacktrace } from '../common/util';


/**
 * A Tracer is used to emit trace messages for development purposes.
 * While it shares the logic of a typical logger, it will be turned of in production.
 */
@Injectable({
    providedIn: 'root'
})
export class Tracer {
    // static

    public static ENABLED = true

    public static instance : Tracer

    // instance data

    private traceLevels : { [path : string] : TraceLevel } = {}
    private cachedTraceLevels : { [path : string] : TraceLevel } = {}
    private modifications = 0
    private sink : Trace | undefined

    // constructor

    constructor() {
        const tracerConfiguration = TracerModule.tracerConfiguration

        // enabled

        Tracer.ENABLED = tracerConfiguration.enabled

        // some more

        this.sink = tracerConfiguration.trace

        // set paths

        if (tracerConfiguration.paths)
            for (const path of Object.keys(tracerConfiguration.paths))
                this.setTraceLevel(path, tracerConfiguration.paths[path])

        Tracer.instance = this
    }

    static getInstance() {
        if (!Tracer.instance)
            new Tracer()

        return Tracer.instance
    }

    // public

    public static Trace(path : string, level : TraceLevel, message : string, ...args : any[]) {
        const instance = Tracer.getInstance()

        if ( instance.getTraceLevel(path) >= level) {
            const stack = new Error().stack!

            const frames = Stacktrace.createFrames(stack)

            const lastFrame = frames[1]

            instance.trace(path, level, message, lastFrame, ...args)
        }
    }

    // public

    public isTraced(path : string, level : TraceLevel) : boolean {
        return Tracer.ENABLED && this.getTraceLevel(path) >= level
    }

    public async trace(path : string, level : TraceLevel, message : string, frame: StackFrame,  ...args : any[]) {
        if (this.isTraced(path, level)) {
            // new

            await Stacktrace.mapFrames(frame)

            // format

            const formattedMessage = message.replace(/{(\d+)}/g, function(match, number) {
                let value = args[+number]

                if (value === undefined) value = "undefined"
                else if (value === null) value = "null"

                return value
            })

            // and write

            this.sink?.trace(new TraceEntry(path, level, formattedMessage, new Date(), frame))
        }
    }

    // private

    private getTraceLevel(path : string) : TraceLevel {
        // check dirty state

        if (this.modifications > 0) {
            this.cachedTraceLevels = {} // restart from scratch
            this.modifications = 0
        } // if

        let level = this.cachedTraceLevels[path]
        if (!level) {
            level = this.traceLevels[path]
            if (!level) {
                const index = path.lastIndexOf(".")
                level = index != -1 ? this.getTraceLevel(path.substring(0, index)) :
                    (path != "" ? this.getTraceLevel("") : TraceLevel.OFF)
            } // if

            // cache

            this.cachedTraceLevels[path] = level
        } // if

        return level
    }

    private setTraceLevel(path : string, level : TraceLevel) : void {
        this.traceLevels[path] = level
        this.modifications++
    }
}
