import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DockablePaneModule } from '../dockable-pane/dockable-pane.module';
import { ResizableContainerModule } from '../resizable-container/resizable-container.module';
import { BottomPane, LayoutComponent, LayoutTab, LeftPane, RightPane, TopPane } from './layout.component';
import { IconComponent } from '../../ui/icon.component';

/**
 * @ignore
 */
const declarables = [
  LayoutComponent,
  TopPane,
  BottomPane,
  LeftPane,
  RightPane,
  LayoutTab
];

//@Library(packageJson)
@NgModule({
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    DockablePaneModule,
    ResizableContainerModule,
    IconComponent
  ],
  declarations: [...declarables],
  exports: [...declarables]
})
export class LayoutModule {
}
