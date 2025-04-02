import { Injectable } from "@angular/core";
import { TraceLevel, Tracer } from "@modulefederation/common";
import { SessionManager } from "@modulefederation/portal";
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
    // instance data

   private  tasklistComponent!: TasklistComponent // TODO

    // constructor

    constructor(stomp: RxStomp, private sessionManager: SessionManager) {
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

    register(tasklist: TasklistComponent) : Promise<Task[]> | undefined {
        this.tasklistComponent = tasklist // TODO bs, der...

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
        this.tasklistComponent.updateList(delta)
     }
}
