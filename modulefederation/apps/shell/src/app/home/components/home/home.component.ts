import { Component, OnInit } from '@angular/core';
import {RegisterFeature} from "@modulefederation/portal";

@RegisterFeature({
  name: 'home'
})
@Component({
  selector: 'modulefederation-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }
}
