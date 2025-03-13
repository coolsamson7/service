/* eslint-disable @angular-eslint/component-class-suffix */

import { AfterContentInit, Component, ContentChildren, ElementRef, Input, OnDestroy, OnInit, QueryList } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DockablePaneComponent } from "../dockable-pane/dockable-pane.component";
import { TabComponent, Tab } from "./tab.component";


/**
 * Base class for the different panes at the different sides of the layout.
 */
@Component({template: ``})
 export abstract class AbstractPaneComponent implements  AfterContentInit, OnDestroy {
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
    @Input() open = true;

    // instance data
  
    @ContentChildren(TabComponent) tabsQuery!: QueryList<TabComponent>;
    tabs!: TabComponent[];
    selectedTab! : TabComponent
    
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
        this.sizes[this.indexOf(this.selectedTab)] = data
    }

    indexOf(tab: TabComponent) {
        return this.tabs.indexOf(tab)
    }

    toggleTab(tab: TabComponent) {
        this.open = ! this.open
    }

    selectTab(tab: TabComponent) {
        this.open = true
        this.selectedTab = tab
    }

    removeTab(tab: TabComponent) {
        const index = this.tabs.indexOf(tab)
        this.tabs.splice(index, 1)
    } 

    close() {
        this.open = false
    }

    //@RestoreState()
    restoreState(state: any) {
        // @ts-ignore
        this.el.nativeElement.parentElement.parentElement.querySelector(
          `resizable-container.cell.pane-container.${this.getTagName()}`
          // @ts-ignore
        ).style.flexBasis = this.sizeOf(this.selectedTab) 
    }

    sizeOf(tab: TabComponent) {
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
            !result?.andCollapse && (this.open = true);
            this.selectedTab.state = "docked"
        });

        this.selectedTab.state = "floating"

        this.open = false;
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
export class TopPaneComponent extends AbstractPaneComponent {
}
  
/**
 * the pane at the bottom
 */
//@Stateful()
@Component({
    selector: 'bottom',
    template: ``
})
export class BottomPaneComponent extends AbstractPaneComponent {
}
  
/**
 * the pane at the left side
 */
//@Stateful()
@Component({
    selector: 'left',
    template: ``
})
export class LeftPaneComponent extends AbstractPaneComponent {
}
  
/**
 * the pane at the right side
 */
//@Stateful()
@Component({
    selector: 'right',
    template: ``
})
export class RightPaneComponent extends AbstractPaneComponent {
}