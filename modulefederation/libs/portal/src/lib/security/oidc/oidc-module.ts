import { InjectionToken, ModuleWithProviders, NgModule } from "@angular/core";
import { AuthConfig } from "angular-oauth2-oidc";

/**
 * the configuration object for the oidc module
 */
export interface OIDCModuleConfig {
    authConfig: AuthConfig
}

export const OIDCModuleConfigToken = new InjectionToken<OIDCModuleConfig>('OIDCModuleConfig');

@NgModule({
    imports: [],
    declarations: [],
    exports: []
})
export class OIDCModule {
    // static methods

    static forRoot(config : OIDCModuleConfig) : ModuleWithProviders<OIDCModule> {
        return {
            ngModule: OIDCModule,
            providers: [
                {
                    provide: OIDCModuleConfigToken,
                    useValue: config
                },
            ]
        };
    }
}
