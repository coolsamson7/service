/* eslint-disable @angular-eslint/component-class-suffix */
import {
  Component,
  ContentChild,
  Input,
  Optional,
  SkipSelf
} from '@angular/core';

import { TopPane, BottomPane, LeftPane, RightPane } from './pane.component';
import { TabConfig } from './tab.component';
import { IconBarElement } from '../icon-bar/icon-bar';


/**
 * the main layout component which is able to show panes on the different sides and projects the content inside.
 */
  //@Stateful()
@Component({
  selector: 'layout',
  templateUrl: 'layout.component.html',
  styleUrls: ['layout.component.scss'],
})
export class LayoutComponent {
  // input

  // TODO: it should be like this: !this.parent?.horizontal;
  /**
   * @ignore
   */
  @Input() horizontal = true;

  // instance data

  @ContentChild(TopPane) topPane?: TopPane;
  @ContentChild(BottomPane) bottomPane?: BottomPane;
  @ContentChild(LeftPane) leftPane?: LeftPane;
  @ContentChild(RightPane) rightPane?: RightPane;

  // constructor

  constructor(@Optional() @SkipSelf() private parent: LayoutComponent) {
  }

  // public

  directionsFor(clazz: string): string[] {
    let mapping: any = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top'
    }

    return [mapping[clazz]]
  }

  computeStyle(pane: any): any {
    let result = (!pane.opened || !pane.tabs.length) && {display: 'none'}

    //console.log(result)
    return result
  }
}
