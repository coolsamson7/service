import { Type, InjectionToken, NgModule, ModuleWithProviders } from "@angular/core";
import { CommandInterceptor } from "./command-interceptor";

/**
 * this interface describes the configuration of the controller module
 */
export interface CommandModuleConfig {
    /**
     * array of command interceptor types
     */
    interceptors: Type<CommandInterceptor>[];
  }
  
  /**
   * @ignore
   */
  export const CommandConfigToken = new InjectionToken<CommandModuleConfig>('CommandConfig');

  
  @NgModule({
    imports: [
    ],
    declarations: [],
    exports: []
  })
  export class CommandModule {
    static forRoot(config: CommandModuleConfig = { interceptors: [] }): ModuleWithProviders<CommandModule> {
      return {
        ngModule: CommandModule,
        providers: [
          {
            provide: CommandConfigToken,
            useValue: config
          }
        ]
      };
    }
  }