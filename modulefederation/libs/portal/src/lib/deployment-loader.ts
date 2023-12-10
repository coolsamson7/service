import { DeploymentConfig } from "./deployment";

export abstract class DeploymentLoader {
  abstract load() : Promise<DeploymentConfig>
}
