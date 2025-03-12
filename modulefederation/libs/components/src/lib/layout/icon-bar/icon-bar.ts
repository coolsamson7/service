/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { IconComponent } from '../../ui/icon.component';
import { CommonModule } from '@angular/common';

export type Orientation = 'vertical' | 'horizontal' 

export type IconBarElement = {
    title: string;
    tooltip?: string;
    icon: string;
}

@Component({
  selector: 'icon-bar',
  templateUrl: './icon-bar.html',
  styleUrls: ['./icon-bar.scss'],
  //encapsulation: ViewEncapsulation.None ,
  standalone: true,
  imports: [CommonModule, MatTabsModule, IconComponent]
})
export class IconBarComponent {
    // input

    @Input() orientation : Orientation = "horizontal";
    @Input() elements!: IconBarElement[];
    @Input() iconsOnly = false

    @Output() onClick = new EventEmitter<IconBarElement>();

    // constructor

    constructor() {}

    // callbacks

    clicked(element: IconBarElement) {
       this.onClick.emit(element)
    }
}