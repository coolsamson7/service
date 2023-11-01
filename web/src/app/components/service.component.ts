import { Component, Input, OnInit } from "@angular/core";
import { AnnotationDescriptor, InterfaceDescriptor, MethodDescriptor, TypeDescriptor } from "../model/service.interface";

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

    // public

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
    }
}
