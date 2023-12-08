
import {generateFiles, names, ProjectConfiguration, Tree} from "@nrwl/devkit";

export class RouteModuleWriter {
  constructor(private project: ProjectConfiguration) {
  }

  async write(host: Tree, manifest: any) {
    // write router module

    const routesTemplatePath = 'tools/generators/microfrontend/router-module/templates';

    let moduleName = manifest.module.component
    if ( moduleName.endsWith("Module"))
      moduleName = moduleName.substring(0, moduleName.length - "Module".length) + "RouterModule"

    let fileName = manifest.module.file
    fileName = fileName.substring(0, fileName.lastIndexOf("/") + 1)

    // generate files

    let moduleNames = names(moduleName)

    generateFiles(host, routesTemplatePath, fileName, {
      manifest,
      moduleName: moduleNames.className,
      features: manifest.features,
      fileName:  moduleNames.fileName,
      tmpl: '', // remove __tmpl__ from file endings
    });
  }
}
