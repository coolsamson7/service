import { Manifest } from "@modulefederation/portal"

export interface MicrofrontendInstance {
  uri: string,
  enabled : boolean,
  configuration : string,
  manifest: Manifest
  stage : string
}
