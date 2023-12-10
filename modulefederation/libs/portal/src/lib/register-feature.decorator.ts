import { FeatureRegistry } from './feature-registry';
import {FeatureConfig} from "./feature-config";

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
