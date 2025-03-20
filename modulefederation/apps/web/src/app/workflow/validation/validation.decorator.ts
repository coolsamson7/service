import { AbstractModelValidator } from './abstract-validator';
import { ModelValidation } from './validation';

export const RegisterValidation = (type: string): ClassDecorator => {
    return (validation: any) => {
      import('./validation.module').then((m) => {
        m.ModelValidationModule.injector.subscribe((injector) => {
          const modelValidation = injector.get(ModelValidation);
          const validator : AbstractModelValidator = injector.get(validation)

          validator.type = type
  
          modelValidation.register(validator);
        });
      });
    };
  };
  