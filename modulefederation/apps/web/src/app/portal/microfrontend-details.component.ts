import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { RouteElement } from '../widgets/navigation-component.component';
import { Subscription } from 'rxjs';
import { MirofrontendsComponent } from "./microfrontends.component";
import { EditorModel } from "../widgets/monaco-editor/monaco-editor";
import { v4 as uuidv4 } from 'uuid'
import { FormBuilder, FormGroup, NgForm } from "@angular/forms";
import { DialogService, Feature, FeatureConfig, Manifest, MessageAdministrationService, SuggestionProvider } from "@modulefederation/portal";
import { I18NTreeComponent } from "./widgets/i18n-tree";

@Component({
    selector: 'microfrontend-details',
    templateUrl: './microfrontend-details.component.html',
    styleUrls: ['./microfrontend-details.component.scss'],
    providers: []
})
@Feature({
    id: "microfrontend",
    parent: "microfrontends",
    router: {
        path: ":microfrontend"
    },
    label: "",
    categories: [],
    tags: [],
    permissions: []
})
export class MicrofrontendDetailsComponent implements OnInit, OnDestroy {
    // instance data

    @ViewChild(I18NTreeComponent) tree! : I18NTreeComponent

    suggestionProvider? : SuggestionProvider// = new NodeSuggestionProvider()

    manifest : Manifest = {
        commitHash: "",
        features: [],
        folders: [],
        module: "",
        name: "",
        remoteEntry: "",
        version: ""
    }
    subscription! : Subscription
    element : RouteElement = {
        label: "Microfrontends",
        route: "/microfrontends/"
    }

    uuid = uuidv4() // will be set in onInit

    namespaces: string[] = []

    model : EditorModel = {
        value: 'hallo',
        language: "json",
        schema: null,
        uri: 'json://' + this.uuid + '.schema'
    }

    manifestJSON = ""

    @ViewChild('form') public form! : NgForm

    selectedFeature? : FeatureConfig


    allPermissions : string[] = [];
    allTags : string[] = [];
    allCategories : string[] = [];
    allVisibilities : string[] = ['public', 'private'];

    formGroup : FormGroup
    labelKey = ""

    dirty = {}
    isDirty = false
    enabled : boolean[] = []

    labelKeyIsFocused: boolean = false

    // constructor

    constructor(private messageAdministrationService : MessageAdministrationService, private formBuilder : FormBuilder, private activatedRoute : ActivatedRoute, private microfrontendsComponent : MirofrontendsComponent, private dialogs : DialogService) {
        microfrontendsComponent.pushRouteElement(this.element)

        this.formGroup = this.formBuilder.group({
                id: [''],
                label: [''],
                labelKey: [''],
                description: [''],
                visibility: [[]],
                permissions: [[]],
                categories: [[]],
                tags: [[]]
            }
        )

        this.formGroup.get('id')?.disable();
    }


    focusLabelKey(focused: boolean) {
        this.labelKeyIsFocused = focused

        if ( focused )
            this.tree?.applyFilter(this.labelKey)
    }

    save() {
        // copy values from

        const index = this.manifest.features.indexOf(this.selectedFeature!)

        this.selectedFeature!.enabled = this.enabled[index]

        for (const propertyName in this.dirty) { // @ts-ignore
            this["selectedFeature"][propertyName] = this.dirty[propertyName]
        }

        // save

        this.microfrontendsComponent.saveManifest(this.manifest)

        // new state

        this.selectFeature(this.selectedFeature!)
    }

    revert() {
        this.enabled = this.manifest.features.map(feature => feature.enabled!)
        // will trigger isDirty calculation
        this.selectFeature(this.selectedFeature!)
    }

