import { Injectable, NgZone } from "@angular/core";
import { Observable, Subject } from 'rxjs';
import { ServiceInstanceDTO } from "../model/service-instance.interface";
import { Environment } from "../common/util/environment.service";

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

  constructor(private zone : NgZone, private environment : Environment) {
    this.setup();
  }

  // private

  setup() {
    // local function

    let connect = () => {
      console.log("connect ")

      // create source

      let url = this.environment.get<string>("administration.server") + "/administration/listen/" + this.subscriberId
      let source = new EventSource(url);

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
