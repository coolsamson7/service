/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeModule, MatTreeNestedDataSource } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatMenuModule } from "@angular/material/menu";
import { Application, Microfrontend, ApplicationVersion, MicrofrontendVersion, MicrofrontendInstance } from "../../model";

export interface Node {
    type: "application" | "application-version" | "microfrontend" | "microfrontend-version"| "microfrontend-instance"
    parent?: Node
    children?: Node[]
    data : any
}

export interface MenuRequest {
    node: Node, 
    action: string
}

@Component({
    selector: 'application-tree',
    templateUrl: './application-tree.component.html',
    styleUrls: ['./application-tree.component.scss'],
    standalone: true,
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatMenuModule],
})
export class ApplicationTreeComponent implements OnInit, OnChanges {
    // input

    @Input() applications : Application[] = []
    @Input() microfrontends : Microfrontend[] = []

    @Output() onSelectionChange = new EventEmitter<Node>();
    @Output() onMenu = new EventEmitter<MenuRequest>();


    // instance data

    treeControl = new NestedTreeControl<Node>(node => node.children);
    dataSource = new MatTreeNestedDataSource<Node>();

    selection?: Node

    // private

     refreshData() {
        const data = this.dataSource.data
        this.dataSource.data = []
        this.dataSource.data = data
    }

    // public

    addInstance(treeConfig: any) {
        let mfe = treeConfig.instance.microfrontend
        let version = treeConfig.instance.version

        let node : Node
        if ( treeConfig.microfrontend) { 
            const microfrontend : Microfrontend = treeConfig.microfrontend as Microfrontend

             node =  {
                type: "microfrontend",
                data: microfrontend,
                children: []
            }

            this.dataSource.data.push(node)
        }
        else node = this.dataSource.data.find(node => node.data.name == mfe)!
        
        if (treeConfig.version) {
            const version : MicrofrontendVersion = treeConfig.version as MicrofrontendVersion

            node!.children?.push(node =  {
                type: "microfrontend-version",
                data: version,
                children: []
            })
        }
        else node = node.children!.find(node => node.data.version == version)!

        if (treeConfig.instance) {
            const instance : MicrofrontendInstance = treeConfig.instance as MicrofrontendInstance

            node!.children?.push(node =  {
                type: "microfrontend-instance",
                data: instance
            })
        }

        this.refreshData()
    }

    addVersion(applicationVersion: ApplicationVersion, applicationNode: Node) : Node {
        const node : Node =  {
            type: "application-version",
            data: applicationVersion,
            parent: applicationNode
        }

        if (!applicationNode.children)
            applicationNode.children = []

        applicationNode.children!.push(node)

        this.refreshData()
        this.select(node)

        return node
    }

    deletedApplication(node: Node) {
        this.dataSource.data.splice(this.dataSource.data.indexOf(node), 1)
        this.refreshData()
    }

    deletedApplicationVersion(node: Node) {
        node.parent?.children?.splice(node.parent?.children.indexOf(node), 1)
        this.refreshData()
    }

    addApplication(application: Application) : Node{
        const node : Node =  {
            type: "application",
            data: application
        }

        let after = -1
        for ( let i = 0; i < this.dataSource.data.length; i++)
           if (this.dataSource.data[i].type == "application")
              after = i
            else
               break

        if ( after == -1)
            this.dataSource.data.push(node)
        else
            this.dataSource.data.splice(after + 1, 0, node)

        this.refreshData()

        this.select(node)

        return node
    }

    select(node: Node) {
        this.selection = node

        this.onSelectionChange.emit(node)
    }

    hasChild = (_: number, node: Node) => node.children && node.children.length > 0;

    // state

    getState() : string[] {
        return this.treeControl.expansionModel.selected.map(node => node.data.name)
    }

    applyState(selected: string[]) {
        const nodes = this.dataSource.data

        selected.forEach((path: string) => {
            const node = nodes.find(n => n.data.name === path);
            if (node)
                this.treeControl.expand(node);
            })
    }

    // private

    createData(applications: Application[], microfrontends: Microfrontend[]) : Node[] {
        const mapApplicationVersion = (parent: Node, version: ApplicationVersion) : Node => {
            return {
                type: "application-version",
                parent: parent,
                data: version
            }
        }

        const mapMicrofrontendVersion = (parent: Node, version: MicrofrontendVersion) : Node => {
            return {
                type: "microfrontend-version",
                parent: parent,
                data: version
            }
        }

        const mapMicrofrontendInstance = (parent: Node, instance: MicrofrontendInstance) : Node => {
            return {
                type: "microfrontend-instance",
                parent: parent,
                data: instance
            }
        }

        return  [...<Node[]>applications.map(application => {
            const parent : Node =  {
                type: "application",
                data: application
            }

            parent.children = application.versions?.map(version => mapApplicationVersion(parent, version))

            return parent
        }),
        ...<Node[]>microfrontends.map(microfrontend => {
            const parent : Node =  {
                type: "microfrontend",
                data: microfrontend
            }

            parent.children = microfrontend.versions?.map(instance => mapMicrofrontendVersion(parent, instance))

            return parent
        })]
    }

    // callbacks

    triggeredMenu(node: Node, action: string) {
        this.onMenu.emit({
            node: node,
            action: action
        })
    }

    // implement OnInit

    ngOnInit() : void {
        this.dataSource.data = this.createData(this.applications, this.microfrontends)

        this.refreshData()
    }

    // implement OnChanges

    ngOnChanges(changes : SimpleChanges) : void {
        if (changes['applications'] && !changes['applications'].isFirstChange())
            this.dataSource.data = this.createData(this.applications, this.microfrontends)

        this.refreshData()
    }
}
