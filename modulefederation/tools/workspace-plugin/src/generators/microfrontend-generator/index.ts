import { formatFiles, generateFiles, getProjects, joinPathFragments, offsetFromRoot, readProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { applicationGenerator } from '@nx/angular/generators';

import { MicrofrontendGeneratorSchema } from './schema';
import { join } from 'path';
/**
 * main function
 * @param tree the virtual file system
 * @param schema the config
 */
export default async function (tree: Tree, schema: MicrofrontendGeneratorSchema) {
  // generate standard angular app first

  await applicationGenerator(tree, {
    ...schema,
    // set some defaults
    minimal: false,
    bundler: 'webpack'
  });

  // read project from workspace.json / angular.json

  const projectConfig = getProjects(tree).get(schema.name);

  // delete existing files ( also those that we will recreate )

  tree.delete(join(projectConfig.root, './src/index.html'));
  tree.delete(join(projectConfig.root, './src/styles.scss'));
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

   // modify project.json

   const projectJsonPath = join(projectConfig.root, './project.json')

   updateJson(tree, projectJsonPath, json => {
    json.targets.serve.options.liveReload = false // WTF
    json.targets.build.executor = "@nx/angular:webpack-browser"
    json.targets.serve.executor = "@nx/angular:dev-server"

     json.targets.build.options.customWebpackConfig = {
        "path":  join(projectConfig.root, './webpack.config.js')
       }

      json.targets.build.configurations.production.customWebpackConfig = {
         "path":  join(projectConfig.root, './webpack.prod.config.js')
       }

     return json;
   });


  // let's generate some files

  generateFiles(tree, join(__dirname, "/templates"), projectConfig.root, {
    name: schema.name,
    serverURL: schema.serverURL,
    publicPortal: schema.generatePublicPortal || false,
    privatePortal: schema.generatePrivatePortal || false,
    style: schema.style || "scss",
    tmpl: '', // remove __tmpl__ from file endings
  });

   if (schema.generatePrivatePortal === true) {
      generateFiles(tree, join(__dirname, "/private-portal-templates"), projectConfig.root, {
          name: schema.name,
          publicPortal: schema.generatePublicPortal || false,
          privatePortal: true,
          style: schema.style || "scss",
          tmpl: '', // remove __tmpl__ from file endings
        });
    }

   if (schema.generatePublicPortal === true) {
      generateFiles(tree, join(__dirname, "/public-portal-templates"), projectConfig.root, {
          name: schema.name,
          publicPortal: true,
          privatePortal: schema.generatePrivatePortal || false,
          style: schema.style || "scss",
          tmpl: '', // remove __tmpl__ from file endings
        });
    }

  // write files

  await formatFiles(tree);
}
