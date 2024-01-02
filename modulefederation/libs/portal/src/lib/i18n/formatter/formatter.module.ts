import { Injector, NgModule } from '@angular/core';
import { AbstractModule } from '../../injection';
import { DateFormatter } from "./impl/date-formatter";
import { StringFormatter } from "./impl/string-formatter";
import { NumberFormatter } from "./impl/number-formatter";


@NgModule({
    imports: []
})
export class FormatterModule extends AbstractModule() {
    constructor(injector : Injector) {
        super(injector)

      DateFormatter
      StringFormatter
      NumberFormatter
    }
}
