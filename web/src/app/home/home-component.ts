import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })
  export class HomeComponent implements OnInit {
    // constructor

    constructor() { }

    // public

    public executeSelectedChange = (event) => {
      console.log(event);
    }
  
    // implement OnInit

    ngOnInit() {
    }
  }