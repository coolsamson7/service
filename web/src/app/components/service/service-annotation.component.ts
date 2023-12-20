import { Component, Input } from "@angular/core"
import { AnnotationDescriptor } from "../../model/service.interface"

@Component({
  selector: 'annotation',
  templateUrl: './service-annotation.component.html',
  styleUrls: ['./service-annotation.component.scss']
})
export class ServiceAnnotationComponent {
  // input

  @Input('annotation') annotation : AnnotationDescriptor

  isArray(value : any) {
    return Array.isArray(value)
  }

  isAnnotation(value : any) {
    let type = typeof value

    if (type == "object") {
      return !Array.isArray(value)
    }

    return false
  }

  name() {
    return this.annotation.name.substring(this.annotation.name.lastIndexOf(".") + 1)
  }
}
