import { Component, HostListener, Inject, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

/**
 * the dialog config object
 */
type DialogConfig = {
  /**
   * the title
   */
  title: string;
  /**
   * the icon
   */
  icon: string;
  /**
   * a template
   */
  template: TemplateRef<any>;
};

/**
 * a floating pane with resize handles
 */
@Component({
  selector: 'dockable-pane',
  templateUrl: './dockable-pane.component.html',
  styleUrls: ['./dockable-pane.component.scss']
})
export class DockablePaneComponent {
  private readonly DEFAULT_Z_INDEX = 900;
  private readonly FOCUSED_Z_INDEX = 901;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogConfig,
    public dialog: MatDialogRef<DockablePaneComponent>,
    private dialogService: MatDialog
  ) {
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
    return dialog['_overlayRef']._host;
  }
}
