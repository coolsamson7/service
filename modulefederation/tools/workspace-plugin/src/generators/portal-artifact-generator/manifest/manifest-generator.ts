import { DecoratorReader } from './decorator-reader';
import { execSync } from 'child_process';
import { ModuleReader, Modules } from './module-reader';

import { find } from 'find-in-files';
import { findNearestPackageJsonSync } from 'find-nearest-package-json'

// local interfaces

interface DecoratorData {
  decorator: string;
  file: string;
  lineNumber: number;
  decorates: string;
  data: any;
}

export type ApplyDecorator = (decorator: DecoratorData) => void;

// main class

export class ManifestGenerator {
  // instance data

  modules?: Modules;

  // constructor

  constructor(private dir: string, private project: string, private shell: boolean) {}

  // private

  async generate() {
    // read module locations

    this.modules = await new ModuleReader().readModules(this.dir);

    // read package.json

    const packageJson = findNearestPackageJsonSync(this.dir).data;

    // read commit

    const commitHash = this.readCommitHash();

    // find module

    const module = await this.readModule();

    // find folders

    const folders = await this.readFolders(this.path(module.file));

    // find features

    const features = await this.readFeatures(this.path(module.file));

    // assemble manifest

    const manifest = this.generateManifest(
      packageJson,
      commitHash,
      module,
      features,
      folders
    );

    // write

    return manifest;
  }

  protected relativeImport(
    current: string,
    target: string,
    separator = '/'
  ): string {
    if (current == target) return './';

    let check = current;
    let result = '';

    while (!target.startsWith(check)) {
      check = check.substring(0, check.lastIndexOf(separator));

      result += '../';
    }

    if (result.length > 0) result += target.substring(check.length);
    else result += '.' + target.substring(check.length);

    return result + separator;
  }

  private findFile4Module(module: string): string {
    return this.modules[module];
  }

  private generateManifest(
    packageJson: any,
    commitHash: string,
    module: any,
    features: any[],
    folders: any[]
  ): any {
    // done

    const { name, version } = packageJson;

    const manifest: unknown = {
      name: this.project,
      type: this.shell ? "shell" : "microfrontend",
      version,
      commitHash,
      module,
      features,
      folders,
    };

    // done

    return manifest;
  }

  private readCommitHash(): string {
    return execSync('git rev-parse HEAD').toString().trim();
  }

  private async findDecorators(
    decoratorName: string,
    folder: string
  ): Promise<string[]> {
    return Object.keys(await find('@' + decoratorName, folder, '.ts$')).filter(
      (file) => !file.includes('.test')
    ); // no test files!
  }

  private file(fileName: string) {
    const index = fileName.lastIndexOf('/');

    return {
      file: fileName.substring(index + 1),
      path: fileName.substr(0, index),
    };
  }

  private async readModule(): Promise<any> {
    const decorator = this.shell ? 'Shell' : 'Microfrontend';
    const files = await this.findDecorators(decorator, this.dir);

    // validate

    if (files.length != 1) {
      if (files.length == 0) throw new Error(`expected one @${decorator}`);
      else if (files.length > 1) {
        console.log(files);
        throw new Error(`expected at most one @${decorator}`);
      }
    }

    // read

    let module: any = undefined;
    new DecoratorReader(files[0], decorator, false).read(
      (data: DecoratorData) => {
        module = data;
      }
    );

    // done

    return {
      name: module.data.name,
      ngModule: module.decorates,
      file: module.file,
    };
  }

  private path(file: string, separator = '/'): string {
    return file.substring(0, file.lastIndexOf(separator));
  }

  // public

  private async readFolders(modulePath: string): Promise<any[]> {
    const decorator = 'Folder';
    const files = await this.findDecorators(decorator, this.dir);

    const decorators: { [name: string]: DecoratorData } = {};

    for (const file of files)
      new DecoratorReader(file, decorator, true).read((data: DecoratorData) => {
        if (!decorators[data.data.name]) decorators[data.data.name] = data;
        else {
          const file1 =
            decorators[data.data.name].file +
            ', line ' +
            decorators[data.data.name].lineNumber;
          const file2 = data.file + ', line ' + data.lineNumber;
          throw new Error(
            "folder '" + data.data.name + "' found twice " + file1 + ' ' + file2
          );
        }
      });

    const decorator4 = (name: string) => {
      const decorator = decorators[name];
      if (decorator) return decorator;
      else throw new Error("unknown folder '" + name + "'");
    };

    // name, label, icon?, parent?

    const resultMap: { [name: string]: any } = {};
    const result: any[] = [];

    const createFolder = (name: string): any => {
      const decorator: DecoratorData = decorator4(name);

      const folderDecorator = decorator.data;
      const folder = {
        name: folderDecorator.name,
        label: folderDecorator.label,
        icon: folderDecorator.icon,
      };

      resultMap[folder.name] = folder;

      // parent?

      if (folderDecorator.parent) {
        const parent = findFolder(folderDecorator.parent);

        if (!parent.children) parent.children = [folder];
        else parent.children.push(folder);
      } else result.push(folder);

      return folder;
    };

    const findFolder = (name: string): any => {
      let folder = resultMap[name];
      if (!folder) folder = createFolder(name);

      return folder;
    };

    // create folder hierarchy

    for (const decorator in decorators) {
      try {
        findFolder(decorator);
      } catch (error) {
        throw new Error(
          error.message +
            ' in ' +
            decorators[decorator].file +
            ', line ' +
            decorators[decorator].lineNumber
        );
      }
    }

    // return the list of root folders...

    return result;
  }

