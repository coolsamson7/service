/* eslint-disable no-case-declarations */
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { Point } from './drag-handle.directive';

type Data = {
  id?: string;
  point?: Point;
  width?: number | string | boolean;
  height?: number | string | boolean;
};

@Component({
  selector: 'resizable-container',
  templateUrl: 'resizable-container.component.html',
  styleUrls: ['resizable-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResizableContainerComponent implements OnInit, AfterViewInit {
  @HostBinding('class.resizable') resizable = true;
  @HostBinding('class.no-transition') noTransition = false;
  @HostBinding('style.width') width!: string;
  @HostBinding('style.height') height!: string;
  @HostBinding('style.flex-basis') flexBasis: string | number | boolean | undefined;

  @Input() directions: string[] = []
  @Input() flex = false;
  @Output() resizeStart = new EventEmitter();
  @Output() resizing = new EventEmitter();
  @Output() resizeEnd = new EventEmitter();
  public nativeElement;
  private style: any;
  private w!: number;
  private h!: number;
  private vx = 1;
  private vy = 1;
  private start!: number;
  private dragDir!: string;
  private axis!: string;
  private data: Data = {};

  constructor(private regionElement: ElementRef) {
    this.nativeElement = this.regionElement.nativeElement;
  }

  @Input()
  set initialSize(value: string) {
    this.flexBasis = value || '120px';
  }

  ngOnInit() {
    // Added to permit use of component for all cells
    if (!this.flex) {
      this.resizable = false;
    }
  }

  ngAfterViewInit() {
    this.style = window.getComputedStyle(this.nativeElement);
  }

  public dragStart(p: Point, direction: string) {
    this.dragDir = direction;
    this.axis = this.dragDir === 'left' || this.dragDir === 'right' ? 'x' : 'y';
    this.start = this.axis === 'x' ? p.x : p.y;
    this.w = parseInt(this.style.getPropertyValue('width'), 10);
    this.h = parseInt(this.style.getPropertyValue('height'), 10);

    this.resizeStart.emit({data: this.data});
    this.noTransition = true;
  }

  public dragEnd(p: Point) {
    this.updateData(p);
    this.resizeEnd.emit({data: this.data});
    this.noTransition = false;
  }

  public dragging(p: Point) {
    const offset = this.axis === 'x' ? this.start - p.x : this.start - p.y;

    let operand = 1;
    switch (this.dragDir) {
      // @ts-ignore
      case 'top':
        operand = -1;


      case 'bottom':
        const height = this.h - offset * this.vy * operand + 'px';
        if (this.flex) {
          this.flexBasis = height;
        }
        else {
          this.height = height;
        }
        break;
      // @ts-ignore
      case 'left':
        operand = -1;

      case 'right':
        const width = this.w - offset * this.vx * operand + 'px';
        if (this.flex) {
          this.flexBasis = width;
        }
        else {
          this.width = width;
        }
        break;
    }
    this.updateData(p);
    this.resizing.emit({data: this.data});
  }

  private updateData(p: Point) {
    this.data.width = false;
    this.data.height = false;

    const prop = this.axis === 'x' ? 'width' : 'height';

    this.data[prop] = this.flex ? this.flexBasis : parseInt(this.nativeElement.style[prop], 10);

    this.data.id = this.nativeElement.id;
    this.data.point = p;
  }
}
