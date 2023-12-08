import { setRemoteDefinitions } from '@nrwl/angular/mf';
import {ModuleConfig} from "@modulefederation/portal";

interface DeploymentConfig {
   name: string
   remotes: { [name: string] : string } // name -> url
}

interface DeploymentLoader {
  load() : Promise<DeploymentConfig>
}

class LocalDeploymentLoader implements DeploymentLoader {
  // instance data

  private urls: string[]

  // constructor

  constructor(...urls: string[]) {
    this.urls = urls
  }
  // implement DeploymentLoader
  async load() : Promise<DeploymentConfig> {
    const promises = this.urls.map(url => {
      return fetch(url + "/assets/manifest.json")
    })

    let result: DeploymentConfig = {
      name: "deployment",
      remotes: {}
    }

    let responses = await Promise.all<Response>(promises)
    let index = 0
    for ( let response of responses) {
      if (response.ok) {
        let json = await response.json()

        result.remotes[json.module.name] = this.urls[index]
      }

      index++;
    }

    return result
  }
}

new LocalDeploymentLoader("http://localhost:4201", "http://localhost:4202")
  .load()
  .then((deployment) => {console.log(deployment); setRemoteDefinitions(deployment.remotes)})
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
