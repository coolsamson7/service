import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FeatureData, FeatureRegistry, FolderData } from "@modulefederation/portal";
import { NavigationItem } from './feature-navigation.model';

@Component({
    selector: 'feature-navigation',
    templateUrl: './feature-navigation.component.html',
    styleUrls: ['./feature-navigation.component.scss']
})
export class FeatureNavigationComponent implements OnInit {
    // instance data

    collapsed = false;
    screenWidth = 0;
    navData : NavigationItem[] = [];
    multiple : boolean = false;

    // constructor

    constructor(public router : Router, private featureRegistry : FeatureRegistry) {
        let mapFeature = (feature : FeatureData, parent : NavigationItem) : NavigationItem => {
            let item = {
                routeLink: feature.routerPath!!,
                icon: feature.icon!!,
                label: feature.label!!,
                items: []
            }

            parent.items!!.push(item)

            return item
        }

        let mapFolder = (folder : FolderData, parent? : NavigationItem) : NavigationItem => {
            let item : NavigationItem = {
                routeLink: "",
                icon: folder.icon,
                label: folder.label || folder.name,
                items: []
            }

            // features

            for (let feature of folder.features || [])
                if (feature.enabled) {
                    mapFeature(feature, item)

                    item.visible = true
                }

            // folder recursion

            for (let child of folder.children || []) {
                let childFolder = mapFolder(child, item)
                if ( childFolder.visible)
                    item.visible = true
            }

            // add to parent

            if (parent && item.visible)
                parent.items!!.push(item)

            // done

            return item
        }

        let folderItems = this.featureRegistry.folders
            .map(folder => mapFolder(folder, undefined))
            .filter(item => item.visible) // only folders that contain at least one enabled feature

        // features

        let features = this.featureRegistry.finder().withTag("navigation").withoutFolder().find()

        let featureItems = features.map((feature) => {
            return {
                routeLink: feature.routerPath!!,
                icon: feature.icon!!,
                label: feature.label!!,
                visible: true,
                items: []
            }
        })

        // done

        this.navData = [...folderItems, ...featureItems]
    }

    // host listener

    @HostListener('window:resize', ['$event'])
    onResize(event : any) {
        this.screenWidth = window.innerWidth;
        if (this.screenWidth <= 768) {
            this.collapsed = false;
        }
    }

    // public

    toggleCollapse() : void {
        this.collapsed = !this.collapsed;
    }

    closeSidenav() : void {
        this.collapsed = false;
    }

    handleClick(item : NavigationItem) : void {
        this.shrinkItems(item);
        item.expanded = !item.expanded
    }

    getActiveClass(data : NavigationItem) : string {
        return this.router.url.includes(data.routeLink) ? 'active' : '';
    }

    shrinkItems(item : NavigationItem) : void {
        if (!this.multiple) {
            for (let modelItem of this.navData) {
                if (item !== modelItem && modelItem.expanded) {
                    modelItem.expanded = false;
                }
            }
        }
    }

    // implement OnInit

    ngOnInit() : void {
        this.screenWidth = window.innerWidth;
    }
}