import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DropTarget } from './drag-drop.interface';
import { DragSourceDirective } from './drag-source.directive';
import {TraceLevel, Tracer} from "@modulefederation/common";

/**
 * a directive in order to treat the attributed object as a drop target
 */
@Directive({
  selector: '[drop-target]'
})
export class DropTargetDirective {
  // instance data

  @Output() dropped: EventEmitter<any> = new EventEmitter();

  //@Input
  dropEnabled = true;

  @Input('dropEnabled') set droppable(value: boolean) {
    this.dropEnabled = !!value;
  }

  @Input('allowDrop')
  allowDrop!: (object: any) => boolean;

  @Input('drop-target')
  dropTarget!: DropTarget;

  private screenX: number = 0;
  private screenY: number = 0;

  // constructor

  constructor(private element: ElementRef) {}

  // private

  private dragData(clear: boolean = false): any {
    const data = DragSourceDirective.dragData;

    if (clear) DragSourceDirective.dragData = undefined;

    return data;
  }

  private dropAllowed(): boolean {
    let allowed = false;

    if (this.dropEnabled) {
      if (this.dropTarget) allowed = this.dropTarget.dropAllowed(this.dragData());
      else if (this.allowDrop) allowed = this.allowDrop(this.dragData());
    }

    return allowed;
  }

  // host listeners

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    this.screenX = 0;
    this.screenY = 0;

    if (Tracer.ENABLED)
      Tracer.Trace('ui.dd', TraceLevel.HIGH, 'drag enter');

    if (this.dropTarget?.over) this.dropTarget.over(event);

    if (this.dropAllowed()) {
      event.preventDefault();
      event.stopPropagation();

      if (Tracer.ENABLED) Tracer.Trace('ui.dd', TraceLevel.HIGH, 'drop allowed');

      this.element.nativeElement.classList.add('over');

      // @ts-ignore
      event.dataTransfer.dropEffect = 'move';

      return true;
    } else {
      if (Tracer.ENABLED) Tracer.Trace('ui.dd', TraceLevel.HIGH, 'drop disallowed');

      // @ts-ignore
      event.dataTransfer.dropEffect = 'none';

      return false;
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.screenX !== event.screenX || this.screenY !== event.screenY) {
      if (Tracer.ENABLED) Tracer.Trace('ui.dd', TraceLevel.FULL, 'drag over');

      if (this.dropAllowed()) {
        event.preventDefault();
        //event.stopPropagation();

        // @ts-ignore
        event.dataTransfer.dropEffect = 'move';
      }
      else { // @ts-ignore
        event.dataTransfer.dropEffect = 'none';
      }

      // remember

      this.screenX = event.screenX;
      this.screenY = event.screenY;
    }

    return false;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    if (Tracer.ENABLED) Tracer.Trace('ui.dd', TraceLevel.HIGH, 'drag leave');

    event.preventDefault();
    event.stopPropagation();

    if (this.dropTarget?.over)
      this.dropTarget.out!(event); // TODO typo??

    this.element.nativeElement.classList.remove('over');
  }

  @HostListener('drop', ['$event'])
  onDrop(event: any) {
    console.log("DROP")
    if (Tracer.ENABLED) Tracer.Trace('ui.dd', TraceLevel.HIGH, 'drop');

    event.stopPropagation();
    if (this.dropAllowed()) {
      this.element.nativeElement.classList.remove('over');

      if (this.dropTarget) {console.log("dropped")
        this.dropTarget.dropped(this.dragData());
      }
      else {console.log("emit drop")
        this.dropped.emit(this.dragData(true));
      }
    } // if

    return false;
  }
}
