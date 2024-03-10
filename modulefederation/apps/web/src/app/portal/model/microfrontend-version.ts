import { Manifest } from "@modulefederation/portal";
import { MicrofrontendInstance } from "./microfrontend-instance";

export interface MicrofrontendVersion {
    id: string,
    manifest : Manifest,
    enabled : boolean,
    configuration : string,
    instances : MicrofrontendInstance[]
}
