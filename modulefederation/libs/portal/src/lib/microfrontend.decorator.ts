import { InjectionToken, Type } from "@angular/core";
import { Module, ModuleMetadata } from "./modules";

/**
 * @ignore
 */
export type MicrofrontendMetadata = ModuleMetadata & {
  type? : 'microfrontend';
};

export const MicrofrontendMetadata = new InjectionToken<MicrofrontendMetadata>('MicrofrontendMetadata');


export function Microfrontend(metadata : MicrofrontendMetadata) {
  metadata.type = 'microfrontend';

  return (componentClass : Type<any>) => Module(metadata, MicrofrontendMetadata)(componentClass);
}
