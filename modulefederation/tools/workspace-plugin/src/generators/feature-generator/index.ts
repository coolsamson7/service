import { formatFiles, generateFiles, getProjects, Tree } from '@nx/devkit';
import { FeatureGeneratorSchema } from './schema';
import { join } from 'path';

/**
 * main function
 * @param host the virtual file system
 * @param schema the config
 */
export default async function (tree: Tree, schema: FeatureGeneratorSchema) {
  // read project from workspace.json / angular.json

  const project = getProjects(tree).get(schema.projectName);

  // create the files

  const capitalized = (str: string) => {
     return str.charAt(0).toUpperCase() + str.slice(1);
  }

  generateFiles(tree, join(__dirname, "/templates"), join(project.sourceRoot, schema.directory || ""), {
    name: schema.name,
    feature: capitalized(schema.name),
    selector: schema.name,
    style: schema.style || "scss",
    tmpl: '', // remove __tmpl__ from file endings
  });

  // format all files which were created / updated in this schematic

  await formatFiles(tree);
}
