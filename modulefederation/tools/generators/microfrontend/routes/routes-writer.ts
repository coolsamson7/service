
import {generateFiles, names, ProjectConfiguration, Tree} from "@nrwl/devkit";
import {RouteModuleWriter} from "../router-module/route-module-writer";

export class RoutesWriter {
  constructor(private project: ProjectConfiguration) {
  }

  async write(host: Tree, manifest: any) {
    // write router module

    const routesTemplatePath = 'tools/generators/microfrontend/routes/templates';

    let fileName = manifest.module.file
    fileName = fileName.substring(0, fileName.lastIndexOf("/") + 1)

    // generate files

    generateFiles(host, routesTemplatePath, fileName, {
      manifest,
      isChild: false,
      features: manifest.features,
      fileName:  "local", // TODO
      tmpl: '', // remove __tmpl__ from file endings
    });

    // check lazy components

    let routeModuleWriter = new RouteModuleWriter(this.project)

    for ( let feature of manifest.features)
        if ( feature.module)
          routeModuleWriter.write(
            host,
            feature.module.name,
            feature.module.file.path,
            [feature],
            true)
  }
}
