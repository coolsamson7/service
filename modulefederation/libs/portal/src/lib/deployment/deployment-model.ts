import { FeatureConfig } from "../feature-config";
import { ModuleMetadata } from "../modules";
import { FolderData } from "../folder.decorator";

export interface Manifest extends ModuleMetadata {
    name : string,
    version : string,
    enabled? : boolean,
    health? : string,
    commitHash : string,
    remoteEntry? : string,
    module : string,
    features : FeatureConfig[],
    folders : FolderData[],
}

export interface Deployment {
    modules : { [name : string] : Manifest }
}

