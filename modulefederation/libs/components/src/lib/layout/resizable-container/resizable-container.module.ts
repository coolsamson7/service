import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableContainerComponent } from './resizable-container.component';
import { DragHandleDirective } from './drag-handle.directive';

export * from './drag-handle.directive';
export * from './resizable-container.component';

/**
 * @ignore
 */
const declarables = [ResizableContainerComponent, DragHandleDirective];

@NgModule({
  imports: [CommonModule],
  declarations: [...declarables],
  exports: [...declarables]
})
export class ResizableContainerModule {
}


