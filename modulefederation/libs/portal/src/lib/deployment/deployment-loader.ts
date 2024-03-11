import { Deployment } from "../deployment";

export abstract class DeploymentLoader {
    abstract load(name: string, version: string) : Promise<Deployment>
}
