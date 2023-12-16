import { Component } from "@angular/core";
import { PortalIntrospectionService } from "./service";
import { Manifest } from "./model";
import { NavigationComponent } from "../widgets/navigation-component.component";
import { ReplaySubject } from "rxjs/internal/ReplaySubject";
import { MatDialog } from "@angular/material/dialog";
import { AddManifestDialog } from "./add-manifest-dialog";
import { ConfirmationDialogs } from "./dialog/confirmation-dialogs";

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

  constructor(private introspectionService : PortalIntrospectionService, private dialog : MatDialog, private confirmationDialogs: ConfirmationDialogs) {
    super()
  }

  selectManifest(manifest : Manifest) {
    console.log("CLICK")
  }

  addManifest() {
    const dialogRef = this.dialog.open(AddManifestDialog, {
      data: {remote: ""},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      this.confirmationDialogs.okCancel("Add", "Are you sure").subscribe(result => console.log(result))
    });
  }

  // implement OnInit

  ngOnInit() {
    super.ngOnInit()

    this.introspectionService.getManifests().subscribe((manifests) =>
      this.$manifests.next(this.manifests = manifests)
    )
  }
}
