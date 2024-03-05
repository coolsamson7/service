import { MicrofrontendInstance } from "./microfrontend-instance";

export interface MicrofrontendVersion {
    id: string,
    manifest : string,
    enabled : boolean,
    configuration : string,
    instances : MicrofrontendInstance[]
}
