
export interface FolderConfig {
  name: string,
  parent?: string
}

export function Folder(config : FolderConfig) {
  return (ctor : Function) => {
    // actually not need anymore
    // (ctor as any).$$feature = config ->  this is done in the route registry process :-)
  }
}
