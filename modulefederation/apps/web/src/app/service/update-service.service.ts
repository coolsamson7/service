import { Injectable, NgZone } from "@angular/core";
import { Observable, Subject } from 'rxjs';
import { ServiceInstanceDTO } from "../model/service-instance.interface";
import { ConfigurationManager } from "@modulefederation/portal";

export interface Update {
    deletedServices : string[],
    addedServices : string[],
    deletedInstances : { [key : string] : string[] }
    addedInstances : { [key : string] : ServiceInstanceDTO[] }
}

export type Healths = { [key : string] : string }

@Injectable({
    providedIn: 'root',
})
export class UpdateService {
    // static data

    private static readonly MAX_RETRIES = 5;

    // instance data
    subscriberId = crypto.randomUUID();
    private retryCount = 0;
    private observable : Subject<Update> = new Subject<Update>()

    // constructor

    constructor(private zone : NgZone, private configurationManager : ConfigurationManager) {
        this.setup();
    }

    // private

    setup() {
        // local function

        const connect = () => {
            console.log("connect ")

            // create source

            const url = this.configurationManager.get<string>("admin.server") + "/administration/listen/" + this.subscriberId
            const source = new EventSource(url);

            // attach callbacks

            // open

            source.onopen = event => {
                //console.log("opened sse ")
            }

            // update

            source.addEventListener('update', (event) => {
                this.zone.run(() => {
                    this.observable.next(JSON.parse(event.data))
                })
            })

            // error

            source.onerror = event => {
                console.log("got sse error ")

                this.zone.run(() => {
                    this.observable.error(event)

                    source.close();

                    if (this.retryCount > UpdateService.MAX_RETRIES) {
                        console.log('too many retries');
                    }
                    else {
                        this.retryCount++;

                        console.log('retry');

                        connect();
                    }
                })
            }
        }

        connect()
    }

    // public

    getUpdates() : Observable<Update> {
        return this.observable
    }
}
