import { DecoratorReader } from "./decorator-reader"
import { execSync } from "child_process"
import { ModuleReader, Modules } from "./module-reader";

const {find} = require("find-in-files")
const {findNearestPackageJsonSync} = require("find-nearest-package-json")

// local interfaces

interface DecoratorData {
    decorator : string
    file : string
    lineNumber : number
    decorates : string
    data : any
}

export type ApplyDecorator = (decorator : DecoratorData) => void;

// main class

export class ManifestGenerator {
    // instance data

    modules? : Modules

    // constructor

    constructor(private dir : string, private shell : boolean) {
    }

    // private

    async generate() {
        // read module locations

        this.modules = await new ModuleReader().readModules(this.dir)

        // read package.json

        const packageJson = findNearestPackageJsonSync(this.dir).data

        // read commit

        const commitHash = this.readCommitHash()

        // find module

        const module = await this.readModule()

        // find folders

        const folders = await this.readFolders(this.path(module.file))

        // find features

        const features = await this.readFeatures(this.path(module.file))

        // assemble manifest

        const manifest = this.generateManifest(packageJson, commitHash, module, features, folders)

        // write

        return manifest
    }

    protected relativeImport(current : string, target : string, separator : string = "/") : string {
        if (current == target)
            return "./"

        let check = current
        let result = ""

        while (!target.startsWith(check)) {
            check = check.substring(0, check.lastIndexOf(separator))

            result += "../"
        }

        if (result.length > 0)
            result += target.substring(check.length)
        else
            result += "." + target.substring(check.length)

        return result + separator
    }

    private findFile4Module(module : string) : string {
        return this.modules[module]
    }

    private generateManifest(packageJson : any, commitHash : string, module : any, features : any[], folders : any[]) : any {
        // done

        const {name, version} = packageJson

        const manifest : unknown = {
            name,
            version,
            commitHash,
            module,
            features,
            folders
        }

        // done

        return manifest
    }

    private readCommitHash() : string {
        return execSync("git rev-parse HEAD").toString().trim()
    }

    private async findDecorators(decoratorName : string, folder : string) : Promise<string[]> {
        return Object.keys(await find("@" + decoratorName, folder, ".ts$")).filter((file) => !file.includes(".test")) // no test files!
    }

    private file(fileName : string) {
        let index = fileName.lastIndexOf("/")

        return {
            file: fileName.substring(index + 1),
            path: fileName.substr(0, index)
        }
    }

    private async readModule() : Promise<any> {
        const decorator = this.shell ? "Shell" : "Microfrontend"
        const files = await this.findDecorators(decorator, this.dir)

        // validate

        if (files.length != 1) {
            if (files.length == 0)
                throw new Error(`expected one @${decorator}`)
            else if (files.length > 1) {
                console.log(files)
                throw new Error(`expected at most one @${decorator}`)
            }
        }

        // read

        let module : any = undefined
        new DecoratorReader(files[0], decorator, false)
            .read((data : DecoratorData) => {
                module = data
            })

        // done

        return {
            name: module.data.name,
            ngModule: module.decorates,
            file: module.file
        }
    }

    private path(file : string, separator : string = "/") : string {
        return file.substring(0, file.lastIndexOf(separator))
    }

    // public

    private async readFolders(modulePath : string) : Promise<any[]> {
        const decorator = "Folder"
        const files = await this.findDecorators(decorator, this.dir)

        const decorators : { [name : string] : DecoratorData } = {}

        for (const file of files)
            new DecoratorReader(file, decorator, true)
                .read((data : DecoratorData) => {
                    decorators[data.data.name] = data // TODO duplicate
                })

        let decorator4 = (name : string) => {
            let decorator = decorators[name]
            if (decorator)
                return decorator
            else
                throw new Error("unknown folder " + name)
        }

        // name, label, icon?, parent?

        let resultMap : { [name : string] : any } = {}
        let result : any[] = []

        let createFolder = (name : string) : any => {
            let decorator : DecoratorData = decorator4(name)

            let folderDecorator = decorator.data
            let folder = {
                name: folderDecorator.name,
                label: folderDecorator.label,
                icon: folderDecorator.icon
            }

            resultMap[folder.name] = folder

            // parent?

            if (folderDecorator.parent) {
                let parent = findFolder(folderDecorator.parent)

                if (!parent.children)
                    parent.children = [folder]
                else
                    parent.children.push(folder)
            }
            else result.push(folder)

            return folder
        }

        let findFolder = (name : string) : any => {
            let folder = resultMap[name]
            if (!folder)
                folder = createFolder(name)

            return folder
        }

        // create folder hierarchy

        for (let decorator in decorators)
            findFolder(decorator)

        // return the list of root folders...

        return result
    }

    private async readFeatures(modulePath : string) : Promise<any> {
        const decorator = "Feature"
        const files = await this.findDecorators(decorator, this.dir)

        // read

        let features : any[] = []
        const featureMap : { [key : string] : DecoratorData } = {}

        for (const file of files)
            new DecoratorReader(file, decorator, true)
                .read((data : DecoratorData) => {
                    features.push(data)

                    //console.log("remember " + data.decorates + " as " + data.data.id)

                    featureMap[data.data.id] = data
                })

        // sort

        const result : { [key : string] : any } = {}

        const findFeatureDecorator = (name : string) : DecoratorData => {
            if (!featureMap[name])
                throw new Error("no decorated feature named " + name)

            return featureMap[name]
        }

        const findFeature = (name : string) : any => {
            return result[name]
        }

        const mapFeature = (data : DecoratorData) : any => {
            let feature

            if ((feature = findFeature(data.data.id)) !== undefined)
                return feature

            // create

            let decorator = data.data

            // create feature

            feature = {
                id: decorator.id,
                label: decorator.label || decorator.id,
                icon: decorator.icon || "",
                folder: decorator.folder || "",
                router: decorator.router || null,
                component: data.decorates,
                tags: decorator.tags || [], // portal
                categories: decorator.categories || [],
                visibility: decorator.visibility || [], // public, private
                permissions: decorator.permissions || [],
                featureToggles: decorator.featureToggles || [],

                file: this.file(data.file),
                relative: this.relativeImport(modulePath, this.path(data.file))
            }

            // check for lazy modules

            if (decorator.router?.lazyModule) {
                let lazyModuleFile = this.findFile4Module(decorator.router?.lazyModule)

                let file = this.file(lazyModuleFile)
                feature.module = {
                    name: decorator.router?.lazyModule,
                    file: file,
                    relative: this.relativeImport(modulePath, this.path(lazyModuleFile))
                }

                // relative is now relative to the specified lazy module

                feature.relative = this.relativeImport(this.path(lazyModuleFile), this.path(data.file))
            }

            result[feature.id] = feature

            // link to parent

            let parent
            if (data.data.parent) {
                parent = mapFeature(findFeatureDecorator(data.data.parent))

                if (!parent.children)
                    parent.children = []
                parent.children.push(feature)
            }

            // done

            return feature
        }

        // traverse

        for (const feature of features)
            mapFeature(feature)

        // done

        features = features.filter(data => !data.data.parent).map(data => result[data.data.id])
        // make sure the "" feature comes first since it will get a special handling

        let index = features.find(feature => feature.id == "")
        if (index > 0) {
            let tmp = features[0]
            features[0] = features[index]
            features[index] = tmp
        }

        return features
    }
}
