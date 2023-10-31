
import { Component } from '@angular/core';
import { Portal, PortalElement } from './navigation/navigation.interface';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
}
