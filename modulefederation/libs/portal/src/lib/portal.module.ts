import {ReplaySubject} from "rxjs";
import {
  APP_INITIALIZER, Inject,
  Injectable,
  InjectionToken,
  Injector,
  ModuleWithProviders,
  NgModule,
  Type
} from "@angular/core";
import {Router, Routes} from "@angular/router";
import {FeatureRegistry} from "./feature-registry";
import {Deployment, DeploymentLoader} from "./deployment";

export type PortalModuleConfig = {
  loader: DeploymentLoader,
  localRoutes: Routes
}

export const PortalModuleConfigToken = new InjectionToken<PortalModuleConfig>('PortalModuleConfig');

@Injectable({ providedIn: 'root' })
export class PortalConfigurationService {
  // constructor

  constructor(
    @Inject(PortalModuleConfigToken) private portalConfig: PortalModuleConfig,
    private featureRegistry : FeatureRegistry,
    private router : Router
  ) {
  }

  // private

  private setupDeployment(deployment: Deployment) {
    // set remote definitions

    deployment.setRemoteDefinitions()

    // setup routes

    this.router.resetConfig(deployment.buildRoutes(this.portalConfig.localRoutes))
  }

  // public

  async load(): Promise<void> {
    this.portalConfig.loader.load()
      .then((deployment) => this.setupDeployment(deployment))
  }
}
function loadPortalConfiguration(configurationService: PortalConfigurationService) {
  return () => configurationService.load();
}

@NgModule({
  imports: [],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadPortalConfiguration,
      multi: true,
      deps: [PortalConfigurationService]
    },
  ],
  declarations: [/*FeatureOutletDirective*/],
  exports: [/*FeatureOutletDirective*/]
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
