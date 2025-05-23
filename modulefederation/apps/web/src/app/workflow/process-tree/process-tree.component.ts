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
import { SvgIconComponent } from "../svg.icon";

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

export class TreeSelectionEvent{
  // constructor

  constructor(private tree: ProcessTreeComponent, public selection: Node | undefined, private oldSelection: Node | undefined) {}

  // public

  veto() {
    this.tree.selection = this.oldSelection
  }
}

@Component({
    selector: 'process-tree',
    templateUrl: './process-tree.component.html',
    styleUrls: ['./process-tree.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatTreeModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatMenuModule,
        SvgIconComponent
    ],
})
export class ProcessTreeComponent implements OnInit, OnChanges {
    // input

    @Input() processes : Process[] = []
    @Output() onSelectionChange = new EventEmitter<TreeSelectionEvent>();
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

    createNodes(processes: Process[]) : Node[] {
        const formNode = (parent: Node | undefined, form: Form) :Node => {
            return {
                type: "form",
                name: form.name,
                parent: parent,
                data: form,
                children: []
            }
        }

        const processNode = (process: Process) :Node => {
            const node : Node = {
                type: "process",
                name: process.name,
                data: process,
                //children: process.forms.map(form => formNode(undefined, form))
            }

          node.children = process.forms.map(form => formNode(undefined, form))

          return node
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

    select(node: Node | undefined) {
        if ( this.selection !== node) {
            this.onSelectionChange.emit(new TreeSelectionEvent(this, node, this.selection))

            this.selection = node
        }
    }

    indexOf(node: Node) {
        if ( node.parent)
            return node.parent!.children!.indexOf(node)
        else
            return this.dataSource.data.indexOf(node)
    }

    // return the node which should be selected

    deletedNode(node: Node) : Node | undefined {
        let nextNode : Node | undefined = undefined
        const index = this.indexOf(node)

        if ( node.parent) {
            const children  = node.parent!.children!

            /*const form : Form = node.data
            const process : Process = node.parent.data

            process.forms.splice( process.forms.indexOf(form), 1)*/

            children.splice(index, 1)
            nextNode = children.length > 0 ? children[Math.min(children.length - 1, index)] : node.parent
        }
        else {
            const children  =  this.dataSource.data
            children.splice(index, 1)
            nextNode = children.length > 0 ? children[Math.min(children.length - 1, index)] : undefined
        }

        this.refreshData()

        if ( nextNode )
            this.treeControl.expansionModel.select(nextNode)
        else
            this.treeControl.expansionModel.select()

        this.select(nextNode)

        return nextNode
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
