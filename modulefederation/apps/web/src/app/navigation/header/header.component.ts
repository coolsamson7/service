import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { AppComponent } from "../../app.component";
import { SessionManager, Ticket } from "@modulefederation/portal";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // output

  @Output() public sidenavToggle = new EventEmitter();

  // instance data

  label = ""
  icon = ""

  // constructor

  constructor(private router : Router, private activatedRoute : ActivatedRoute, public sessionManager : SessionManager<any,Ticket>) {
  }

  // callbacks

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  // implement OnInit

  ngOnInit() : void {
    // listen to router events

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => route.firstChild),
        switchMap(route => (route as any).data)
      )
      .subscribe((data : any) => {
        this.label = data['label']
        this.icon = data['icon']
      });
  }
}
