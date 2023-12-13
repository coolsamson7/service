import {LoadChildrenCallback} from "@angular/router";

export type RouterConfig = {
  /**
   * the router path which will override th eid
   */
  path?: string;
  /**
   * if <code>true</code> the router will reuse the component.
   */
  reuse?: boolean;
  /**
   * the name of a lazy loaded module
   */
  lazyModule: string;
};

export type Visibility = "public" | "private"

export interface FeatureConfig {
  parent?: string
  id: string
  description?: string
  isDefault?: boolean
  label?: string
  component?: string
  tags?: string[]
  categories?: string[]
  visibility?:Visibility[]
  permissions?: string[]
  featureToggles?: string[]
  router?: RouterConfig

  // computed

  module?: any
  origin?: string
  path?: string // this is computed!!!

  // TODO: maybe split in two interfaces...

  children?: FeatureConfig[]
  $parent?: FeatureConfig
  ngComponent?: any
  load?: LoadChildrenCallback
}
