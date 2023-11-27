import { Component, Input } from "@angular/core"
import { ComponentModel } from "../../model/component.interface"
import { InterfaceDescriptor, MethodDescriptor } from "../../model/service.interface"

@Component({
    selector: 'method',
    templateUrl: './service-method.component.html',
    styleUrls: ['./service-method.component.scss']
  })
export class ServiceMethodComponent {
    // input

    @Input('model') model: ComponentModel 
    @Input('service') service: InterfaceDescriptor 
    @Input('method') method: MethodDescriptor 

    run = false

    toggleRun() {
        this.run = !this.run
    }
}