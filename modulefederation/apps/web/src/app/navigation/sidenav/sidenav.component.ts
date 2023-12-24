import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { INavbarData } from './helper';
import { FeatureData, FeatureRegistry, FolderData } from "@modulefederation/portal";
import { mapTo } from "rxjs";

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

      let mapFeature = (feature: FeatureData, parent: INavbarData) :INavbarData => {
          let item =  {
              routeLink: feature.routerPath!!,
              icon: feature.icon!!,
              label: feature.label!!,
              items: []
          }

          parent.items!!.push(item)

          return item
    }

      let mapFolder = (folder: FolderData, parent?: INavbarData) :INavbarData => {
          let item : INavbarData = {
              routeLink: "",// feature.routerPath!!,
              icon: folder.icon,
              label: folder.label || folder.name,
              items: []
          }

          // add to parent

          if ( parent )
              parent.items!!.push(item)

          // features

          for ( let feature of folder.features || [])
              mapFeature(feature, item)

          // folder recursion

          for ( let child of folder.children || [])
              mapFolder(child, item)

          // done

          return item
      }

      let data = this.featureRegistry.folders.map(folder => mapFolder(folder, undefined))

      this.navData = data

     /* this.navData = features.map((feature)=> {
      return {
      routeLink: feature.routerPath!!,
      icon: feature.icon!!,
      label: feature.label!!,
      items: []
    }})*/
  }

  // host listener

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
