import { Component, OnInit } from "@angular/core";
import { PortalIntrospectionService } from "./service";
import { Manifest } from "./model";
import { NavigationComponent } from "../widgets/navigation-component.component";
import { ReplaySubject } from "rxjs/internal/ReplaySubject";

@Component({
  selector: 'microfrontends',
  templateUrl: './microfrontends.component.html',
  styleUrls: ['./microfrontends.component.scss']
})
export class MirofrontendsComponent extends NavigationComponent {
  // instance data

  manifests: Manifest[] = []
  $manifests = new ReplaySubject<Manifest[]>(1);

  // constructor

  constructor(private introspectionService: PortalIntrospectionService) {
    super()
  }

  selectManifest(manifest: Manifest) {
    console.log("CLICK")
  }

  // implement OnInit

  ngOnInit() {
    super.ngOnInit()

    this.introspectionService.getManifests().subscribe((manifests) =>
      this.$manifests.next(this.manifests = manifests)
    )
  }
}
