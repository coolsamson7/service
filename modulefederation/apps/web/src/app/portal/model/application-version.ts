
export interface AssignedMicrofrontend {
    id?: number,
    microfrontend: string,
    version: string,
    type: string
}

export interface ApplicationVersion {
    id? : number,
    version : string,
    configuration : string
    assignedMicrofrontends: AssignedMicrofrontend[]
}