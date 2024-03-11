/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { AfterViewInit, Component, ElementRef, Injector, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { RouteElement } from '../widgets/navigation-component.component';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { MirofrontendsComponent } from "./microfrontends.component";
import { EditorModel } from "../widgets/monaco-editor/monaco-editor";
import { v4 as uuidv4 } from 'uuid'
import { AbstractControl, AbstractControlDirective, AsyncValidatorFn, FormBuilder, FormGroup, NgControl, NgForm, ValidationErrors } from "@angular/forms";
import { AbstractFeature, Command, Feature, FeatureConfig, Manifest, MessageAdministrationService, SuggestionProvider, Translator, WithCommands, WithDialogs } from "@modulefederation/portal";
import { I18NTreeComponent } from "./widgets/i18n-tree";
import { MatFormField } from "@angular/material/form-field";

@Component({
    selector: '[errorMessages]',
    template: '{{ error }}'
})
export class MatErrorMessagesComponent implements AfterViewInit {
    // instance data

    public error = ''
    private control: NgControl | AbstractControlDirective | null = null

    // constructor

    constructor(private formField: MatFormField) {
    }

    /// implement AfterViewInit

    public ngAfterViewInit(): void {
        this.control = this.formField._control.ngControl;

        // sub to the control's status stream

        this.control?.statusChanges!.subscribe(this.updateErrors);
    }

    // private

    private updateErrors = (state: 'VALID' | 'INVALID'): void => {
        if (state === 'INVALID') {
            // active errors on the FormControl

            const controlErrors = this.control!.errors!

            // just grab one error

            const firstError = Object.keys(controlErrors)[0]

            if (firstError === 'required')
                this.error = 'This field is required.'

            if (firstError === 'i18n-key')
                switch (controlErrors[firstError].error) {
                    case "missing-namespace":
                        this.error = "namespace missing`"
                        break;

                    case "missing-path":
                        this.error = "path missing"
                        break;

                    case "no-translations":
                        this.error = "no translations"
                        break;

                default:
                    this.error = "i18n fuck"
             }
        }
    };
}

export class I18NValidator {
  static createValidator(translator: Translator): AsyncValidatorFn {

  const extractNamespace = (key : string) :  { namespace : string | undefined; path : string } => {
      let namespace : string;
      let path : string;
      const colon = key.indexOf(':');

      if (colon > 0)
        return {
          namespace: key.substring(0, colon),
          path: key.substring(colon + 1)
        }

      else return {
          namespace: undefined,
          path: key
      }
  }

  const check = (value: string)  : boolean => {
    const {namespace, path} = extractNamespace(value);

    if ( namespace == undefined)
        return false

    if ( path.length == 0)
        return false


    return true
   }

    return (control: AbstractControl): Observable<ValidationErrors|null> => {
        if ( control.value == "")
            return of(null)

        const {namespace, path} = extractNamespace(control.value);

        if ( namespace == undefined)
            return of({
                'i18n-key': {error: "missing-namespace"}
            })

        if ( path.length == 0)
            return of({
                'i18n-key': {error: "missing-path"}
            })

        return translator.hasTranslationsFor$(control.value).pipe(
            switchMap(ok => ok ? of(null) : of({
                'i18n-key': {error: "no-translations"}
            })
            ))
        };
  }
}

@Component({
    selector: 'microfrontend-details',
    templateUrl: './microfrontend-details.component.html',
    styleUrls: ['./microfrontend-details.component.scss'],
    //providers: []
})
@Feature({
    id: "microfrontend",
    parent: "microfrontends",
    i18n: ["portal.commands"],
    router: {
        path: ":microfrontend"
    },
    label: "",
    categories: [],
    tags: [],
    permissions: []
})
export class MicrofrontendDetailsComponent extends WithCommands(WithDialogs(AbstractFeature)) {
    // instance data

    @ViewChild(I18NTreeComponent) tree! : I18NTreeComponent
    @ViewChild("input") input!: ElementRef;

    suggestionProvider? : SuggestionProvider// = new NodeSuggestionProvider()

    manifest : Manifest = {
        commitHash: "",
        features: [],
        folders: [],
        module: "",
        name: "",
        type: "microfrontend",
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
    labelTranslation = ""

    dirty : any = {}
    isDirty = false
    enabled : boolean[] = []

    labelKeyIsFocused = false

    // constructor

    constructor(injector: Injector, private translator: Translator, private messageAdministrationService : MessageAdministrationService, private formBuilder : FormBuilder, private activatedRoute : ActivatedRoute, private microfrontendsComponent : MirofrontendsComponent) {
        super(injector)

        microfrontendsComponent.pushRouteElement(this.element)

        this.formGroup = this.formBuilder.group({
                id: [''],
                label: [''],
                labelKey: ['', null, [I18NValidator.createValidator(translator)]],
                labelTranslation: [''],
                description: [''],
                visibility: [[]],
                permissions: [[]],
                categories: [[]],
                tags: [[]]
            }
        )

        this.formGroup.get('labelKey')?.valueChanges.subscribe(val => this.changedLabelKey(val));
        this.formGroup.get('id')?.disable();
    }

    @Command({
        shortcut: "ctrl+t"
    })
    test() {
            console.log("test")


            let element = window.document.activeElement
            while ( element ) {
                console.log(element.localName)

                if ((<any>element).__ngContext__)
                   console.log("ANGULAR")


                element = element.parentElement
            }
    }

    focusLabelKey(focused: boolean) {
        this.labelKeyIsFocused = focused

        if ( focused )
            this.tree?.applyFilter(this.formGroup.get('labelKey')?.value)
    }

    focusLabelTranslation(focused: boolean) {
        this.labelKeyIsFocused = focused

        setTimeout(() => this.input.nativeElement.focus(), 0)
    }

    save() {
        if (!this.formGroup.valid) {
            this.confirmationDialog()
                .title("Invalid Data")
                .message("Correct input first")
                .ok()
                .show()
            return
        }

        // copy values from

        const index = this.manifest.features.indexOf(this.selectedFeature!)

        this.selectedFeature!.enabled = this.enabled[index]

        for (const propertyName in this.dirty)
          if (propertyName !== "labelTranslation") {
            (<any>this.selectedFeature)[propertyName] = this.dirty[propertyName] || false
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

        this.microfrontendsComponent.$manifests
            .subscribe(manifests =>
                this.reallySetManifest(this.setManifests(manifests).find((manifest) => manifest.name == manifestName)!))
    }

    reallySetManifest(manifest : Manifest) {
        this.manifest = manifest
        this.manifestJSON = JSON.stringify(manifest, null, 2)

        this.enabled = manifest.features.map(feature => feature.enabled == true)

        if (manifest.features.length > 0)
            this.selectFeature(manifest.features[0])
    }

    selectFeature(feature : any) {

        if (feature !== this.selectedFeature && !this.formGroup.valid) {
            this.confirmationDialog()
                .title("Invalid Data")
                .message("Correct input first")
                .ok()
                .show()

            return
        }


        if (feature !== this.selectedFeature && this.isDirty) {
            this
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

       if (!feature.labelKey)
          feature.labelKey = ""

        this.selectedFeature = feature
        this.labelTranslation = ""// todo this.translator.tr
        this.labelKeyIsFocused = false

        this.changedLabelKey(feature.labelKey || "")

        this.formGroup.setValue({
            id: feature.id,
            label: feature.label,
            labelKey:  feature.labelKey || "",
            labelTranslation:  this.labelTranslation,
            description: feature.description,
            visibility: feature.visibility,
            categories: feature.categories,
            tags: feature.tags,
            permissions: feature.permissions,
            //enabled: feature.enabled
        })

        this.tree?.filterTree( feature.labelKey || "")
    }

    changedLabelKey(key: string) {
        this.tree?.applyFilter(key)

        if (this.formGroup.get('labelKey')?.valid && key != "")
            this.translator.translate$(key).subscribe(translation => {
                this.labelTranslation = translation
                this.formGroup.get("labelTranslation")?.setValue(translation)
            })
        else {
            const translation = ""

            this.labelTranslation = translation
            this.formGroup.get("labelTranslation")?.setValue(translation)
        }
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

        const dirty : any = {}

        this.isDirty = false

        for (const propertyName in value) {
            if (propertyName !== "labelTranslation" && !equals((<any>this.selectedFeature)[propertyName], value[propertyName])) {
                dirty[propertyName] = value[propertyName]

                console.log(propertyName + " is dirty, was  " + (<any>this.selectedFeature)[propertyName] + ", now " + value[propertyName])
                this.isDirty = true
            }
        }

        // compare enabled

        const index = this.manifest.features.indexOf(this.selectedFeature!)
        if (this.selectedFeature!.enabled !== this.enabled[index]) {
            this.isDirty = true
            dirty["enabled"] = this.enabled[index]
        }

        this.dirty = dirty
    }

    // implement OnInit

    override ngOnInit() {
        super.ngOnInit()

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

    override ngOnDestroy() {
        super.ngOnDestroy()

        if (this.element)
            this.microfrontendsComponent.popRouteElement(this.element);

        this.subscription.unsubscribe();
    }
}

