import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  QueryList
} from '@angular/core';
import { FocusableOption, FocusKeyManager } from '@angular/cdk/a11y';

@Directive({
  selector: '[navigableListItem]'
})
export class NavigableListItemDirective implements FocusableOption {
  // instance data

  // The label which allows the user to jump to the list item by typing
  @Input('navigableListItem')
  label? : string;
  disabled : boolean = false;
  // Emits when an item is selected with mouse or keyboard
  @Output('navSelection')
  selectedChange = new EventEmitter<void>()
  // only intended to be used by the container navigable list component.
  @Output()
  focused = new EventEmitter<void>()

  // Change name since it's not really two-way bindable.
  /** @internal */
  @HostBinding('tabindex') tabIndex = 0;

  // emits when the element is focused -

  constructor(private element : ElementRef) {
  }

  private _selected = false;

  // Whether the item is currently selected or not. If it is selected, it will be tabbable
  @Input('navSelected')
  get selected() {
    return this._selected;
  }

  // constructor

  set selected(newValue : boolean) {
    this._selected = newValue;

    newValue ? this.tabIndex = 0 : this.tabIndex = -1;
  }

  // liustener

  @HostListener('focus', ['$event'])
  focusEvent(event : FocusEvent) {
    this.focused.emit();
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  @HostListener('click', ['$event'])
  manage(event : KeyboardEvent) {
    this.selectedChange.emit();
    this.selected = true;
  }

  getLabel() : string {
    return this.label || '';
  }

  /** called by the key manager when this item should become focused */
  focus() {
    (this.element.nativeElement as HTMLElement).focus();
  }
}

@Directive({
  selector: '[navigableList]',
})
export class NavigableListComponent implements AfterContentInit {
  // instance data

  keyManager! : FocusKeyManager<NavigableListItemDirective>;

  @ContentChildren(NavigableListItemDirective, {descendants: true})
  listItems! : QueryList<NavigableListItemDirective>;

  // constructor

  constructor() {
  }

  // listener

  @HostListener('keydown', ['$event'])
  manage(event : KeyboardEvent) {
    this.keyManager.onKeydown(event);
  }

  // implement AfterContentInit

  ngAfterContentInit() {
    // typing the first letter of an item will jump to the item. (based on optional label input)

    this.keyManager = new FocusKeyManager<NavigableListItemDirective>(this.listItems).withWrap().withTypeAhead(300);

    setTimeout(() => {
      this.listItems.first.tabIndex = 0;
    })

    // todo: subscribe to listItems changes

    this.listItems.forEach((item, index) => {
      // TODO: unsub

      item.selectedChange.subscribe(it => {
        this.keyManager.setActiveItem(index);
        this.listItems.forEach((otherItem, otherIndex) => {
          if (otherIndex != index) {
            otherItem.selected = false;
          }
        })
      })

      item.focused.subscribe(_ => {
        this.keyManager.setActiveItem(index);
      })
    })
  }
}
