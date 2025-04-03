import { Injectable } from "@angular/core";
import { TraceLevel, Tracer } from "@modulefederation/common";
import { RxStomp, RxStompState } from "@stomp/rx-stomp";
import { BehaviorSubject, map, Observable, Subject } from "rxjs";
import { HandlerMethod } from "./websocket-handler";
import { v4 as uuidv4 } from 'uuid'

export interface Request {
    id?: string, // correlation id
    session?: string, // session id
    request: string,
    args: any[]
}

export interface Result {
    id?: string, // correlation id

    response: any,
    result: any
}

interface Pending<T> {
    id: string,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
}

@Injectable({providedIn: 'root'})
export class WebsocketManager {
    // instance data

    pending: { [id: string]: Pending<any> } = {};
    call$: Observable<any> = new Subject();
    result$: Observable<any> = new Subject();
    open$ = new BehaviorSubject<boolean>(false);

    next = 0 // correlation id

    callbacks : { [id: string]: HandlerMethod } = {};

    session = uuidv4()

    // constructor

    constructor(private stomp: RxStomp) {
        this.subscribe(stomp)

        // and activate

        stomp.activate()
    }

    // public

    active() : boolean {
        return this.stomp.active
    }

    registerCallback(name: string, callback: HandlerMethod) {
        this.callbacks[name] = callback
    }

    // private

    private subscribe(stomp: RxStomp) {
        stomp.connectionState$.subscribe(state => {
            switch(state) {
                case RxStompState.CONNECTING:
                    if ( Tracer.ENABLED) Tracer.Trace("websocket", TraceLevel.HIGH, "connecting")
                    break;

                case RxStompState.OPEN:
                    if ( Tracer.ENABLED) Tracer.Trace("websocket", TraceLevel.HIGH, "open")

                    this.open$.next(true)
                    break;

                case RxStompState.CLOSING:
                    if ( Tracer.ENABLED) Tracer.Trace("websocket", TraceLevel.HIGH, "closing")
                    break;

                case RxStompState.CLOSED:
                    if ( Tracer.ENABLED) Tracer.Trace("websocket", TraceLevel.HIGH, "closed")
                    this.open$.next(false)
                    break;
            } // switch
        })

        this.call$ = stomp.watch('/session/call' + this.session) // NEW /user/queue/call'
            .pipe(
                map(message => JSON.parse(message.body)),
                //share({resetOnRefCountZero: true})
            )

        this.result$ = stomp.watch('/session/result'  + this.session)// NEW /user/queue/call'
            .pipe(
                map(message => JSON.parse(message.body)),
                //share({resetOnRefCountZero: true})
            )

        this.call$.subscribe(request => this.handleRequest(request))
        this.result$.subscribe(result => this.handleResult(result))
    }

    private nextId() : string {
        return '' + this.next++
    }

    private promise<T>(request: Request, timeout: number) : Promise<T> {
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

                    reject(new Error(`timout after ${timeout}ms for request ${request.request}`))
                }, timeout)
        })
    }

    private handleResult(result: Result) {
        if ( Tracer.ENABLED)
            Tracer.Trace("websocket", TraceLevel.FULL, "handle result {0}", result.response)

        try {
            const pending = this.pending[result.id!]

            if ( pending )
                pending.resolve(result.result)
            else {
                if ( Tracer.ENABLED)
                    Tracer.Trace("plugin", TraceLevel.FULL, "no recipient for the result of {0}.{1}", result.response)
            }
        }
        finally {
            delete this.pending[result.id!]
        }
    }

    // protected

    protected handleRequest(request: Request) {
        if ( Tracer.ENABLED)
            Tracer.Trace("websocket", TraceLevel.FULL, "handle request {0}", request.request)

        this.callbacks[request.request].apply(request.args)
    }

    public execute<T>(request: Request, expectedValue: boolean, timeout: number) : Promise<T> | undefined {
        if ( Tracer.ENABLED)
            Tracer.Trace("websocket", TraceLevel.FULL, "execute {0}", request.request)

        request.session = this.session // NEW
        if ( !this.stomp.active)
            console.log("?")

        // prepare request

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
