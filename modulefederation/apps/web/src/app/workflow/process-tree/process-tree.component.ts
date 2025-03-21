/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeModule, MatTreeNestedDataSource } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { Process } from "../service/process-inventory-service";
import { Form } from "../service/form-inventory-service";
import { MatMenuModule } from "@angular/material/menu";

export interface Node {
    type: "process" | "form"
    name: string,
    parent?: Node
    children?: Node[]
    data : any
}

export interface MenuRequest {
    node: Node,
    action: string
}

@Component({
    selector: 'process-tree',
    templateUrl: './process-tree.component.html',
    styleUrls: ['./process-tree.component.scss'],
    standalone: true,
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatMenuModule],
})
export class ProcessTreeComponent implements OnInit, OnChanges {
    // input

    @Input() processes : Process[] = []
    @Output() onSelectionChange = new EventEmitter<Node>();
    @Output() onMenu = new EventEmitter<MenuRequest>();

    // instance data

    treeControl = new NestedTreeControl<Node>(node => node.children);
    dataSource = new MatTreeNestedDataSource<Node>();

    vetoSelection = false
    selection?: Node

    // private

     refreshData() {
        const data = this.dataSource.data
        this.dataSource.data = []
        this.dataSource.data = data
    }

    createNodes(processes: Process[]) : Node[] {
        const formNode = (parent: Node | undefined, form: Form) :Node => {
            return {
                type: "form",
                name: form.name,
                //parent: parent,
                data: form,
                children: []
            }
        }

        const processNode = (process: Process) :Node => {
            return {
                type: "process",
                name: process.name,
                data: process,
                children: process.forms.map(form => formNode(undefined, form))
            }
        }

        return processes.map(process => processNode(process))
    }

    // public

    triggeredMenu(node: Node, action: string) {
        this.onMenu.emit({
            node: node,
            action: action
        })
    }

    select(node: Node) {
        if ( this.selection !== node) {
            this.onSelectionChange.emit(node)

            //if (!this.vetoSelection) {
                this.selection = node
            //}

            this.vetoSelection = false
        }
    }

    addProcess(process: Process) : Node {
        const node : Node =  {
            type: "process",
            name: process.name,
            data: process
        } 

        //if ( after == -1)
        //    this.dataSource.data.push(node)
        //else
        //    this.dataSource.data.splice(after + 1, 0, node)

        this.dataSource.data.push(node)

        this.refreshData()

        this.select(node)

        return node
    }

    selectForm(name: string) {
        const node = this.selection?.children?.find(child => child.name == name)

        this.select(node!)
    }


    addForm(form: Form, processNode: Node, select = true) : Node {
        const node : Node =  {
            type: "form",
            name: form.name,
            data: form,
            parent: processNode
        }

        if (!processNode.children)
            processNode.children = []

        processNode.children!.push(node)

        this.refreshData()
        if ( select )
            this.select(node)

        return node
    }

    hasChild = (_: number, node: Node) => !!node.children && node.children.length > 0;

    // implement OnInit

    ngOnInit() : void {
        this.dataSource.data = this.createNodes(this.processes);
    }

    // implement OnChanges

    ngOnChanges(changes : SimpleChanges) : void {
        if (changes['processes'] && !changes['processes'].isFirstChange())
            this.dataSource.data = this.createNodes(this.processes);

        this.refreshData()
    }
}
