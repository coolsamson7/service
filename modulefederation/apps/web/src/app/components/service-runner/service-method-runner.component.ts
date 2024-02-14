import { Component, Input, OnInit, ViewChild } from "@angular/core"
import { NgForm } from "@angular/forms"

import { ServerError } from "@modulefederation/portal";
import { ComponentModel } from "../../model/component.interface"
import { InterfaceDescriptor, MethodDescriptor, TypeDescriptor } from "../../model/service.interface"
import { ComponentService } from "../../service/component-service.service"
import { EditorModel } from "../../widgets/monaco-editor/monaco-editor"
import { ServiceRequest } from "../service.component"
import { v4 as uuidv4 } from 'uuid'
import { ParameterType, Query, QueryAnalyzer, QueryParameter } from "../../json/query-analyzer"

@Component({
    selector: 'method-runner',
    templateUrl: './service-method-runner.component.html',
    styleUrls: ['./service-method-runner.component.scss']
})
export class ServiceMethodRunnerComponent implements OnInit {
    // input


    @Input() model! : ComponentModel
    @Input() service! : InterfaceDescriptor
    @Input() method! : MethodDescriptor

    @ViewChild('form') public form! : NgForm

    query! : Query
    result = ''
    error = false
    executedURL = ""
    body! : QueryParameter
    parameter = {}
    uuid = uuidv4()

    resultModel : EditorModel = {
        value: '',
        language: "json",
        schema: null,
        uri: 'json://' + uuidv4() + '.schema'
    }

    bodyModel : EditorModel = {
        value: '',
        language: "json",
        schema: null,
        uri: null // will be set in onInit
    }

    // constructor

    constructor(private componentService : ComponentService) {
    }

    // public

    paramModel(param : any) : EditorModel {
        return {
            value: param.value,
            language: "json",
            schema: param.schema,
            uri: this.uuid
        }
    }

    isError(name : string) {
        return this.form.form.controls[name].status != "VALID"
    }

    errorMessage(name : string) {
        const errors = this.form.form.controls[name].errors
        for (const error in errors) {
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

    enumValues(type : TypeDescriptor) {
        // @ts-ignore
        return this.model.models.find(descriptor => descriptor.name == type.name).properties.map(property => property.name)
    }

    inputType4(type : TypeDescriptor) : string {
        switch (type.name) {
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
                const model = this.model.models.find(model => model.name == type.name)
                if (model?.kind.includes("enum"))
                    return "enum"
                else
                    return "json"
        }
    }

    // private

    execute() {
        if (!this.form.valid) {
            this.form.control.updateValueAndValidity()
            this.form.control.markAllAsTouched()
            return
        }

        this.error = false

        const request : ServiceRequest = {
            component: this.model.component!.name,
            service: this.service.name,
            method: this.method.name,
            parameters: []
        }

        for (const param of this.query.params) {
            if (param === this.body) {
                const body = JSON.parse(param.value)

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

        const json = JSON.stringify(request, null, "\t")

        this.componentService.executeMethod(request.component, json).subscribe({
            next: (result) => {
                if (typeof result === "object")
                    this.result = JSON.stringify(result, null, "\t")
                else
                    this.result = result
            },
            error: (error) => {
                this.error = true

                if (error instanceof ServerError) {
                    this.result = error.message
                }
                else {
                    this.result = error.message
                }
            }
        })
    }

    // callbacks

    onChange() {
        this.updateURL()
    }

    ngOnInit() : void {
        const uri = "json://" + this.service.name + "/" + this.uuid + ".schema"

        this.bodyModel.uri = uri

        this.query = new QueryAnalyzer(this.service, this.model).analyzeMethod(this.method)!

        for (const param of this.query.params) {
            // @ts-ignore
            this.parameter[param.name] = param
            if (param.parameterType == ParameterType.BODY)
                this.body = param
        }

        this.updateURL()
    }

    // implement OnInit

    private updateURL() {
        this.executedURL = "";

        const template = this.query.url

        let i = 0
        let lbrace = template.indexOf("{")
        while (lbrace >= 0) {
            this.executedURL += template.substring(i, lbrace)

            // find  }

            const rbrace = template.indexOf("}", lbrace)
            i = rbrace + 1

            const variable = template.substring(lbrace + 1, rbrace)

            // @ts-ignore
            this.executedURL += encodeURI(this.parameter[variable].value)

            lbrace = template.indexOf("{", rbrace)
        }

        this.executedURL += template.substring(i)

        if (this.query.params.find(param => param.parameterType == ParameterType.REQUEST_PARAM) != undefined) {
            this.executedURL += "?"
            let i = 0;
            for (const param of this.query.params.filter(param => param.parameterType == ParameterType.REQUEST_PARAM)) {
                if (i++ > 0)
                    this.executedURL += "&"

                this.executedURL += param.name + "=" + encodeURI(param.value)
            }
        }
    }
}
