import { Injectable } from "@angular/core";
import { Observable, of, ReplaySubject } from "rxjs";
import { FeatureConfig, Visibility } from "./feature-config";
import { FeatureData } from "./portal-manager";
import { FolderData } from "./folder.decorator";
import { TraceLevel, Tracer } from "./tracer";
import { LocaleManager, OnLocaleChange } from "./locale";
import { Translator } from "./i18n";

export type FeatureFilter = (feature : FeatureData) => boolean

@Injectable({providedIn: 'root'})
export class FeatureRegistry implements OnLocaleChange {
    // instance data

    features : { [name : string] : FeatureData } = {};
    registry$ = new ReplaySubject<FeatureRegistry>(1);
    folders : FolderData[] = []
    path2Folder : { [key : string] : FolderData } = {}

    // constructor

    constructor(localeManager: LocaleManager, private translator: Translator) {
        (window as any)["features"] = () => {
            this.report()
            console.log(this.features)
        }

        localeManager.subscribe(this, 0);

        // initial setup

        this.onLocaleChange(localeManager.getLocale())
    }

    // public

    report() {
        const table = []

        for (const path in this.features) {
            const feature = this.features[path]

            table.push({
                name: path,
                component: feature.component,
                origin: feature.origin,
                enabled: feature.enabled ? "x" : null,
                loaded: feature.ngComponent !== undefined ? "x" : null
            })
        }

        console.table(table)
    }

    ready() {
        this.registry$.next(this);
    }

    registerFolders(...folders : FolderData[]) {
        const rememberPath = (folder : FolderData, prefix  = "") => {
            this.path2Folder[prefix + folder.name] = folder

            for (const child of folder.children || [])
                rememberPath(child, prefix + folder.name + ".")
        }

        // remember paths

        for (const folder of folders) {
            this.folders.push(folder)
            rememberPath(folder)
        }
    }

    register(...features : FeatureConfig[]) {
        for (const feature of features)
            if (!(feature as FeatureData).$parent)
                this.registerFeature(feature, undefined, "")
    }

    registerRemote(microfrontend : string, ...features : FeatureConfig[]) {
        const rootFeature = features.find(feature => feature.id == "")
        if (rootFeature)
            this.registerFeature(rootFeature, undefined, microfrontend)

        for (const feature of features)
            if (feature !== rootFeature && !(feature as FeatureData).$parent)
                this.registerFeature(feature, rootFeature, microfrontend + ".")
    }

    disable(microfrontend : string) {
        const rootFeature = this.getFeature(microfrontend)

        const disable = (feature : FeatureData) => {
            feature.enabled = false

            if (feature.children)
                for (const child of feature.children)
                    disable(child)
        }

        disable(rootFeature)
    }

    getFeature(id : string) : FeatureData {
        let feature = this.features[id]

        if (!feature) {
          feature = this.features[""]

          if (!feature)
          throw new Error(`unknown feature ${id}`)
        }

        return feature
    }

    findFeature(id : string) : FeatureData | undefined {
        return this.features[id]
    }


    // public

    findFeatures(filter : (feature : FeatureConfig) => boolean) : FeatureData[] {
        return Object.values(this.features).filter(filter)
    }

    finder() : FeatureFinder {
        return new FeatureFinder(this)
    }

    mergeFeature(feature : FeatureData, newFeature : FeatureData) {
        // copy

        feature.enabled = newFeature.enabled

        // recursion

        if (feature.children)
            for (const child of feature.children)
                this.mergeFeature(child, newFeature.children!.find(f => f.id == child.id)!)
    }

    private registerFeature(featureConfig : FeatureConfig, parent? : FeatureData, path = "") {
        if ( Tracer.ENABLED )
            Tracer.Trace("portal", TraceLevel.FULL, "register feature {0}", featureConfig.id)

        // local function

        const key = (name : string, path : string) => {
            if (path.length == 0)
                return name
            else
                return path + name
        }

        const feature = featureConfig as FeatureData

        // add

        const name = key(feature.id, path)

        this.features[name] = feature

        feature.path = name
        feature.routerPath = "/" + name.replace(".", "/")

        // link parent & child

        if (parent) {
            if (parent.children == undefined)
                parent.children = [feature]
            else if (!parent.children.includes(feature)) {
                //console.log("add child " + feature.id + " to parent " + parent.id + " WTD???")
                parent.children.push(feature)
            }

            feature.$parent = parent
        }

        // link folder?

        if (feature.folder) {
            const folder = this.path2Folder[feature.folder]

            // TODO CHECK null

            if (folder.features)
                folder.features.push(feature)
            else
                folder.features = [feature]
        }

        // recursion

        for (const child of feature.children || [])
            this.registerFeature(child, feature, (path == "" ? feature.id : path + feature.id) + ".");
    }

    // implement OnLocaleChange

    onLocaleChange(locale: Intl.Locale): Observable<any> {
      for ( const featureName in this.features) {
        const feature = this.features[featureName]

        if ( feature.labelKey)
          this.translator.translate$(feature.labelKey)
            .subscribe(translation => feature.label = translation)
      }

        return of()
    }
}

export class FeatureFinder {
    // instance data

    private filters : FeatureFilter[] = []

    // constructor

    constructor(private featureRegistry : FeatureRegistry) {
        // automatic filter for enabled

        this.filters.push((feature) => feature.enabled == true)
    }

    // fluent

    withId(id : string) : FeatureFinder {
        this.filters.push((feature) => feature.id == id)
        return this
    }

    withVisibility(visibility : Visibility) : FeatureFinder {
        this.filters.push((feature) => feature.visibility!.includes(visibility))
        return this
    }

    withTag(tag : string) : FeatureFinder {
        this.filters.push((feature) => feature.tags!.includes(tag))
        return this
    }

    withoutFolder() : FeatureFinder {
        this.filters.push((feature) => feature.folder === undefined || feature.folder == "")
        return this
    }

    withEnabled(enabled = true) : FeatureFinder {
        this.filters.push((feature) => {
            if (feature.enabled !== null)
                return feature.enabled == enabled
            else
                return true
        })
        return this
    }

    withPermission(permission : string) : FeatureFinder {
        this.filters.push((feature) => feature.permissions!.includes(permission))
        return this
    }

    withCategory(category : string) : FeatureFinder {
        this.filters.push((feature) => feature.categories!.includes(category))
        return this
    }

    // public

    find() : FeatureData[] {
        return this.featureRegistry.findFeatures((feature) => {
            for (const filter of this.filters)
                if (!filter(feature))
                    return false

            return true
        })
    }

}
