import { formatFiles, generateFiles, getProjects, joinPathFragments, offsetFromRoot, readProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { applicationGenerator } from '@nx/angular/generators';

import { MicrofrontendGeneratorSchema } from './schema';
import { join } from 'path';


    /*"projectNameAndRootFormat": {
      "description": "Whether to generate the project name and root directory as provided (`as-provided`) or generate them composing their values and taking the configured layout into account (`derived`).",
      "type": "string",
      "enum": ["as-provided", "derived"]
    },*/

/*

export interface Schema {
 x S name: string;     
 x false addTailwind?: boolean;
  skipFormat?: boolean; ?
 x false inlineStyle?: boolean;
 x false inlineTemplate?: boolean;
 x None viewEncapsulation?: 'Emulated' | 'Native' | 'None';
 x false routing?: boolean;
  prefix?: string;
  style?: Styles;
  skipTests?: boolean;
  directory?: string;
  projectNameAndRootFormat?: ProjectNameAndRootFormat;
  tags?: string;
 x eslint linter?: Linter;
 x jest unitTestRunner?: UnitTestRunner;
  e2eTestRunner?: E2eTestRunner;
x NONE  backendProject?: string;
x yes  strict?: boolean;
?  standaloneConfig?: boolean;
  port?: number;
?  setParserOptionsProject?: boolean;
  skipPackageJson?: boolean;
x y  standalone?: boolean;
?  rootProject?: boolean;
  minimal?: boolean;
x webpack  bundler?: 'webpack' | 'esbuild';
x?  ssr?: boolean;
x?  addPlugin?: boolean;
}
 */


/**
 * main function
 * @param tree the virtual file system
 * @param schema the config
 */
export default async function (tree: Tree, schema: MicrofrontendGeneratorSchema) {
  // generate standard angualr app first

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
