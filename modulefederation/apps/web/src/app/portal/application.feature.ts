import { AfterViewInit, Component, Directive, Injector, ViewChild } from "@angular/core";
import { Feature, WithCommands, WithDialogs, AbstractFeature, Command, CommandButtonComponent, SuggestionProvider, ArraySuggestionProvider, NgModelSuggestionsDirective, VersionRange } from "@modulefederation/portal";
import { PortalAdministrationService } from "./service";
import { Node, ApplicationTreeComponent, MenuRequest } from "./application-tree.component";
import { CommonModule } from "@angular/common";
import { Application, ApplicationVersion, AssignedMicrofrontend, Microfrontend, MicrofrontendInstance, MicrofrontendVersion } from "./model";
import { MatTabsModule } from "@angular/material/tabs";
import { ConfigurationTreeComponent } from "./config/configuration-tree.component";
import { ConfigurationProperty } from "./config/configuration-model";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { forkJoin } from "rxjs";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AbstractControl, AbstractControlDirective, FormsModule, NG_VALIDATORS, NgControl, NgForm, Validator } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";


@Directive({
    selector: '[versionValidator]',
    standalone: true,
    providers: [{
      provide: NG_VALIDATORS,
      useExisting: VersionValidatorDirective,
      multi: true
    }]
  })
  export class VersionValidatorDirective implements Validator {
    // implement Validator

    validate(control: AbstractControl) : {[key: string]: any} | null {
        try {
            new VersionRange(control.value)

            return null
        }
        catch(e) {
            return {
                'versionInvalid': true
            };
        }
    }
  }

  @Directive({
    selector: '[microfrontendValidator]',
    standalone: true,
    providers: [{
      provide: NG_VALIDATORS,
      useExisting: MicrofrontendValidatorDirective,
      multi: true
    }]
  })
  export class MicrofrontendValidatorDirective implements Validator {
    // constructor

    constructor(private feature: ApplicationFeatureComponent) {
    }

    // implement Validator

    validate(control: AbstractControl) : {[key: string]: any} | null {
     if (this.feature!.microfrontends.find(mfe => mfe.name === control.value) === undefined)
        return {
            'microfrontendInvalid': true
        };

      return null;
    }
  }

@Component({
    standalone: true,
    selector: '[showErrors]',
    template: '{{ error }}'
})
export class MatErrorMessagesComponent implements AfterViewInit {
    // instance data

    public error = ''
    private control: NgControl | AbstractControlDirective | null = null

    // constructor

    constructor(private formField: MatFormField, private feature: ApplicationFeatureComponent) {
    }

    /// implement AfterViewInit

    public ngAfterViewInit(): void {
        this.control = this.formField._control.ngControl;

        // sub to the control's status stream

        this.control?.statusChanges!.subscribe(this.updateErrors);
    }

    // private

    private updateErrors = (state: 'VALID' | 'INVALID'): void => {
        this.feature.state((<any>this.control)["name"], state)

        if (state === 'INVALID') {
            // active errors on the FormControl

            const controlErrors = this.control!.errors!

            // just grab one error

            const firstError = Object.keys(controlErrors)[0]

            if (firstError === 'required')
                this.error = 'This field is required.'

            else if (firstError === 'versionInvalid')
                this.error = "invalid version specifier"

            else if (firstError === 'microfrontendInvalid')
                this.error = "unknown microfrontend"
        }
    };
}

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
      key: 'microfrontend',
      type: 'mfe',
      label: 'Name',
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

        MicrofrontendValidatorDirective,
        VersionValidatorDirective,

        MatErrorMessagesComponent,
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

 errors : any = {}

state(control: string, state: 'VALID' | 'INVALID') {
    if (state == "INVALID")
       this.errors[control] = true
    else
        delete this.errors[control]
}

canFinishEdit() {
    return Object.getOwnPropertyNames(this.errors).length == 0
}

