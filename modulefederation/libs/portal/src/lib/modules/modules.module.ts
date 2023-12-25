import { Injector, NgModule } from '@angular/core';
import { ModuleRegistry } from './module-registry';
import { AbstractModule } from '../injection';

/**
 * the modules module
 */
@NgModule({
    imports: [],
    providers: [ModuleRegistry]
})
export class ModulesModule extends AbstractModule() {
    constructor(injector: Injector) {
        super(injector);
    }
}
