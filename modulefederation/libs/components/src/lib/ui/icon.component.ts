import { Component, ElementRef, Injector, Input, Output, OnChanges, OnInit, forwardRef, SimpleChanges, EventEmitter } from "@angular/core";

import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";


@Component({
  selector: 'icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class IconComponent implements OnInit, OnChanges {
  // input

  @Input() name!: string
  @Input() styles: any = {};
  @Input() classes: any = {};
  @Input() tooltip = "";

  type = "material"

  // output

  @Output() click = new EventEmitter<Event>();

  // constructor

  constructor(private el: ElementRef) {
  }

  // callbacks

  emitClick($event: Event) {
    this.click.emit($event)
  }

  // private

  private resolveName() {
    const colon = this.name.indexOf(':')

    if ( colon > 0) {
      this.type = this.name.substring(0, colon)
      this.name = this.name.substring(colon + 1)
    }
  }

  // implement OnInit

  ngOnInit(): void {
      this.resolveName()

      return

      // strip root element

      const nativeElement = this.el.nativeElement
      const parentElement = nativeElement.parentElement;

      // move all children out of the element

      while (nativeElement.firstChild) {
          parentElement.insertBefore(nativeElement.firstChild, nativeElement);
      }

      // remove the empty element(the host)

      parentElement.removeChild(nativeElement);
    }

    // implement OnChanges

    ngOnChanges(changes: SimpleChanges): void {
      this.resolveName()
    }
}
