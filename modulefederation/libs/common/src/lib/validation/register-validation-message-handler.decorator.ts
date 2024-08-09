
// the decorator

import { GConstructor } from '../lang';
import { ValidationMessageHandler } from './validation-message-handler.interface';
import { ValidationMessageRegistry } from './validation-message-registry';

/**
 * decorates classes that implement the interface {@link ValidationMessageHandler}
 * @param validation the validation name
 * @constructor
 */
export function RegisterValidationMessageHandler<T extends ValidationMessageHandler = ValidationMessageHandler> (validation: string) {
  let issuedWarning = false;

  return (clazz: GConstructor<ValidationMessageHandler>) => {
    import('./validation.module').then((m) => {
      m.ValidationModule.injector.subscribe((injector) => {
        if (injector) {
          const registry = injector.get(ValidationMessageRegistry);

          registry.register(validation, injector.get(clazz));
        }
        else if (!issuedWarning) {
          console.warn('@RegisterValidationMessageHandler expects that you import the ValidationModule!');

          issuedWarning = true;
        }
      });
    });
  };
}
