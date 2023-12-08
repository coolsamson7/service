import { setRemoteDefinitions } from '@nrwl/angular/mf';

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

    let responses = await Promise.allSettled<Response>(promises)
    let index = 0
    for ( let response of responses) {
      if (response.status == "fulfilled") {
        let json = await response.value.json()

        result.remotes[json.module.name] = this.urls[index]
      }
      else {
        console.log("error fetching " + this.urls[index] + "/assets/manifest.json, reason: " + response.reason)
      }

      index++;
    }

    return result
  }
}

new LocalDeploymentLoader("http://localhost:4201", "http://localhost:4202")
  .load()
  .then((deployment) => setRemoteDefinitions(deployment.remotes))
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
