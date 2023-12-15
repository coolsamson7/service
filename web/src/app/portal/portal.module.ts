import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatTabsModule } from "@angular/material/tabs";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MirofrontendsComponent } from "./microfrontends.component";
import { MicrofrontendDetailsComponent } from "./microfrontend-details.component";
import { MonacoEditorModule } from "../widgets/monaco-editor/monaco-editor.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatChipsModule } from "@angular/material/chips";
import { MatOptionModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatLegacyChipsModule } from "@angular/material/legacy-chips";

@NgModule({
  declarations: [
    MirofrontendsComponent,
    MicrofrontendDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatTabsModule,
    MatInputModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MonacoEditorModule,
    MatChipsModule,
    MatLegacyChipsModule
  ]
})
export class PortalModule { }
