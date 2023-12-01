import { Component, Input, OnInit } from "@angular/core"
import { ComponentModel } from "../../model/component.interface"
import { AnnotationDescriptor, InterfaceDescriptor, MethodDescriptor } from "../../model/service.interface"

@Component({
    selector: 'method',
    templateUrl: './service-method.component.html',
    styleUrls: ['./service-method.component.scss']
  })
export class ServiceMethodComponent implements OnInit {
    // input

    @Input('model') model: ComponentModel 
    @Input('service') service: InterfaceDescriptor 
    @Input('method') method: MethodDescriptor 

    run = false
    description : AnnotationDescriptor = null
    annotations: AnnotationDescriptor[]

    // callbacks

    toggleRun() {
        this.run = !this.run
    }


    // implement OnInit

    ngOnInit(): void {
        this.description = this.method.annotations.find(annotation => annotation.name == "com.serious.annotations.Description")
        this.annotations =  this.method.annotations
        if ( this.description )
            this.annotations = this.method.annotations.filter(annotation => annotation !== this.description)
    }
}