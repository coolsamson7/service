import { FeatureRegistry } from './feature-registry';
import {FeatureConfig} from "./feature-config";
import {map} from "rxjs";
import {MicrofrontendMetadata} from "./register-microfrontend.decorator";
import {inject, InjectFlags} from "@angular/core";

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

          // get registry

          try {
            let foo = inject(MicrofrontendMetadata, InjectFlags.Optional)

            console.log(foo)
          }
          catch (e) {

          }

          const registry = injector.get(FeatureRegistry)

          registry.registry$.subscribe((_) => {
              // they should both point to the same object!

            //console.log("register " + config.name)
            //console.log("register " + config.name + " in " + foo.name);

              //TODO config = registry.getFeature(config.name);

              (ctor as any).$$feature = config

              //TODO config.ngComponent = ctor
          })
        });
      })
  }
}
