import { Component, OnInit } from "@angular/core";
import { PortalIntrospectionService } from "./service";
import { Manifest } from "./model";
import { NavigationComponent } from "../widgets/navigation-component.component";

@Component({
  selector: 'microfrontends',
  templateUrl: './microfrontends.component.html',
  styleUrls: ['./microfrontends.component.css']
})
export class MirofrontendsComponent extends NavigationComponent {
  // instance data

  manifests: Manifest[] = []

  // constructor

  constructor(private introspectionService: PortalIntrospectionService) {
    super()
  }

  // implement OnInit

  ngOnInit() {
    super.ngOnInit()

    this.introspectionService.getManifests().subscribe((manifests) =>
      this.manifests = manifests
    )
  }
}
