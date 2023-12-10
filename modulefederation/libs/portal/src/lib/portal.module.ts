import {ReplaySubject} from "rxjs";
import {
  APP_INITIALIZER,
  InjectionToken,
  Injector,
  ModuleWithProviders,
  NgModule
} from "@angular/core";
import { Routes} from "@angular/router";
import {DeploymentLoader} from "./deployment/deployment-loader";
import {PortalConfigurationService} from "./portal-configuration-service";
import {Manifest} from "./deployment/deployment-model";
import {ModulesModule} from "./modules";
import { FeatureOutletDirective } from "./components/feature-outlet.component";

export type PortalModuleConfig = {
  loader: DeploymentLoader,
  localRoutes: Routes,
  localManifest: Manifest
}

export const PortalModuleConfigToken = new InjectionToken<PortalModuleConfig>('PortalModuleConfig');


function loadPortalConfiguration(configurationService: PortalConfigurationService) : () => Promise<void> {
  return () => configurationService.load();
}

@NgModule({
  imports: [ModulesModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadPortalConfiguration,
      multi: true,
      deps: [PortalConfigurationService]
    },
  ],
  declarations: [FeatureOutletDirective],
  exports: [FeatureOutletDirective]
})
export class PortalModule {
  static injector = new ReplaySubject<Injector>(1);

  constructor(injector : Injector) {
    PortalModule.injector.next(injector);
  }

  public static forRoot(config: PortalModuleConfig): ModuleWithProviders<PortalModule> {
    return {
      ngModule: PortalModule,
      providers: [
        {
          provide: PortalModuleConfigToken,
          useValue: config
        },
        {
          provide: DeploymentLoader,
          useValue: config.loader
        },
      ]
    };
  }
}
