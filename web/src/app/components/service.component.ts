import { Component, Input, OnInit } from "@angular/core";
import { AnnotationDescriptor, InterfaceDescriptor, MethodDescriptor, TypeDescriptor, PropertyDescriptor } from "../model/service.interface";

@Component({
    selector: 'annotation',
    templateUrl: './service-annotation.component.html',
    styleUrls: ['./service-annotation.component.scss']
  })
export class ServiceAnnotationComponent {
    // input

    @Input('annotation') annotation: AnnotationDescriptor 
}

@Component({
    selector: 'literal',
    templateUrl: './service-literal.component.html',
    styleUrls: ['./service-literal.component.scss']
  })
export class ServiceLiteralComponent implements OnInit {
    // input

    @Input('value') value: any 
    type: string

    // implement OnInit

    ngOnInit(): void {
        this.type = typeof this.value
        if ( Array.isArray(this.value))
           this.type = "array"
    }
}

@Component({
    selector: 'method',
    templateUrl: './service-method.component.html',
    styleUrls: ['./service-method.component.scss']
  })
export class ServiceMethodComponent {
    // input

    @Input('method') method: MethodDescriptor 
}

@Component({
    selector: 'property',
    templateUrl: './service-property.component.html',
    styleUrls: ['./service-property.component.scss']
  })
export class ServicePropertyComponent {
    // input

    @Input('property') property: PropertyDescriptor 
}

@Component({
    selector: 'type',
    templateUrl: './service-type.component.html',
    styleUrls: ['./service-type.component.scss']
  })
export class ServiceTypeComponent {
    // input

    @Input('type') type: TypeDescriptor 

    // public

    formatType(type: TypeDescriptor) {
        return type.name.substring(type.name.lastIndexOf('.') + 1) // for now
    }
}

@Component({
    selector: 'service',
    templateUrl: './service.component.html',
    styleUrls: ['./service.component.scss']
  })
export class ServiceComponent implements OnInit {
    // input

    @Input('service') service: InterfaceDescriptor 
    @Input('open') open = false
    icon = "expand_more"

    // public

    toggle() {
        if ( this.open) {
            this.open = false
            this.icon = "expand_more"
        }
        else {
            this.open = true
            this.icon = "expand_less"
        }  
    }

    format(o: any) {
        if ( typeof o == "string")
           return "\"" + o +  "\""
        else
         return o
    }

    formatType(type: TypeDescriptor) {
        return type.name.substring(type.name.lastIndexOf('.') + 1)
    }

    // implement OnInit

    ngOnInit(): void {
        this.toggle()
        this.toggle()
    }
}
