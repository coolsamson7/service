import { Component, OnInit } from '@angular/core';
import {AbstractFeature, Feature} from "@modulefederation/portal";

@Feature({
  id: 'home'
})
@Component({
  selector: 'modulefederation-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends AbstractFeature implements OnInit {
  // constructor

  constructor() {
    super();

    console.log(this.getName())
  }

  // implement OnInit

  ngOnInit() {
  }
}
