import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { Authentication } from './authentication';
import { Authorization } from './authorization';
import { Ticket } from "./ticket.interface";
import { SessionManager, StandardSessionManager } from "./session-manager";

/**
 * the configuration object for the security module
 */
interface SecurityModuleConfig {
    sessionManager? : Type<SessionManager<any, Ticket>>;

    authentication? : Type<Authentication<any, Ticket>>;

    authorization? : Type<Authorization>;
}

@NgModule({
    imports: [],
    declarations: [],
    exports: []
})
export class SecurityModule {
    // static methods

    static forRoot(config : SecurityModuleConfig = {}) : ModuleWithProviders<SecurityModule> {
        return {
            ngModule: SecurityModule,
            providers: [
                {
                    provide: Authentication,
                    useClass: config?.authentication || Authentication
                },
                {
                    provide: SessionManager,
                    useClass: config?.sessionManager || StandardSessionManager
                },
                {
                    provide: Authorization,
                    useClass: config?.authorization || Authorization
                }
            ]
        };
    }
}
