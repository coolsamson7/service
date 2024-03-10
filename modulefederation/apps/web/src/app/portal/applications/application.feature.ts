import { Component, Injector, ViewChild } from "@angular/core";
import { Feature, WithCommands, WithDialogs, AbstractFeature, Command, CommandButtonComponent } from "@modulefederation/portal";

import { CommonModule } from "@angular/common";
import { MatTabsModule } from "@angular/material/tabs";

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { forkJoin } from "rxjs";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { ApplicationView } from "./application-view";
import { ConfigurationTreeComponent } from "../config/configuration-tree.component";
import { PortalAdministrationService } from "../service";
import { ApplicationTreeComponent, MenuRequest, Node } from "./application-tree/application-tree.component";
import { ApplicationVersionComponent } from "./application-version/application-version.component";
import { ApplicationComponent } from "./application/application.component";
import { MicrofrontendVersionComponent } from "./microfrontend-version/microfrontend-version.component";
import { MicrofrontendComponent } from "./microfrontend/microfrontend.component";
import { Application } from "../model/application";
import { Microfrontend } from "../model/microfrontend";
import { ApplicationVersion } from "../model/application-version";
import { MicrofrontendVersion } from "../model/microfrontend-version";
import { MicrofrontendInstance } from "../model/microfrontend-instance";


@Component({
    standalone: true,
    imports: [
        // angular

        CommonModule,
        FormsModule,

        // material

        MatTabsModule,
        MatDividerModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatTableModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatCheckboxModule,

        // components

        ApplicationComponent,
        ApplicationVersionComponent,

        MicrofrontendComponent,
        MicrofrontendVersionComponent,

        CommandButtonComponent,

        ApplicationTreeComponent,
        ConfigurationTreeComponent
    ],
    selector: 'application-feature',
    templateUrl: './application.feature.html',
    styleUrls: ['./application.feature.scss'],
})
@Feature({
    id: "application",
    label: "Application",
    icon: "apps",
    i18n: ["portal.commands"],
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: [],
    folder: "portals"
})
export class ApplicationFeatureComponent extends WithCommands(WithDialogs(AbstractFeature)) {
   // instance data

   applications: Application[] = []
   microfrontends : Microfrontend[] = []

   selectedNode : Node| undefined  = undefined

   currentView : ApplicationView | undefined  = undefined

   selectedApplication : Application | undefined  = undefined
   selectedVersion : ApplicationVersion | undefined  = undefined
   selectedMicrofrontend: Microfrontend |  undefined  = undefined
   selectedMicrofrontendVersion: MicrofrontendVersion |  undefined  = undefined
   selectedMicrofrontendInstance: MicrofrontendInstance |  undefined  = undefined

   application : Application | undefined  = undefined
   microfrontend: Microfrontend |  undefined  = undefined

   dirty = false
   stages: string[] = []

   @ViewChild(ApplicationTreeComponent) tree!: ApplicationTreeComponent

   // constructor

   constructor(injector: Injector, private portalAdministrationService : PortalAdministrationService) {
      super(injector)

      // read some masterdata

      portalAdministrationService.readStages().subscribe(stages =>
        this.stages = stages
     )

     // read microfrontend data

     forkJoin({
        microfrontends: portalAdministrationService.readMicrofrontends(),
        applications: portalAdministrationService.readApplications()
      }).subscribe((data: any) => {
        this.microfrontends = data.microfrontends
        this.applications = data.applications;
        })
   }


   // private

   setDirty(dirty = true) {
    this.dirty = dirty

    this.updateCommandState()
   }

   // callbacks

   changed($event: any) {
     this.setDirty()
   }

   menuRequest(request: MenuRequest) {
       switch ( request.action) {
        case "add-version":
            this.addVersion(request.node)
            break;

        case "delete":
            if ( request.node.type == "application")
                this.deleteApplication(request.node)

            else if  ( request.node.type == "application-version")
                this.deleteApplicationVersion(request.node)

            else if  ( request.node.type == "microfrontend")
                this.deleteMicrofrontend(request.node)

            else if  ( request.node.type == "microfrontend-version")
                this.deleteMicrofrontendVersion(request.node)

            break;
       }
   }

