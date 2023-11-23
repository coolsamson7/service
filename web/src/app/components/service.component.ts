import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AnnotationDescriptor, InterfaceDescriptor, MethodDescriptor, TypeDescriptor, PropertyDescriptor } from "../model/service.interface";
import { ParameterType, Query, QueryAnalyzer, QueryParameter } from "../json/json-schema-builder";
import { ComponentModel } from "../model/component.interface";
import { ComponentService } from "../service/component-service.service";
import { NgForm } from "@angular/forms";
import { ServerError } from "../common/error/error";

@Component({
    selector: 'annotation',
    templateUrl: './service-annotation.component.html',
    styleUrls: ['./service-annotation.component.scss']
  })
export class ServiceAnnotationComponent {
    // input

    @Input('annotation') annotation: AnnotationDescriptor 

    name() {
        return this.annotation.name.substring(this.annotation.name.lastIndexOf(".") + 1)
    }
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

    @Input('model') model: ComponentModel 
    @Input('service') service: InterfaceDescriptor 
    @Input('method') method: MethodDescriptor 

    run = false

    toggleRun() {
        this.run = !this.run
    }
}

@Component({
    selector: 'query-parameter',
    templateUrl: './query-parameter.component.html',
    styleUrls: ['./query-parameter.component.scss']
  })
export class QueryParamComponent implements OnInit {
    // input

    @Input('parameter') parameter: QueryParameter 
    @Input('model') model: ComponentModel 
    @Input() form: any 

    @Output() changed = new EventEmitter<any>();

    type: string

    // callbacks

    newValue(value: any) {
        this.changed.emit(value)
    }

    // private

    private inputType4(type: TypeDescriptor) : string {
        switch(type.name) {
            case "kotlin.String":
                return "string"

            case "kotlin.Int":
                return "number"

            default:
                return "json"
        }
    }

    // implement OnInit
    
    ngOnInit(): void {
        this.type = this.inputType4(this.parameter.type)
    }
}

@Component({
    selector: 'method-runner',
    templateUrl: './service-method-runner.component.html',
    styleUrls: ['./service-method-runner.component.scss']
  })
export class ServiceMethodRunnerComponent implements OnInit {
    // input


    @Input('model') model: ComponentModel 
    @Input('service') service: InterfaceDescriptor 
    @Input('method') method: MethodDescriptor 

    @ViewChild('form') public form: NgForm

    query: Query
    result
    error = false
    executedURL = ""
    body: QueryParameter
    parameter = {}

    // constructor

    constructor(private componentService : ComponentService) {
    }

    isError(name: string) {
        return this.form.form.controls[name].status != "VALID"
    }

    errorMessage(name: string) {
        let errors = this.form.form.controls[name].errors
        for ( let error in errors) {
            switch (error) {
                case "required":
                    return name + " is required"
                case "json": 
                    return "schema violation: " + errors[error].messages[0]
            }

            return name + " violates " + error
        }

        return "ouch"
    }

    inputType4(type: TypeDescriptor) : string {
        switch(type.name) {
            case "kotlin.String":
                return "string"

            case "kotlin.Int":
                return "number"

            default:
                return "json"
        }
    }

    // private

    private updateURL() {
        this.executedURL = "";

        let template = this.query.url

        let i = 0
        let lbrace = template.indexOf("{")
        while ( lbrace >= 0 ) {
            this.executedURL += template.substring(i, lbrace)

            // find  }

            let rbrace =  template.indexOf("}", lbrace)
            i = rbrace + 1

            let variable = template.substring(lbrace + 1, rbrace)

            this.executedURL += encodeURI(this.parameter[variable].value)

            lbrace = template.indexOf("{", rbrace)
        }

        this.executedURL +=  template.substring(i)

        if ( this.query.params.find(param => param.parameterType == ParameterType.REQUEST_PARAM) != undefined) {
            this.executedURL += "?"
            let i = 0;
            for ( let param of  this.query.params.filter(param => param.parameterType == ParameterType.REQUEST_PARAM)) {
                if ( i > 0)
                    this.executedURL += ";"

                    this.executedURL += param.name + "=" + encodeURI(param.value)
            }
        }
    }

   // callbacks

    execute() {
        this.error = false

        let request : ServiceRequest = {
            component: this.model.component.name,
            service: this.service.name,
            method: this.method.name,
            parameters: []
        }

        for ( let param of this.query.params) {
            if ( param === this.body) {
                let body = JSON.parse(param.value)

                request.parameters.push({
                    name: param.name,
                    value: body
                })
            }
            else request.parameters.push({
                name: param.name,
                value: param.value
            })
        }        

        let json = JSON.stringify(request, null, "\t")

        this.componentService.executeMethod(request.component, json).subscribe( {
            next: (result) => {
                if ( typeof result === "object")
                    this.result = JSON.stringify(result, null, "\t")
                else
                    this.result = result
            },
            error: (error) => {
               this.error = true
               
               if ( error instanceof ServerError) {
                    this.result = error.message
               }
               else {
                this.result = error.message
               }
            }
        } )
    }

    onChange() {
        this.updateURL()
    }

    // implement OnInit

    ngOnInit(): void {
        this.query = new QueryAnalyzer(this.service, this.model).analyzeMethod(this.method);

        for ( let param of this.query.params) {
           this.parameter[param.name] = param
           if ( param.parameterType == ParameterType.BODY)
                this.body = param
        }

       this.updateURL()
    }
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
    selector: 'class',
    templateUrl: './service-class.component.html',
    styleUrls: ['./service-type.component.scss']
  })
export class ServiceClassComponent {
    // input

    @Input('class') clazz: String 

    // public

    format(clazz: String) {
        return clazz.substring(clazz.lastIndexOf('.') + 1) // for now
    }
}

export interface ServiceRequestParam {
   name: string,
   value: any
}
export interface ServiceRequest {
    component: string,
    service: string,
    method: string,
    parameters: ServiceRequestParam[]
}

@Component({
    selector: 'service',
    templateUrl: './service.component.html',
    styleUrls: ['./service.component.scss']
  })
export class ServiceComponent implements OnInit {
    // input

    @Input('model') model: ComponentModel 
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

    superClass() : Boolean{
        return this.service.inherits != null && this.service.inherits != ""
    }

    inherits() : Boolean{
        return this.superClass() || this.service.implements.length > 0
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

    formatClass(type: String) {
        return type.substring(type.lastIndexOf('.') + 1)
    }

    // implement OnInit

    ngOnInit(): void {
        this.toggle()
        this.toggle()
    }
}
