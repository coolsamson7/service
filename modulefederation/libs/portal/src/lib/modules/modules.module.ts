import { Injector, NgModule } from '@angular/core';
import { ModuleRegistry } from './module-registry';
import { AbstractModule } from '../injection';

console.log("##### ModulesModule")

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
