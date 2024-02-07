import { generateFiles, ProjectConfiguration, Tree } from '@nx/devkit';

export class WebpackWriter {
  constructor(private project: ProjectConfiguration, private projectName) {}

  async write(host: Tree, manifest: any) {
    // write router module

    const webpackTemplatePath =
      'tools/workspace-plugin/src/generators/microfrontend/webpack/templates';

    const moduleName = manifest.module.component;
    const fileName = manifest.module.file;
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
