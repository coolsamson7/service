import { NgModule } from '@angular/core';
import { DragSourceDirective } from './drag-source.directive';
import { DropTargetDirective } from './drop-target.directive';

@NgModule({
  imports: [],
  declarations: [DragSourceDirective, DropTargetDirective],
  exports: [DragSourceDirective, DropTargetDirective]
})
export class UIModule {}
