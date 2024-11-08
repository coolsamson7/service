import { Component, EventEmitter, Injector, Input, OnInit, Output } from "@angular/core";
import { Application } from "../../model";
import { ConfigurationProperty } from "../../config/configuration-model";
import { ConfigurationTreeComponent } from "../../config/configuration-tree.component";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ApplicationView } from "../application-view";
import { ApplicationFeatureComponent } from "../application.feature";
import { PortalAdministrationService } from "../../service";

@Component({
    standalone: true,
    selector: 'application',
    templateUrl: "./application.component.html",
    styleUrls: ["./application.component.scss"],
    imports: [
        MatDividerModule,
        MatFormFieldModule,

        ConfigurationTreeComponent
    ]
})
export class ApplicationComponent extends ApplicationView implements OnInit {
   // inputs

    @Input() application! : Application

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
        this.application.configuration = JSON.stringify(this.stripInherited(this.configurationData))

        this.portalAdministrationService.updateApplication(this.application).subscribe()

        this.showSnackbar("saved")
    }

    revert() {
        // TODO
        this.showSnackbar("reverted")
    }
    
   // callbacks

   onDirty(dirty: boolean) {
    this.dirty.emit(dirty)
   }

   // implement OnInit

    override ngOnInit(): void {
        super.ngOnInit()

        this.configurationData = JSON.parse(this.application.configuration)
        if (!this.configurationData.type)
            this.configurationData = {
                type: "object",
                value: []
            }
    }
}
