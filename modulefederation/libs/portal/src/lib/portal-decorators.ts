import {Observable} from "rxjs";
import {FeatureRegistry} from "./feature-registry";

export interface FeatureConfig {
  parent?: string
  name: string
  description?: string
  isDefault?: boolean
  label?: string
  component?: string
  tags?: string[]
  categories?: string[]
  visibility?:string[]
  permissions?: string[]
  featureToggles?: string[]

  ngComponent?: any
  load?: () => Observable<any>
}

export function RegisterFeature(config : FeatureConfig) {
  return (ctor : Function) => {
    console.log("RegisterFeature: " + config.name);

    import('./portal.module')
      .then((m) => {
        m.PortalModule.injector.subscribe((injector) => {
          if (!injector) {
            console.error(`
            PortalModule injector is missing.
            Please import the PortalModule.forRoot() in the AppModule.
          `);
            return;
          }

          // get registry

          const registry = injector.get(FeatureRegistry)

          // they should both point to the same object!

          config = registry.getFeature(config.name);

          (ctor as any).$$feature = config

          //TODO config.ngComponent = ctor
        });
      })
  }
}


export interface ModuleConfig {
  name: string
  //component: string
  description?: string
}

export function RegisterModule(config: ModuleConfig) {
  console.log(config)
  return (ctor: Function) => {
    console.log("RegisterModule: " + config.name);
  }
}
