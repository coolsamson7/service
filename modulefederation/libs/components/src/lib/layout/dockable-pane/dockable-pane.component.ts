import { Component, ElementRef, HostListener, Inject, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Tab } from '../layout';

/**
 * a floating pane - actually a dialog - with resize handles
 */
@Component({
  selector: 'dockable-pane',
  templateUrl: './dockable-pane.component.html',
  styleUrls: ['./dockable-pane.component.scss']
})
export class DockablePaneComponent {
  // constants

  private readonly DEFAULT_Z_INDEX = 900;
  private readonly FOCUSED_Z_INDEX = 901;

  // constructor

  constructor(
    @Inject(MAT_DIALOG_DATA) public tab: Tab,
    private dialog: MatDialogRef<DockablePaneComponent>,
    private dialogService: MatDialog,
    private elementRef: ElementRef
  ) {
  }

  // callbacks

  resized() {
    (<any> this.tab)["floatingSize"] = this.elementRef.nativeElement.getBoundingClientRect()
  }

  close(collapse: boolean) {
    this.resized()
  
  
    this.dialog.close({andCollapse: collapse})
  }

  @HostListener('mousedown')
  private focus() {
    // A workaround to close the MatAutocomplete panel when we click on the dialog.
    // For now the Angular Material has a defect: doesn't add the
    // overlay backdrop to it and that's why it doesn't close properly.
    document.dispatchEvent(new MouseEvent('click'));

    const openedWrappers = this.dialogService.openDialogs.map(this.getDialogWrapper);
    const currentWrapper = this.getDialogWrapper();

    openedWrappers.forEach((w) => (w.style.zIndex = this.DEFAULT_Z_INDEX));
    currentWrapper.style.zIndex = this.FOCUSED_Z_INDEX;
  }

  private getDialogWrapper(dialog: MatDialogRef<DockablePaneComponent> = this.dialog): any {
    // @ts-ignore
    return dialog['_ref']['overlayRef']._host;
  }
}
