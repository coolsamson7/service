import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppComponent } from "../../app.component";
import { FeatureData, FeatureRegistry } from "@modulefederation/portal";

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent {
  // input & output

  @Output() sidenavClose = new EventEmitter();

  // instance data

  elements : FeatureData[]

  // constructor

  constructor(public app : AppComponent, private featureRegistry: FeatureRegistry) {
    this.elements = this.featureRegistry.finder().withTag("navigation").find()
  }

  public select() {
    this.sidenavClose.emit();
  }
}
