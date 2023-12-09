import { Component, OnInit } from '@angular/core';
import {Feature, RegisterFeature} from "@modulefederation/portal";

@RegisterFeature({
  name: 'home'
})
@Component({
  selector: 'modulefederation-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends Feature implements OnInit {
  // constructor

  constructor() {
    super();
  }

  // implement OnInit

  ngOnInit() {
  }
}
