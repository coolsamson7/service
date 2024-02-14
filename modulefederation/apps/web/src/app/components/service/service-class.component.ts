import { Component, Input } from "@angular/core"

@Component({
    selector: 'class',
    templateUrl: './service-class.component.html',
    styleUrls: ['./service-type.component.scss']
})
export class ServiceClassComponent {
    // input

    @Input('class') clazz! : string

    // public

    format(clazz : string) {
        return clazz.substring(clazz.lastIndexOf('.') + 1) // for now
    }
}
