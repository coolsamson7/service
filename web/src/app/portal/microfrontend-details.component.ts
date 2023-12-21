import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Feature, Manifest } from "./model";
import { ActivatedRoute } from '@angular/router';
import { RouteElement } from '../widgets/navigation-component.component';
import { Subscription } from 'rxjs';
import { MirofrontendsComponent } from "./microfrontends.component";
import { EditorModel } from "../widgets/monaco-editor/monaco-editor";
import { v4 as uuidv4 } from 'uuid'
import { FormBuilder, FormGroup, NgForm } from "@angular/forms";
import { Dialogs } from "./dialog/dialogs";

@Component({
  selector: 'microfrontend-details',
  templateUrl: './microfrontend-details.component.html',
  styleUrls: ['./microfrontend-details.component.scss'],
  providers: []
})
export class MicrofrontendDetailsComponent implements OnInit, OnDestroy {
  // instance data

  manifest : Manifest = {
    commitHash: "",
    features: [],
    module: undefined,
    name: "",
    remoteEntry: "",
    version: ""
  }
  subscription : Subscription
  element : RouteElement = {
    label: "Microfrontends",
    route: "/microfrontends/"
  }

  uuid = uuidv4() // will be set in onInit

  model : EditorModel = {
    value: 'hallo',
    language: "json",
    schema: null,
    uri: 'json://' + this.uuid + '.schema'
  }

  manifestJSON = ""

  @ViewChild('form') public form : NgForm

  selectedFeature : Feature

  allPermissions : string[] = [];
  allTags : string[] = [];
  allCategories : string[] = [];
  allVisibilities : string[] = ['public', 'private'];

  formGroup : FormGroup

  dirty = {}
  isDirty = false

  // constructor
  enabled : boolean[]

  // public

  constructor(private formBuilder : FormBuilder, private activatedRoute : ActivatedRoute, private microfrontendsComponent : MirofrontendsComponent, private dialogs : Dialogs) {
    microfrontendsComponent.pushRouteElement(this.element)

    this.formGroup = this.formBuilder.group({
        id: [''],
        label: [''],
        description: [''],
        visibility: [[]],
        permissions: [[]],
        categories: [[]],
        tags: [[]]
      }
    )

    this.formGroup.get('id')?.disable();
  }

  save() {
    // copy values from

    let index = this.manifest.features.indexOf(this.selectedFeature)

    this.selectedFeature.enabled = this.enabled[index]

    for (let propertyName in this.dirty)
      this.selectedFeature[propertyName] = this.dirty[propertyName]

    // save

    this.microfrontendsComponent.saveManifest(this.manifest)

    // new state

    this.selectFeature(this.selectedFeature)
  }

  revert() {
    this.enabled = this.manifest.features.map(feature => feature.enabled)
    // will trigger isDirty calculation
    this.selectFeature(this.selectedFeature)
  }

  setManifests(manifests : Manifest[]) : Manifest[] {
    // local functions

    let analyzeFeature = (feature : Feature) => {
      // recursion

      if (feature.children)
        for (let child of feature.children)
          analyzeFeature(child)

      // collect info

      for (let permission of feature.permissions)
        if (!this.allPermissions.includes(permission))
          this.allPermissions.push(permission)

      for (let tag of feature.tags)
        if (!this.allTags.includes(tag))
          this.allTags.push(tag)

      for (let category of feature.categories)
        if (!this.allCategories.includes(category))
          this.allCategories.push(category)
    }

    let analyzeManifest = (manifest : Manifest) => {
      for (let feature of manifest.features)
        analyzeFeature(feature)
    }

    for (let manifest of manifests)
      analyzeManifest(manifest)

    // done


    return manifests
  }

  setManifest(manifestName : string) {
    this.model.uri = 'json://' + this.uuid + manifestName + '.schema'

    this.microfrontendsComponent.$manifests.subscribe(manifests => this.reallySetManifest(this.setManifests(manifests).find((manifest) => manifest.name == manifestName)))
  }

  reallySetManifest(manifest : Manifest) {
    this.manifest = manifest
    this.manifestJSON = JSON.stringify(manifest, null, 2)

    this.enabled = manifest.features.map(feature => feature.enabled)

    if (manifest.features.length > 0)
      this.selectFeature(manifest.features[0])
  }

  selectFeature(feature : Feature) {
    if (feature !== this.selectedFeature && this.isDirty) {
      this.dialogs
        .confirmationDialog()
        .type("info")
        .title("Switch feature")
        .message("Please save first")
        .okCancel()
        .show().subscribe(result => {//okCancel("Switch feature", "Please save first").subscribe(result => {
        if (result == true) {
          this.save()
          this.isDirty = false
          this.selectFeature(feature)
        }
      })
      return
    }

    this.selectedFeature = feature

    this.formGroup.setValue({
      id: feature.id,
      label: feature.label,
      description: feature.description,
      visibility: feature.visibility,
      categories: feature.categories,
      tags: feature.tags,
      permissions: feature.permissions,
      //enabled: feature.enabled
    })
  }

  toggleEnabled(index : number) {
    this.enabled[index] = !this.enabled[index]

    this.checkChanges(this.formGroup.value)
  }

  checkChanges(value : any) {
    // local functions

    const equalArrays = (a, b) => {
      if (a == undefined || b == undefined)
        return a == b

      if (a.length != b.length)
        return false

      let sorted = b.sort()
      return a.sort().every((element, index) => element == sorted[index]);
    }

    const equals = (a, b) => Array.isArray(a) ? equalArrays(a, b) : a == b

    let dirty = {}

    this.isDirty = false

    for (let propertyName in value) {
      if (!equals(this.selectedFeature[propertyName], value[propertyName])) {
        dirty[propertyName] = value[propertyName]
        this.isDirty = true
      }
    }

    // compare enabled

    let index = this.manifest.features.indexOf(this.selectedFeature)
    if (this.selectedFeature.enabled !== this.enabled[index]) {
      this.isDirty = true
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
  }

  // implement OnDestroy

  ngOnDestroy() {
    if (this.element)
      this.microfrontendsComponent.popRouteElement(this.element);

    this.subscription.unsubscribe();
  }
}
