import { Component, EventEmitter, Inject, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { Application, ApplicationVersion, Microfrontend } from "../../model";
import { ConfigurationProperty } from "../../config/configuration-model";
import { ConfigurationTreeComponent } from "../../config/configuration-tree.component";
import { MatDividerModule } from "@angular/material/divider";
import { AssignedMicrofrontendsComponent } from "../assigned-microfrontends/assigned-microfrontends.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ApplicationFeatureComponent } from "../application.feature";
import { PortalAdministrationService } from "../../service";
import { ApplicationView } from "../application-view";
import { ContentComponent } from "./application-version-dialog";


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
export class ApplicationVersionComponent extends ApplicationView implements OnInit, OnChanges {
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

  constructor(injector: Injector, feature: ApplicationFeatureComponent, private portalAdministrationService : PortalAdministrationService) {
    super(injector);

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

    this.showSnackbar("saved")
   }

  revert() {
    // TODO
    this.showSnackbar("reverted")
  }

  // callbacks

  open() {
    this.dynamicDialog()
      .title(this.applicationVersion.version)
      .component(ContentComponent)
      .args({
        version: this.applicationVersion
      })
      .ok()
      .show().subscribe()

  }

  onDirty(dirty: boolean) {
    this.dirty.emit(dirty)
  }

  private setApplicationVersion(applicationVersion: ApplicationVersion) {
    this.applicationVersion = applicationVersion

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

  // implement OnInit

  override ngOnInit(): void {
    super.ngOnInit()

    this.setApplicationVersion(this.applicationVersion)
  }

   // implement OnChanges

   ngOnChanges(changes : SimpleChanges) : void {
    const change = changes['applicationVersion']
    if (change && !change.isFirstChange())
        this.setApplicationVersion(change.currentValue)
    }
}
