import { GConstructor } from "../../lang";
import { ValidationMessageManager } from "./validation-message-manager"
import { ValidationMessageProvider } from "./validation-message-provider";

let issuedWarning = false

export function RegisterValidationMessageProvider(type: string) {
    return (clazz: GConstructor<ValidationMessageProvider>) => {
      import('../validation.module').then((m) => {
        m.ValidationModule.injector.subscribe((injector) => {
          if (injector) {
            const manager = injector.get(ValidationMessageManager);

            manager.register(type, injector.get(clazz));
          }
          else if (!issuedWarning) {
            console.warn('@RegisterValidationMessageProvider expects that you import the ValidationModule!');

            issuedWarning = true;
          }
        });
      });
    };
  }
