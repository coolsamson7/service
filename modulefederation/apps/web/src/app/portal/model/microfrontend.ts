import { MicrofrontendVersion } from "./microfrontend-version";

export interface Microfrontend {
    name: string,
    enabled : boolean,
    configuration : string,
    versions : MicrofrontendVersion[]
}
