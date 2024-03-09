import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Application, ApplicationVersion, Microfrontend } from "../../model";
import { ConfigurationProperty } from "../../config/configuration-model";
import { ConfigurationTreeComponent } from "../../config/configuration-tree.component";
import { MatDividerModule } from "@angular/material/divider";
import { AssignedMicrofrontendRow, AssignedMicrofrontendsComponent } from "../assigned-microfrontends/assigned-microfrontends.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ApplicationFeatureComponent } from "../application.feature";
import { PortalAdministrationService } from "../../service";
import { ApplicationView } from "../application-view";

@Component({
    standalone: true,
    selector: 'application-version',
    templateUrl: "./application-version.component.html",
    styleUrls: ["./application-version.component.scss"],
    imports: [
        MatDividerModule,
        MatFormFieldModule,

        AssignedMicrofrontendsComponent,
        ConfigurationTreeComponent
    ]
})
export class ApplicationVersionComponent extends ApplicationView  implements OnInit {
  // inputs

  @Input() application! : Application
  @Input() applicationVersion! : ApplicationVersion
  @Input() microfrontends! : Microfrontend[]

   // outputs

   @Output() dirty = new EventEmitter<boolean>();

  // instance data

  configurationData: ConfigurationProperty = {
       type: "object",
       value: []
  }
  inheritedConfigurationData: ConfigurationProperty[] = []

  // constructor

  constructor(feature: ApplicationFeatureComponent, private portalAdministrationService : PortalAdministrationService) {
    super();

    feature.currentView = this
   }

   save() {
    this.applicationVersion.configuration = JSON.stringify(this.stripInherited(this.configurationData))

    this.portalAdministrationService.updateApplicationVersion(this.applicationVersion).subscribe(version => {
        // copy back possibly pks of the assigned microfrontends

        for ( let i = 0; i < this.applicationVersion.assignedMicrofrontends.length; i++) {
            this.applicationVersion.assignedMicrofrontends[i].id = version.assignedMicrofrontends[i].id
        }
    })
   }

  // callbacks

  onDirty(dirty: boolean) {
    this.dirty.emit(dirty)
  }

  // implement OnInit

  ngOnInit(): void {
    this.inheritedConfigurationData = [ JSON.parse(this.application.configuration) ]

    this.configurationData =  JSON.parse(this.applicationVersion!.configuration)

    if (!this.configurationData.type)
         this.configurationData = {
            type: "object",
            value: []
         }

     if (this.applicationVersion!.assignedMicrofrontends == undefined)
      this.applicationVersion!.assignedMicrofrontends = []
   }
}
