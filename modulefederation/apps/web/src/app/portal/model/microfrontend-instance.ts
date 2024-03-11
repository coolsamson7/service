import { Manifest } from "@modulefederation/portal"

export interface MicrofrontendInstance {
  uri: string,
  microfrontend: string,
  version: string,
  enabled : boolean,
  health : string,
  configuration : string,
  manifest: Manifest
  stage : string
}
