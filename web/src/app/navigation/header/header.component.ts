import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { filter, map, switchMap, takeUntil } from 'rxjs';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // output

  @Output() public sidenavToggle = new EventEmitter();
  label = ""
  icon = ""
  
  // constructor

  constructor(public app: AppComponent, private router: Router, private activatedRoute: ActivatedRoute) { }

  // public

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  // implement OnInit

  ngOnInit(): void {
      this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => route.firstChild),
        switchMap(route => (route as any).data),
        //map(data => data['label'])
         )
        .subscribe(data => {
           this.label = data['label']
           this.icon = data['icon']
        });
    }
  }
