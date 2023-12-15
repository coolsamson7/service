import {TraceLevel} from './trace-level.enum';
import {TracerConfiguration, TracerConfigurationInjectionToken} from './tracer-configuration';
import {Trace} from './trace';
import {TraceEntry} from './trace-entry';
import {ConsoleTrace} from "./traces/console-trace";
import {Inject, Injectable, Optional} from "@angular/core";

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

    private static This : Tracer
    private traceLevels : { [path : string] : TraceLevel } = {}
    private cachedTraceLevels : { [path : string] : TraceLevel } = {}

    // instance data

    private modifications = 0
    private sink : Trace | undefined

    // constructor

    constructor(@Optional() @Inject(TracerConfigurationInjectionToken) tracerConfiguration : TracerConfiguration) {
        if (tracerConfiguration) {
            // enabled

            Tracer.ENABLED = tracerConfiguration.enabled

            // some more

            this.sink = tracerConfiguration.trace

            // set paths

            for (const path of Object.keys(tracerConfiguration.paths!!)) {
                this.setTraceLevel(path, tracerConfiguration.paths!![path])
            }
        }

        Tracer.This = this
    }

    static getSingleton() {
        if (!Tracer.This)
            new Tracer({
                enabled: true,
                trace: new ConsoleTrace("%d [%p]: %m\n"),
                paths: {
                    "": TraceLevel.FULL,
                },
            })

        return Tracer.This
    }

    // public

    public static Trace(path : string, level : TraceLevel, message : string, ...args : any[]) {
        Tracer.getSingleton().trace(path, level, message, ...args)
    }

    // public

    public isTraced(path : string, level : TraceLevel) : boolean {
        return Tracer.ENABLED && this.getTraceLevel(path) >= level
    }

    public trace(path : string, level : TraceLevel, message : string, ...args : any[]) {
        if (this.isTraced(path, level)) {
            // format

            const formattedMessage = message.replace(/{(\d+)}/g, function (match, number) {
                let value = args[+number]

                if (value === undefined) value = "undefined"
                else if (value === null) value = "null"

                return value
            })

            // and write

            this.sink?.trace(new TraceEntry(path, level, formattedMessage, new Date()))
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
