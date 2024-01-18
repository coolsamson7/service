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
import { MatLineModule, MatOptionModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ChipsComponent } from "./chips.component";
import { Folder } from "@modulefederation/portal";
import { I18NTreeComponent } from "./widgets/i18n-tree";
import { NgModelSuggestionsDirective } from "./widgets/suggestion.directive";

@Folder({
    name: "microfrontends",
    label: "Microfrontend Stuff",
    icon: "home"
})
@NgModule({
    declarations: [
        MirofrontendsComponent,
        MicrofrontendDetailsComponent,
        ChipsComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatListModule,
        MatButtonModule,
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
        MatSlideToggleModule,
        MatLineModule,
        MatDialogModule,
        MatToolbarModule,
        I18NTreeComponent,
        NgModelSuggestionsDirective
    ]
})
export class PortalComponentModule {
}
