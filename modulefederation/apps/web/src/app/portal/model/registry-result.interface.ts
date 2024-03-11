import { Manifest } from "@modulefederation/portal";
import { MicrofrontendInstance } from "./microfrontend-instance";

export type RegistryError = "duplicate" | "malformed_url" | "unreachable"

export interface RegistryResult {
    error? : RegistryError,
    manifest? : Manifest,
    message : string
}


export interface MicrofrontendRegistryResult {
    error? : RegistryError,
    instance? : MicrofrontendInstance,
    message : string
}
