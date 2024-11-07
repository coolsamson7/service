import { Injectable } from "@angular/core";
import { TraceLevel, Tracer } from "@modulefederation/common";
import { RxStomp, RxStompState } from "@stomp/rx-stomp";
import { BehaviorSubject, map, Observable, Subject } from "rxjs";
import { PluginRegistry } from "./plugin-registry";
import { PluginDescriptor } from "./plugin-descriptor";

export interface PluginRequest {
    id?: string, // correlation id

    plugin: string,
    method: string,
    args: any
}

export interface PluginResult {
    id?: string, // correlation id

    plugin: string,
    method: string,
    response: any
}

interface Pending<T> {
    id: string,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
}

@Injectable({providedIn: 'root'})
export class PluginManager extends PluginRegistry {
    // instance data

    pending: { [id: string]: Pending<any> } = {};
    call$: Observable<any> = new Subject();
    result$: Observable<any> = new Subject();
    open$ = new BehaviorSubject<boolean>(false);

    next = 0 // correlation id

    // constructor

    constructor(private stomp: RxStomp) {
        super()

        this.subscribe(stomp)

        stomp.activate()
    }

    listen2(descriptor: PluginDescriptor, method: string, callback: (...args: any[]) => void) {
        // check

        if (!descriptor.callbacks[method])
            throw new Error("unknown callback method " + method)


    }

    // private

    private subscribe(stomp: RxStomp) {
        stomp.connectionState$.subscribe(state => {
            switch(state) {
                case RxStompState.CONNECTING:
                    if ( Tracer.ENABLED) Tracer.Trace("plugin", TraceLevel.HIGH, "connecting")
                    break;

                case RxStompState.OPEN:
                    if ( Tracer.ENABLED) Tracer.Trace("plugin", TraceLevel.HIGH, "open")

                    this.open$.next(true)
                    break;

                case RxStompState.CLOSING:
                    if ( Tracer.ENABLED) Tracer.Trace("plugin", TraceLevel.HIGH, "closing")
                    break;

                case RxStompState.CLOSED:
                    if ( Tracer.ENABLED) Tracer.Trace("plugin", TraceLevel.HIGH, "closed")
                    this.open$.next(false)
                    break;
            } // switch
        })

        this.call$ = stomp.watch('/notifier/call')
            .pipe(
                map(message => JSON.parse(message.body)),
                //share({resetOnRefCountZero: true})
            )

        this.result$ = stomp.watch('/notifier/result')
            .pipe(
                map(message => JSON.parse(message.body)),
                //share({resetOnRefCountZero: true})
            )

        this.call$ .subscribe((request: PluginRequest) => this.handleReqest(request))
        this.result$ .subscribe((result: PluginResult) => this.handleResult(result))
    }

    private nextId() : string {
        return '' + this.next++
    }

    private promise<T>(request: PluginRequest, timeout: number) : Promise<T> {
        const id = request.id!

        return new Promise<T>((resolve, reject) => {
            // remember the pending structure

            this.pending[id] = {
                id: id,
                resolve: resolve,
                reject: reject
            }

            // optional timeout

            if ( timeout > 0)
                setTimeout(() => {
                    // delete pending

                    delete this.pending[id]

                    // and reject the promise

                    reject(new Error(`timout after ${timeout}ms for request ${request.plugin}.${request.method}`))
                }, timeout)
        })
    }

    // public

    active() : boolean {
        return this.stomp.active
    }

    handleResult(result: PluginResult) {
        if ( Tracer.ENABLED)
            Tracer.Trace("plugin", TraceLevel.FULL, "handle result {0}.{1}", result.plugin, result.method)

        try {
            const pending = this.pending[result.id!]

            if ( pending )
                pending.resolve(result.response)
            else {
                if ( Tracer.ENABLED)
                    Tracer.Trace("plugin", TraceLevel.FULL, "no recipient for the result of {0}.{1}", result.plugin, result.method)
            }
        }
        finally {
            delete this.pending[result.id!]
        }
    }

    handleReqest(request: PluginRequest) {
        if ( Tracer.ENABLED)
            Tracer.Trace("plugin", TraceLevel.FULL, "handle request {0}.{1}", request.plugin, request.method)

        request.args = JSON.parse(request.args)

        this.plugin(request.plugin).callback(request.method, request.args)
    }

    execute(request: PluginRequest, expectedValue: any, timeout: number) : Promise<any> | undefined {
        if ( Tracer.ENABLED)
            Tracer.Trace("plugin", TraceLevel.FULL, "execute {0}.{1}", request.plugin, request.method)

        if ( !this.active ) {
            console.log("not active...TODO ") // TODO???
        }

        // prepare request

        request.args = JSON.stringify(request.args)

        if ( expectedValue)
            request.id = this.nextId()
        else
            request.id = ""

        // call websocket

        this.stomp.publish({
            destination: '/app/call',
            body: JSON.stringify(request),
            headers: {'content-type': 'application/json'}
        });

        // return promise only for non void

        if ( expectedValue  )
            return this.promise(request, timeout)
        else
            return undefined
    }
  }
