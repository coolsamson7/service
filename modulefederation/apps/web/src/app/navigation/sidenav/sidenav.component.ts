import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { INavbarData } from './helper';
import { FeatureRegistry } from "@modulefederation/portal";

export interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SideNavigationComponent implements OnInit {
  // instance data

  collapsed = false;
  screenWidth = 0;
  navData: INavbarData[] = [];
  multiple: boolean = false;

  // constructor

  constructor(public router: Router, private featureRegistry: FeatureRegistry) {
    let features = this.featureRegistry.finder().withTag("navigation").find()

    this.navData = features.map((feature)=> {
      return {
      routeLink: feature.routerPath!!,
      icon: feature.icon!!,
      label: feature.label!!,
      items: []
    }})
  }

  // host listner

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768 ) {
      this.collapsed = false;
    }
  }


  // public

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  closeSidenav(): void {
    this.collapsed = false;
  }

  handleClick(item: INavbarData): void {
    this.shrinkItems(item);
    item.expanded = !item.expanded
  }

  getActiveClass(data: INavbarData): string {
    return this.router.url.includes(data.routeLink) ? 'active' : '';
  }

  shrinkItems(item: INavbarData): void {
    if (!this.multiple) {
      for(let modelItem of this.navData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
  }

  // implement OnInit

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }
}
