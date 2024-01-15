import { Component } from "@angular/core";
import { PortalAdministrationService, PortalIntrospectionService } from "./service";
import { Address } from "./model";
import { NavigationComponent } from "../widgets/navigation-component.component";
import { ReplaySubject } from "rxjs/internal/ReplaySubject";
import { ManifestDecorator } from "./util/manifest-decorator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DialogService, Feature, Manifest } from "@modulefederation/portal";

@Component({
    selector: 'microfrontends',
    templateUrl: './microfrontends.component.html',
    styleUrls: ['./microfrontends.component.scss']
})
@Feature({
    id: "microfrontends",
    label: "Microfrontends",
    icon: "folder",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: [],
    folder: "microfrontends" // TODO NEW
})
export class MirofrontendsComponent extends NavigationComponent {
    // instance data

    manifests : Manifest[] = []
    $manifests = new ReplaySubject<Manifest[]>(1);

    // constructor

    constructor(private snackBar : MatSnackBar, private introspectionService : PortalIntrospectionService, private portalAdministrationService : PortalAdministrationService, private dialogs : DialogService) {
        super()
    }

    // public

    showSnackBar(message : string, action : string) {
        this.snackBar.open(message, action);
    }

    onChangedEnabled(manifest : Manifest) {
        this.showSnackBar(manifest.name, manifest.enabled ? "disabled" : "enabled")

        this.portalAdministrationService.enableMicrofrontend(manifest.name, !manifest.enabled).subscribe(result => console.log(result))
    }

    refresh() {
        this.portalAdministrationService.refresh().subscribe(_ => {
            this.loadManifests()
        })
    }

    addManifest() {
        this.dialogs.inputDialog()
          .title("Add Microfrontend")
          .placeholder("manifest url")
          .inputType("text")
          .okCancel()
          .show().subscribe(remote => {
          if (remote == "" || remote == undefined)
            return

          let url : URL | undefined = undefined

          try {
            url = new URL(remote)
          } catch(error) {
            this.dialogs.confirmationDialog()
              .title("Add Microfrontend")
              .message("malformed url")
              .ok()
              .show()
            return
          }

          let address : Address = {
            protocol: url.protocol,
            host: url.hostname,
            port: +url.port
          }
          this.portalAdministrationService.registerMicrofrontend(address).subscribe(result => {
            if (result.manifest)
              this.manifests.push(ManifestDecorator.decorate(result.manifest))

            else {
              switch (result.error) {
                case "duplicate":
                  this.dialogs.confirmationDialog()
                    .title("Add Microfrontend")
                    .message("already registered")
                    .ok()
                    .show()
                  break;
                case "malformed_url":
                  this.dialogs.confirmationDialog()
                    .title("Add Microfrontend")
                    .message("malformed url")
                    .ok()
                    .show()
                  break;
                case "unreachable":
                  this.dialogs.confirmationDialog()
                    .title("Add Microfrontend")
                    .message("could not fetch manifest metadata")
                    .ok()
                    .show()
                  break;
              }
            }
          })
        })
    }

    loadManifestFrom(url : string) {
        try {
            let asUrl = new URL(url)

            fetch(url + "/assets/manifest.json").then(async (response) => {
                if (response.ok) {
                    let manifest = await response.json()

                    // check for duplicates

                    for (let manifest of this.manifests)
                        if (manifest.remoteEntry == url) {
                            this.dialogs.confirmationDialog()
                                .title("Add Remote")
                                .message("Already registered")
                                .ok()
                                .show()
                            return
                        }


                    ManifestDecorator.decorate(manifest)

                    this.manifests.push(manifest)
                }
                else {
                    this.dialogs.confirmationDialog()
                        .title("Add Remote")
                        .message("Error fetching manifest")
                        .ok()
                        .show()
                }
            })
        } catch(e) {
            this.dialogs.confirmationDialog()
                .title("Add Remote")
                .message("Invalid URL")
                .ok()
                .show()
            return
        }
    }

    removeManifest(manifest : Manifest) {
        this.dialogs.confirmationDialog()
            .title("Remove Manifest")
            .message("Are you sure?")
            .okCancel()
            .show().subscribe(result => {
            if (result) {
                this.manifests.splice(this.manifests.indexOf(manifest), 1)

                let url = new URL(manifest.remoteEntry!!)
                let address : Address = {
                    protocol: url.protocol,
                    host: url.hostname,
                    port: +url.port
                }
                this.portalAdministrationService.removeMicrofrontend(address).subscribe(_ => console.log("ok"))
            }
        })
    }

    saveManifest(manifest : Manifest) {
        this.showSnackBar(manifest.name, "Saved")

        this.portalAdministrationService.saveManifest(manifest).subscribe(result => result)
    }

    override ngOnInit() {
        super.ngOnInit()

        this.introspectionService.getManifests().subscribe((manifests) =>
            this.$manifests.next(this.manifests = this.decorateManifests(manifests))
        )
    }

    private decorateManifests(manifests : Manifest[]) : Manifest[] {
        for (let manifest of manifests)
            ManifestDecorator.decorate(manifest)

        return manifests
    }

    // implement OnInit

    private loadManifests() {
        this.introspectionService.getManifests().subscribe((manifests) =>
            this.$manifests.next(this.manifests = this.decorateManifests(manifests))
        )
    }
}
