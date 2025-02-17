/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injector, NgModule } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { SvgIconComponent } from '../../svg.icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PropertyEditorDirective } from './property.editor.directive';

@NgModule({
  imports: [
    // angular

    CommonModule,
    FormsModule,

    SvgIconComponent
  ],
  declarations: [
    PropertyEditorDirective
  ],
  exports: [
    PropertyEditorDirective,
    SvgIconComponent
  ]
})
export class PropertyEditorModule {
  static injector = new ReplaySubject<Injector>()

  constructor(injector: Injector) {
    PropertyEditorModule.injector.next(injector);
  }
}



