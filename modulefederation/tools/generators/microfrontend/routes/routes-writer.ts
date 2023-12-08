
import {generateFiles, names, ProjectConfiguration, Tree} from "@nrwl/devkit";

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
      features: manifest.features,
      fileName:  "local", // TODO
      tmpl: '', // remove __tmpl__ from file endings
    });
  }
}
