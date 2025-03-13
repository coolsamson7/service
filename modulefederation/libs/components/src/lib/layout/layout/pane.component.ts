/* eslint-disable @angular-eslint/component-class-suffix */

import { AfterContentInit, Component, ContentChildren, ElementRef, Input, OnDestroy, QueryList } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DockablePaneComponent } from "../dockable-pane/dockable-pane.component";
import { TabComponent } from "./tab.component";


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

    // instance data

    @ContentChildren(TabComponent) tabsQuery!: QueryList<TabComponent>;
    tabs!: TabComponent[];
    selectedTab! : TabComponent

    // constructor

    constructor(private el: ElementRef, private dialog: MatDialog) {
    }

    // private

    private getTagName(): 'top' | 'bottom' | 'left' | 'right' {
        return this.el.nativeElement.tagName.toLowerCase();
    }

    // public

    rememberSize(data: any) {
        this.selectedTab.dockSize = data
    }

    indexOf(tab: TabComponent) {
        return this.tabs.indexOf(tab)
    }

    toggleTab(tab: TabComponent) {
        if ( tab.state == "floating") {
            if ( tab.isOpen()) 
                tab.dialogRef.componentInstance.close(true)
        
            else 
                this.undock()
        } // if
        else tab.toggle()
    }

    selectTab(tab: TabComponent) { 
        this.selectedTab = tab

        if ( !tab.isOpen()) {
            tab.open(tab.state)

            if (tab.state == "floating") {
                this.undock()
            }
        } // if
    }

    removeTab(tab: TabComponent) {
        const index = this.tabs.indexOf(tab)
        this.tabs.splice(index, 1)
    }

    isOpen() : boolean {
        return this.selectedTab?.isDocked()
    }

    //@RestoreState()
    restoreState(state: any) {
        this.el.nativeElement.parentElement.parentElement.querySelector(`resizable-container.cell.pane-container.${this.getTagName()}`).style.flexBasis = this.sizeOf(this.selectedTab)
    }

    sizeOf(tab: TabComponent) {
        return tab.dockSize || this.initialSize;
    }

    undock() {
        const pane = document.querySelector(`.cell.${this.getTagName()}`)!
     
        const tab = this.selectedTab
        const rect = tab.floatSize || pane.getBoundingClientRect();

        tab.dialogRef = this.dialog.open(DockablePaneComponent, {
            data: this.selectedTab,
            panelClass: ['g3-dialog', 'g3-dockable-pane', tab.class],
            position: {left: `${rect.left}px`, top: `${rect.top}px`},
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            hasBackdrop: false,
            autoFocus: false
        });

        tab.dialogRef.afterClosed().subscribe((result: any) => {
            const collapse = result.andCollapse == true
            const clientRect = result.clientRect

            tab.dialogRef = undefined
           
            tab.floatSize = clientRect
            if (collapse)
                tab.close(tab.state)
            else {
                tab.state = "docked"
                this.selectTab(tab)
            }
        });

        tab.open("floating")
    }

    // implement AfterContentInit

    ngAfterContentInit() {
      this.tabs = this.tabsQuery.toArray();
      this.selectedTab = this.tabs[0]
      this.selectedTab.state = "docked"
    }

    // implement OnDestroy

    ngOnDestroy() {
        for ( const tab of this.tabs)
            tab.dialogRef?.close();
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
