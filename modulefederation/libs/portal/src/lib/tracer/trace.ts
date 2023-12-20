import { TraceFormatter } from './trace-formatter';
import { TraceEntry } from './trace-entry';

/**
 * A <code>Trace</code> is used to emit a trace entry.
 */
export abstract class Trace {
  // instance data

  private formatter : TraceFormatter;

  // constructor

  protected constructor(formatter : TraceFormatter | string) {
    this.formatter = typeof formatter == 'string' ? new TraceFormatter(formatter) : formatter;
  }

  // protected

  abstract trace(entry : TraceEntry) : void;

  // abstract

  /**
   * format a trace entry
   * @param entry the entry
   */
  protected format(entry : TraceEntry) : string {
    return this.formatter.format(entry);
  }
}
