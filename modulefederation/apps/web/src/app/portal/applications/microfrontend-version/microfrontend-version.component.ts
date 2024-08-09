import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { Application, ApplicationVersion, Microfrontend, MicrofrontendInstance, MicrofrontendVersion } from "../../model";
import { ConfigurationProperty } from "../../config/configuration-model";
import { ConfigurationTreeComponent } from "../../config/configuration-tree.component";
import { MatDividerModule } from "@angular/material/divider";
import { PortalAdministrationService } from "../../service";
import { ApplicationFeatureComponent } from "../application.feature";
import { ApplicationView } from "../application-view";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ManifestComponent } from "../manifest/manifest.component";
import { MatListModule } from "@angular/material/list";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { NgModelSuggestionsDirective, SuggestionProvider, WithDialogs, WithSnackbar } from "@modulefederation/portal";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatInputModule } from "@angular/material/input";


export class ApplicationVersionSuggestionProvider implements SuggestionProvider {
    // constructor

    constructor(private applications: Application[]) {
    }

    // implement SuggestionProvider

    highlightSuggestion(suggestion: string | null) : void {}

    selectSuggestion(suggestion: string) : void {}

    provide(input : string) : string[] {
        if ( input.includes(":")) {
            const colon = input.indexOf(":")
            const applicationName = input.substring(0, colon)

            const application = this.applications.find(application => application.name == applicationName)
            if ( application ) {
                const versionName = input.substring(colon + 1)

                return application.versions!
                    .filter(version => version.version.startsWith(versionName))
                    .map(version => applicationName + ":" + version.version)
            }
            else return []
        }
        else {
            return this.applications
                .filter(application => application.name.startsWith(input))
                .map(application => application.name)
        }
    }
}

@Component({
    standalone: true,
    selector: 'microfrontend-version',
    templateUrl: "./microfrontend-version.component.html",
    styleUrls: ["./microfrontend-version.component.scss"],
    imports: [
        // angular

        CommonModule,
        FormsModule,
        RouterModule,

        // material

        MatDividerModule,
        MatFormFieldModule,
        MatListModule,
        MatSlideToggleModule,
        MatIconModule,
        MatInputModule,
        MatSlideToggleModule,

        // components

        NgModelSuggestionsDirective,
        ManifestComponent,
        ConfigurationTreeComponent
    ]
})
export class MicrofrontendVersionComponent extends ApplicationView implements OnChanges {//TODO WithSnackbar(ApplicationView) {
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

    suggestionProvider : SuggestionProvider

    applicationVersion  = ""

    // constructor

    constructor(injector: Injector, private feature: ApplicationFeatureComponent, private portalAdministrationService : PortalAdministrationService) {
        super(injector);

        feature.currentView = this

        this.suggestionProvider = new ApplicationVersionSuggestionProvider(feature.applications)
    }

    // override ApplicationView

    save() {
       if ( this.manifestComponent.save()) {
            this.microfrontendVersion.configuration = JSON.stringify(this.stripInherited(this.configurationData))

            this.portalAdministrationService.updateMicrofrontendVersion(this.microfrontendVersion).subscribe()

            this.manifestComponent.saved()
        }
    }

    revert() {
        this.manifestComponent.revert()
    }

    onChangedEnabled(instance: MicrofrontendInstance) {
      //this.showSnackbar(instance.uri, instance.enabled ? "disabled" : "enabled")

      //TODO this.portalAdministrationService.enableMicrofrontend(manifest.name, !manifest.enabled).subscribe(result => console.log(result))
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

   applicationChanged(application: string) {
    const applicationVersion = this.findApplicationVersion(application)

    if ( applicationVersion )
       this.microfrontendVersion.applicationVersion = applicationVersion!.id!
    else
        this.microfrontendVersion!.applicationVersion = null

    this.onDirty(true)
   }

   onDirty(dirty: boolean) {
    this.dirty.emit(dirty)
   }

   findApplicationVersion(name: string) : ApplicationVersion | null {
        const colon = name.indexOf(":")

        if ( colon <= 0)
            return null

        const applicationName = name.substring(0, colon)
        const application = this.feature.applications.find(app => app.name == applicationName)

        if ( application == undefined)
            return null

        const versionName = name.substring(colon + 1)

        const version = application.versions!.find(version => version.version == versionName)

        return version ? version: null
    }

   findApplicationVersionName(id: number) : string {
        for (const app of this.feature.applications) {
            for ( const version of app.versions!)
                if ( version.id == id)
                    return app.name + ":" + version.version
        }

        return ""
   }

   private setMicrofrontendVersion(microfrontendVersion: MicrofrontendVersion) {
    this.microfrontendVersion = microfrontendVersion

    this.inheritedConfigurationData = [ JSON.parse(this.microfrontendVersion.configuration)]
    this.configurationData = JSON.parse(this.microfrontendVersion.configuration)


    if ( this.microfrontendVersion.applicationVersion)
        this.applicationVersion = this.findApplicationVersionName(this.microfrontendVersion.applicationVersion)
   }

   // implement OnInit

    override ngOnInit(): void {
        super.ngOnInit()

        this.setMicrofrontendVersion( this.microfrontendVersion)
   }

    // implement OnChanges

    ngOnChanges(changes : SimpleChanges) : void {
        const change = changes['microfrontendVersion']
        if (change && !change.isFirstChange())
            this.setMicrofrontendVersion(change.currentValue)
        }
}
