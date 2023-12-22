/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { Feature } from "./feature.interface"
import { Module } from "./module.interface"

export interface Manifest {
  enabled? : boolean,
  health?: string,
  commitHash : string,
  features : Feature[],
  module : string,
  name : string,
  remoteEntry : string | undefined,
  version : string
}
