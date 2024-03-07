import { CommonModule } from "@angular/common"
import { Component, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ParamComponent } from "../parameter-component"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatFormFieldModule } from "@angular/material/form-field"

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatCheckboxModule],
  selector: 'string-parameter',
  templateUrl: './boolean-parameter.component.html'
})
export class BooleanParamComponent extends ParamComponent implements OnInit  {
  // implement OnInit
  
  ngOnInit(): void {
    if (typeof this.value !== "boolean" ) {
      this.value = false // default
    }
  }
}
