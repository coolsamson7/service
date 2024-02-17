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

  const formatList = (str: string) => str.split(',').map(item => "\"" + item + "\"").join(", ")

  const formatSuperclass = () => {
     let superClass = "AbstractFeature"

     // check all mixins

     let index = 0
     for (const mixin of mixins) {
        if (schema[mixin] === true) {
           superClass = mixinExpressions[index] + "(" + superClass + ")"
        }

        index++
     }

     // done

     return superClass
  }

   const mixins = ["dialogMixin", "commandMixin", "onLocaleChangeMixin", "stateMixin", "viewMixin", "routingMixin", "featureMetadataMixin", "speechCommandsMixin"]
   const mixinExpressions = ["WithDialogs", "WithCommands", "WithOnLocaleChange", "WithState<" + capitalized(schema.name) + "Component" + ">()", "WithWiew", "WithRouting", "WithFeatureMetadata", "WithSpeechCommands"]


  generateFiles(tree, join(__dirname, "/templates"), join(project.sourceRoot, schema.directory || ""), {
    name: schema.name,
    schema: schema,
    feature: schema.name,
    format: {
       formatList: formatList,
       className: () => capitalized(schema.name) + "Component",
       superclass: formatSuperclass
    },
    selector: schema.name,
    style: schema.style || "scss",
    tmpl: '', // remove __tmpl__ from file endings
  });

  // format all files which were created / updated in this schematic

  await formatFiles(tree);
}
