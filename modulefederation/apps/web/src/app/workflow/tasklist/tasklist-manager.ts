import { Injectable } from "@angular/core";
import { MessageBus } from "@modulefederation/portal";

import { Task } from "../service/task-service";
import { Call, Callback, Handler } from "./websocket.decorator";

export interface TasklistDelta {
    added: Task[],
    deleted: Task[]
}


@Injectable({providedIn: 'root'})
@Handler("tasklist")
export class TasklistManager {
    // constructor

    constructor(private messageBus: MessageBus) {
    }

    // calls

    @Call()
    register(user: string) : Promise<Task[]> | undefined {
       return undefined  // make the compiler happy
    }

    @Call()
    unregister(user: string) : Promise<string> | undefined {
        return undefined  // make the compiler happy
     }

     // callback

     @Callback
     tasklist(delta: TasklistDelta) {
        this.messageBus.broadcast({
            topic: "tasklist",
            message: "update",
            arguments: delta

        })
     }
}
