import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  QueryList,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TabConfig } from './layout.models';

/**
 * @ignore
 */
@Component({
  selector: 'tab',
  standalone: true,
  template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class LayoutTabSelector {
  @ViewChild(TemplateRef, {static: true}) template!: TemplateRef<any>;
  @Input() title!: string;
  @Input() icon!: string;
}

/**
 * @ignore base class for selectors that project the content into a pane.
 */
@Component({
  template: ``
})
export abstract class PaneSelector implements AfterContentInit {
  @Input() tabsOverlapMode = false;

  @ContentChildren(LayoutTabSelector) tabsConfig!: QueryList<LayoutTabSelector>;
  tabs!: TabConfig[];

  selectedTabIndex = 0;
  sizes = {};
  opened = true;

  constructor(private el: ElementRef, private dialog: MatDialog) {
  }

  ngAfterContentInit() {
    // @ts-ignore
    this.tabs = this.tabsConfig.toArray();
  }

  undock() {
    const tagName: 'top' | 'bottom' | 'left' | 'right' = this.el.nativeElement.tagName.toLowerCase();
    const pane = document.querySelector(`.cell.${tagName}`);
    // @ts-ignore
    const rect = pane.getBoundingClientRect();

    const undockIndex = this.selectedTabIndex;
    const undockedTab = this.tabs[undockIndex];

    console.log("TODO")
    /*this.dialog
      .open(DialogComponent, {
        data: undockedTab,
        panelClass: ['g3-dialog', 'g3-undocked-pane'],
        position: { left: `${rect.left}px`, top: `${rect.top}px` },
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        hasBackdrop: false,
        autoFocus: false
      })
      .afterClosed()
      .subscribe((result: { andCollapse: boolean }) => {
        !result?.andCollapse && (this.opened = true);
        this.tabs.splice(undockIndex, 0, undockedTab);
      });*/

    this.tabs.splice(this.selectedTabIndex, 1);
    this.opened = false;

    if (this.selectedTabIndex >= this.tabs.length) {
      this.selectedTabIndex--;
    }
  }
}

/**
 * @ignore
 */
@Component({
  selector: 'top',
  standalone: true,
  template: ``
})
export class TopPaneSelector extends PaneSelector {
}

/**
 * @ignore
 */
@Component({
  selector: 'bottom',
  standalone: true,
  template: ``
})
export class BottomPaneSelector extends PaneSelector {
}

/**
 * @ignore
 */
@Component({
  selector: 'left',
  standalone: true,
  template: ``
})
export class LeftPaneSelector extends PaneSelector {
}

/**
 * @ignore
 */
@Component({
  selector: 'right',
  standalone: true,
  template: ``
})
export class RightPaneSelector extends PaneSelector {
}
