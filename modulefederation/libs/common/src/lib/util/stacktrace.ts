/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { catchError, forkJoin, lastValueFrom, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { SourceMapConsumer } from 'source-map-js';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const UNKNOWN_FUNCTION = '<unknown>';

export interface StackFrame {
  file: string | null
  methodName: string | null
  arguments: any[] | null,
  lineNumber: number | null,
  column: number | null
}

// parser stuff

interface Parser {
  parse(line: string): StackFrame | null
}

class ChromeParser implements Parser {
  // instance data

  chromeRe = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  chromeEvalRe = /\((\S*)(?::(\d+))(?::(\d+))\)/;


  // implement Parser

  parse(line: string): StackFrame | null {
    const parts = this.chromeRe.exec(line);

    if (!parts)
      return null;


    const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
    const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line

    const submatch = this.chromeEvalRe.exec(parts[2]);
    if (isEval && submatch != null) {
      // throw out eval line/column and use top-most line/column number

      parts[2] = submatch[1]; // url
      parts[3] = submatch[2]; // line
      parts[4] = submatch[3]; // column
    }

    return {
      file: !isNative ? parts[2] : null,
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: isNative ? [parts[2]] : [],
      lineNumber: parts[3] ? +parts[3] : null,
      column: parts[4] ? +parts[4] : null,
    };
  }
}

class GeckoParser implements Parser {
  // instance data

  geckoRe = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
  geckoEvalRe = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;

  // implement Parser

  parse(line: string): StackFrame | null {
    const parts = this.geckoRe.exec(line);

    if (!parts)
      return null;


    const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;

    const submatch = this.geckoEvalRe.exec(parts[3]);
    if (isEval && submatch != null) {
      // throw out eval line/column and use top-most line number
      parts[3] = submatch[1];
      parts[4] = submatch[2];
      parts[5] = ""//null; // no column when eval
    }

    return {
      file: parts[3],
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: parts[2] ? parts[2].split(',') : [],
      lineNumber: parts[4] ? +parts[4] : null,
      column: parts[5] ? +parts[5] : null,
    };
  }
}

/*
class WinJSParser implements Parser {
  // instance data

   winjsRe = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;

  // implement Parser

  parse(line: string) : StackFrame | null {

    const parts = this.winjsRe.exec(line);

    if (!parts)
      return null;


    return {
      file: parts[2],
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: [],
      lineNumber: +parts[3],
      column: parts[4] ? +parts[4] : null,
    };
  }
}

class JSCParser implements Parser {
  // instance data

  const javaScriptCoreRe = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;


  // implement Parser

  parse(line: string) : StackFrame | null {

    const parts = this.javaScriptCoreRe.exec(line);

    if (!parts)
      return null;


    return {
      file: parts[3],
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: [],
      lineNumber: +parts[4],
      column: parts[5] ? +parts[5] : null,
    };
  }
}

class NodeParser implements Parser {
  // instance data

   nodeRe = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;


  // implement Parser

  parse(line: string) : StackFrame | null {

    const parts = this.nodeRe.exec(line);

    if (!parts)
      return null;


    return {
      file: parts[2],
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: [],
      lineNumber: +parts[3],
      column: parts[4] ? +parts[4] : null,
    };
  }
}*/

function determineParser(): Parser {
  if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
    return new ChromeParser()
  else if (navigator.userAgent.toLowerCase().indexOf('gecko') > -1)
    return new GeckoParser()
  else {
    console.log("## unable to parse stracktraces, agent is " + navigator.userAgent);

    return {
      parse(line) {
        return null
      }
    }
  }
}


export class Stacktrace {
  // static data

  static loading: { [key: string]: Observable<SourceMapConsumer> } = {};
  static consumer: { [file: string]: SourceMapConsumer } = {}

  static parser = determineParser()


  // public

  static async mapFrames(...frames: StackFrame[]): Promise<StackFrame[]> {
    const files: { [file: string]: boolean } = {}
    for (const frame of frames)
      if (frame.file && frame.file!.includes(":"))
        files[frame.file!] = true

    // load missing source maps

    const missingFiles = Object.keys(files).filter(file => this.consumer[file] == undefined)

    if (missingFiles.length > 0) {
      //console.log("load missing source maps ", missingFiles)

      await lastValueFrom(forkJoin(missingFiles.map(file => this.loadSourcemap(file))))
    }

    // map

    for (const stackFrame of frames) {
      if (stackFrame.lineNumber && stackFrame.file && stackFrame.file.includes(":")) {
        const originalPosition = this.consumer[stackFrame.file].originalPositionFor({
          line: stackFrame.lineNumber!,
          column: stackFrame.column!,
        });

        stackFrame.file = originalPosition.source
        stackFrame.lineNumber = originalPosition.line
        stackFrame.column = originalPosition.column
      }
    }

    // done

    return frames
  }


  static createFrames(stack: string): StackFrame[] {
    return stack.split('\n').reduce((stack: StackFrame[], line) => {
      const frame = this.parser.parse(line)

      if (frame)
        stack.push(frame);

      return stack;
    }, []);
  }

  // private

  private static loadSourcemap(uri: string): Observable<SourceMapConsumer> {
    const uriQuery = new URL(uri).search;
    const loading = this.loading[uri];

    //console.log("find source map for " + uri)

    if (loading)
      return loading;

    else {
      const request = fromFetch(uri).pipe(
        catchError((e) => {
          console.error(e);
          return of();
        }),

        switchMap(response => response.text()),

        switchMap(script => {
          const match = RegExp(/\/\/# sourceMappingURL=(.*)/).exec(script)

          let mapUri = match !== null ? match[1] : "";
          mapUri = new URL(mapUri, uri).href + uriQuery;

          return fromFetch(mapUri)
        }),

        switchMap(sourceMap => sourceMap.json()),

        map(sourceMap => new SourceMapConsumer(sourceMap)),

        tap(consumer => this.consumer[uri] = consumer),

        shareReplay()
      );

      return this.loading[uri] = request;
    }
  }
}
