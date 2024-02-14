import {describe, expect, test} from '@jest/globals';

 interface Format {
  format : string;
  parameters? : { [key : string] : any };
}

/**
 * @ignore
 */
interface Placeholder {
  name : string;
  format? : Format;
}


class PlaceholderParser {
  // instance data

  variable = /^{(?<variable>\w+)}$/
  variableFormat = /^{(?<variable>\w+)\s*:\s*(?<format>\w+)}$/
  variableFormatArgs = /^{(?<variable>\w+)\s*:\s*(?<format>\w+)\((?<parameter>\w+\s*:\s*(\d+|'\w+')(\s*,\s*\w+\s*:\s*(-?\d+|'\w+'|true|false))*)\)}$/
  parameter =  /\s*(?<parameter>\w+)\s*:\s*(?<value>-?\d+|'\w+'|true|false)(?:,|$)*/g

  // public

  parse(input: string) : Placeholder {
    // variable

    let result: RegExpMatchArray | null
    if ((result = input.match(this.variable))) {
      return {
        name: result.groups!['variable']
      }
    }

    // variable:format

    else if ((result = input.match(this.variableFormat))) {
      return {
        name:  result.groups!['variable'],
        format:  {format: result.groups!['format']}
      }
    }

    // variable:format(<param>:<value>, ...)
    else if ((result = input.match(this.variableFormatArgs))) {
      const formatParameter = {}
      const format = {
        name: result.groups!['variable'],
        format: {
          format: result.groups!['format'],
          parameters: formatParameter
        },
      }

      const parameters = result.groups!['parameter']

      // parse parameters individually

      while ((result = this.parameter.exec(parameters))) {
        const parameter = result.groups!["parameter"]
        let value: any = result.groups!["value"] as string

        if (value.startsWith("'"))
          value = value.substring(1, value.length - 1)
        else if (value == "true")
          value = true
        else if (value == "false")
          value = false

        else {
          if ( value.startsWith("-"))
            value = - +value.substring(1)
          else
            value = +value
        }

        // @ts-ignore
        formatParameter[parameter] = value
      }

      return format
    }
    else
     throw new Error("could not parse " + input)
  }
}

describe('interpolator parser', () => {
  let parser: PlaceholderParser;

  beforeAll(() => (parser = new PlaceholderParser()));

  test('should parse placeholder', () => {
    const placeholder : Placeholder = parser.parse('{num}');

    expect(placeholder.name).toBe('num');
  });

  test('should parse format name only', () => {
    const placeholder : Placeholder = parser.parse('{num:number}');

    expect(placeholder.name).toBe('num');
    expect(placeholder.format!.format).toBe('number');
  });

  test('should parse parameters', () => {
    const placeholder : Placeholder = parser.parse("{num:number(number: 1 , negative: -1, t: true, f: false, str1: 'str1',  str2: 'str2')}");

    expect(placeholder.name).toBe('num');
    expect(placeholder.format!.format).toBe('number');
    expect(placeholder.format!.parameters!['number']).toBe(1);
    expect(placeholder.format!.parameters!['t']).toBe(true);
    expect(placeholder.format!.parameters!['f']).toBe(false);
    expect(placeholder.format!.parameters!['str1']).toBe('str1');
    expect(placeholder.format!.parameters!['str2']).toBe('str2');
  })
})
