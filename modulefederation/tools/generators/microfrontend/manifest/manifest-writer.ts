import {ProjectConfiguration, Tree} from "@nrwl/devkit";

export class ManifestWriter {
  constructor(private project: ProjectConfiguration) {
  }

  async write(host: Tree, manifest: any) {
    const filename = this.project.sourceRoot + "/assets/manifest.json"

    host.write(filename, JSON.stringify(manifest, null, 2))
  }
}
