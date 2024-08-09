/* eslint-disable @angular-eslint/component-class-suffix */
import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  Optional,
  QueryList,
  SkipSelf,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { DockablePaneComponent } from '../dockable-pane/dockable-pane.component';
import { TabConfig } from './layout.models';


/**
 * @ignore
 */
@Component({
  selector: 'tab',
  //standalone: true,
  template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class LayoutTab {
  @ViewChild(TemplateRef, {static: true}) template!: TemplateRef<any>;
  @Input() id!: string;
  @Input() title!: string;
  @Input() icon!: string;
  @Input() class!: string;
}

/**
 * Base class for the different panes at the different sides of the layout.
 */
@Component({
  template: ``
})
export abstract class Pane implements AfterContentInit, OnDestroy {
  /**
   * if <code>true</code> the tabs will overlap the content.
   */
  @Input() tabsOverlapMode = false;
  /**
   * if <code>true</code> the tab will only contain the icon.
   */
  @Input() iconTabs = false;
  /**
   * initial size
   */
  @Input() initialSize = '120px';
  /**
   * the opened staten of a tab.
   */
  @Input() opened = true;

  @ContentChildren(LayoutTab) tabsConfig!: QueryList<LayoutTab>;
  tabs!: TabConfig[];

  selectedTabIndex = 0;

  sizes = {};
  private dialogRef: any;

  constructor(private el: ElementRef, private dialog: MatDialog) {
  }

  ngAfterContentInit() {
    // TODO WTF
    // @ts-ignore
    this.tabs = this.tabsConfig.toArray();
  }

  //@RestoreState()
  restoreState(state: any) {

    // @ts-ignore
    this.el.nativeElement.parentElement.parentElement.querySelector(
      `resizable-container.cell.pane-container.${this.getTagName()}`
      // @ts-ignore
    ).style.flexBasis = this.sizes[this.selectedTabIndex] || this.initialSize;
  }

  undock() {
    const pane = document.querySelector(`.cell.${this.getTagName()}`);
    // @ts-ignore
    const rect = pane.getBoundingClientRect();

    const undockIndex = this.selectedTabIndex;
    const undockedTab = this.tabs[undockIndex];

    this.dialogRef = this.dialog.open(DockablePaneComponent, {
      data: undockedTab,
      panelClass: ['g3-dialog', 'g3-dockable-pane', undockedTab.class],
      position: {left: `${rect.left}px`, top: `${rect.top}px`},
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      hasBackdrop: false,
      autoFocus: false
    });

    this.dialogRef.afterClosed().subscribe((result: { andCollapse: boolean }) => {
      !result?.andCollapse && (this.opened = true);
      this.tabs.splice(undockIndex, 0, undockedTab);
    });

    this.tabs.splice(this.selectedTabIndex, 1);
    this.opened = false;

    if (this.selectedTabIndex && this.selectedTabIndex >= this.tabs.length) {
      this.selectedTabIndex--;
    }
  }

  ngOnDestroy() {
    this.dialogRef?.close();
  }

  private getTagName(): 'top' | 'bottom' | 'left' | 'right' {
    return this.el.nativeElement.tagName.toLowerCase();
  }
}

/**
 * @ignore
 */
  //@Stateful()
@Component({
  selector: 'top',
  template: ``
})
export class TopPane extends Pane {
}

/**
 * the pane at the bottom
 */
  //@Stateful()
@Component({
  selector: 'bottom',
  template: ``
})
export class BottomPane extends Pane {
}

/**
 * the pane at the left side
 */
  //@Stateful()
@Component({
  selector: 'left',
  template: ``
})
export class LeftPane extends Pane {
}

/**
 * the pane at the right side
 */
  //@Stateful()
@Component({
  selector: 'right',
  template: ``
})
export class RightPane extends Pane {
}

/**
 * the main layout component which is able to show panes on the different sides and projects the content inside.
 */
  //@Stateful()
@Component({
  selector: 'layout',
  templateUrl: 'layout.component.html',
  styleUrls: ['layout.component.scss'],
  //encapsulation: ViewEncapsulation.None // TODO
})
export class LayoutComponent {
  @ContentChild(TopPane) topPane?: TopPane;
  @ContentChild(BottomPane) bottomPane?: BottomPane;
  @ContentChild(LeftPane) leftPane?: LeftPane;
  @ContentChild(RightPane) rightPane?: RightPane;

  // TODO: it should be like this: !this.parent?.horizontal;
  /**
   * @ignore
   */
  @Input() horizontal = true;

  constructor(@Optional() @SkipSelf() private parent: LayoutComponent) {
  }

  // constructor

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
