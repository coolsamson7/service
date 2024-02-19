
import { StackFrame } from '../common/util';
import { TraceLevel } from './trace-level.enum';

/**
 * A <code>TraceEntry</code> is the internal representation of a trace entry.
 */
export class TraceEntry {
    /**
     * the path
     */
    path : string;
    /**
     * the level
     */
    level : TraceLevel;
    /**
     * the formatted message
     */
    message : string;
    /**
     * the timestamp
     */
    timestamp : Date = new Date();

    stackFrame : StackFrame

    // constructor

    constructor(path : string, level : TraceLevel, message : string, timestamp : Date, stackFrame : StackFrame) {
        this.path = path;
        this.level = level;
        this.message = message;
        this.timestamp = timestamp;
        this.stackFrame = stackFrame
    }
}
