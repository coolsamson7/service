import { Trace } from '../trace';
import { TraceEntry } from '../trace-entry';
import { TraceFormatter } from '../trace-formatter';

/**
 * A <code>ConsoleTrace</code> will emit trace entries to the console.
 */
export class ConsoleTrace extends Trace {
    // constructor

    constructor(messageFormat : string) {
        super(new TraceFormatter(messageFormat));
    }

    // implement Trace

    /**
     * @inheritdoc
     */
    trace(entry : TraceEntry) : void {
        console.log(this.format(entry));
    }
}
