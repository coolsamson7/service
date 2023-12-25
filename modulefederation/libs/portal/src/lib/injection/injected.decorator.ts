import 'reflect-metadata';

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
    let inject = target.constructor.$$inject;

    if (!inject) inject = target.constructor.$$inject = {};

    const type = configuration?.type || Reflect.getMetadata('design:type', target, propertyKey);

    inject[propertyKey] = type;
  };
}
