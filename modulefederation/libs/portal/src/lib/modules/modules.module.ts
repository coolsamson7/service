import { Injector, NgModule } from '@angular/core';
import { AbstractModule } from '../injection/abstract-module';

/**
 * the modules module
 */
@NgModule({
    imports: [],
    providers: []
})
export class ModulesModule extends AbstractModule() {
    constructor(injector: Injector) {
        super(injector);
    }
}
