import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PortalAdministrationService, PortalDeploymentService } from "../../service";
import { ApplicationVersion, MicrofrontendInstance } from "../../model";
import { Collectors, Stream } from "@modulefederation/common";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatTableModule } from "@angular/material/table";
import { Manifest } from "@modulefederation/portal";


@Component({
    standalone: true,
    selector: 'application-version-content',
    templateUrl: "./application-version-dialog.html",
    //styleUrls: ["./application-version.component.scss"],
    imports: [
      CommonModule,

      MatButtonToggleModule,
      MatTableModule
    ]
  })
  export class ContentComponent {
    // instance data

    version: ApplicationVersion
    instances : MicrofrontendInstance[] = []
    stages : string[] = []
    selectedStage = ""
    selectedURL? : URL
    modules : Manifest[] = []
    displayedColumns: string[] = ['name', 'version', 'remoteEntry'];

    // constructor
  
    constructor(@Inject(MAT_DIALOG_DATA) public data : any,  private portalAdministrationService : PortalAdministrationService, private deploymentService: PortalDeploymentService) {
        this.version = data.arguments.version

        this.deploymentService.findShellInstances(this.version.id!).subscribe(instances => {
            this.setInstances(instances)
            this.selectStage(this.stages[0])
        })
    }

    // callbacks

    selectStage(stage: string) {
        this.selectedStage = stage

        this.setInstance(this.instances.find(instance => instance.stage == stage)!)
    }

    // private

    private setInstances(instances: MicrofrontendInstance[]) {
        this.instances = instances
        this.stages = Stream.of(instances)
            .map(instance => instance.stage)
            .distinct()
            .collect(Collectors.toArray())

        //this.setInstance(this.instances[0])
    }

    private setInstance(instance: MicrofrontendInstance) {
        this.selectedURL = new URL(instance.uri)

        this.deploymentService.computeDeployment({
            application: instance.microfrontend,
            version : instance.version,
            session: true,
            host:  this.selectedURL.hostname,
            port:  this.selectedURL.port,
            protocol:  this.selectedURL.protocol
        }).subscribe(deployment => {
            this.modules = Object.values( deployment.modules)
            /*for ( const m in deployment.modules) { 
                const module = deployment.modules[m]

                this.modules.push(module)
            }*/
        })
    }
  }