  private async readFeatures(modulePath: string): Promise<any> {
    const decorator = 'Feature';
    const files = await this.findDecorators(decorator, this.dir);

    // read

    let features: any[] = [];
    const featureMap: { [key: string]: DecoratorData } = {};

    for (const file of files)
      new DecoratorReader(file, decorator, true).read((data: DecoratorData) => {
        features.push(data);

        if (!featureMap[data.data.id]) featureMap[data.data.id] = data;
        else {
          const file1 =
            featureMap[data.data.id].file +
            ', line ' +
            featureMap[data.data.id].lineNumber;
          const file2 = data.file + ', line ' + data.lineNumber;

          throw new Error(
            "feature '" + data.data.id + "' found twice " + file1 + ' ' + file2
          );
        }
      });

    // sort

    const result: { [key: string]: any } = {};

    const findFeatureDecorator = (name: string): DecoratorData => {
      if (!featureMap[name])
        throw new Error("no decorated feature named '" + name + "'");

      return featureMap[name];
    };

    const findFeature = (name: string): any => {
      return result[name];
    };

    const mapFeature = (data: DecoratorData): any => {
      let feature;

      if ((feature = findFeature(data.data.id)) !== undefined) return feature;

      // create

      const decorator = data.data;

      // create feature

      feature = {
        fqn: decorator.id, // new
        id: decorator.id,
        label: decorator.label || (decorator.labelKey ? '' : decorator.id),
        labelKey: decorator.labelKey || '',
        i18n: decorator.i18n || [],
        //isPageNotFound: decorator.isPageNotFound || decorator.id == "**",
        icon: decorator.icon || '',
        folder: decorator.folder || '',
        router: decorator.router || null,
        component: data.decorates,
        tags: decorator.tags || [], // portal
        categories: decorator.categories || [],
        visibility: decorator.visibility || [], // public, private
        permissions: decorator.permissions || [],
        featureToggles: decorator.featureToggles || [],

        file: this.file(data.file),
        relative: this.relativeImport(modulePath, this.path(data.file)),
      };

      if (decorator.isPageNotFound || decorator.id == "**")
        feature.isPageNotFound = true

      if (decorator.isDefault == true)
        feature.isDefault = true

      // check for lazy modules

      if (decorator.router?.lazyModule) {
        const lazyModuleFile = this.findFile4Module(decorator.router?.lazyModule);

        const file = this.file(lazyModuleFile);

        feature.module = {
          name: decorator.router?.lazyModule,
          file: file,
          relative: this.relativeImport(modulePath, this.path(lazyModuleFile)),
        };

        // relative is now relative to the specified lazy module

        feature.relative = this.relativeImport(
          this.path(lazyModuleFile),
          this.path(data.file)
        );
      }

      result[feature.id] = feature;

      // link to parent

      let parent;
      if (data.data.parent) {
        let decorator: DecoratorData;
        try {
          decorator = findFeatureDecorator(data.data.parent);
        } catch (error) {
          throw new Error(
            error.message +
              ' in file ' +
              data.file +
              ', line ' +
              data.lineNumber
          );
        }

        parent = mapFeature(decorator);

        if (!parent.children)
           parent.children = [feature];
        else
           parent.children.push(feature);
      }

      // done

      return feature;
    };

    // traverse

    for (const feature of features)
       mapFeature(feature);

    // find root features

    features = features
      .filter((data) => !data.data.parent)
      .map((data) => result[data.data.id]);

    // sort alphabetically, so the generators are stable

    const sortFeatures = (features: any[]) => {
      features.sort((a, b) => a.id.localeCompare(b.id))

      // recursion

      for ( const feature of features)
         if ( feature.children &&  feature.children.length > 0)
            sortFeatures(feature.children)
    }

    sortFeatures(features)

    // make sure the "" feature comes first since it will get a special handling

   let swap = (array: any[], i1: number, i2: number) => {
       const tmp = array[i1];
       array[i1] = array[i2];
       array[i2] = tmp;
   }

    let feature = features.find((feature) => feature.id == '');
    if (feature)
       swap(features, 0, features.indexOf(feature) )

    // make sure, that any "**" is last :-)

    feature = features.find((feature) => feature.isPageNotFound == true || feature.id === "**");
    if (feature)
       swap(features, features.length - 1, features.indexOf(feature))

    // done

    return features;
  }
}
