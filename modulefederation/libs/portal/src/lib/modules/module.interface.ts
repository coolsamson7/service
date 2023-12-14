/**
 * meta data for a module
 */
export type ModuleMetadata = {
    /**
     * the module tye
     */
    type? : 'shell' | 'microfrontend';
    /**
     * the module name
     */
    name : string;
    /**
     * the module version
     */
    version? : string;

    /**
     * the commit hash
     */
    commitHash? : string,

    /**
     * if true, the module is loaded
     */
    isLoaded? : boolean
};
