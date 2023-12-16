import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { Feature, Manifest } from "./model";
import { ActivatedRoute } from '@angular/router';
import { RouteElement } from '../widgets/navigation-component.component';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { MirofrontendsComponent } from "./microfrontends.component";
import { EditorModel } from "../widgets/monaco-editor/monaco-editor";
import { v4 as uuidv4 } from 'uuid'
import { FormControl, NgForm } from "@angular/forms";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from "@angular/material/chips";
import { MatAutocomplete, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

@Component({
  selector: 'microfrontend-details',
  templateUrl: './microfrontend-details.component.html',
  styleUrls: ['./microfrontend-details.component.scss'],
  providers: []
})
export class MicrofrontendDetailsComponent implements OnInit, OnDestroy {
  // instance data

  manifest: Manifest = {
    commitHash: "",
    features: [],
    module: undefined,
    name: "",
    remoteEntry: "",
    version: ""
  }
  subscription: Subscription
  element: RouteElement = {
    label: "Microfrontends",
    route: "/microfrontends/"
  }

  uuid = uuidv4() // will be set in onInit

  model :  EditorModel = {
    value: '',
    language: "json",
    schema: null,
    uri: null // will be set in onInit
  }

  @ViewChild('form') public form: NgForm

  selectedFeature : Feature

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  permissionCtrl = new FormControl();
  tagCtrl = new FormControl();
  categoryCtrl = new FormControl();
  visibilityCtrl = new FormControl();
  featureToggleCtrl = new FormControl();

  @ViewChild('permissionInput') permissionInput: ElementRef<HTMLInputElement>;
  @ViewChild('permissionAuto') permissionAutocomplete: MatAutocomplete;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('tagAuto') tagAutocomplete: MatAutocomplete;

  @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('categoryAuto') categoryAutocomplete: MatAutocomplete;

  @ViewChild('visibilityInput') visibilityInput: ElementRef<HTMLInputElement>;
  @ViewChild('visibilityAuto') visibilityAutocomplete: MatAutocomplete;

  filteredPermissions: Observable<string[]>;
  allPermissions: string[] = [];

  filteredTags: Observable<string[]>;
  allTags: string[] = [];

  filteredCategories: Observable<string[]>;
  allCategories: string[] = [];

  filteredVisibility: Observable<string[]>;
  allVisibilities: string[] = ['public', 'private'];

  // constructor

  constructor(private activatedRoute: ActivatedRoute, private microfrontendsComponent: MirofrontendsComponent) {
    microfrontendsComponent.pushRouteElement(this.element)

    // visibility

    this.filteredVisibility = this.visibilityCtrl.valueChanges.pipe(
      startWith(null),
      map((visibility: string | null) => visibility ? this.filterVisibilities(visibility) : this.allVisibilities.slice()));


    // permissions

    this.filteredPermissions = this.permissionCtrl.valueChanges.pipe(
      startWith(null),
      map((permission: string | null) => permission ? this.filterPermissions(permission) : this.allPermissions.slice()));
  }

  // public

    setManifests(manifests: Manifest[]):Manifest[] {
      // local functions

        let analyzeFeature = (feature: Feature) => {
            // recursion

            if ( feature.children)
                for (let child of feature.children)
                    analyzeFeature(child)

            // collect info

            for ( let permission of feature.permissions)
                if ( !this.allPermissions.includes(permission))
                    this.allPermissions.push(permission)

            for ( let tag of feature.tags)
                if ( !this.allTags.includes(tag))
                    this.allTags.push(tag)

            for ( let category of feature.categories)
                if ( !this.allCategories.includes(category))
                    this.allCategories.push(category)
        }

        let analyzeManifest = (manifest: Manifest) => {
            for (let feature of manifest.features)
                analyzeFeature(feature)
        }

        for ( let manifest of manifests)
            analyzeManifest(manifest)

        // done


      return manifests
    }

  setManifest(manifestName: string) {
    this.model.uri = this.uuid + manifestName // will be set in onInit

    this.microfrontendsComponent.$manifests.subscribe(manifests => this.manifest = this.setManifests(manifests).find((manifest) => manifest.name == manifestName))
  }

  selectFeature(feature: Feature) {
    this.selectedFeature = feature
  }

  // visibility

  private filterVisibilities(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allVisibilities.filter(visibility => visibility.toLowerCase().indexOf(filterValue) === 0);
  }

  addVisibility(event: MatChipInputEvent): void {
    if (!this.visibilityAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        this.selectedFeature.visibility.push(value.trim());
      }

      // reset the input value

      if (input)
        input.value = '';

      this.visibilityCtrl.setValue(null);
    }
  }

  removeVisibility(visibility: string): void {
    const index = this.selectedFeature.visibility.indexOf(visibility);

    if (index >= 0)
      this.selectedFeature.visibility.splice(index, 1);
  }

  selectedVisibility(event: MatAutocompleteSelectedEvent): void {
    this.selectedFeature.visibility.push(event.option.viewValue);

    this.visibilityInput.nativeElement.value = '';
    this.visibilityCtrl.setValue(null);
  }

  // permission

  private filterPermissions(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allPermissions.filter(permission => permission.toLowerCase().indexOf(filterValue) === 0);
  }

  addPermission(event: MatChipInputEvent): void {
    if (!this.permissionAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        this.selectedFeature.permissions.push(value.trim());
      }

      // reset the input value

      if (input)
        input.value = '';

      this.permissionCtrl.setValue(null);
    }
  }

  removePermission(permission: string): void {
    const index = this.selectedFeature.permissions.indexOf(permission);

    if (index >= 0)
      this.selectedFeature.permissions.splice(index, 1);
  }

  selectedPermission(event: MatAutocompleteSelectedEvent): void {
    this.selectedFeature.permissions.push(event.option.viewValue);

    this.permissionInput.nativeElement.value = '';
    this.permissionCtrl.setValue(null);
  }


  // implement OnInit

  ngOnInit() {
    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.setManifest(params["microfrontend"])
    })
  }

  // implement OnDestroy

  ngOnDestroy() {
    if ( this.element)
      this.microfrontendsComponent.popRouteElement(this.element);

    this.subscription.unsubscribe();
  }
}
