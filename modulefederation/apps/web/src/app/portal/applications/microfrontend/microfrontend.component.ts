import { Component, EventEmitter, Injector, Input, OnInit, Output } from "@angular/core";
import { Microfrontend } from "../../model";
import { ConfigurationProperty } from "../../config/configuration-model";
import { ConfigurationTreeComponent } from "../../config/configuration-tree.component";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ApplicationFeatureComponent } from "../application.feature";
import { PortalAdministrationService } from "../../service";
import { ApplicationView } from "../application-view";
import { CommonModule } from "@angular/common";
import { ManifestComponent } from "../manifest/manifest.component";

@Component({
    standalone: true,
    selector: 'microfrontend',
    templateUrl: "./microfrontend.component.html",
    styleUrls: ["./microfrontend.component.scss"],
    imports: [
        // angular

        CommonModule,

        // material

        MatDividerModule,
        MatFormFieldModule,

        // components

        ManifestComponent,
        ConfigurationTreeComponent
    ]
})
export class MicrofrontendComponent extends ApplicationView implements OnInit {
   // inputs

    @Input() microfrontend! : Microfrontend

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

   // override 

   save() {
    this.microfrontend!.configuration = JSON.stringify(this.stripInherited(this.configurationData))

    this.portalAdministrationService.updateMicrofrontend(this.microfrontend).subscribe()

   }

   revert() {
    // TODO
    }

   onDirty(dirty: boolean) {
    this.dirty.emit(dirty)
   }

   // implement OnInit

   override ngOnInit(): void {
    super.ngOnInit()

    this.configurationData = JSON.parse(this.microfrontend.configuration)
   }
}
