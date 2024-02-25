/**
 * A <code>Message</code> consists of
 * <ul>
 *   <li>a topic</li>
 *   <li>a message</li>
 *   <li>additional optional arguments</li>
 * </ul>
 */
export interface BusMessage<T=any> {
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
   * arguments of the specific message
   */
  arguments?: T;
}
