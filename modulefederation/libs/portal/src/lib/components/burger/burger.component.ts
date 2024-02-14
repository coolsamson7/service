import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, state, style, transition, trigger, } from '@angular/animations';

@Component({
    selector: 'burger',
    templateUrl: './burger.component.html',
    styleUrls: ['./burger.component.scss'],
    animations: [
        trigger('burgerX', [
            /*
              state hamburger => is the regular 3 lines style.
              states topX, hide, and bottomX => used to style the X element
            */
            state('burger', style({})),
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
export class BurgerComponent {
    // input & output

    @Input() isBurger  = true
    @Output() public toggle = new EventEmitter<boolean>();

    // callbacks

    clicked() {
        this.toggle.emit(this.isBurger = !this.isBurger)
    }
}
