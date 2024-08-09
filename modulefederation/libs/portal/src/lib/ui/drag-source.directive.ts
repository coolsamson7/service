import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DragSource } from './drag-drop.interface';
import {TraceLevel, Tracer} from "@modulefederation/common";

/**
 * a directive in order to treat the attributed obejct as a drag source
 */
@Directive({
  selector: '[drag-source]'
})
export class DragSourceDirective implements OnChanges {
  // static data

  static dragData: any;

  // instance data

  @Input()
  private draggable = true;
  @Input('source')
  private source!: () => any;

  @Input('drag-source')
  dragSource!: DragSource;

  // constructor

  constructor(private element: ElementRef, private tracer: Tracer) {}

  // handlers

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    if (Tracer.ENABLED)
      Tracer.Trace('ui.dd', TraceLevel.HIGH, 'drag start');

    DragSourceDirective.dragData = this.dragSource ? this.dragSource.create() : this.source();

    event.stopPropagation();

    this.element.nativeElement.classList.add('dragging');

    // @ts-ignore
    event.dataTransfer.setData('Text', event.target.id);

    // @ts-ignore
    event.dataTransfer.effectAllowed = 'move';
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent) {
    if (Tracer.ENABLED)
      Tracer.Trace('ui.dd', TraceLevel.HIGH, 'drag end');

    DragSourceDirective.dragData = undefined;

    event.preventDefault();
    this.element.nativeElement.classList.remove('dragging');
  }

  // implement OnChanges

  /**
   * @inheritdoc
   */
  ngOnChanges(changes: SimpleChanges) {
    this.element.nativeElement.setAttribute('draggable', this.draggable ? 'true' : 'false');
  }
}
