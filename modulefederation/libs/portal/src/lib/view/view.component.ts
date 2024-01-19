import { Component } from '@angular/core';
import { OverlayComponent } from './overlay';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  standalone: true,
  imports: [CommonModule, OverlayComponent]
})
export class ViewComponent {
  // instance data

  hasOverlay = false;
  isBusy = false;
  progress = "";

  // public

  showOverlay(state: boolean): void {
    this.hasOverlay = state;
  }

  showMessage(message: string): void {
    this.progress = message;
  }

  setBusy(state: boolean): void {
    this.isBusy = state;
  }
}
