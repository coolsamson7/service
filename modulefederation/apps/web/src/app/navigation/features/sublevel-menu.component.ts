import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationItem } from './feature-navigation.model';

const fadeInOut = trigger('fadeInOut', [
    transition(':enter', [
        style({opacity: 0}),
        animate('350ms',
            style({opacity: 1})
        )
    ]),
    transition(':leave', [
        style({opacity: 1}),
        animate('350ms',
            style({opacity: 0})
        )
    ])
])


@Component({
    selector: 'sublevel-menu',
    templateUrl: './sublevel-menu.component.html',
    styleUrls: ['./feature-navigation.component.scss'],
    animations: [
        fadeInOut,
        trigger('submenu', [
            state('hidden', style({
                height: '0',
                overflow: 'hidden'
            })),
            state('visible', style({
                height: '*'
            })),
            transition('visible <=> hidden', [style({overflow: 'hidden'}),
                animate('{{transitionParams}}')]),
            transition('void => *', animate(0))
        ])
    ]
})
export class SublevelMenuComponent {
    // inout & output

    @Input() data : NavigationItem = {
        routeLink: '',
        icon: '',
        label: '',
        items: []
    }
    @Input() collapsed = false;
    @Input() animating : boolean | undefined;
    @Input() expanded : boolean | undefined;
    @Input() multiple : boolean = false;

    // constructor

    constructor(public router : Router) {
    }

    // public

    handleClick(item : any) : void {
        if (!this.multiple) {
            if (this.data.items && this.data.items.length > 0) {
                for (let modelItem of this.data.items) {
                    if (item !== modelItem && modelItem.expanded) {
                        modelItem.expanded = false;
                    }
                }
            }
        }

        item.expanded = !item.expanded;
    }

    getActiveClass(item : NavigationItem) : string {
        return item.expanded && this.router.url.includes(item.routeLink)
            ? 'active-sublevel'
            : '';
    }
}
