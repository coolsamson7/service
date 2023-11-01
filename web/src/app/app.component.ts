
import { Component, NgZone, OnInit } from '@angular/core';
import { Portal, PortalElement } from './navigation/navigation.interface';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';


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

  constructor(private router: Router, private zone: NgZone) {  
  }

  //
  sub: Subscription;

  getUpdates(): Observable<any> {
    return Observable.create(
      observer => {

        let source = new EventSource("http://localhost:8080/administration/listen/TestComponent");
        
        source.onmessage = event => {
          this.zone.run(() => {
            observer.next(event.data)
          })
        }

        source.onerror = event => {
          this.zone.run(() => {
            observer.error(event)
          })
        }
      }
    )
  }

  ngOnInit(): void {
    this.sub = this.getUpdates().subscribe({
      next: data => {
        console.log(data);
      },
      error: err => console.error(err)
    });
  }

  //
}
