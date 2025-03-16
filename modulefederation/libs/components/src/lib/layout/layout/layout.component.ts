/* eslint-disable @angular-eslint/component-class-suffix */
import {
  Component,
  ContentChild,
  Input,
  Optional,
  SkipSelf
} from '@angular/core';

import { TopPaneComponent, BottomPaneComponent, LeftPaneComponent, RightPaneComponent } from './pane.component';
import { State, Stateful } from '@modulefederation/common';

/**
 * the main layout component which is able to show panes on the different sides and projects the content inside.
 */
@Stateful()
@Component({
  selector: 'layout',
  templateUrl: 'layout.component.html',
  styleUrls: ['layout.component.scss'],
})
export class LayoutComponent {
  // input

  // TODO: it should be like this: !this.parent?.horizontal;

  @Input() horizontal = true;

  // instance data

  @State({recursive: true})
  @ContentChild(TopPaneComponent) topPane?: TopPaneComponent;
  @State({recursive: true})
  @ContentChild(BottomPaneComponent) bottomPane?: BottomPaneComponent;
  @State({recursive: true})
  @ContentChild(LeftPaneComponent) leftPane?: LeftPaneComponent;
  @State({recursive: true})
  @ContentChild(RightPaneComponent) rightPane?: RightPaneComponent;

  // constructor

  constructor(@Optional() @SkipSelf() private parent: LayoutComponent) {
  }

  // public

  directionsFor(clazz: string): string[] {
    const mapping: any = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top'
    }

    return [mapping[clazz]]
  }

  computeStyle(pane: any): any {
    return !pane.isOpen() && {display: 'none'}
  }
}
