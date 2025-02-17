
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ModdleExtensions } from 'bpmn-js/lib/BaseViewer';
import { DiagramComponent } from './diagram.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../svg.icon';
import { PropertyPanelModule } from '../property-panel/property-panel.module';
import { DiagramConfiguration, DiagramConfigurationToken } from './diagram.configuration';




@NgModule({
  imports: [
    // angular

    CommonModule,
    FormsModule,

    // property panel

    PropertyPanelModule,

    // stuff

    SvgIconComponent,
  ],
  declarations: [
      DiagramComponent
  ],
  exports: [
    DiagramComponent,

    SvgIconComponent,
  ]
})
export class DiagramModule {
  // public

  /**
   * configure the diagram module
   * @param configuration the configuration object
   */
  public static forRoot(configuration: DiagramConfiguration = {}): ModuleWithProviders<DiagramModule> {
    return {
      ngModule: DiagramModule,
      providers: [
        {
          provide: DiagramConfigurationToken,
          useValue: configuration
        }
      ]
    };
  }
}
