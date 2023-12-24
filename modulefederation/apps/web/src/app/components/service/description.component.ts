import { Component, Input, OnInit } from "@angular/core";
import { AnnotationDescriptor } from "../../model/service.interface";

interface Parameter {
    name : string
    description : string
}

interface Description {
    description : string
    parameter : Parameter[]
}

@Component({
    selector: 'description',
    templateUrl: './description.component.html',
    styleUrls: ['./description.component.scss']
})
export class DescriptionComponent implements OnInit {
    // input

    @Input() annotation! : AnnotationDescriptor

    description : Description = {
        description: "",
        parameter: []
    }

    // private

    ngOnInit() : void {
        this.extractDescription(this.annotation)
    }

    // implement OnInit

    private extractDescription(annotation : AnnotationDescriptor) {
        this.description.description = " * " + annotation.parameters.find(parameter => parameter.name == "value")!!.value.replace("\n", "<br> * ")

        let parameters = annotation.parameters.find(parameter => parameter.name == "parameters")
        if (parameters)
            for (let param of parameters.value) {
                let name = param.parameters.find((p : any) => p.name == "name").value
                let value = param.parameters.find((p : any) => p.name == "description").value.replace("\n", "<br>")

                this.description.parameter.push({
                    name: name,
                    description: value
                })
            }
    }
}
