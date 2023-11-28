import { Component, OnInit, Input, ViewChild } from "@angular/core"
import { NgForm } from "@angular/forms"

import { ServerError } from "../../common/error/error"
import { ComponentModel } from "../../model/component.interface"
import { InterfaceDescriptor, MethodDescriptor, TypeDescriptor } from "../../model/service.interface"
import { ComponentService } from "../../service/component-service.service"
import { EditorModel } from "../../widgets/monaco-editor/monaco-editor"
import { ServiceRequest } from "../service.component"
import { v4 as uuidv4 } from 'uuid'
import { ParameterType, QueryAnalyzer, QueryParameter, Query } from "../../json/query-analyzer"

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
    result = ''
    error = false
    executedURL = ""
    body: QueryParameter
    parameter = {}
    uuid =  uuidv4()

   resultModel :  EditorModel = {
        value: '',
        language: "json",
        schema: null,
        uri: 'json://' + uuidv4() + '.schema'
    }

    bodyModel :  EditorModel = {
        value: '',
        language: "json",
        schema: null,
        uri: null // will be set in onInit
    }

    // constructor

    constructor(private componentService : ComponentService) {
    }

    // public

    paramModel(param) : EditorModel {
        return {
            value: param.value,
            language: "json",
            schema: param.schema,
            uri: this.uuid
        }
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

    enumValues(type: TypeDescriptor) {
        return this.model.models.find(descriptor => descriptor.name == type.name).properties.map(property => property.name)
    }

    inputType4(type: TypeDescriptor) : string {
        switch(type.name) {
            case "kotlin.String":
                return "string"

            case "kotlin.Short":
            case "kotlin.Int":
            case "kotlin.Long":
            case "kotlin.Float":
            case "kotlin.Double":
                return "number"

            case "kotlin.Boolean":
                return "boolean"

            case "java.util.Date":
                    return "date"

            default:
                let model = this.model.models.find(model => model.name == type.name)
                if ( model?.kind.includes("enum"))
                    return "enum"
                else
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
                if ( i++ > 0)
                    this.executedURL += "&"

                    this.executedURL += param.name + "=" + encodeURI(param.value)
            }
        }
    }

   // callbacks

    execute() {
        if (!this.form.valid) {
            this.form.control.updateValueAndValidity()
            this.form.control.markAllAsTouched()
            return
        }

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
        let uri = "json://" + this.service.name + "/" + this.uuid + ".schema"

        this.bodyModel.uri = uri

        this.query = new QueryAnalyzer(this.service, this.model).analyzeMethod(this.method);

        for ( let param of this.query.params) {
           this.parameter[param.name] = param
           if ( param.parameterType == ParameterType.BODY)
                this.body = param
        }

       this.updateURL()
    }
}