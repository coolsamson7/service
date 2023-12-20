import {
  AboutDialogService,
  AbstractFeature,
  Feature,
  FeatureData,
  FeatureRegistry,
  PortalManager,
  SessionManager
} from "@modulefederation/portal";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Feature({
  id: 'private-portal',
  visibility: ["private"],
  tags: ["portal"],
  router: {
    lazyModule: "PrivatePortalModule"
  }
})
@Component({
  selector: 'private-portal',
  templateUrl: './private-portal-component.html',
  styleUrls: ["./private-portal-component.scss"]
})
export class PrivatePortalComponent extends AbstractFeature implements OnInit {
  // instance data

  features : FeatureData[] = []

  // constructor
  constructor(private portalManager : PortalManager, private router : Router, private sessionManager : SessionManager, private featureRegistry : FeatureRegistry, private aboutDialogService : AboutDialogService) {
    super();

    featureRegistry.registry$.subscribe(_ => this.computeNavigation())
  }

  // callbacks

  about() {
    this.aboutDialogService.show()
  }

  logout() {
    this.sessionManager.closeSession().subscribe(
      (session) => {
        this.portalManager.loadDeployment(true).then(result =>
          this.router.navigate(["/"])
        )
      },
      (error) => {
        console.log("ouch")
      })
  }

  // private

  ngOnInit() : void {
    this.computeNavigation()
  }


  // implement OnInit

  private computeNavigation() {
    this.features = this.featureRegistry.finder().withEnabled().withTag("navigation").find()
  }
}
