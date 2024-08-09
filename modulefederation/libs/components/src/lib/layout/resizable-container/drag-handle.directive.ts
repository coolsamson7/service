import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

export type Point = { x: number; y: number };

@Directive({
  selector: '[dragHandle]'
})
export class DragHandleDirective {
  // output

  @Output() dragStart = new EventEmitter<Point>();
  @Output() drag = new EventEmitter<Point>();
  @Output() dragEnd = new EventEmitter<Point>();

  private dragging = false;

  // cnstructor

  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  // host listener

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (e.which === 1) {
      this.dragging = true;
      this.dragStart.emit({x: e.clientX, y: e.clientY});

      document.addEventListener('mousemove', this.onMouseMove);
    }
  }

  /*@HostListener('touchstart', ['$event'])
  onTouchstart(e: TouchEvent) {
    const touch = e.touches[0];
    this.dragging = true;
    this.dragStart.emit({x: touch.clientX, y: touch.clientY});
  }*/

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e: MouseEvent) {
    if (this.dragging) {
      this.dragEnd.emit({x: e.clientX, y: e.clientY});

      document.removeEventListener('mousemove', this.onMouseMove);
    }
    this.dragging = false;
  }

  /*@HostListener('document:touchend', ['$event'])
  @HostListener('document:touchcancel', ['$event'])
  onTouchend(e: TouchEvent) {
    if (this.dragging) {
      const touch = e.changedTouches[0];
      this.dragEnd.emit({x: touch.clientX, y: touch.clientY});
    }
    this.dragging = false;
  }*/

  onMouseMove(e: MouseEvent) {
    if (this.dragging) {
      this.drag.emit({x: e.clientX, y: e.clientY});
    }
  }

  /*@HostListener('document:touchmove', ['$event'])
  onTouchmove(e: TouchEvent) {
    if (this.dragging) {
      const touch = e.touches[0];

      this.drag.emit({x: touch.clientX, y: touch.clientY});
    }
  }*/
}
