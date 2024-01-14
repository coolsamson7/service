import { TypeDescriptor } from '../reflection';
import { CommandConfig } from './command-config';

/**
 * registers a command
 * @param config the command config
 */
export function Command(config: CommandConfig) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    TypeDescriptor.forType(target.constructor).addMethodDecorator(target, propertyKey, Command, config)

    if (!config.command) config.command = propertyKey;

    config.action = descriptor.value;
  };
}
