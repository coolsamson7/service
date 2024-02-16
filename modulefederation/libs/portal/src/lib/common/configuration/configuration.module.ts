import { ModuleWithProviders, NgModule } from "@angular/core";
import { ConfigurationManager } from "./configuration-manager";
import { ConfigurationSource } from "./configuration-source";

@NgModule({
    imports: [],
    providers: [],
    declarations: [],
    exports: [],
})
export class ConfigurationModule {
    static forRoot(...sources: ConfigurationSource[]) : ModuleWithProviders<ConfigurationModule> {
        return {
            providers: [{
              provide: ConfigurationManager,
              useValue: new ConfigurationManager(...sources)
            }],
            ngModule: ConfigurationModule,
        };
    }
}
