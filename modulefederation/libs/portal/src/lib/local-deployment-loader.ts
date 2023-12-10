import { DeploymentConfig } from "./deployment";
import {DeploymentLoader} from "./deployment-loader";

export class LocalDeploymentLoader extends DeploymentLoader {
  // instance data

  private urls: string[]

  // constructor

  constructor(...urls: string[]) {
    super()

    this.urls = urls
  }
  // implement DeploymentLoader
  async load() : Promise<DeploymentConfig> {
    const promises = this.urls.map(url => {
      return fetch(url + "/assets/manifest.json")
    })

    let deployment: DeploymentConfig = {
      name: "deployment",
      remotes: {},
      modules: {}
    }

    let responses = await Promise.allSettled<Response>(promises)
    let index = 0
    for ( let response of responses) {
      if (response.status == "fulfilled") {
        let manifest = await response.value.json()

        deployment.remotes[manifest.module.name] = this.urls[index]
        deployment.modules[manifest.module.name] = manifest
      }
      else {
        console.log("error fetching " + this.urls[index] + "/assets/manifest.json, reason: " + response.reason)
      }

      index++;
    }

    return deployment
  }
}
