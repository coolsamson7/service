/**
 * additional router configuration for a feature
 */
export type RouterConfig = {
    /**
     * the router path which will override the id
     */
    path? : string;
    /**
     * if <code>true</code> the router will reuse the component.
     */
    reuse? : boolean;
    /**
     * the name of a lazy loaded module
     */
    lazyModule? : string;
};

/**
 * controls if a feature requires a valid session ( "private" ) or is available before login as well
 */
export type Visibility = "public" | "private"

export interface FeatureConfig {
    /**
     * enabled status of a feature
     */
    enabled? : boolean

    /**
     * resolved children array
     */
    children? : FeatureConfig[]

    /**
     * optional icon name
     */
    icon? : string,

    /**
     * optional folder name
     */
    folder? : string,

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
     * optional label key
     */
    labelKey? : string
    /**
     * optional label key
     */
    i18n? : string[]
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
    visibility? : ("public" | "private")[]
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
