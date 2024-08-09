import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
} from '@angular/core';

export interface ResizeConfig {
  direction: 'horizontal' | 'vertical' | 'none',
   // custom properties
 [prop : string] : any;
}

export interface ResizeEvent extends ResizeConfig {
  element: ElementRef,
  delta: number,
}

@Directive({
  selector:'[resize]',
  standalone: true
})
export class ResizerDirective implements OnInit, OnDestroy {
  // instance data

  @Input('resize') config!: ResizeConfig;

  @Output() startResize = new EventEmitter<ResizeEvent>();
  @Output() resized     = new EventEmitter<ResizeEvent>();
  @Output() endResize   = new EventEmitter<ResizeEvent>();

  cursorX = -1;
  cursorY = -1;
  event!: ResizeEvent

  // constructor

  constructor(private el: ElementRef) {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp   = this.onMouseUp.bind(this);

    el.nativeElement.addEventListener('mousedown', this.onMouseDown);
  }

  // callbacks

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if ( this.config.direction == 'none')
      return

    this.cursorX = event.clientX;
    this.cursorY = event.clientY;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    this.startResize.emit(this.event)
  }

  onMouseMove(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.event.delta = this.config.direction == "horizontal" ? event.clientX - this.cursorX : event.clientY - this.cursorY

    this.resized.emit(this.event)
  }

  onMouseUp(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

     document.removeEventListener('mousemove', this.onMouseMove);
     document.removeEventListener('mouseup', this.onMouseUp);

     this.endResize.emit(this.event)
  }

  // implement OnInit

  ngOnInit(): void {
    this.event = {...this.config, element:  this.el, delta: 0}
    // set cursor
    this.el.nativeElement.style.cursor = this.config.direction == 'horizontal' ? 'ew-resize' : 'ns-resize'
  }

  // implement OnDestroy

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('mousedown', this.onMouseDown);
  }
}
