import { StringBuilder } from "../common";
import { TraceEntry } from "./trace-entry";
import { TraceLevel } from "./trace-level.enum";

/**
 * @ignore
 */
declare type renderer = (builder : StringBuilder, model : TraceModel) => void;

interface TraceModel {
  p : string;
  d : string;
  l : string;
  m : string;
}

interface Callbacks {
  string : (value : string) => void;
  d : () => void;
  l : () => void;
  p : () => void;
  m : () => void;
}

/**
 * @ignore
 */
export class TraceFormatter {
  // instance data

  private readonly renderer : renderer[];

  // constructor

  constructor(format : string) {
    this.renderer = this.parse(format);
  }

  // private

  format(entry : TraceEntry) : string {
    return this.build({
      p: entry.path,
      d: entry.timestamp.toDateString(),
      l: this.level(entry.level),
      m: entry.message,
    });
  }

  private level(level : TraceLevel) : string {
    switch (level) {
      case TraceLevel.OFF:
        return "OFF";
      case TraceLevel.LOW:
        return "LOW";
      case TraceLevel.MEDIUM:
        return "MEDIUM";
      case TraceLevel.HIGH:
        return "HIGH";
      case TraceLevel.FULL:
        return "FULL";
    }
  }

  private scan(format : string, callbacks : Callbacks) {
    // go

    let start = 0;
    let i;

    while ((i = format.indexOf("%", start)) >= 0) {
      // rest from last run?

      if (i > start) callbacks.string(format.substring(start, i));

      // take care of placeholder

      (callbacks as any)[format[++i]]!();

      // next

      start = ++i;
    } // while

    // last element

    if (start < format.length) callbacks.string(format.substring(start));
  }

  private parse(format : string) : renderer[] {
    const result : renderer[] = []; // array of strings or functions

    this.scan(format, {
      // string literal

      string: (value : string) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        result.push((builder : StringBuilder, model : TraceModel) =>
          builder.append(value)
        );
      },

      // placeholders

      d: () => {
        // date
        result.push((builder : StringBuilder, model : TraceModel) =>
          builder.append(model.d)
        );
      },
      l: () => {
        // level
        result.push((builder : StringBuilder, model : TraceModel) =>
          builder.append(model.l)
        );
      },
      p: () => {
        // path
        result.push((builder : StringBuilder, model : TraceModel) =>
          builder.append(model.p)
        );
      },
      m: () => {
        // message
        result.push((builder : StringBuilder, model : TraceModel) =>
          builder.append(model.m)
        );
      },
    });

    return result;
  }

  // '%d [%l] %p: %m', // d(ate), l(evel), p(ath), m(message)
  private build(args : TraceModel) : string {
    const builder = new StringBuilder();

    for (const render of this.renderer) render(builder, args);

    return builder.toString();
  }
}
