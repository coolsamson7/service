import { generateFiles, Tree } from '@nx/devkit';
import { RouteModuleWriter } from '../router-module/route-module-writer';

export class RoutesWriter {
  constructor() {}

  async write(host: Tree, manifest: any) {
    // write router module

    const routesTemplatePath =
      'tools/workspace-plugin/src/generators/microfrontend/routes/templates';

    let fileName = manifest.module.file;
    fileName = fileName.substring(0, fileName.lastIndexOf('/') + 1);

    // generate files

    let pageNotFoundFeature = undefined;

    let requiresRedirect = true;
    for (const feature of manifest.features) {
      if (feature.isPageNotFound == true) {
        pageNotFoundFeature = feature;
      }

      if (feature.id == '' || feature.router?.path == '')
        requiresRedirect = false;
    }

    generateFiles(host, routesTemplatePath, fileName, {
      manifest,
      requiresRedirect,
      pageNotFoundFeature,
      isChild: false,
      features: manifest.features,
      fileName: 'local',
      tmpl: '', // remove __tmpl__ from file endings
    });

    // check lazy components

    const routeModuleWriter = new RouteModuleWriter();

    for (const feature of manifest.features)
      if (feature.module)
        routeModuleWriter.write(
          host,
          manifest,
          feature.module.name,
          feature.module.file.path,
          [feature],
          false
        );
  }
}
