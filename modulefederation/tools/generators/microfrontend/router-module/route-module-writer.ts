
import {generateFiles, names, ProjectConfiguration, Tree} from "@nrwl/devkit";

export class RouteModuleWriter {
  constructor(private project: ProjectConfiguration) {
  }

  async write(host: Tree, forModule: string, inFolder: string, features: any[], isChild: boolean) {
    console.log("create router module for moudle" + forModule + " in " + inFolder)
    // write router module

    const routesTemplatePath = 'tools/generators/microfrontend/router-module/templates';

    let moduleName = forModule
    if ( moduleName.endsWith("Module"))
      moduleName = moduleName.substring(0, moduleName.length - "Module".length) + "RouterModule"

    // generate files

    let moduleNames = names(moduleName)

    let fileName = moduleNames.fileName
    if ( fileName.endsWith("-module"))
      fileName = fileName.substring(0, fileName.length - "-module".length)

    generateFiles(host, routesTemplatePath, inFolder, {
      //manifest,
      isChild,
      moduleName: moduleNames.className,
      features: features,
      fileName:  fileName,
      tmpl: '', // remove __tmpl__ from file endings
    });

    // recursion for any lazy modules

    if ( !isChild )
      for ( let feature of features)
        if ( feature.module)
          this.write(
            host,
            feature.module.name,
            feature.module.file.path,
            [feature],
            true)
    }
}
