import { formatFiles, getProjects, Tree } from '@nx/devkit';
import { MicrofrontendSchema } from './schema';

import { ManifestGenerator } from './manifest/manifest-generator';
import { ManifestWriter } from './manifest/manifest-writer';
import { RouteModuleWriter } from './router-module/route-module-writer';
import { WebpackWriter } from './webpack/webpack-writer';
import { RoutesWriter } from './routes/routes-writer';

/**
 * main function
 * @param host the virtual file system
 * @param schema the config
 */
export default async function (host: Tree, schema: MicrofrontendSchema) {
  // read project from workspace.json / angular.json

  const project = getProjects(host).get(schema.projectName);

  // create manifest

  const manifest = await new ManifestGenerator(
    project.sourceRoot,
    schema.projectName,
    schema.type == 'shell'
  ).generate();

  // write router module or routes

  const path = (fileName: string): string => {
    return fileName.substring(0, fileName.lastIndexOf('/'));
  };

  if (schema.type == 'shell') await new RoutesWriter().write(host, manifest);
  else {
    const writer = new RouteModuleWriter();

    await writer.write(
      host,
      manifest,
      manifest.module.ngModule,
      path(manifest.module.file),
      manifest.features,
      true /* root module */
    );

    const queue = manifest.features
      .filter((feature) => feature.module)
      .map((feature) => {
        return {
          name: manifest.module.name + '.' + feature.id,
          feature: feature,
        };
      });

    while (queue.length > 0) {
      const { name, feature } = queue[0];

      feature.fqn = name;

      // remove from queue

      queue.splice(0, 1);

      if (feature.module)
        // process

        await writer.write(
          host,
          manifest,
          feature.module.name,
          feature.module.file.path,
          [feature],
          false // root module
        );

      // push children

      for (const child of feature.children || [])
        queue.push({ name: name + '.' + child.id, feature: child });
    } // while
  }

  // webpack

  if (schema.type != 'shell')
    await new WebpackWriter(project, schema.projectName).write(host, manifest);

  // write manifest

  await new ManifestWriter(project).write(host, manifest);

  // format all files which were created / updated in this schematic

  await formatFiles(host);
}
