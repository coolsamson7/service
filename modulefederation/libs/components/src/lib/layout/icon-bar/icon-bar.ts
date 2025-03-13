/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { IconComponent } from '../../ui/icon.component';
import { CommonModule } from '@angular/common';

//export type Orientation = 'vertical' | 'horizontal' 
export type Orientation = 'left' | 'top' | 'right' | 'bottom' 

export type IconBarElement = {
    title: string;
    tooltip?: string;
    icon: string;
}

@Component({
  selector: 'icon-bar',
  templateUrl: './icon-bar.html',
  styleUrls: ['./icon-bar.scss'],
  standalone: true,
  imports: [CommonModule, MatTabsModule, IconComponent]
})
export class IconBarComponent implements OnChanges {
    // input

    @Input() orientation : Orientation = "left";
    @Input() elements!: IconBarElement[];
    @Input() iconsOnly = false

    @Input() selection!: IconBarElement

    // output

    @Output() selectionChange = new EventEmitter<IconBarElement>();
    @Output() toggled = new EventEmitter<IconBarElement>();

    // constructor

    constructor() {}

    // public

    indexOf(element: IconBarElement) : number {
        return this.elements.indexOf(element)
    }

    // callbacks

    toggle(element: IconBarElement) {
        if ( !this.selection) {
            this.selection = element

            this.selectionChange.emit(this.selection)
        }
        
        if ( element == this.selection)
            this.toggled.emit(element)
    }

    selectionChanged(event: MatTabChangeEvent) {
        this.selection = this.elements[event.index]
console.log("new selection")
        console.log(this.selection)

        this.selectionChange.emit(this.selection)
    }

    // implement OnChanges
    
    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes["selection"])
    }
}