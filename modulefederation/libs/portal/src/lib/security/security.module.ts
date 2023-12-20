import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { Authentication } from './authentication';
import { Authorization } from './authorization';
import { User } from "./user.interface";
import { Ticket } from "./ticket.interface";

/**
 * the configuration object for the security module
 */
interface SecurityModuleConfig {
  authentication? : Type<Authentication<User, Ticket>>;

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
          provide: Authorization,
          useClass: config?.authorization || Authorization
        }
      ]
    };
  }
}
