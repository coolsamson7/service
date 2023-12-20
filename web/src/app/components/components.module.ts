import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ComponentsComponent } from "./components.component";
import { ComponentListComponent } from "./component-list.component";
import { ComponentDetailsComponent } from "./component-details.component";
import { MatListModule } from "@angular/material/list";
import { RouterModule } from "@angular/router";
import { MatTabsModule } from "@angular/material/tabs";
import { NavigableListComponent, NavigableListItemDirective } from "../widgets/navigable-list.directive";
import { ServiceInstanceComponent } from "./service-instance.component";
import { ServiceInstanceListComponent } from "./service-instance-list.component";
import { ServiceComponent } from "./service.component";
import { FormsModule } from "@angular/forms";
import { ParameterValidator } from "./service-runner/parameter-validator";
import { MonacoEditorModule } from "../widgets/monaco-editor/monaco-editor.module";
import { ServiceMethodRunnerComponent } from "./service-runner/service-method-runner.component";
import { ServiceAnnotationComponent } from "./service/service-annotation.component";
import { ServiceClassComponent } from "./service/service-class.component";
import { ServiceLiteralComponent } from "./service/service-literal.component";
import { ServiceMethodComponent } from "./service/service-method.component";
import { ServicePropertyComponent } from "./service/service-property.component";
import { ServiceTypeComponent } from "./service/service-type.component";
import { QueryParamComponent } from "./service-runner/query-parameter.component";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DescriptionComponent } from "./service/description.component";

@NgModule({
  declarations: [
    ComponentsComponent,
    ComponentListComponent,
    ComponentDetailsComponent,
    NavigableListItemDirective,
    ServiceInstanceListComponent,
    ServiceInstanceComponent,
    NavigableListComponent,
    ServiceComponent,
    ServiceLiteralComponent,
    ServiceAnnotationComponent,
    ServiceTypeComponent,
    ServiceMethodComponent,
    ServicePropertyComponent,
    ServiceClassComponent,
    ServiceMethodRunnerComponent,
    QueryParamComponent,
    ParameterValidator,
    DescriptionComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MonacoEditorModule
  ]
})
export class ComponentsModule {
}
