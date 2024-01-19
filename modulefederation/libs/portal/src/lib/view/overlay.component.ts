import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

/**
 * an overlay component used to show spinners and messages for long running commands
 */
@Component({
  selector: 'overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule]
})
export class OverlayComponent {
  @Input() message!: string;
}
