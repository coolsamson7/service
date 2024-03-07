import { CommonModule } from "@angular/common"
import { Component, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { ParamComponent } from "../parameter-component"


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule],
  selector: 'string-parameter',
  templateUrl: './string-parameter.component.html'
})
export class StringParamComponent extends ParamComponent implements OnInit  {

  // implement OnInit

  ngOnInit(): void {
    if (typeof this.value !== "string" ) {
      if (typeof this.value == "number")
         this.value = this.value.toString()
      else
         this.value = "" // default
    }
  }
}
