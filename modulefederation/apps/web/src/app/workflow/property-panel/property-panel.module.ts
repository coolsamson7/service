import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { PropertyGroupComponent } from './property-group';
import { PropertyPanelComponent } from './property-panel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../svg.icon';
import { ExtensionEditor } from './extension-editor';
import { PropertyPanelConfig, PropertyPanelConfigurationToken } from './property-panel.configuration';
import { PropertyNameComponent } from './property-name';
import { PropertyEditorDirective } from './property.editor.directive';
import { ReplaySubject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ExtensionList } from './extension-list';
import { BadgeComponent } from './badge.component';

@NgModule({
  imports: [
    // angular

    CommonModule,
    FormsModule,

    // material

    MatIconModule,

    // editors

    PropertyNameComponent,

    // stuff

    SvgIconComponent,
  ],
  declarations: [
      BadgeComponent,
      PropertyGroupComponent,
      PropertyPanelComponent,
      ExtensionEditor,
      ExtensionList,
      PropertyEditorDirective
  ],
  exports: [
    BadgeComponent,
    PropertyPanelComponent,
    PropertyEditorDirective,

    SvgIconComponent,
  ]
})
export class PropertyPanelModule {
  static injector = new ReplaySubject<Injector>()

  // constructor

  constructor(injector: Injector) {
    PropertyPanelModule.injector.next(injector);
  }

  // public

  /**
   * configure the tracing module
   * @param configuration the configuration object
   */
  public static forRoot(configuration: PropertyPanelConfig = {groups: [], editors: []}): ModuleWithProviders<PropertyPanelModule> {
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
