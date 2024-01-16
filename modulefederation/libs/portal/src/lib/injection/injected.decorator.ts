import 'reflect-metadata';
import { TypeDescriptor } from '../reflection';
import { InjectProperty } from '../reflection/injector';
import { Injector } from '@angular/core';

/**
 * we still need to add the type manually.
 * Is that really required?
 */
export interface InjectConfiguration {
  type: any;
}
/**
 * use this decorator to annotate properties that need to be injected in combination with <code>WithInjection</code>
 * @constructor
 */
export function Injected(configuration?: InjectConfiguration) {
  return function (target: any, propertyKey: string) {
    const type = configuration?.type || Reflect.getMetadata('design:type', target, propertyKey);

    TypeDescriptor.forType(target.constructor)
      .addPropertyDecorator(target, propertyKey, Injected as any)
      .addInjector(new InjectProperty(propertyKey, (injector: Injector) => injector.get(type, undefined, {})))
  };
}
