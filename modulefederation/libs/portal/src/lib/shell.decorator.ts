import {Module, ModuleMetadata} from "./modules";
import {InjectionToken, Type} from "@angular/core";

/**
 * meta data for libraries
 */
export type ShellMetadata = ModuleMetadata & {
    type? : 'shell';
};

export const ShellMetadata = new InjectionToken<ShellMetadata>('ShellMetadata');

export function Shell(metadata : ShellMetadata) {
    metadata.type = 'shell';

    return (componentClass : Type<any>) => Module(metadata, ShellMetadata)(componentClass);
}
