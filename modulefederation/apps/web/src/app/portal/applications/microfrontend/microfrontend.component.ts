import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Microfrontend } from "../../model";
import { ConfigurationProperty } from "../../config/configuration-model";
import { ConfigurationTreeComponent } from "../../config/configuration-tree.component";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ApplicationFeatureComponent } from "../application.feature";
import { PortalAdministrationService } from "../../service";
import { ApplicationView } from "../application-view";

@Component({
    standalone: true,
    selector: 'microfrontend',
    templateUrl: "./microfrontend.component.html",
    styleUrls: ["./microfrontend.component.scss"],
    imports: [
        MatDividerModule,
        MatFormFieldModule,

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

   constructor(feature: ApplicationFeatureComponent, private portalAdministrationService : PortalAdministrationService) {
    super();

    feature.currentView = this
   }

   save() {
    this.microfrontend!.configuration = JSON.stringify(this.stripInherited(this.configurationData))

    this.portalAdministrationService.updateMicrofrontend(this.microfrontend).subscribe()

   }

   onDirty(dirty: boolean) {
    this.dirty.emit(dirty)
   }

   // implement OnInit

   ngOnInit(): void {
    this.configurationData = JSON.parse(this.microfrontend.configuration)
   }
}
