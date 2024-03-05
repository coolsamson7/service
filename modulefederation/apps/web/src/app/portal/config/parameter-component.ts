/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component } from "@angular/core";

@Component({
  selector: "param",
  template: "<div></div>"
})
export abstract class ParamComponent { 
  value?: any
  disabled = false

  onChange! : (value: any) => void

  changed(value: any) {
    this.onChange(value)
  }
}
