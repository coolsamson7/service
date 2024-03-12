/* eslint-disable @angular-eslint/no-output-on-prefix */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { AfterViewInit, Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from "@angular/core";
import { Observable, of, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'
import { AbstractControl, AbstractControlDirective, AsyncValidatorFn, FormBuilder, FormGroup, FormsModule, NgControl, NgForm, ReactiveFormsModule, ValidationErrors } from "@angular/forms";
import { AbstractFeature, FeatureConfig, Manifest, ManifestDecorator, MessageAdministrationService, NgModelSuggestionsDirective, SuggestionProvider, Translator, WithCommands, WithDialogs } from "@modulefederation/portal";

import { MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { EditorModel } from "../../../widgets/monaco-editor/monaco-editor";
import { I18NTreeComponent } from "../../widgets/i18n-tree";
import { CommonModule } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MonacoEditorModule } from "../../../widgets/monaco-editor/monaco-editor.module";
import { MatTabsModule } from "@angular/material/tabs";
import { ChipsComponent } from "../../chips.component";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

@Component({
    standalone: true,
    selector: '[manifestErrorMessages]',
    template: '{{ error }}'
})
export class ManifestErrorMessagesComponent implements AfterViewInit {
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
    standalone: true,
    selector: 'manifest',
    templateUrl: './manifest.component.html',
    styleUrls: ['./manifest.component.scss'],
    imports: [
        // angular

        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        // material

        MatFormFieldModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatDividerModule,
        MatListModule,
        MatSlideToggleModule,

        // components

        NgModelSuggestionsDirective,
        ChipsComponent,
        MonacoEditorModule,
        I18NTreeComponent,
        ManifestErrorMessagesComponent
    ]
})
export class ManifestComponent extends WithCommands(WithDialogs(AbstractFeature)) {
    // input

    @Input() manifest!: Manifest

    // output

    @Output() dirty = new EventEmitter<boolean>();
    @Output() onSave = new EventEmitter<void>();

    // instance data

    @ViewChild(I18NTreeComponent) tree! : I18NTreeComponent
    @ViewChild("input") input!: ElementRef;

    suggestionProvider? : SuggestionProvider// = new NodeSuggestionProvider()

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

    dirtyProperties : any = {}
    isDirty = false
    enabled : boolean[] = []

    labelKeyIsFocused = false

    // constructor

    constructor(injector: Injector, private translator: Translator, private messageAdministrationService : MessageAdministrationService, private formBuilder : FormBuilder) {
        super(injector)

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

    focusLabelKey(focused: boolean) {
        this.labelKeyIsFocused = focused

        if ( focused )
            this.tree?.applyFilter(this.formGroup.get('labelKey')?.value)
    }

    focusLabelTranslation(focused: boolean) {
        this.labelKeyIsFocused = focused

        setTimeout(() => this.input.nativeElement.focus(), 0)
    }

    setDirty(dirty = true) {
        this.isDirty = dirty
        this.dirty.emit(dirty)
    }

    triggerSave() {
        this.onSave.emit()
    }

    save() : boolean {
        if (!this.formGroup.valid) {
            this.confirmationDialog()
                .title("Invalid Data")
                .message("Correct input first")
                .ok()
                .show()
            return false
        }

        // copy values from

        const index = this.manifest.features.indexOf(this.selectedFeature!)

        this.selectedFeature!.enabled = this.enabled[index]

        for (const propertyName in this.dirtyProperties)
          if (propertyName !== "labelTranslation") {
            (<any>this.selectedFeature)[propertyName] = this.dirtyProperties[propertyName] || false
        }

        return true
    }

    saved() {
        if ( this.isDirty && this.selectedFeature) {
            this.selectFeature(this.selectedFeature!)
        }
    }

    revert() {
        if ( this.isDirty) {
            this.enabled = this.manifest.features.map(feature => feature.enabled!)
            // will trigger isDirty calculation
            this.selectFeature(this.selectedFeature!)
        }
    }

    setManifest(manifest : Manifest) {
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
                .subscribe(result => {
                if (result == true) {
                    this.triggerSave()
                    //this.setDirty(false)
                    //this.selectFeature(feature)
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

        this.dirtyProperties = dirty

        this.setDirty(this.isDirty)
    }

    // implement OnInit

    override ngOnInit() {
        super.ngOnInit()

        this.setManifest(ManifestDecorator.decorate(this.manifest)) // TODO: wo?

        this.formGroup.valueChanges.subscribe(value => this.checkChanges(value))

        this.messageAdministrationService.readNamespaces().subscribe(namespaces => {
            this.namespaces = namespaces
            this.suggestionProvider = undefined
        })
    }

    // implement OnDestroy

    override ngOnDestroy() {
        super.ngOnDestroy()
    }
}

