
import {generateFiles, names, ProjectConfiguration, Tree} from "@nrwl/devkit";

export class RouteModuleWriter {
  constructor(private project: ProjectConfiguration) {
  }

  async write(host: Tree, manifest: any) {
    // write router module

    const routesTemplatePath = 'tools/generators/microfrontend/router-module/templates';

    console.log(manifest)
    let moduleName = manifest.module.ngModule
    if ( moduleName.endsWith("Module"))
      moduleName = moduleName.substring(0, moduleName.length - "Module".length) + "RouterModule"

    let folder = manifest.module.file
    folder = folder.substring(0, folder.lastIndexOf("/") + 1)

    // generate files

    let moduleNames = names(moduleName)

    let fileName = moduleNames.fileName
    if ( fileName.endsWith("-module"))
      fileName = fileName.substring(0, fileName.length - "-module".length)

    generateFiles(host, routesTemplatePath, folder, {
      manifest,
      moduleName: moduleNames.className,
      features: manifest.features,
      fileName:  fileName,
      tmpl: '', // remove __tmpl__ from file endings
    });
  }
}
