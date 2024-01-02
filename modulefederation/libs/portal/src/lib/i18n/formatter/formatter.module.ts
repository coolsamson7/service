import { Injector, NgModule } from '@angular/core';
import { FormatterRegistry } from './formatter-registry';
import { AbstractModule } from '../../injection';

import("./impl/date-formatter")
  .then(result => console.log(result))
import("./impl/number-formatter")
  .then(result => console.log(result))
import("./impl/string-formatter")
  .then(result => console.log(result))

@NgModule({
    imports: []
})
export class FormatterModule extends AbstractModule() {
    constructor(injector : Injector) {
        super(injector)
    }
}
