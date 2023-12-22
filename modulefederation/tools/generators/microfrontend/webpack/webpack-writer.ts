import { generateFiles, ProjectConfiguration, Tree } from "@nrwl/devkit";

export class WebpackWriter {
  constructor(private project : ProjectConfiguration, private projectName) {
  }

  async write(host : Tree, manifest : any) {
    // write router module

    const webpackTemplatePath = 'tools/generators/microfrontend/webpack/templates';

    let moduleName = manifest.module.component
    let fileName = manifest.module.file
    //fileName = fileName.substring(0, fileName.lastIndexOf("/") + 1)

    // generate files

    generateFiles(host, webpackTemplatePath, this.project.root, {
      manifest,
      projectName: this.projectName,
      moduleName: moduleName,
      moduleFile: fileName,
      tmpl: '', // remove __tmpl__ from file endings
    });
  }
}
