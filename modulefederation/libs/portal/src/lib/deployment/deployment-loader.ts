import { Deployment } from "../deployment";

export interface DeploymentRequest {
    application: string
    version : string
    session: boolean
    host: string
    port: string
    protocol: string
}

export abstract class DeploymentLoader {
    abstract load(request: DeploymentRequest) : Promise<Deployment>
}
