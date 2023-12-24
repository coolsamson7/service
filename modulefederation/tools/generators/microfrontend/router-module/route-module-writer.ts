import { generateFiles, names, Tree } from "@nrwl/devkit";

export class RouteModuleWriter {
    constructor() {
    }

    async write(host : Tree, manifest : any, forModule : string, inFolder : string, features : any[], isChild : boolean) {
        // write router module

        const routesTemplatePath = 'tools/generators/microfrontend/router-module/templates';

        let moduleName = forModule
        if (moduleName.endsWith("Module"))
            moduleName = moduleName.substring(0, moduleName.length - "Module".length) + "RouterModule"

        // generate files

        let moduleNames = names(moduleName)

        let fileName = moduleNames.fileName
        if (fileName.endsWith("-module"))
            fileName = fileName.substring(0, fileName.length - "-module".length)

        let featureName
        if (isChild)
            featureName = manifest.module.name + "." + features[0].id

        let requiresRedirect = !isChild
        for (let feature of features)
            if (feature.id == "" || feature.router?.path == "")
                requiresRedirect = false

        generateFiles(host, routesTemplatePath, inFolder, {
            manifest,
            requiresRedirect,
            featureName,
            isChild,
            moduleName: moduleNames.className,
            features: features,
            fileName: fileName,
            tmpl: '', // remove __tmpl__ from file endings
        });

        // recursion for any lazy modules

        if (!isChild)
            for (let feature of features)
                if (feature.module)
                    this.write(
                        host,
                        manifest,
                        feature.module.name,
                        feature.module.file.path,
                        [feature],
                        true)
    }
}
