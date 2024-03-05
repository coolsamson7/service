import { CommonModule } from "@angular/common"
import { Component, EventEmitter, OnInit, Output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { ParamComponent } from "../parameter-component"


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule],
  selector: 'number-parameter',
  templateUrl: './number-parameter.component.html'
})
export class NumberParamComponent extends ParamComponent implements OnInit  {
  
  // implement OnInit

  ngOnInit(): void {
    if (typeof this.value !== "number" ) {
      if (typeof this.value == "string")
         this.value = +this.value
      else
         this.value = 0 // default
    }
  }
}
