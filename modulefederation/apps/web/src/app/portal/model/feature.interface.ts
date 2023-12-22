/**
 * @COPYRIGHT (C) 2023 Andreas Ernst
 * don't touch!
 * generated at Fri Dec 15 12:41:07 CET 2023 with typescript V1.0
 */

import { FeatureModule } from "./feature-module.interface"
import { Router } from "./router.interface"

export interface Feature {
  enabled? : boolean
  categories : string[] | undefined,
  children : Feature[] | undefined,
  component : string,
  description : string | undefined,
  featureToggles : string[] | undefined,
  id : string,
  label : string | undefined,
  module : FeatureModule | undefined,
  parent : string | undefined,
  permissions : string[] | undefined,
  router : Router | undefined,
  tags : string[] | undefined,
  visibility : string[] | undefined
}
