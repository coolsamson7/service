import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DockablePaneModule } from '../dockable-pane/dockable-pane.module';
import { ResizableContainerModule } from '../resizable-container/resizable-container.module';
import {  LayoutComponent } from './layout.component';
import { IconComponent } from '../../ui/icon.component';
import { IconBarComponent } from '../icon-bar/icon-bar';
import { TopPaneComponent, BottomPaneComponent, LeftPaneComponent, RightPaneComponent } from './pane.component';
import { TabComponent } from './tab.component';

/**
 * @ignore
 */
const declarables = [
  LayoutComponent,
  TopPaneComponent,
  BottomPaneComponent,
  LeftPaneComponent,
  RightPaneComponent,
  TabComponent
];

@NgModule({
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    DockablePaneModule,
    ResizableContainerModule,
    IconComponent,
    IconBarComponent
  ],
  declarations: [...declarables],
  exports: [...declarables]
})
export class LayoutModule {
}
