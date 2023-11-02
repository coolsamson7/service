
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

  // emitter stuff

  private retryCount = 0;
  private static readonly MAX_RETRIES = 5;
  sub: Subscription;

  /*
  private connectToSSE() {
    this.eventSource = new EventSource(`http://localhost:8080/teller/subscribe/${FortuneTellerService.subscriberId}`);
    console.log('creating event source');
    this.eventSource.onmessage = event => {
      console.log('received event', event)
      this.sseDataSubject.next(JSON.parse(event.data));
    };

    this.eventSource.onerror = error => {
      console.log('error', error);
      if (FortuneTellerService.retryCount > FortuneTellerService.MAX_RETRIES) {
        console.log('too many retries');
        this.sseDataSubject.error(error);
        this.eventSource!.close();
        return;
      }
      FortuneTellerService.retryCount++;
      this.sseDataSubject.error(error);
      this.eventSource!.close();
      this.connectToSSE();
    };

  */
  getUpdates(): Observable<any> {
    // local function

    let connect = (observer) => {
      console.log("connect ")

      // create source

      let source = new EventSource("http://localhost:8080/administration/listen/TestComponent");
        
      // attach callbacks

      source.onopen = event => {
        console.log("opened sse ")
      }

      /*source.onmessage = event => {
        console.log("got sse message ")
        this.zone.run(() => {
          observer.next(event.data) // JSON.parse(event.data)
        })
      }*/

      source.addEventListener('update', (event) => {
        console.log("got sse message ")
        this.zone.run(() => {
          observer.next(JSON.parse(event.data))
        })
      })

      source.onerror = event => {
        console.log("got sse error ")

        this.zone.run(() => {
          observer.error(event)

          if (this.retryCount > AppComponent.MAX_RETRIES) {
            console.log('too many retries');
      
            source.close();
            return;
          }
          else {

          }
          this.retryCount++;
          
          console.log('retry');

          source.close();

          connect(observer);
        })
      }

    }

    // create observable

    return Observable.create(
      observer => connect(observer)
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
