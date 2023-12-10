import { FeatureRegistry } from './feature-registry';
import {FeatureConfig} from "./feature-config";
import {map} from "rxjs";

export function RegisterFeature(config : FeatureConfig) {
  return (ctor : Function) => {
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

          console.log("RegisterFeature: " + config.name);

          // get registry

          const registry = injector.get(FeatureRegistry)

          registry.registry$.subscribe((_) => {
            console.log("really register" + config?.name)
              // they should both point to the same object!

              config = registry.getFeature(config.name);

              (ctor as any).$$feature = config

              config.ngComponent = ctor
          })
        });
      })
  }
}
