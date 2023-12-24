import { Manifest } from "@modulefederation/portal";

export type RegistryError = "duplicate" | "malformed_url" | "unreachable"

export interface RegistryResult {
    error? : RegistryError,
    manifest? : Manifest,
    message : string
}
