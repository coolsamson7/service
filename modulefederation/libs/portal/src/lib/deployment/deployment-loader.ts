import {Deployment} from "../deployment";

export abstract class DeploymentLoader {
    abstract load() : Promise<Deployment>
}
