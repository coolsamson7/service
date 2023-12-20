import { Component, Input, OnInit } from "@angular/core"

@Component({
  selector: 'literal',
  templateUrl: './service-literal.component.html',
  styleUrls: ['./service-literal.component.scss']
})
export class ServiceLiteralComponent implements OnInit {
  // input

  @Input('value') value : any
  type : string

  // implement OnInit

  ngOnInit() : void {
    this.type = typeof this.value
    if (Array.isArray(this.value))
      this.type = "array"
  }
}
