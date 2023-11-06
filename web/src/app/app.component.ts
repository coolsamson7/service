
import { Component, Injectable, OnInit } from '@angular/core';
import { Portal, PortalElement } from './navigation/navigation.interface';
import { Router } from '@angular/router';
import { EndpointLocator } from './common/communication/endpoint-locator';

import { environment } from '../environments/environment';

@Injectable({providedIn: "root"})
export class ApplicationEndpointLocator extends EndpointLocator {
  // constructor

  constructor() {
    super()

    let url = window.location.href;
    console.log(url)
  }
  // implement 

  getEndpoint(domain: string): string {
    if ( domain == "admin")
      return environment.adminServer//'http://localhost:8080'
    else
       throw new Error("unknown domain " + domain)
  }
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // instance data

 portal: Portal = {
    items: [
      {
       label: "Home",
       route: "/home",
       icon: "home"      
      },
      {
        label: "Components",
        route: "/components",
        icon: "account_balance"      
       },
       {
        label: "Nodes",
        route: "/nodes",
        icon: "account_balance"      
       }
    ]
  }

  selection: PortalElement = this.portal.items[0] // home

  // public

  navigate(element: PortalElement) {
      this.selection = element
      this.router.navigate([element.route])
  }

  // constructor

  constructor(private router: Router) {  
  }

  // implement OnInit

  ngOnInit(): void {
  }
}
