/* eslint-disable @angular-eslint/component-class-suffix */

import { AfterContentInit, Component, ContentChildren, ElementRef, Input, OnDestroy, OnInit, QueryList } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DockablePaneComponent } from "../dockable-pane/dockable-pane.component";
import { LayoutTab, TabConfig } from "./tab.component";


/**
 * Base class for the different panes at the different sides of the layout.
 */
@Component({
    template: ``
  })
  export abstract class Pane implements  AfterContentInit, OnDestroy {
    // input

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

    // instane data
  
    @ContentChildren(LayoutTab) tabsConfig!: QueryList<LayoutTab>;
    tabs!: TabConfig[];
  
    selectedTabIndex = 0;
  
    sizes = {};
    private dialogRef: any;

    // constructor
  
    constructor(private el: ElementRef, private dialog: MatDialog) {
    }

    // private

    private getTagName(): 'top' | 'bottom' | 'left' | 'right' {
        return this.el.nativeElement.tagName.toLowerCase();
    }

    // public

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
   
    // implement AfterContentInit

    ngAfterContentInit() {
      // TODO WTF
      // @ts-ignore
      this.tabs = this.tabsConfig.toArray();
    }

    // implement OnDestroy
  
    ngOnDestroy() {
      this.dialogRef?.close();
    }
  }

/**
   * the pane at the top
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