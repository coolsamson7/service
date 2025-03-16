import { takeUntil } from 'rxjs/operators';
import { fromEvent, Subscription } from 'rxjs';
import { AfterViewInit, Directive, Input, OnDestroy } from '@angular/core';
import { MatDialogContainer } from '@angular/material/dialog';
import { DockablePaneComponent } from './dockable-pane.component';

/**
 * @ignore
 */
type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/**
 * @ignore material dialogs will be resizable
 */
@Directive({
  selector: '[matResizableDialog]'
})
export class MatResizableDialogDirective implements OnDestroy, AfterViewInit {
  // input

  @Input('matResizableDialog') pane!: DockablePaneComponent 
  
  // instance data

  private readonly directions: Direction[] = ['se', 'sw'];
  private resizingDirection: Direction | null = null;
  private element!: HTMLElement;
  private subscription: Subscription | undefined = undefined;
  private newWidth!: number;
  private newHeight!: number;
  private newLeft!: number;
  private newTop!: number;

  private minWidth!: number;
  private maxWidth!: number;
  private minHeight!: number;
  private maxHeight!: number;

  // constructor

  constructor(private container: MatDialogContainer) {
    !container && console.error(`MatResizableDialogDirective should be used only inside of the MatDialogContainer`);
  }

  // implement AfterViewInit

  ngAfterViewInit(): void {
    this.element = this.container['_elementRef'].nativeElement;
    this.element.addEventListener('mousedown', (e) => this.onMousedown(e));

    Object.assign(this.element.style, {
      position: 'absolute',
      maxWidth: 'none',
      maxHeight: 'none',
      minHeight: '100px',
      overflow: 'hidden'
    });

    this.directions.forEach((d) => this.createHandle(`resize-handle-${d}`));

    const computedStyle = window.getComputedStyle(this.element);
    this.minWidth = parseFloat(computedStyle.minWidth);
    this.maxWidth = parseFloat(computedStyle.maxWidth);
    this.minHeight = parseFloat(computedStyle.minHeight);
    this.maxHeight = parseFloat(computedStyle.maxHeight);
  }

  onMousedown(event: MouseEvent | TouchEvent): void {
    if (!isLeftButton(event)) {
      return;
    }

    const className = (event.target as HTMLElement).classList.toString();

    if (!className.includes('resize-handle')) {
      return;
    }

    // @ts-ignore
    const direction = className.match(/resize-handle-(.*)/)[1] as Direction;
    const evt = getEvent(event);
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    const left = this.element.offsetLeft;
    const top = this.element.offsetTop;
    const screenX = evt.screenX;
    const screenY = evt.screenY;

    const isTouchEvent = event.type.startsWith('touch');
    const moveEvent = isTouchEvent ? 'touchmove' : 'mousemove';
    const upEvent = isTouchEvent ? 'touchend' : 'mouseup';

    this.initResize(event, direction);

    const mouseup = fromEvent(document, upEvent);
    // @ts-ignore
    this.subscription = mouseup.subscribe((e: MouseEvent | TouchEvent) => this.onMouseup(e));

    // @ts-ignore
    const mouseMoveSub = fromEvent(document, moveEvent)
      .pipe(takeUntil(mouseup))
      // @ts-ignore
      .subscribe((e: MouseEvent | TouchEvent) => this.move(e, width, height, top, left, screenX, screenY));

    this.subscription.add(mouseMoveSub);
  }

  move(
    event: MouseEvent | TouchEvent,
    width: number,
    height: number,
    top: number,
    left: number,
    screenX: number,
    screenY: number
  ): void {
    const evt = getEvent(event);
    const movementX = evt.screenX - screenX;
    const movementY = evt.screenY - screenY;
    const movingWest = ['sw', 'w', 'nw'].includes(this.resizingDirection!);
    const movingNorth = ['nw', 'n', 'ne'].includes(this.resizingDirection!);

    this.newWidth = width - (movingWest ? movementX : -movementX);
    this.newHeight = height - (movingNorth ? movementY : -movementY);
    this.newLeft = left + movementX;
    this.newTop = top + movementY;

    this.resizeWidth(evt);
    this.resizeHeight(evt);
  }

  onMouseup(event: MouseEvent | TouchEvent): void {
    this.endResize(event);
    this.destroySubscription();
  }

  initResize(event: MouseEvent | TouchEvent, direction: Direction) {
    this.resizingDirection = direction;
    this.element.classList.add('resizing');
    this.newWidth = this.element.clientWidth;
    this.newHeight = this.element.clientHeight;
    this.newLeft = this.element.offsetLeft;
    this.newTop = this.element.offsetTop;
    event.stopPropagation();
  }

  endResize(event: MouseEvent | TouchEvent): void {
    this.resizingDirection = null;
    this.element.classList.remove('resizing');

    this.pane.resized()
  }

  resizeWidth(event: MouseEvent | Touch): void {
    const overMinWidth = !this.minWidth || this.newWidth >= this.minWidth;
    const underMaxWidth = !this.maxWidth || this.newWidth <= this.maxWidth;

    if (['se', 'e', 'ne'].includes(this.resizingDirection!)) {
      if (overMinWidth && underMaxWidth) {
        this.element.style.width = `${this.newWidth}px`;
      }
    }

    if (['sw', 'w', 'nw'].includes(this.resizingDirection!)) {
      if (overMinWidth && underMaxWidth) {
        this.element.style.left = `${this.newLeft}px`;
        this.element.style.width = `${this.newWidth}px`;
      }
    }
  }

  resizeHeight(event: MouseEvent | Touch): void {
    const overMinHeight = !this.minHeight || this.newHeight >= this.minHeight;
    const underMaxHeight = !this.maxHeight || this.newHeight <= this.maxHeight;

    if (['se', 's', 'sw'].includes(this.resizingDirection!)) {
      if (overMinHeight && underMaxHeight) {
        this.element.style.height = `${this.newHeight}px`;
      }
    }

    if (['nw', 'n', 'ne'].includes(this.resizingDirection!)) {
      if (overMinHeight && underMaxHeight) {
        this.element.style.top = `${this.newTop}px`;
        this.element.style.height = `${this.newHeight}px`;
      }
    }
  }

  // implement OnDestroy

  ngOnDestroy(): void {
    this.destroySubscription();
    this.element.removeEventListener('mousedown', (e) => this.onMousedown(e));
  }

  private destroySubscription(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  private createHandle(className: string): void {
    const node = document.createElement('span');
    node.className = className;
    this.element.appendChild(node);
  }
}

/**
 * @ignore
 */
export function isLeftButton(event: MouseEvent | TouchEvent): boolean {
  if (event.type === 'touchstart') {
    return true;
  }
  return event.type === 'mousedown' && (event as MouseEvent).button === 0;
}

/**
 * @ignore
 */
export function getEvent(event: MouseEvent | TouchEvent): MouseEvent | Touch {
  if (event.type === 'touchend' || event.type === 'touchcancel') {
    return (event as TouchEvent).changedTouches[0];
  }
  return event.type.startsWith('touch') ? (event as TouchEvent).targetTouches[0] : (event as MouseEvent);
}
