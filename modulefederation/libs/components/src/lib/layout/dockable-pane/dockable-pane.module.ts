import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { DockablePaneComponent } from './dockable-pane.component';
import { MatResizableDialogDirective } from './mat-resizable-dialog.directive';
import { IconComponent } from '../../ui/icon.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatButtonModule, DragDropModule, ScrollingModule, IconComponent],
  declarations: [DockablePaneComponent, MatResizableDialogDirective],
  exports: [DockablePaneComponent, MatResizableDialogDirective, MatDialogModule]
})
export class DockablePaneModule {
}

export * from './mat-resizable-dialog.directive';
