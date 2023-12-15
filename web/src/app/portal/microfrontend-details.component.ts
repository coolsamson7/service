import { Component, OnInit, OnDestroy } from "@angular/core";
import { Manifest } from "./model";
import { ActivatedRoute } from '@angular/router';
import { RouteElement } from '../widgets/navigation-component.component';
import { Subscription } from 'rxjs';
import { MirofrontendsComponent } from "./microfrontends.component";


@Component({
  selector: 'microfrontend-details',
  templateUrl: './microfrontend-details.component.html',
  styleUrls: ['./microfrontend-details.component.scss'],
  providers: []
})
export class MicrofrontendDetailsComponent implements OnInit, OnDestroy {
  // instance data

  manifest: Manifest = {
    commitHash: "",
    features: [],
    module: undefined,
    name: "",
    remoteEntry: "",
    version: ""
  }
  subscription: Subscription
  element: RouteElement = {
    label: "Microfrontends",
    route: "/microfrontends/"
  }

  // constructor

  constructor(private activatedRoute: ActivatedRoute, private microfrontendsComponent: MirofrontendsComponent) {
    microfrontendsComponent.pushRouteElement(this.element)
  }

  // public

  setManifest(manifest: string) {
    this.manifest = this.microfrontendsComponent.manifests.find((m) => m.name == manifest)
  }

  // implement OnInit

  ngOnInit() {
    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.setManifest(params["microfrontend"])
    })
  }

  // implement OnDestroy

  ngOnDestroy() {
    if ( this.element)
      this.microfrontendsComponent.popRouteElement(this.element);

    this.subscription.unsubscribe();
  }
}
