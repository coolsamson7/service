import { Component, Input, OnInit } from "@angular/core";
import { AnnotationDescriptor, InterfaceDescriptor, TypeDescriptor } from "../model/service.interface";
import { ComponentModel } from "../model/component.interface";


export interface ServiceRequestParam {
    name : string,
    value : any
}

export interface ServiceRequest {
    component : string,
    service : string,
    method : string,
    parameters : ServiceRequestParam[]
}

@Component({
    selector: 'service',
    templateUrl: './service.component.html',
    styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
    // input

    @Input('model') model! : ComponentModel
    @Input('service') service! : InterfaceDescriptor
    @Input('open') open = false
    icon = "expand_more"

    description! : AnnotationDescriptor
    annotations! : AnnotationDescriptor[]

    // public

    toggle() {
        if (this.open) {
            this.open = false
            this.icon = "expand_more"
        }
        else {
            this.open = true
            this.icon = "expand_less"
        }
    }

    superClass() : Boolean {
        return this.service!!.inherits != null && this.service!!.inherits != ""
    }

    inherits() : Boolean {
        return this.superClass() || this.service!!.implements.length > 0
    }

    format(o : any) {
        if (typeof o == "string")
            return "\"" + o + "\""
        else
            return o
    }

    formatType(type : TypeDescriptor) {
        return type.name.substring(type.name.lastIndexOf('.') + 1)
    }

    formatClass(type : String) {
        return type.substring(type.lastIndexOf('.') + 1)
    }

    // implement OnInit

    ngOnInit() : void {
        this.toggle()
        this.toggle()

        // @ts-ignore
        this.description = this.service.annotations.find(annotation => annotation.name == "com.serious.annotations.Description")
        this.annotations = this.service!!.annotations
        if (this.description)
            this.annotations = this.service!!.annotations.filter(annotation => annotation !== this.description)
    }
}
