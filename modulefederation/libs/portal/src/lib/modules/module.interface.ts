/**
 * meta data for a module
 */
export type ModuleMetadata = {
  /**
   * the module tye
   */
  type?: 'shell' | 'library' | 'microfrontend';
  /**
   * the module name
   */
  name: string;
  /**
   * the module version
   */
  version?: string;
};
