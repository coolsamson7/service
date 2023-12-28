import { Injector, NgModule } from '@angular/core';
import { FormatterRegistry } from './formatter-registry';
import { AbstractModule } from '../../injection';

import "./impl/date-formatter"
import "./impl/number-formatter"
import "./impl/string-formatter"

@NgModule({
    imports: []
})
export class FormatterModule extends AbstractModule() {
    static formatters : any = [];

    constructor(injector : Injector) {
        super(injector)

        const registry = injector.get(FormatterRegistry);

        for (const formatter of FormatterModule.formatters)
            registry.register(formatter.type, injector.get(formatter.formatterClass));
    }
}
