import {InjectionToken, Type} from "@angular/core";
import { ModuleMetadata, Module } from "./modules";

/**
 * @ignore
 */
export type MicrofrontendMetadata = ModuleMetadata & {
  type?: 'microfrontend';
};

export const MicrofrontendMetadata = new InjectionToken<MicrofrontendMetadata>('MicrofrontendMetadata');


export function RegisterMicrofrontend(metadata: MicrofrontendMetadata) {
  metadata.type = 'microfrontend';

  return (componentClass: Type<any>) => Module(metadata, MicrofrontendMetadata)(componentClass);
}
