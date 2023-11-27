import { Component, Input } from "@angular/core"
import { AnnotationDescriptor } from "../../model/service.interface"

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