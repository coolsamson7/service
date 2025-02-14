
import { ModuleWithProviders, NgModule } from '@angular/core';
import { PropertyGroupComponent, PropertyPanelConfig } from './property-group';
import { ModdleExtensions } from 'bpmn-js/lib/BaseViewer';
import { DiagramComponent } from './diagram.component';
import { ExtensionEditor } from './extension-editor';
import { PropertyPanelComponent } from './property-panel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyEditorModule } from './property-editor.module';
import { PropertyEditorDirective } from './property.editor.directive';
import { SvgIconComponent } from '../svg.icon';

export interface DiagramConfiguration {
  properties: PropertyPanelConfig,
  extensions?: ModdleExtensions;
}


@NgModule({
  imports: [
      CommonModule,
      FormsModule,
      //PropertyEditorModule,

      //PropertyEditorDirective,
      //SvgIconComponent,
  ],
  declarations: [
      //ExtensionEditor,
      //PropertyGroupComponent,
      //PropertyPanelComponent,
     // DiagramComponent
  ],
  exports: [
    //DiagramComponent,
    //PropertyEditorDirective,
    //SvgIconComponent,
  ],
  providers: []
})
export class DiagramModule {
  // static

  static configuration: DiagramConfiguration = {
      properties: {
        groups: []
      }
}

  // public

  /**
   * configure the tracing module
   * @param tracerConfiguration the configuration object
   */
  public static forRoot(configuration: DiagramConfiguration): ModuleWithProviders<DiagramModule> {
    DiagramModule.configuration = configuration

    return {
      ngModule: DiagramModule,


      /*providers: [
        {
          provide: Tracer,
          useValue: new Tracer()
        }
      ]*/
    };
  }
}
