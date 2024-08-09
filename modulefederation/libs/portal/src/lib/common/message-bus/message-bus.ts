import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { BusMessage } from "./message"
import { TraceLevel, Tracer } from '@modulefederation/common';

/**
 * A <code>MessageBus</code> is a central hub where messages can be sent which will be delivered to any subscribed client.
 */
@Injectable({ providedIn: 'root' })
export class MessageBus {
  // instance data

  private stream = new Subject<BusMessage>();

  // constructor

  constructor() {}

  // public

  /**
   * broadcast a message to all subscribers
   * @param message the message object
   */
  broadcast(message: BusMessage<any>): void {
    if (Tracer.ENABLED)
      Tracer.Trace('message-bus', TraceLevel.MEDIUM, 'broadcast topic {0}: {1}', message.topic, message.message);

    this.stream.next(message);
  }

  /**
   * subscribe to a specific topic
   * @param topic the topic
   */
  listenFor<T>(topic: string): Observable<BusMessage<T>> {
    if (Tracer.ENABLED) Tracer.Trace('message-bus', TraceLevel.MEDIUM, 'subscribe to message bus');

    return this.stream.pipe(
       filter((msg) => msg.topic === topic)
    );
  }
}
