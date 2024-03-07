
export interface AssignedMicrofrontend {
    id: string,
    version: string
}

export interface ApplicationVersion {
    id? : number,
    version : string,
    configuration : string
    microfrontends: AssignedMicrofrontend[]
}