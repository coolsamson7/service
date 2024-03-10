import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Microfrontend, MicrofrontendVersion } from "../../model";
import { ConfigurationProperty } from "../../config/configuration-model";
import { ConfigurationTreeComponent } from "../../config/configuration-tree.component";
import { MatDividerModule } from "@angular/material/divider";
import { PortalAdministrationService } from "../../service";
import { ApplicationFeatureComponent } from "../application.feature";
import { ApplicationView } from "../application-view";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ManifestComponent } from "../manifest/manifest.component";
import { Command } from "@modulefederation/portal";


@Component({
    standalone: true,
    selector: 'microfrontend-version',
    templateUrl: "./microfrontend-version.component.html",
    styleUrls: ["./microfrontend-version.component.scss"],
    imports: [
        // material

        MatDividerModule,
        MatFormFieldModule,

        // components

        ManifestComponent,
        ConfigurationTreeComponent
    ]
})
export class MicrofrontendVersionComponent extends ApplicationView implements OnInit {
    // inputs

    @Input() microfrontend! : Microfrontend
    @Input() microfrontendVersion! : MicrofrontendVersion

    // outputs

     @Output() dirty = new EventEmitter<boolean>();

     @ViewChild(ManifestComponent) manifestComponent!: ManifestComponent

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

    // TEST

    @Command({
            label: "test",
            icon: "add"
    })
    test() {}

   // callbacks

   onDirty(dirty: boolean) {
    this.dirty.emit(dirty)
   }

   // implement OnInit

    override ngOnInit(): void {
        super.ngOnInit()

        this.inheritedConfigurationData = [ JSON.parse(this.microfrontendVersion.configuration)]
        this.configurationData = JSON.parse(this.microfrontendVersion.configuration)
   }
}
