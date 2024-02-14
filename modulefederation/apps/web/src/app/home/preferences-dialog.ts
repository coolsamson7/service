/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Inject, Injector, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCommonModule } from "@angular/material/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import {
  AbstractFeature,
  Feature,
  FeatureData,
  FeatureRegistry,
  I18nModule,
  PortalComponentsModule
} from "@modulefederation/portal";
import { MatListModule } from "@angular/material/list";
import { Observable, of } from "rxjs";


export abstract class PreferencesFeature extends AbstractFeature {
  // constructor

  constructor(injector: Injector, dialog : PreferencesDialog, protected feature : FeatureData) {
    super(injector)

    dialog.selectedComponent = this
  }

  // public

  isDirty() : boolean {
    return false
  }

  save() : void {
  }

  canSave() : Observable<boolean> {
    return of(true)
  }
}


export interface PreferencesDialogConfig {
  title : string
}

@Component({
  selector: 'preferences-dialog',
  templateUrl: './preferences-dialog.html',
  styleUrls: ['./preferences-dialog.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatListModule, PortalComponentsModule, I18nModule]
})
export class PreferencesDialog implements OnInit {
  // instance data

  features : FeatureData[] = []
  selectedFeature? : FeatureData
  selectedComponent? : PreferencesFeature

  // constructor

  constructor(
    featureRegistry : FeatureRegistry,
    public dialogRef : MatDialogRef<PreferencesDialog>,
    @Inject(MAT_DIALOG_DATA) public data : PreferencesDialogConfig,
  ) {
    this.features = featureRegistry.finder()
      .withTag("preferences")
      .find()

    this.selectedFeature = this.features[0]
  }

  // callbacks

  selectFeature(feature : FeatureData) {
    if (feature !== this.selectedFeature) {
      if (this.selectedComponent?.isDirty())
        this.selectedComponent?.canSave().subscribe(ok => {
          if (ok)
            this.selectedFeature = feature
        })
      else this.selectedFeature = feature
    }
    else this.selectedFeature = feature
  }

  ok() {
    if (this.selectedComponent?.isDirty())
      this.selectedComponent?.canSave().subscribe(ok => {
        if (ok)
          this.dialogRef.close(true);
      })
    else this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  // implement OnInit
  ngOnInit() : void {
    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === "Escape") {
        this.cancel();
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        this.ok()
      }
    });
  }
}


@Feature({
  i18n: [],
  id: "other-preferences",
  label: "Other",
  tags: ["preferences"]
})
@Component({
  selector: 'other-preferences',
  templateUrl: './other-preferences.html',
  standalone: true,
  imports: [CommonModule, MatCommonModule, MatInputModule, MatIconModule, MatDialogModule, MatButtonModule, FormsModule, MatFormFieldModule, MatListModule]
})
export class OtherPreferences extends PreferencesFeature {
  constructor(injector: Injector, dialog : PreferencesDialog) {
    super(injector, dialog, Reflect.get(OtherPreferences, '$$feature') as FeatureData)
  }
}
