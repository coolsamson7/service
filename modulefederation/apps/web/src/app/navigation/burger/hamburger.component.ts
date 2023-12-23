import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'hamburger',
  templateUrl: './hamburger.component.html',
  styleUrls: ['./hamburger.component.scss'],
  animations: [
    trigger('hamburgerX', [
      /*
        state hamburger => is the regular 3 lines style.
        states topX, hide, and bottomX => used to style the X element
      */
      state('hamburger', style({})),
      // style top bar to create the X
      state(
        'topX',
        style({
          transform: 'rotate(45deg)',
          transformOrigin: 'left',
          margin: '6px',
        })
      ),
      // hides element when create the X (used in the middle bar)
      state(
        'hide',
        style({
          opacity: 0,
        })
      ),
      // style bottom bar to create the X
      state(
        'bottomX',
        style({
          transform: 'rotate(-45deg)',
          transformOrigin: 'left',
          margin: '6px',
        })
      ),
      transition('* => *', [
        animate('0.2s'), // controls animation speed
      ]),
    ]),
  ],
})
export class HamburgerComponent {
  // input & output

  @Input() isHamburger : boolean = true
  @Output() public toggle = new EventEmitter<boolean>();

  // callbacks

  clicked() {
    this.toggle.emit(this.isHamburger = !this.isHamburger)
  }
}
