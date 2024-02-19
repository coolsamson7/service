import { generateFiles, names, Tree } from '@nx/devkit';

export class RouteModuleWriter {
  constructor() {}

  // private

  private relativeImport(
    current: string,
    target: string,
    separator = '/'
  ): string {
    if (current == target) return './';

    let check = current;
    let result = '';

    while (!target.startsWith(check)) {
      check = check.substring(0, check.lastIndexOf(separator));

      result += '../';
    }

    if (result.length > 0) result += target.substring(check.length);
    else result += '.' + target.substring(check.length);

    return result + separator;
  }

  // public

  async write(
    host: Tree,
    manifest: any,
    forModule: string,
    inFolder: string,
    features: any[],
    rootModule: boolean
  ) {
    // write router module

    const routesTemplatePath =
      'tools/workspace-plugin/src/generators/portal-artifact-generator/router-module/templates';

    let moduleName = forModule;
    if (moduleName.endsWith('Module'))
      moduleName =
        moduleName.substring(0, moduleName.length - 'Module'.length) +
        'RouterModule';

    // generate files

    const moduleNames = names(moduleName);

    let fileName = moduleNames.fileName;
    if (fileName.endsWith('-module'))
      fileName = fileName.substring(0, fileName.length - '-module'.length);

    let featureName;
    if (!rootModule) featureName = features[0].fqn; //TODO manifest.module.name + "." + features[0].id // TODO

    let requiresRedirect = rootModule;

    let pageNotFoundFeature = undefined;
    for (const feature of features) {
      if (feature.isPageNotFound == true) {
        pageNotFoundFeature = feature;
      }

      if (feature.id == '' || feature.router?.path == '')
        requiresRedirect = false;
    }

    const execute = {
      moduleImportPath: (feature: any) => {
        let path = this.relativeImport(inFolder, feature.module.file.path);

        path += feature.module.file.file.substring(
          0,
          feature.module.file.file.length - 3
        ); // strip .ts

        return path;
      },

      importPath: (feature: any) => {
        let path = this.relativeImport(inFolder, feature.module.file.path);

        path += feature.file.file.substring(0, feature.file.file.length - 3); // strip .ts

        return path;
      },
    };

    generateFiles(host, routesTemplatePath, inFolder, {
      execute: execute,
      manifest,
      requiresRedirect,
      featureName,
      pageNotFoundFeature,
      rootModule,
      isChild: false,
      moduleName: moduleNames.className,
      features: features,
      fileName: fileName,
      tmpl: '', // remove __tmpl__ from file endings
    });
  }
}
