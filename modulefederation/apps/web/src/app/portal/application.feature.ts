import { Component, Injector } from "@angular/core";
import { Feature, WithCommands, WithDialogs, AbstractFeature, Command, CommandButtonComponent } from "@modulefederation/portal";
import { PortalAdministrationService } from "./service";
import { Node, ApplicationTreeComponent } from "./application-tree.component";
import { CommonModule } from "@angular/common";
import { Application, ApplicationVersion } from "./model";
import { MatTabsModule } from "@angular/material/tabs";
import { ConfigurationTreeComponent } from "./config/configuration-tree.component";
import { ConfigurationData } from "./config/configuration-model";
import { MatToolbarModule } from "@angular/material/toolbar";
import { config } from "jointjs";
import { U } from "@angular/cdk/keycodes";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
    standalone: true,
    imports: [
        // angular

        CommonModule,

        // material

        MatTabsModule,
        MatFormFieldModule,
        MatToolbarModule,

        // components

        CommandButtonComponent,

        ApplicationTreeComponent,
        ConfigurationTreeComponent
    ],
    selector: 'application',
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
   selectedNode : Node| undefined  = undefined
   selectedApplication : Application | undefined  = undefined
   selectedVersion : ApplicationVersion | undefined  = undefined
   dirty = false
   configurationData: ConfigurationData = {
    type: "object",
    value: []
  }
   inheritedConfigurationData: ConfigurationData[] = []

   // constructor

   constructor(injector: Injector, private portalAdministrationService : PortalAdministrationService) {
      super(injector)

      // TEST

      portalAdministrationService.readStages().subscribe(stages =>
        console.log(stages)
     )

     portalAdministrationService.readMicrofrontendVersions().subscribe(stages =>
       console.log(stages)
     )

     portalAdministrationService.readApplications().subscribe(applications =>
        this.applications = applications
     )
   }


   // private

   private getConfigurationParent4(configuration: ConfigurationData) : ConfigurationData {
    // local function

    const find = (parent: ConfigurationData, node: ConfigurationData, target: ConfigurationData ) : ConfigurationData | undefined => {
        if ( node === target )
           return parent

        else if (node.type == "object" ) {
            for ( const child of <ConfigurationData[]>node.value ) {
                const result = find(node, child, target)
                if ( result )
                   return result
            }
        } // if

        return undefined
    }

    // go

    for ( const root of this.configurationData.value ) {
        const result = find(this.configurationData, root, configuration)

        if ( result !== undefined )
            return result
    }

    throw new Error("should not happen")
   }

   // callbacks

   changed($event: any) {
    this.dirty = true

    this.updateCommandState()
   }

   addItem(configuration: ConfigurationData) {
    const parent = configuration.type == "object" ? configuration : this.getConfigurationParent4(configuration)

    this.inputDialog()
        .title("New Item")
        .message("Enter item name")
        .placeholder("item name")
        .okCancel()
        .show()
        .subscribe(value => {
            if ( value ) {
                (<ConfigurationData[]>parent.value).push({
                    type: "string",
                    name: value,
                    value: ""
                })


                this.configurationData = {... this.configurationData}

                this.dirty = true
                this.updateCommandState()
            }
        })
   }

   addFolder(configuration: ConfigurationData) {
    const parent = configuration.type == "object" ? configuration : this.getConfigurationParent4(configuration)

    this.inputDialog()
        .title("New Item")
        .message("Enter item name")
        .placeholder("item name")
        .okCancel()
        .show()
        .subscribe(value => {
            if ( value ) {
                (<ConfigurationData[]>parent.value).push({
                    type: "object",
                    name: value,
                    value: []
                })


                this.configurationData = {... this.configurationData}

                this.dirty = true
                this.updateCommandState()
            }
        })
   }

    deleteItem(configuration: ConfigurationData) {
        const parent = this.getConfigurationParent4(configuration)

        this.dirty = true
        this.updateCommandState()

        // TODO

    // const index = <Number>(parent.value).indexOf(configuration)
    // (parent.value as ConfigurationData[]).splice(1, 1)
    }

      // strip inherited

      stripInherited(configuration: ConfigurationData) : ConfigurationData {
        const result : ConfigurationData = {
          type: "object",
          value: []
        }

        // copy all values which either dont't inherit or overwrite

        const copy = (properties: ConfigurationData[], result: ConfigurationData[]) => {
          for ( const property of properties) {
            if ( property.type == "object") {
              // recursive structure

              // TODO
            }
            else {
              // literal property

              if ( property.inherits == undefined || property.value !== property.inherits.value) {
                result.push({
                  type: property.type,
                  name: property.name,
                  value: property.value
                })
              }
            }
          }
        }

        // go

        copy(configuration.value, result.value)

        // done

        return result
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

        this.selectedApplication = undefined
        this.selectedVersion = undefined

        if ( node.type == "application") {
            this.inheritedConfigurationData = []
            this.selectedApplication = node.data

            this.configurationData =  JSON.parse(this.selectedApplication!.configuration)

            // TODO HACK

            if ( Object.getOwnPropertyNames(this.configurationData).length == 0 ) {
                this.configurationData.type = "object"
                this.configurationData.value = [
                    {
                    name: "application",
                    type: "string",
                    value: this.selectedApplication?.name
                    }
                ]
            }   // if
    }
    else if ( node.type == "version") {
        this.selectedVersion = node.data
        this.inheritedConfigurationData = [ JSON.parse(node.parent?.data.configuration)]

        this.configurationData =  JSON.parse(this.selectedVersion!.configuration)

        // TODO HACK

        if ( Object.getOwnPropertyNames(this.configurationData).length == 0 ) {
            this.configurationData.type = "object"
            this.configurationData.value = [
                {
                name: "version",
                type: "string",
                value: this.selectedVersion?.version
                }
            ]
        }   // if
    }

    this.updateCommandState()
   }

   // private

    updateCommandState() {
        this.setCommandEnabled("save", this.dirty)//TODO this.selectedApplication != undefined)
        this.setCommandEnabled("addApplication", !this.dirty)
        this.setCommandEnabled("addVersion", !this.dirty)
    }

    // commands

    @Command({
        //: "portal.commands:save",
        label: "Add Version",
        icon: "add"
    })
    addVersion() {
        this.inputDialog()
        .title("New Version")
        .message("Input version")
        .placeholder("version")
        .show()
        .subscribe(name => {
            if ( name ) {
                console.log(name)
            }
        })
    }

    @Command({
        //: "portal.commands:save",
        label: "Add Application",
        icon: "add"
    })
    addApplication() {
        this.inputDialog()
            .title("New Application")
            .message("Input name")
            .placeholder("application")
            .show()
            .subscribe(name => {
                if ( name ) {
                    console.log(name)
                }
            })
    }

    @Command({
        i18n: "portal.commands:save",
        icon: "save"
    })
    save() {
        if (this.selectedApplication) {

            this.selectedApplication!.configuration = JSON.stringify(this.stripInherited(this.configurationData))

            this.portalAdministrationService.updateApplication(this.selectedApplication).subscribe()
        }
        else if (this.selectedVersion) {
            this.selectedVersion!.configuration = JSON.stringify(this.stripInherited(this.configurationData))

            this.portalAdministrationService.updateApplicationVersion(this.selectedVersion).subscribe()
        }

        this.dirty = false

        this.updateCommandState()
   }

   // public
}
