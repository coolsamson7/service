import { Manifest } from "@modulefederation/portal";
import { MicrofrontendInstance } from "./microfrontend-instance";
import { Microfrontend } from "./microfrontend";
import { MicrofrontendVersion } from "./microfrontend-version";

export type RegistryError = "duplicate" | "malformed_url" | "unreachable"

export interface RegistryResult {
    error? : RegistryError,
    manifest? : Manifest,
    message : string
}


export interface MicrofrontendRegistryResult {
    error? : RegistryError,
    microfrontend? : Microfrontend,
    version? : MicrofrontendVersion,
    instance? : MicrofrontendInstance,
    message : string
}
