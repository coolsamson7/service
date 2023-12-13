import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {FeatureConfig, FeatureRegistry} from "@modulefederation/portal";

@Component({
  selector: 'modulefederation-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  // output

  @Output() public sidenavToggle = new EventEmitter();

  // instance data

  features: FeatureConfig[] = []

  // constructor

  constructor(private featureRegistry: FeatureRegistry) {
    this.features = featureRegistry.findFeatures((feature) => feature.tags!!.includes("navigation"))
  }

  // callbacks

  public path(feature: FeatureConfig) {
    console.log( "/" + feature.id)
    return "/" + feature.path
  }
  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  // implement OnInit

  ngOnInit() {
  }
}
