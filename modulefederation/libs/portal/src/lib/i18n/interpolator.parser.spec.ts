/*import {Placeholder, PlaceholderParser} from "@cgm-ui/common";
import {expect} from "@angular/flex-layout/_private-utils/testing";

describe('interpolator parser', () => {
  let parser: PlaceholderParser;

  beforeAll(() => (parser = new PlaceholderParser()));

  it('should parse placeholder', (done: DoneFn) => {
    const placeholder : Placeholder = parser.parse('{num}');

    expect(placeholder.name).toBe('num');

    done();
  });

  it('should parse format name only', (done: DoneFn) => {
    const placeholder : Placeholder = parser.parse('{num:number}');

    expect(placeholder.name).toBe('num');
    expect(placeholder.format.format).toBe('number');

    done();
  });

  it('should parse format', (done: DoneFn) => {
    const placeholder : Placeholder = parser.parse('{num:number()}');

    expect(placeholder.name).toBe('num');
    expect(placeholder.format.format).toBe('number');

    done();
  });

  it('should parse parameters', (done: DoneFn) => {
    const placeholder : Placeholder = parser.parse("{num:number(number: 1, negative: -1, t: true, f: false, str1: 'str1',  str2: 'str2')}");

    expect(placeholder.name).toBe('num');
    expect(placeholder.format.format).toBe('number');
    expect(placeholder.format.parameters.number).toBe(1);
    expect(placeholder.format.parameters.t).toBe(true);
    expect(placeholder.format.parameters.f).toBe(false);
    expect(placeholder.format.parameters.str1).toBe('str1');
    expect(placeholder.format.parameters.str2).toBe('str2');

    done();
  });

});
*/
