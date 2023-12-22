import { Component, Input } from "@angular/core";

import { PropertyDescriptor } from "../../model/service.interface";

@Component({
  selector: 'property',
  templateUrl: './service-property.component.html',
  styleUrls: ['./service-property.component.scss']
})
export class ServicePropertyComponent {
  // input

  @Input('property') property! : PropertyDescriptor
}