    setManifests(manifests : Manifest[]) : Manifest[] {
        // local functions

        const analyzeFeature = (feature : any) => {
            // recursion

            if (feature.children)
                for (const child of feature.children)
                    analyzeFeature(child)

            // collect info

            for (const permission of feature.permissions || [])
                if (!this.allPermissions.includes(permission))
                    this.allPermissions.push(permission)

            for (const tag of feature.tags || [])
                if (!this.allTags.includes(tag))
                    this.allTags.push(tag)

            for (const category of feature.categories || [])
                if (!this.allCategories.includes(category))
                    this.allCategories.push(category)
        }

        const analyzeManifest = (manifest : Manifest) => {
            for (const feature of manifest.features)
                analyzeFeature(feature)
        }

        for (const manifest of manifests)
            analyzeManifest(manifest)

        // done


        return manifests
    }

    setManifest(manifestName : string) {
        this.model.uri = 'json://' + this.uuid + manifestName + '.schema'

        // @ts-ignore
        // @ts-ignore
        this.microfrontendsComponent.$manifests
            .subscribe(manifests =>
                this.reallySetManifest(this.setManifests(manifests).find((manifest) => manifest.name == manifestName)!))
    }

    reallySetManifest(manifest : Manifest) {
        this.manifest = manifest
        this.manifestJSON = JSON.stringify(manifest, null, 2)

        // @ts-ignore
        this.enabled = manifest.features.map(feature => feature.enabled)

        if (manifest.features.length > 0)
            this.selectFeature(manifest.features[0])
    }

    selectFeature(feature : any) {
        if (feature !== this.selectedFeature && this.isDirty) {
            this.dialogs
                .confirmationDialog()
                .type("info")
                .title("Switch feature")
                .message("Please save first")
                .okCancel()
                .show()
                .subscribe(result => {//okCancel("Switch feature", "Please save first").subscribe(result => {
                if (result == true) {
                    this.save()
                    this.isDirty = false
                    this.selectFeature(feature)
                }
            })
            return
        }

        this.selectedFeature = feature

        // TODO

        this.labelKey =  feature.labelKey || ""

        this.formGroup.setValue({
            id: feature.id,
            label: feature.label,
            labelKey:  this.labelKey,
            description: feature.description,
            visibility: feature.visibility,
            categories: feature.categories,
            tags: feature.tags,
            permissions: feature.permissions,
            //enabled: feature.enabled
        })

        this.tree?.filterTree( this.labelKey)
    }

    changedLabelKey() {
        this.tree?.applyFilter(this.labelKey)
        //this.formGroup.get("labelKey")?.setValue(this.labelKey)
    }

    toggleEnabled(index : number) {
        this.enabled[index] = !this.enabled[index]

        this.checkChanges(this.formGroup.value)
    }

    checkChanges(value : any) {
        // local functions

        const equalArrays = (a : any, b : any) => {
            if (a == undefined || b == undefined)
                return a == b

            if (a.length != b.length)
                return false

            const sorted = b.sort()
            return a.sort().every((element : any, index : number) => element == sorted[index]);
        }

        const equals = (a : any, b : any) => Array.isArray(a) ? equalArrays(a, b) : a == b

        const dirty = {}

        this.isDirty = false

        for (const propertyName in value) {
            // @ts-ignore
            if (!equals(this.selectedFeature[propertyName], value[propertyName])) {
                // @ts-ignore
                dirty[propertyName] = value[propertyName]
                this.isDirty = true
            }
        }

        // compare enabled

        const index = this.manifest.features.indexOf(this.selectedFeature!)
        if (this.selectedFeature!.enabled !== this.enabled[index]) {
            this.isDirty = true
            // @ts-ignore
            dirty["enabled"] = this.enabled[index]
        }


        this.dirty = dirty
    }

    // implement OnInit

    ngOnInit() {
        this.subscription = this.activatedRoute.params.subscribe(params => {
            this.setManifest(params["microfrontend"])
        })

        this.formGroup.valueChanges.subscribe(value => this.checkChanges(value))

        this.messageAdministrationService.readNamespaces().subscribe(namespaces => {
            this.namespaces = namespaces
            this.suggestionProvider = undefined
        })
    }

    // implement OnDestroy

    ngOnDestroy() {
        if (this.element)
            this.microfrontendsComponent.popRouteElement(this.element);

        this.subscription.unsubscribe();
    }
}
