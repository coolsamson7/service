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
  name: string // TODO id?
  path?: string // this is computed!!!
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

  // TODO: maybe spit in two interfaces...

  children?: FeatureConfig[]
  $parent?: FeatureConfig
  ngComponent?: any
  load?: LoadChildrenCallback
}
