import { FeatureConfig } from "../feature-config";
import { ModuleMetadata } from "../modules";
import { FolderData } from "../folder.decorator";

export interface Manifest extends ModuleMetadata {
    name : string,
    type: "shell" | "microfrontend",
    stack?: string,
    version : string,
    enabled? : boolean,
    health? : string,
    commitHash : string,
    remoteEntry? : string,
    remoteEntryName? : string,
    healthCheck?: string,
    module : string,
    features : FeatureConfig[],
    folders : FolderData[],
}

export interface Deployment {
    configuration: string,
    modules : { [name : string] : Manifest }
}

