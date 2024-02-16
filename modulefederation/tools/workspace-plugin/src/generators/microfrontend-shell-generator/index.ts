import { formatFiles, generateFiles, getProjects, joinPathFragments, offsetFromRoot, readProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { applicationGenerator } from '@nx/angular/generators';

import { MicrofrontendShellGeneratorSchema } from './schema';
import { join } from 'path';

/**
 * main function
 * @param tree the virtual file system
 * @param schema the config
 */
export default async function (tree: Tree, schema: MicrofrontendShellGeneratorSchema) {
  // generate standard angular app first

  await applicationGenerator(tree, {
    ...schema,
    // set some defaults
    minimal: false,
    bundler: 'webpack'
  });

  // read project from workspace.json / angular.json

  const projectConfig = getProjects(tree).get(schema.name);

  // delete existing files

  tree.delete(join(projectConfig.root, './src/app/app.routes.ts')); // replaced by own version
  tree.delete(join(projectConfig.root, './src/app/app.config.ts'));
  tree.delete(join(projectConfig.root, './src/app/app.component.ts'));
  tree.delete(join(projectConfig.root, './src/app/app.component.html'));
  tree.delete(join(projectConfig.root, './src/app/nx-welcome.component.ts'));
  tree.delete(join(projectConfig.root, './src/app/app.component.spec.ts'));

  // modify tsconfig.json

  const tsconfigPath = join(projectConfig.root, './tsconfig.json')

  updateJson(tree, tsconfigPath, (json) => {
    json.compilerOptions = {
      ...json.compilerOptions,
      'resolveJsonModule': true
    }

    return json;
  });

  // let's generate some files

  generateFiles(tree, join(__dirname, "/templates"), projectConfig.root, {
    name: schema.name,
    style: schema.style || "scss",
    tmpl: '', // remove __tmpl__ from file endings
  });

  // write files

  await formatFiles(tree);
}
