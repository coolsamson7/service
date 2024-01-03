import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { TraceLevel, Tracer } from 'libs/portal/src/lib/tracer';

/**
 * A <code>Message</code> consists of
 * <ul>
 *   <li>a topic</li>
 *   <li>a message</li>
 *   <li>additional optional arguments</li>
 * </ul>
 */
export interface Message {
  /**
   * optional sender information.
   */
  sender?: any;
  /**
   * the topic of the message
   */
  topic: string;
  /**
   * the message type
   */
  message: string;
  /**
   * any payload information of the specific message
   */
  payload?: any;
}

/**
 * A <code>MessageBus</code> is a central hub where messages can be sent which will be delivered to any subscribed client.
 */
@Injectable({ providedIn: 'root' })
export class MessageBus {
  // instance data

  private stream = new Subject<Message>();

  // constructor

  constructor() {}

  // public

  /**
   * broadcast a message to all subscribers
   * @param message the message object
   */
  broadcast(message: Message): void {
    if (Tracer.ENABLED)
      Tracer.Trace('message-bus', TraceLevel.MEDIUM, 'broadcast topic {0}: {1}', message.topic, message.message);

    this.stream.next(message);
  }

  /**
   * subscribe to a specific topic
   * @param topic the topic
   */
  listenFor(topic: string): Observable<Message> {
    if (Tracer.ENABLED) Tracer.Trace('message-bus', TraceLevel.MEDIUM, 'subscribe to message bus');

    return this.stream.pipe(filter((msg) => msg.topic === topic));
  }
}
