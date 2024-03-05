import { ApplicationVersion } from "./application-version"

export interface Application {
    name : string,
    configuration : string
    versions?: ApplicationVersion[]
}
