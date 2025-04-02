import { Injectable } from "@angular/core";
import { TraceLevel, Tracer } from "@modulefederation/common";
import { MessageBus, SessionManager } from "@modulefederation/portal";
import { RxStomp } from "@stomp/rx-stomp";

import { Task } from "../service/task-service";
import { TasklistComponent } from "./task-list.component";
import { WebsocketManager, Request } from "./websocket-manager";

export interface TasklistDelta {
    added: Task[],
    deleted: Task[]
}


@Injectable({providedIn: 'root'})
export class TasklistManager extends WebsocketManager {
    // constructor

    constructor(stomp: RxStomp, private sessionManager: SessionManager, private messageBus : MessageBus) {
        super(stomp)
    }

    // protected

    protected override handleRequest(request: Request) {
        if ( Tracer.ENABLED)
            Tracer.Trace("tasklist", TraceLevel.FULL, "handle request {0}", request.request)

        switch(request.request) {
            case "tasklist":
                this.tasklist(request.args[0])
                break;

            default:
                console.log("unknown request " + request.request)
        }
    }

    // public

    register() : Promise<Task[]> | undefined {
       return super.execute({
            request: "register",
            args: ["demo"]//this.sessionManager.getUser().name ]
        },
        true, // expect value
        0 // no timeout
    )
    }

    unregister() : Promise<string> | undefined {
        return super.execute({
             request: "unregister",
             args: ["demo"]// TODO this.sessionManager.getUser().name ]
         },
         true, // expect value
         0 // no timeout
     )
     }

     tasklist(delta: TasklistDelta) {
        this.messageBus.broadcast({
            topic: "tasklist",
            message: "update",
            arguments: delta

        })
     }
}
