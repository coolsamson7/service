import { Component, OnInit } from "@angular/core";
import { PortalIntrospectionService } from "./service";
import { Manifest } from "./model";

@Component({
  selector: 'microfrontends',
  templateUrl: './microfrontends.component.html',
  styleUrls: ['./microfrontends.component.css']
})
export class MirofrontendsComponent implements OnInit {
  // instance data

  manifests: Manifest[] = []

  // constructor

  constructor(private introspectionService: PortalIntrospectionService) { }

  // implement OnInit

  ngOnInit() {
    this.introspectionService.getManifests().subscribe((manifests) =>
      this.manifests = manifests
    )
  }
}
