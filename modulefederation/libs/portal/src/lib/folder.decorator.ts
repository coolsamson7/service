import { FeatureData } from "./portal-manager";

export interface FolderConfig {
    name : string,
    label? : string,
    icon? : string,
    parent? : string
}

export interface FolderData extends FolderConfig {
    children? : FolderData[],
    features : FeatureData[]
}

export function Folder(config : FolderConfig) {
    return (ctor : Function) => {
        // actually not need anymore
        // (ctor as any).$$feature = config ->  this is done in the route registry process :-)
    }
}
