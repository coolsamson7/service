import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { ComponentModel } from "../../model/component.interface";
import { TypeDescriptor } from "../../model/service.interface";
import { QueryParameter } from "../../json/query-analyzer";


@Component({
    selector: 'query-parameter',
    templateUrl: './query-parameter.component.html',
    styleUrls: ['./query-parameter.component.scss']
})
export class QueryParamComponent implements OnInit {
    // input

    @Input() parameter! : QueryParameter
    @Input() model! : ComponentModel
    @Input() form : any

    @Output() changed = new EventEmitter<any>();

    type  = ""

    // callbacks

    newValue(value : any) {
        this.changed.emit(value)
    }

    // private

    ngOnInit() : void {
        this.type = this.inputType4(this.parameter.type)
    }

    // implement OnInit

    private inputType4(type : TypeDescriptor) : string {
        switch (type.name) {
            case "kotlin.String":
                return "string"

            case "kotlin.Short":
            case "kotlin.Int":
            case "kotlin.Long":
                return "integer"

            case "kotlin.Double":
            case "kotlin.Float":
                return "number"

            case "kotlin.Boolean":
                return "boolean"

            case "java.util.Date":
                return "date";

            default:
                return "json"
        }
    }
}
