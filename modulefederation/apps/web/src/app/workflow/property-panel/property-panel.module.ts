
import { ModuleWithProviders, NgModule } from '@angular/core';
import { PropertyGroupComponent } from './property-group';
import { PropertyPanelComponent } from './property-panel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../svg.icon';
//import { PropertyEditorModule } from './editor/property-editor.module';
import { ExtensionEditor } from './extension-editor';
import { PropertyEditorModule } from './editor/property-editor.module';
import { PropertyPanelConfig, PropertyPanelConfigurationToken } from './property-panel.configuration';
import { BooleanPropertyEditor } from '../editors/boolean/boolean-editor';
import { DocumentationPropertyEditor } from '../editors/documentation/documentation-editor';
import { ExecutionListenerEditor } from '../editors/execution-listener/execution-listener';
import { IdPropertyEditor } from '../editors/id/id-editor';
import { InputOutputEditor } from '../editors/input-output/input-output';
import { IntegerPropertyEditor } from '../editors/integer/integer-editor';
import { StringPropertyEditor } from '../editors/string/string-editor';
import { SchemaPropertyEditor } from '../editors/schema/schema-editor';
import { FormPropertyEditor } from '../editors/form/form-editor';
import { ServiceTaskEditor } from '../editors/service-task/service-task';

const EDITORS = [
  StringPropertyEditor,
  IntegerPropertyEditor,
  BooleanPropertyEditor,
  DocumentationPropertyEditor,
  FormPropertyEditor,
  IdPropertyEditor,
  InputOutputEditor,
  ExecutionListenerEditor,
  SchemaPropertyEditor,
  ServiceTaskEditor
]



@NgModule({
  imports: [
    // angular

    CommonModule,
    FormsModule,

    // editors

    PropertyEditorModule,

    // stuff

    SvgIconComponent,
  ],
  declarations: [
      PropertyGroupComponent,
      PropertyPanelComponent,
      ExtensionEditor,
  ],
  exports: [
    PropertyPanelComponent,

    SvgIconComponent,
  ]
})
export class PropertyPanelModule {
  // public

  /**
   * configure the tracing module
   * @param configuration the configuration object
   */
  public static forRoot(configuration: PropertyPanelConfig = {groups: []}): ModuleWithProviders<PropertyPanelModule> {
    return {
      ngModule: PropertyPanelModule,
      providers: [
        {
          provide: PropertyPanelConfigurationToken,
          useValue: configuration
        }
      ]
    };
  }
}
