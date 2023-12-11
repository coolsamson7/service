
import {DeploymentLoader} from "./deployment-loader";
import {DeploymentConfig} from "./deployment-model";

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
      modules: {}
    }

    console.log("load...wait for promises ")

    let responses = await Promise.allSettled<Response>(promises)
    console.log("\"load...wait for promises returns")

    let index = 0
    for ( let response of responses) {
      if (response.status == "fulfilled") {
        let manifest = await response.value.json()

        manifest.remoteEntry = this.urls[index]

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
