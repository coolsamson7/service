import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Microfrontend, MicrofrontendVersion } from "../../model";
import { ConfigurationProperty } from "../../config/configuration-model";
import { ConfigurationTreeComponent } from "../../config/configuration-tree.component";
import { MatDividerModule } from "@angular/material/divider";
import { PortalAdministrationService } from "../../service";
import { ApplicationFeatureComponent } from "../application.feature";
import { ApplicationView } from "../application-view";
import { MatFormFieldModule } from "@angular/material/form-field";


@Component({
    standalone: true,
    selector: 'microfrontend-version',
    templateUrl: "./microfrontend-version.component.html",
    styleUrls: ["./microfrontend-version.component.scss"],
    imports: [
        MatDividerModule,
        MatFormFieldModule,

        ConfigurationTreeComponent
    ]
})
export class MicrofrontendVersionComponent extends ApplicationView  implements OnInit {
    // inputs

    @Input() microfrontend! : Microfrontend
    @Input() microfrontendVersion! : MicrofrontendVersion

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
        this.microfrontendVersion.configuration = JSON.stringify(this.stripInherited(this.configurationData))

        this.portalAdministrationService.updateMicrofrontendVersion(this.microfrontendVersion).subscribe()
   }

   // public

   name(id: string) : string{
        const colon = id.indexOf(":")
        return id.substring(0, colon)
    }

    version(id: string) : string {
        const colon = id.indexOf(":")
        return id.substring(colon + 1)
    }

   // callbacks

   onDirty(dirty: boolean) {
    this.dirty.emit(dirty)
   }


   // implement OnInit

    ngOnInit(): void {
        this.inheritedConfigurationData = [ JSON.parse(this.microfrontendVersion.configuration)]
        this.configurationData = JSON.parse(this.microfrontendVersion.configuration)
   }
}
