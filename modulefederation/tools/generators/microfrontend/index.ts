import {
  formatFiles,
  getProjects,
  Tree,
} from '@nrwl/devkit';
import { MicrofrontendSchema } from './schema';

import { ManifestGenerator } from "./manifest/manifest-generator"
import { ManifestWriter } from "./manifest/manifest-writer";
import { RouteModuleWriter } from "./router-module/route-module-writer";
import { WebpackWriter } from "./webpack/webpack-writer";
import { RoutesWriter } from "./routes/routes-writer";

/**
 * main function
 * @param host the virtual file system
 * @param schema the config
 */
export default async function (host: Tree, schema: MicrofrontendSchema) {
  // read project from workspace.json / angular.json

  const project = getProjects(host).get(schema.projectName);

  // create manifest

  const manifest = await new ManifestGenerator(project.sourceRoot, schema.type == "shell").generate()

  // write manifest

  await new ManifestWriter(project).write(host, manifest)

  // write router module or routes

  if ( schema.type == "shell")
     await new RoutesWriter(project).write(host, manifest)
  else
    await new RouteModuleWriter(project).write(host, manifest)

  // webpack

  if ( schema.type != "shell")
    await new WebpackWriter(project, schema.projectName).write(host, manifest)

  // format all files which were created / updated in this schematic

  await formatFiles(host);
}
