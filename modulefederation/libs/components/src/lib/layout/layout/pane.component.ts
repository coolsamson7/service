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
     * the opened state of a tab.
     */
    @Input() opened = true;

    // instance data
  
    @ContentChildren(LayoutTab) tabsQuery!: QueryList<LayoutTab>;
    tabs!: LayoutTab[];
    selectedTab! : LayoutTab
    
    sizes : any = {};
    private dialogRef: any;

    // constructor
  
    constructor(private el: ElementRef, private dialog: MatDialog) {
    }

    // private

    private getTagName(): 'top' | 'bottom' | 'left' | 'right' {
        return this.el.nativeElement.tagName.toLowerCase();
    }

    // public

    rememberSize(data: any) {
        console.log(data)
        this.sizes[this.indexOf(this.selectedTab)] = data
    }

    indexOf(tab: LayoutTab) {
        return this.tabs.indexOf(tab)
    }

    toggleTab(tab: LayoutTab) {
        this.opened = ! this.opened
    }

    selectTab(tab: LayoutTab) {
        this.opened = true
        this.selectedTab = tab
    }

    removeTab(tab: LayoutTab) {
        const index = this.tabs.indexOf(tab)
        this.tabs.splice(index, 1)
    } 

    //@RestoreState()
    restoreState(state: any) {
        // @ts-ignore
        this.el.nativeElement.parentElement.parentElement.querySelector(
          `resizable-container.cell.pane-container.${this.getTagName()}`
          // @ts-ignore
        ).style.flexBasis = this.sizeOf(this.selectedTab) 
    }

    sizeOf(tab: LayoutTab) {
        return this.sizes[this.indexOf(tab)] || this.initialSize;
    }

    undock() {
        const pane = document.querySelector(`.cell.${this.getTagName()}`);
        // @ts-ignore
        const rect = pane.getBoundingClientRect();

        this.dialogRef = this.dialog.open(DockablePaneComponent, {
            data: this.selectedTab,
            panelClass: ['g3-dialog', 'g3-dockable-pane', this.selectedTab.class],
            position: {left: `${rect.left}px`, top: `${rect.top}px`},
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            hasBackdrop: false,
            autoFocus: false
        });

        this.dialogRef.afterClosed().subscribe((result: { andCollapse: boolean }) => {
            !result?.andCollapse && (this.opened = true);
        });

        this.opened = false;
    }
   
    // implement AfterContentInit

    ngAfterContentInit() {
      this.tabs = this.tabsQuery.toArray();
      this.selectedTab = this.tabs[0]
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