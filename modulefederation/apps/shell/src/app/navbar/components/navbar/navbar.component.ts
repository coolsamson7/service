import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {FeatureConfig, FeatureData, FeatureRegistry} from "@modulefederation/portal";

@Component({
  selector: 'modulefederation-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  // output

  @Output() public sidenavToggle = new EventEmitter();

  // instance data

  features: FeatureData[] = []

  // constructor

  constructor(private featureRegistry: FeatureRegistry) {
    this.features = featureRegistry.findFeatures((feature) => feature.tags!!.includes("navigation"))
  }

  // callbacks

  public path(feature: FeatureData) {
    return "/" + feature.path
  }
  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  // implement OnInit

  ngOnInit() {
  }
}