    selectNode(node: Node) {
        if ( this.dirty) {
            this.confirmationDialog()
                .title("Dirty")
                .message("save?")
                .okCancel()
                .show()
                .subscribe(result => {
                    if ( result ) {
                        this.save()
                        this.selectNode(node)
                    }
                })
            return
        }

        this.selectedNode = node

        this.application = undefined
        this.microfrontend = undefined

        this.selectedApplication = undefined
        this.selectedVersion = undefined
        this.selectedMicrofrontend = undefined
        this.selectedMicrofrontendVersion = undefined
        this.selectedMicrofrontendInstance = undefined

        if ( node.type == "microfrontend")
            this.selectedMicrofrontend = node.data

        else if ( node.type == "microfrontend-version") {
            this.microfrontend = node.parent?.data
            this.selectedMicrofrontendVersion = node.data
        }

        else if ( node.type == "application")
            this.selectedApplication = node.data

        else if ( node.type == "application-version") {
            this.application = node.parent?.data
            this.selectedVersion = node.data
        }

    this.updateCommandState()
   }

   // private

    updateCommandState() {
        this.setCommandEnabled("save", this.dirty)
        this.setCommandEnabled("addApplication", !this.dirty)
    }

    // commands

    addVersion(applicationNode: Node) {
        this.inputDialog()
            .title("New Version")
            .message("Input version")
            .placeholder("version")
            .okCancel()
            .show()
            .subscribe(name => {
            const application : Application = applicationNode.data

            if ( name && application.versions?.find(version => version.version == name ) === undefined) {
                let newVersion : ApplicationVersion = {
                    version : name,
                    configuration : "{\"type\":\"object\",\"value\": []}",
                    assignedMicrofrontends: []
                }

                application.versions!.push(newVersion)

                this.portalAdministrationService.updateApplication(application).subscribe(returnApplication => {
                    newVersion = <ApplicationVersion>returnApplication.versions?.find(version => version.version === name)

                    const index = application.versions?.indexOf(<ApplicationVersion>application.versions?.find(version => version.version === name))
                    
                    application.versions![index!] = newVersion // we have a key now

                    this.selectNode(this.tree.addVersion(newVersion, applicationNode))
                })
            } // if
        })
    }

    deleteApplication(node: Node) {
        this.portalAdministrationService.deleteApplication(node.data.name).subscribe()
    }

    deleteMicrofrontend(node: Node) {
        // TODO
    }

    deleteMicrofrontendVersion(node: Node) {
        // TODO
    }

    deleteApplicationVersion(node: Node) {
        const application : Application = node.parent?.data

        this.portalAdministrationService.deleteApplicationVersion(application.name, node.data.version).subscribe(_ => {
            this.tree.deletedApplicationVersion(node)

            this.selectNode(node.parent!)
        })
    }

    computeApplicationVersionConfiguration() {
        this.portalAdministrationService.computeApplicationVersionConfiguration(this.selectedVersion!.id!).subscribe()
    }

    @Command({
        label: "Add Application",
        icon: "add"
    })
    addApplication() {
        this.inputDialog()
            .title("New Application")
            .message("Input name")
            .placeholder("application")
            .okCancel()
            .show()
            .subscribe(name => {
                if ( name )
                    this.portalAdministrationService.createApplication({
                        name : name,
                        configuration : "{\"type\":\"object\",\"value\": []}",
                        versions: []
                }).subscribe((application: any) => {
                    this.selectNode(this.tree.addApplication(application))
                })
            })
    }

    @Command({
        i18n: "portal.commands:save",
        icon: "save"
    })
    save() {
        if ( this.currentView )
            this.currentView.save()

        this.setDirty(false)
   }
}