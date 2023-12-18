import { Component } from "@angular/core";
import { PortalAdministrationService, PortalIntrospectionService } from "./service";
import { Address, Manifest } from "./model";
import { NavigationComponent } from "../widgets/navigation-component.component";
import { ReplaySubject } from "rxjs/internal/ReplaySubject";
import { MatDialog } from "@angular/material/dialog";
import { AddManifestDialog } from "./add-manifest-dialog";
import { ConfirmationDialogs } from "./dialog/confirmation-dialogs";
import { ManifestDecorator } from "./util/manifest-decorator";

@Component({
  selector: 'microfrontends',
  templateUrl: './microfrontends.component.html',
  styleUrls: ['./microfrontends.component.scss']
})
export class MirofrontendsComponent extends NavigationComponent {
  // instance data

  manifests : Manifest[] = []
  $manifests = new ReplaySubject<Manifest[]>(1);

  // constructor

  constructor(private introspectionService : PortalIntrospectionService, private portalAdministrationService: PortalAdministrationService, private dialog : MatDialog, private confirmationDialogs: ConfirmationDialogs) {
    super()
  }

  selectManifest(manifest : Manifest) {
    console.log("CLICK")
  }

  onChangedEnabled(manifest: Manifest) {
      this.portalAdministrationService.saveManifest(manifest).subscribe(result => console.log(result))
  }

  addManifest() {
    const dialogRef = this.dialog.open(AddManifestDialog, {
      data: {remote: ""},
        autoFocus: "first-tabbable",
        restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(remote => {
        if ( remote == "" || remote == undefined )
            return

        let url : URL = null

        try {
            url = new URL(remote)
        }
        catch(error) {
            this.confirmationDialogs.ok("Add Microfrontend", "malformed url")
            return
        }

        let address : Address = {
            protocol: url.protocol,
            host: url.hostname,
            port: +url.port
        }
        this.portalAdministrationService.registerMicrofrontend(address).subscribe(result => {
            if ( result.manifest )
                this.manifests.push(ManifestDecorator.decorate(result.manifest))

            else {
                switch (result.error) {
                    case "duplicate":
                        this.confirmationDialogs.ok("Add Microfrontend", "already registered")
                        break;
                    case "malformed_url":
                        this.confirmationDialogs.ok("Add Microfrontend", "malformed url")
                        break;
                    case "unreachable":
                        this.confirmationDialogs.ok("Add Microfrontend", "could not fetch manifest metadata")
                        break;
                }
            }
        })
    });
  }

  loadManifestFrom(url: string) {
    try {
        let asUrl = new URL(url)

        fetch(url + "/assets/manifest.json").then(async (response) => {
            if ( response.ok) {
                let manifest = await response.json()

                // check for duplicates

                for ( let manifest of this.manifests)
                  if ( manifest.remoteEntry == url) {
                      this.confirmationDialogs.ok("Remote", "Already registered")
                      return
                  }


                ManifestDecorator.decorate(manifest)

                this.manifests.push(manifest)
            }
            else {
                this.confirmationDialogs.ok("Add Remote", "Error fetching manifest")
            }
        })
    }
    catch(e) {
        this.confirmationDialogs.ok("Add Remote", "Invalid URL")
        return
    }
  }

  removeManifest(manifest: Manifest) {
      this.confirmationDialogs.okCancel("Remove Manifest", "are you sure?").subscribe(result => {
          if (result) {
              this.manifests.splice(this.manifests.indexOf(manifest), 1)

              let url = new URL(manifest.remoteEntry)
              let address : Address = {
                  protocol: url.protocol,
                  host: url.hostname,
                  port: +url.port
              }
              this.portalAdministrationService.removeMicrofrontend(address).subscribe(_ => console.log("ok"))
          }
      })
  }

   saveManifest(manifest: Manifest) {
        this.portalAdministrationService.saveManifest(manifest).subscribe(result => result)
    }

  private decorateManifests(manifests: Manifest[]) : Manifest[] {
    for (let manifest of manifests)
      ManifestDecorator.decorate(manifest)

      return manifests
}

  // implement OnInit

  ngOnInit() {
    super.ngOnInit()

    this.introspectionService.getManifests().subscribe((manifests) =>
      this.$manifests.next(this.manifests = this.decorateManifests(manifests))
    )
  }
}
