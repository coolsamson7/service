/**
 * additional router configuration for a feature
 */
export type RouterConfig = {
  /**
   * the router path which will override th eid
   */
  path? : string;
  /**
   * if <code>true</code> the router will reuse the component.
   */
  reuse? : boolean;
  /**
   * the name of a lazy loaded module
   */
  lazyModule : string;
};

/**
 * controls if a feature requires a valid session ( "private" ) or is available before login as well
 */
export type Visibility = "public" | "private"

export interface FeatureConfig {
  /**
   * optional id of a parent feature.  This must be unique in a microfrontend!
   */
  parent? : string
  /**
   * the feature id
   */
  id : string
  /**
   * optional description
   */
  description? : string
  /**
   * if true, the "" redirect will point to this feature
   */
  isDefault? : boolean
  /**
   * optional label. if not set, populated with the id
   */
  label? : string
  /**
   * the name of the implementing component
   */
  component? : string
  /**
   * set of tags, that can be interpreted
   */
  tags? : string[]
  /**
   * set of categories, that can be interpreted
   */
  categories? : string[]
  /**
   * visibility of the feature.
   */
  visibility? : Visibility[]
  /**
   * set of permissions, that are required
   */
  permissions? : string[]
  /**
   * set of feature toggles, that are required
   */
  featureToggles? : string[]
  /**
   * optional router hints
   */
  router? : RouterConfig
}
