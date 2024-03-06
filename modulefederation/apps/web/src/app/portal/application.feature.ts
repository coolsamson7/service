import { Component, Injector } from "@angular/core";
import { Feature, WithCommands, WithDialogs, AbstractFeature, Command, CommandButtonComponent, SuggestionProvider, ArraySuggestionProvider, NgModelSuggestionsDirective } from "@modulefederation/portal";
import { PortalAdministrationService } from "./service";
import { Node, ApplicationTreeComponent } from "./application-tree.component";
import { CommonModule } from "@angular/common";
import { Application, ApplicationVersion, AssignedMicrofrontend, MicrofrontendInstance, MicrofrontendVersion } from "./model";
import { MatTabsModule } from "@angular/material/tabs";
import { ConfigurationTreeComponent } from "./config/configuration-tree.component";
import { ConfigurationData } from "./config/configuration-model";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { forkJoin } from "rxjs";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";

export interface AssignedMicrofrontendRow {
    isSelected: boolean;
    isEdit: boolean;

    data: AssignedMicrofrontend
  }

export const Columns = [
    {
      key: 'isSelected',
      type: 'isSelected',
      label: '',
    },
    {
      key: 'id',
      type: 'mfe',
      label: 'Id',
      required: true,
    },
    {
        key: 'version',
        type: 'text',
        label: 'Version',
        required: true,
      },
      {
        key: 'isEdit',
        type: 'isEdit',
        label: '',
      },
]

@Component({
    standalone: true,
    imports: [
        // angular

        CommonModule,

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
        FormsModule,

        // components

        NgModelSuggestionsDirective,
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
// NEW TODO

displayedColumns: string[] = Columns.map((col) => col.key)
  columnsSchema: any = Columns
  dataSource = new MatTableDataSource<AssignedMicrofrontendRow>()
  //valid: any = {}

  finishEdit(row: AssignedMicrofrontendRow) {
    row.isEdit = false

    console.log(row)
  }

  addRow() {
    const newRow: AssignedMicrofrontendRow = {
      isEdit: true,
      isSelected: false,
      data: {
        id: "",
        version: ""
      }
    }
    this.dataSource.data = [newRow, ...this.dataSource.data]
  }

  removeRow(row: AssignedMicrofrontendRow) {
    /*this.userService.deleteUser(id).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(
        (u: User) => u.id !== id,
      )
    })*/
  }

  removeSelectedRows() {
    //const users = this.dataSource.data.filter((u: AssignedMicrofrontend) => u.isSelected)
    /*this.dialog
      .open(ConfirmDialogComponent)
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.userService.deleteUsers(users).subscribe(() => {
            this.dataSource.data = this.dataSource.data.filter(
              (u: User) => !u.isSelected,
            )
          })
        }
      })*/
  }

  inputHandler(e: any, row: AssignedMicrofrontendRow, key: string) {
    /*if (!this.valid[id]) {
      this.valid[id] = {}
    }
    this.valid[id][key] = e.target.validity.valid*/
  }
/*
  disableSubmit(id: number) {
    if (this.valid[id]) {
      return Object.values(this.valid[id]).some((item) => item === false)
    }
    return false
  }*/

  /*
  isAllSelected() {
    return this.dataSource.data.every((item) => item.isSelected)
  }

  isAnySelected() {
    return this.dataSource.data.some((item) => item.isSelected)
  }

  selectAll(event: any) {
    this.dataSource.data = this.dataSource.data.map((item) => ({
      ...item,
      isSelected: event.checked,
    }))
  }*/
  
    // NEW TODO
   // instance data

   applications: Application[] = []
   microfrontendVersions : MicrofrontendVersion[] = []
   suggestionProvider : SuggestionProvider = new ArraySuggestionProvider([])
   selectedNode : Node| undefined  = undefined
   selectedApplication : Application | undefined  = undefined
   selectedVersion : ApplicationVersion | undefined  = undefined
   selectedMicrofrontendVersion: MicrofrontendVersion |  undefined  = undefined
   selectedMicrofrontendInstance: MicrofrontendInstance |  undefined  = undefined
   dirty = false
   stages: string[] = []
   configurationData: ConfigurationData = {
    type: "object",
    value: []
  }
   inheritedConfigurationData: ConfigurationData[] = []

   // constructor

   constructor(injector: Injector, private portalAdministrationService : PortalAdministrationService) {
      super(injector)

      // read some masterdata

      portalAdministrationService.readStages().subscribe(stages =>
        this.stages = stages
     )

     // read microfrontend data

     forkJoin({
        microfrontends: portalAdministrationService.readMicrofrontendVersions(),
        applications: portalAdministrationService.readApplications()
      }).subscribe((data: any) => {
        // microfrontends

        this.microfrontendVersions = data.microfrontends

        this.suggestionProvider = new ArraySuggestionProvider(this.microfrontendVersions.map(version => version.id))

        // applications

        this.applications = data.applications;
        })
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
        this.selectedMicrofrontendVersion = undefined
        this.selectedMicrofrontendInstance = undefined

        if ( node.type == "microfrontend-version") {
            this.inheritedConfigurationData = []
            this.selectedMicrofrontendVersion = node.data

            this.configurationData =  JSON.parse(this.selectedMicrofrontendVersion!.configuration)
        }

        else if ( node.type == "microfrontend-instance") {
            this.inheritedConfigurationData = [ JSON.parse(node.parent?.data.configuration)]
            this.selectedMicrofrontendInstance = node.data

            this.configurationData =  JSON.parse(this.selectedMicrofrontendInstance!.configuration)

            // TODO HACK

            if ( Object.getOwnPropertyNames(this.configurationData).length == 0 ) {
                this.configurationData.type = "object"
                this.configurationData.value = []
            }   // if
        }


        else if ( node.type == "application") {
            this.inheritedConfigurationData = []
            this.selectedApplication = node.data

            this.configurationData =  JSON.parse(this.selectedApplication!.configuration)
        }

        else if ( node.type == "version") {
            this.selectedVersion = node.data
            this.inheritedConfigurationData = [ JSON.parse(node.parent?.data.configuration) ]

            this.configurationData =  JSON.parse(this.selectedVersion!.configuration)

            if (this.selectedVersion!.microfrontends == undefined)
                this.selectedVersion!.microfrontends = []

            this.dataSource = new MatTableDataSource<AssignedMicrofrontendRow>(
                this.selectedVersion?.microfrontends.map(assigned => {
                    return {
                        isSelected: false,
                        isEdit: false,
                        data: assigned
                    }
                })
            )
        }

        if ( Object.getOwnPropertyNames(this.configurationData).length == 0 ) {
            this.configurationData.type = "object"
            this.configurationData.value = []
        }   // if

    this.updateCommandState()
   }

   // private

    updateCommandState() {
        this.setCommandEnabled("save", this.dirty)
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
        .okCancel()
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
            .okCancel()
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
        else if (this.selectedMicrofrontendVersion) {
            this.selectedMicrofrontendVersion!.configuration = JSON.stringify(this.stripInherited(this.configurationData))

            this.portalAdministrationService.updateMicrofrontendVersion(this.selectedMicrofrontendVersion).subscribe()
        }
        else if (this.selectedMicrofrontendInstance) {
            this.selectedMicrofrontendInstance!.configuration = JSON.stringify(this.stripInherited(this.configurationData))

            this.portalAdministrationService.updateMicrofrontendInstance(this.selectedMicrofrontendInstance).subscribe()
        }

        this.dirty = false

        this.updateCommandState()
   }

   // public
}
