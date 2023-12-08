import {ProjectConfiguration, Tree} from "@nrwl/devkit";

export class ManifestWriter {
  constructor(private project: ProjectConfiguration) {
  }

  async write(host: Tree, manifest: any) {
    const filename = this.project.sourceRoot + "/assets/manifest.json"

    //  .finally(() => console.info("\x1b[32m%s\x1b[0m", "✓ " + generator.out + " successfully generated for " + generator.dir))
    //  .catch((error) => console.error(error))

    host.write(filename, JSON.stringify(manifest, null, 2))
  }
}
