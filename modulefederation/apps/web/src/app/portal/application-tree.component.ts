/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeModule, MatTreeNestedDataSource } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { Application, ApplicationVersion } from "./model";

export interface Node {
    type: "application" | "version"
    parent?: Node
    children?: Node[]
    data : any
}

@Component({
    selector: 'application-tree',
    templateUrl: './application-tree.component.html',
    styleUrls: ['./application-tree.component.scss'],
    standalone: true,
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule, MatFormFieldModule],
})
export class ApplicationTreeComponent implements OnInit, OnChanges {
    // input

    @Input() applications : Application[] = []
    @Output() onSelectionChange = new EventEmitter<Node>();

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

    select(node: Node) {
        this.selection = node

        this.onSelectionChange.emit(node)
    }

    hasChild = (_: number, node: Node) => !!node.children && node.children.length > 0;

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

    createData(applications: Application[]) : Node[] {
        const mapVersion = (parent: Node, version: ApplicationVersion) : Node => {
            return {
                type: "version",
                parent: parent,
                data: version
            }
        }

        return  <Node[]>applications.map(application => {
            const parent : Node =  {
                type: "application",
                data: application
            }

            parent.children = application.versions?.map(version => mapVersion(parent, version))

            return parent
        });
    }

    // implement OnInit

    ngOnInit() : void {
        this.dataSource.data = this.createData(this.applications)

        this.refreshData()
    }

    // implement OnChanges

    ngOnChanges(changes : SimpleChanges) : void {
        if (changes['applications'] && !changes['applications'].isFirstChange())
            this.dataSource.data = this.createData(this.applications)

        this.refreshData()
    }
}
