import { DecoratorReader } from "./decorator-reader"
import { execSync } from "child_process"
const { find } = require("find-in-files")
const { findNearestPackageJsonSync } = require("find-nearest-package-json")

// local interfaces

interface DecoratorData {
    decorator: string
    file: string
    lineNumber: number
    decorates: string
    data: any
}

export type ApplyDecorator = (decorator: DecoratorData) => void;

// main class

export class ManifestGenerator {
    // constructor

    constructor(private dir: string, private shell: boolean) {
    }

    // private

    private generateManifest(packageJson : any, commitHash: string, module: any, features: any[]): any {
        // done

        const {name, version} = packageJson

        const manifest: unknown = {
            name,
            version,
            commitHash,
            module,
            features
        }

        // done

        return manifest
    }

    private readCommitHash(): string {
        return execSync("git rev-parse HEAD").toString().trim()
    }

    private async findDecorators(text: string, folder: string): Promise<string[]> {
        return Object.keys(await find(text, folder, ".ts$")).filter((file) => !file.includes(".test")) // no test files!
    }

    protected relativeImport(current: string, target: string, separator: string = "/") : string {
        if ( current == target)
            return "./"

        let check = current
        let result = ""

        while (!target.startsWith(check)) {
            check = check.substring(0, check.lastIndexOf(separator))

            result += "../"
        }

        if ( result.length > 0)
            result += target.substring(check.length)
        else
            result += "." +  target.substring(check.length)

        return result + separator
    }

    private file(fileName: string) {
      let index = fileName.lastIndexOf("/")

      return {
        file: fileName.substring(index + 1),
        path: fileName.substr(0, index)
      }
    }

    private async readModule() : Promise<any> {
        const decorator = this.shell ?  "RegisterShell" : "RegisterMicrofrontend"
        const files = await this.findDecorators(decorator , this.dir)

        // validate

        if (files.length != 1) {
            if ( files.length == 0)
                throw new Error(`expected one ${decorator}`)
            else if ( files.length > 1)
                throw new Error(`expected at most one ${decorator}`)
        }

        // read

        let module : any = undefined
        new DecoratorReader(files[0], decorator, false)
            .read((data: DecoratorData) => {
                module = data
            } )

        // done

        return {
            name: module.data.name,
            ngModule: module.decorates,
            file: module.file, // TODO
            //relative: this.relativeImport(modulePath, this.path( data.file))
        }
    }

    private path(file: string, separator : string = "/") : string{
        return file.substring(0, file.lastIndexOf(separator))
    }

    private async readFeatures(modulePath: string) : Promise<any> {
        const decorator = "RegisterFeature"
        const files = await this.findDecorators(decorator , this.dir)

        // read

        const features : any[] = []
        const map : { [key: string] :DecoratorData} = {}

        for ( const file of files)
            new DecoratorReader(file, decorator, true)
                .read((data: DecoratorData) => {
                    features.push(data)

                    map[data.data.name] = data
                } )

        // sort

       const result : { [key: string] : any} = {}

       const findData = (name: string) : DecoratorData => {
         return map[name]
       }

       const findFeature = (name: string) : any  => {
        return result[name]
      }

      const mapFeature = (data: DecoratorData) : any => {
        let feature

        if ((feature = findFeature(data.data.name)) !== undefined)
           return feature

        // create

        let decorator = data.data

        feature = {
            name: decorator.name,
            label: decorator.label || decorator.name,
            component: data.decorates,
            tags: decorator.tags || [], // portal
            categories: decorator.categories || [],
            visibility: decorator.visibility || [], // public, private
            permissions: decorator.permissions || [],
            featureToggles: decorator.featureToggles || [],

            file: this.file(data.file),
            relative: this.relativeImport(modulePath, this.path( data.file))
         }

         result[feature.name] = feature

         // link to parent

        let parent
        if ( data.data.parent) {
            parent = mapFeature(findData(data.data.parent))

            if ( !parent.children)
               parent.children = []
               parent.children.push(feature)
        }

         // done

        return feature
       }

        // traverse

        for ( const feature of features )
           mapFeature(feature)

        // done

        return features.filter(data => !data.data.parent).map(data => result[data.data.name])
       }

    // public

    async generate() {
        // read package.json

        const packageJson = findNearestPackageJsonSync(this.dir).data

        // read commit

        const commitHash = this.readCommitHash()

        // find module

        const module = await this.readModule()

        // find features

        const features = await this.readFeatures(this.path(module.file))

        // assemble manifest

        const manifest = this.generateManifest(packageJson, commitHash, module, features)

        // write

        return manifest
    }
}
