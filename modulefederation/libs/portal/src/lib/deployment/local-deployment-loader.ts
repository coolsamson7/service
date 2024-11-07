import { DeploymentLoader, DeploymentRequest } from "./deployment-loader";
import { Deployment } from "./deployment-model";
import { ManifestDecorator } from "./manifest-decorator";

export class LocalDeploymentLoader extends DeploymentLoader {
    // instance data

    private urls : string[]

    // constructor
    constructor(...urls : string[]) {
        super()

        this.urls = urls
    }

    // implement DeploymentLoader
    
    async load(request: DeploymentRequest) : Promise<Deployment> {
        const promises = this.urls.map(url => {
            return fetch(url + "/assets/manifest.json")
        })

        const deployment : Deployment = {
            configuration: "{\"type\":\"object\",\"value\":[]}",
            modules: {}
        }

        const responses = await Promise.allSettled<Response>(promises)

        let index = 0
        for (const response of responses) {
            if (response.status == "fulfilled") {
                const manifest = await response.value.json()

                ManifestDecorator.decorate(manifest)

                manifest.remoteEntry = this.urls[index]

                deployment.modules[manifest.name] = manifest
            }
            else {
                console.log("error fetching " + this.urls[index] + "/assets/manifest.json, reason: " + response.reason)
            }

            index++;
        }

        return deployment
    }
}
