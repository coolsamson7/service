/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */
import { Manifest } from "./manifest.interface";


export interface Deployment {
  modules : { [name : string] : Manifest }
}
