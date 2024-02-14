import { Component, Injector } from "@angular/core";
import { PortalAdministrationService, PortalIntrospectionService } from "./service";
import { Address } from "./model";
import { NavigationComponent } from "../widgets/navigation-component.component";
import { ReplaySubject } from "rxjs/internal/ReplaySubject";
import { ManifestDecorator } from "./util/manifest-decorator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Feature, Manifest, WithDialogs } from "@modulefederation/portal";
import { fromFetch } from "rxjs/fetch";
import { catchError, of, switchMap } from "rxjs";

@Component({
    selector: 'microfrontends',
    templateUrl: './microfrontends.component.html',
    styleUrls: ['./microfrontends.component.scss'],
})
@Feature({
    id: "microfrontends",
    label: "Microfrontends",
    icon: "folder",
    i18n: ["portal.commands"],
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: [],
    folder: "microfrontends", // TODO NEW
})
export class MirofrontendsComponent extends WithDialogs(NavigationComponent) {
    // instance data

    manifests : Manifest[] = []
    $manifests = new ReplaySubject<Manifest[]>(1);

    // constructor

    constructor(injector: Injector, private snackBar : MatSnackBar, private introspectionService : PortalIntrospectionService, private portalAdministrationService : PortalAdministrationService) {
        super(injector)
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

    async addManifest() {
        this.inputDialog()
          .title("Add Microfrontend")
          .placeholder("manifest url")
          .inputType("text")
          .okCancel()
          .show()
          .subscribe(async remote => {
          if (remote == "" || remote == undefined)
            return

          let url : URL | undefined = undefined

          try {
            url = new URL(remote)
          }
          catch(error) {
            this.confirmationDialog()
              .title("Add Microfrontend")
              .message("malformed url")
              .ok()
              .show()
              remote == ""
            return
          }


           fromFetch(remote + "/assets/manifest.json").pipe(
            switchMap(response => response.json()),

            catchError(err => {
                console.error(err);
                    return of({ error: true, message: err });
              }),
            )
            .subscribe(manifest => {
                manifest.enabled = true
                if ( ! manifest.remoteEntry)
                    manifest.remoteEntry = remote
                manifest.health = "alive"

                this.portalAdministrationService.registerManifest(manifest!).subscribe(result => {
                    if (result.manifest)
                    this.manifests.push(ManifestDecorator.decorate(result.manifest))

                    else {
                        const builder = this.confirmationDialog() .title("Add Microfrontend")

                        switch (result.error) {
                            case "duplicate":
                                builder.message("already registered")
                                break;
                            case "malformed_url":
                                builder.message("malformed url")
                                break;
                            case "unreachable":
                                builder.message("could not fetch manifest metadata")
                                break;
                        } // switch

                        builder.ok().show()
                    } // else
                })
                })
            })



          /* New

          let address : Address = {
            protocol: url.protocol,
            host: url.hostname,
            port: +url.port
          }
          this.portalAdministrationService.registerMicrofrontend(address).subscribe(result => {
            if (result.manifest)
              this.manifests.push(ManifestDecorator.decorate(result.manifest))

            else {
                let builder = this.dialogs.confirmationDialog() .title("Add Microfrontend")

                switch (result.error) {
                    case "duplicate":
                        builder.message("already registered")
                        break;
                    case "malformed_url":
                        builder.message("malformed url")
                        break;
                    case "unreachable":
                        builder.message("could not fetch manifest metadata")
                        break;
                } // switch

                builder.ok().show()
            }
          })
        })*/
    }

    loadManifestFrom(url : string) {
        try {
            const asUrl = new URL(url)

            fetch(url + "/assets/manifest.json").then(async (response) => {
                if (response.ok) {
                    const manifest = await response.json()

                    // check for duplicates

                    for (const manifest of this.manifests)
                        if (manifest.remoteEntry == url) {
                            this.confirmationDialog()
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
                    this.confirmationDialog()
                        .title("Add Remote")
                        .message("Error fetching manifest")
                        .ok()
                        .show()
                }
            })
        } 
        catch(e) {
            this.confirmationDialog()
                .title("Add Remote")
                .message("Invalid URL")
                .ok()
                .show()
            return
        }
    }

    removeManifest(manifest : Manifest) {
        this.confirmationDialog()
            .title("Remove Manifest")
            .message("Are you sure?")
            .okCancel()
            .show().subscribe(result => {
            if (result) {
                this.manifests.splice(this.manifests.indexOf(manifest), 1)

                const url = new URL(manifest.remoteEntry!)
                const address : Address = {
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
        for (const manifest of manifests)
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
