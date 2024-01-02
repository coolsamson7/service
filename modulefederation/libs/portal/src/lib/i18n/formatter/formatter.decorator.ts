import { FormatterRegistry } from './formatter-registry';
import { FormatterModule } from "./formatter.module";

/**
 * register the formatter under the given name.
 * @param type the name
 * @constructor
 */
export const Formatter = (type : string) : ClassDecorator => {
    return (formatterClass : any) => {
        import('./formatter.module').then((m) => {
            m.FormatterModule.injectorSubject.subscribe((injector) => {
                const registry = injector.get(FormatterRegistry);

                registry.register(type, injector.get(formatterClass));
            });
        })
    }
}
