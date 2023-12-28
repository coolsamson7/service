/*import {expect} from "@angular/flex-layout/_private-utils/testing"
import {DateFormatter, FormatterRegistry, NumberFormatter, StringFormatter} from "../formatter";
import { Interpolator } from "./interpolator";
import { LocaleManager } from "../locale";
import { PlaceholderParser } from "./interpolator.parser";

describe('interpolator', () => {
  let interpolator: Interpolator;

  beforeAll(() => {
    const localeManager = new LocaleManager({}); // en
    const registry = new FormatterRegistry();

    registry.register('string', new StringFormatter(localeManager));
    registry.register('number', new NumberFormatter(localeManager));
    registry.register('date',  new DateFormatter(localeManager));

    //registry.

    interpolator = new Interpolator(
      new PlaceholderParser(),
      registry
    );
  }
  );

  it('should interpolate', (done: DoneFn) => {
    let value = interpolator.interpolate('Hello {world}!', {world: 'world'});

    expect(value).toBe('Hello world!');

    value = interpolator.interpolate("price: {price:number(style: 'currency', currency: 'EUR')}", {price: 1});

    expect(value).toBe('price: €1.00');

    done();
  });

});
*/