displayedColumns: string[] = Columns.map((col) => col.key)
  columnsSchema: any = Columns
  dataSource = new MatTableDataSource<AssignedMicrofrontendRow>()

  finishEdit(row: AssignedMicrofrontendRow) {
    row.isEdit = false

    this.setDirty()
  }

  addRow() {
    const newRow: AssignedMicrofrontendRow = {
      isEdit: true,
      isSelected: false,
      data: {
        microfrontend: "",
        version: ""
      }
    }
    this.selectedVersion?.assignedMicrofrontends.push(newRow.data)
    this.dataSource.data = [newRow, ...this.dataSource.data]

    this.setDirty()
  }

  removeRow(row: AssignedMicrofrontendRow) {
    this.dataSource.data.splice(this.dataSource.data.indexOf(row), 1)
    this.selectedVersion?.assignedMicrofrontends.splice(this.selectedVersion?.assignedMicrofrontends.indexOf(row.data), 1)

    this.dataSource.data = [...this.dataSource.data]

    this.setDirty()
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
   microfrontends : Microfrontend[] = []
   //microfrontendVersions : MicrofrontendVersion[] = []
   suggestionProvider : SuggestionProvider = new ArraySuggestionProvider([])
   selectedNode : Node| undefined  = undefined

   selectedApplication : Application | undefined  = undefined
   selectedVersion : ApplicationVersion | undefined  = undefined
   selectedMicrofrontend: Microfrontend |  undefined  = undefined
   selectedMicrofrontendVersion: MicrofrontendVersion |  undefined  = undefined
   selectedMicrofrontendInstance: MicrofrontendInstance |  undefined  = undefined
   dirty = false
   stages: string[] = []
   configurationData: ConfigurationProperty = {
    type: "object",
    value: []
  }
   inheritedConfigurationData: ConfigurationProperty[] = []

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
        // microfrontends

        this.microfrontends = data.microfrontends

        this.suggestionProvider = new ArraySuggestionProvider(this.microfrontends.map(microfrontend => microfrontend.name))

        // applications

        this.applications = data.applications;
        })
   }


   // private

   microfrontendName(id: string) : string{
    const colon = id.indexOf(":")
    return id.substring(0, colon)
 }

 microfrontendVersion(id: string) : string {
    const colon = id.indexOf(":")
    return id.substring(colon + 1)
 }



   private getConfigurationParent4(configuration: ConfigurationProperty) : ConfigurationProperty {
    // local function

    const find = (parent: ConfigurationProperty, node: ConfigurationProperty, target: ConfigurationProperty ) : ConfigurationProperty | undefined => {
        if ( node === target )
           return parent

        else if (node.type == "object" ) {
            for ( const child of <ConfigurationProperty[]>node.value ) {
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
            break;
       }
   }

   addItem(configuration: ConfigurationProperty) {
    const parent = configuration.type == "object" ? configuration : this.getConfigurationParent4(configuration)

    this.inputDialog()
        .title("New Property")
        .message("Enter property name")
        .placeholder("property")
        .okCancel()
        .show()
        .subscribe(value => {
            if ( value ) {
                (<ConfigurationProperty[]>parent.value).push({
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

   addFolder(configuration: ConfigurationProperty) {
    const parent = configuration.type == "object" ? configuration : this.getConfigurationParent4(configuration)

    this.inputDialog()
        .title("New folder")
        .message("Enter folder name")
        .placeholder("folder")
        .okCancel()
        .show()
        .subscribe(value => {
            if ( value ) {
                (<ConfigurationProperty[]>parent.value).push({
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

    deleteItem(configuration: ConfigurationProperty) {
        const parent = this.getConfigurationParent4(configuration)

        const index = parent.value.indexOf(configuration)
        parent.value.splice(index, 1)

        this.configurationData = {... this.configurationData}
        
        this.dirty = true
        this.updateCommandState()
    }

      // strip inherited

      stripInherited(configuration: ConfigurationProperty) : ConfigurationProperty {
        const result : ConfigurationProperty = {
          type: "object",
          value: []
        }

        // copy all values which either dont't inherit or overwrite

        const copy = (properties: ConfigurationProperty[], result: ConfigurationProperty[]) => {
          for ( const property of properties) {
            const newProperty = {...property}
            if ( property.inherits == undefined || property.value !== property.inherits.value)
                result.push(newProperty)
        
            // recursion

            if ( property.type == "object") {
                newProperty.value = []
                copy(property.value, newProperty.value)
            } // if
          } // for
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
        this.selectedMicrofrontend = undefined
        this.selectedMicrofrontendVersion = undefined
        this.selectedMicrofrontendInstance = undefined

        if ( node.type == "microfrontend") {
            this.inheritedConfigurationData = []
            this.selectedMicrofrontend = node.data

            this.configurationData = JSON.parse(this.selectedMicrofrontend!.configuration)
        }

        else if ( node.type == "microfrontend-version") {
            this.inheritedConfigurationData = [ JSON.parse(node.parent?.data.configuration)]
            this.selectedMicrofrontendVersion = node.data

            this.configurationData = JSON.parse(this.selectedMicrofrontendVersion!.configuration)
        }

        else if ( node.type == "microfrontend-instance") {
            this.inheritedConfigurationData = [ JSON.parse(node.parent?.parent?.data.configuration), JSON.parse(node.parent?.data.configuration)]
            this.selectedMicrofrontendInstance = node.data

            this.configurationData =  JSON.parse(this.selectedMicrofrontendInstance!.configuration)
        }

        else if ( node.type == "application") {
            this.inheritedConfigurationData = []
            this.selectedApplication = node.data

            this.configurationData =  JSON.parse(this.selectedApplication!.configuration)
        }

        else if ( node.type == "application-version") {
            this.selectedVersion = node.data
            this.inheritedConfigurationData = [ JSON.parse(node.parent?.data.configuration) ]

            this.configurationData =  JSON.parse(this.selectedVersion!.configuration)

            if (this.selectedVersion!.assignedMicrofrontends == undefined)
                this.selectedVersion!.assignedMicrofrontends = []

            this.dataSource = new MatTableDataSource<AssignedMicrofrontendRow>(
                this.selectedVersion?.assignedMicrofrontends.map(assigned => {
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
                const newVersion : ApplicationVersion = {
                    version : name,
                    configuration : "{\"type\":\"object\",\"value\": []}",
                    assignedMicrofrontends: []
                }

                application.versions!.push(newVersion)

                this.portalAdministrationService.updateApplication(application).subscribe(returnApplication => {
                    application.versions = returnApplication.versions // we have a key now

                    this.selectNode(this.tree.addVersion(newVersion, applicationNode))
                })
            } // if
        })
    }

    deleteApplication(node: Node) {
        this.portalAdministrationService.deleteApplication(node.data.name).subscribe(_ => {

        })
    }

    deleteApplicationVersion(node: Node) {
        const application : Application = node.parent?.data

        this.portalAdministrationService.deleteApplicationVersion(application.name, node.data.version).subscribe(_ => {
            this.tree.deletedApplicationVersion(node)

            this.selectNode(node.parent!)
        })
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
                }).subscribe(application => {
                    this.selectNode(this.tree.addApplication(application))
                })
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

            this.portalAdministrationService.updateApplicationVersion(this.selectedVersion).subscribe(version => {
                // copy back possibly pks of the assigned microfrontends

                for ( let i = 0; i < this.selectedVersion!.assignedMicrofrontends.length; i++) {
                    this.selectedVersion!.assignedMicrofrontends[i].id = version.assignedMicrofrontends[i].id
                }
            })
        }
        else if (this.selectedMicrofrontend) {
            this.selectedMicrofrontend!.configuration = JSON.stringify(this.stripInherited(this.configurationData))

            this.portalAdministrationService.updateMicrofrontend(this.selectedMicrofrontend).subscribe()
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
