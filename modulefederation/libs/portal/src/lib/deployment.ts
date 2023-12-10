import { Manifest } from "./manifest";

export interface DeploymentConfig {
  name: string
  remotes: { [name: string] : string } // name -> url
  modules: { [name: string] : Manifest }
}



