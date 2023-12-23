import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, switchMap } from "rxjs";

@Component({
  selector: 'current-feature',
  templateUrl: './current-feature.component.html',
  styleUrls: ['./current-feature.component.scss']
})
export class CurrentFeatureComponent {
  // instance data

  label: string = ""
  icon: string = ""

  // constructor

  constructor(private router : Router, private activatedRoute : ActivatedRoute) {
    // listen to router events

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => route.firstChild),
        switchMap(route => (route as any).data)
      )
      .subscribe((data : any) => {
        this.label = data['feature'].label
        this.icon = data['feature'].icon
      });
  }
}
