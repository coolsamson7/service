import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AnnotationDescriptor, InterfaceDescriptor, MethodDescriptor, TypeDescriptor, PropertyDescriptor } from "../model/service.interface";
import { JSONSchemaBuilder, ParameterType, Query, QueryAnalyzer, QueryParameter } from "../json/json-schema-builder";
import { ComponentModel } from "../model/component.interface";

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
                return "string"
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

    query: Query
    executedURL = ""
    body: QueryParameter
    parameter = {}

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
        console.log("execute")
    }

    onChange() {
        this.updateURL()
    }

    // implement OnInit
    
    ngOnInit(): void {
        this.query = new QueryAnalyzer(this.service).analyzeMethod(this.method);

        for ( let param of this.query.params) {
           this.parameter[param.name] = param
           if ( param.parameterType == ParameterType.BODY)
                this.body = param
        }

        if (this.body) {
            let model = this.model.models.find(model => model.name == this.body.type.name)
            let schema = new JSONSchemaBuilder(this.model).createSchema(model)

            console.log(schema)

            let body = {}

            for (let property in schema.properties) {
                let value
                switch (schema.properties[property].type) {
                    case "string":
                        value = "";
                        break;

                    case "integer":
                    case "number":
                        value = 0
                        break;

                    default:
                        value = ""
                }

                body[property] = value
            }

            this.body.value =  JSON.stringify(body)
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
