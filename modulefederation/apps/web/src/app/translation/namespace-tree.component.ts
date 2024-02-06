import { Message } from "@modulefederation/portal";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeModule, MatTreeNestedDataSource } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";

export interface NamespaceNode {
    children : NamespaceNode[]
    messages?: Message[] // messages coming from server including all locales!
    name : string
    path : string
}

@Component({
    selector: 'namespace-tree',
    templateUrl: './namespace-tree.component.html',
    styleUrls: ['./namespace-tree.component.scss'],
    standalone: true,
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule, MatFormFieldModule],
})
export class NamespaceTreeComponent implements OnInit, OnChanges {

  getState() : string[] {
    return this.treeControl.expansionModel.selected.map(node => node.path)
  }

  applyState(selected: string[]) {
    const nodes = this.dataSource.data 
        
    selected.forEach((path: string) => {
        const node = nodes.find(n => n.path === path);
        if (node)
            this.treeControl.expand(node);
        })
  }
    // input

    @Input('namespaces') namespaces : NamespaceNode[] = []
    @Output() onSelectionChange = new EventEmitter<NamespaceNode>();

    // instance data

    treeControl = new NestedTreeControl<NamespaceNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<NamespaceNode>();

    selection?: NamespaceNode

    // constructor

    constructor() {
    }

    // private

     refreshData() {
        const data = this.dataSource.data
        this.dataSource.data = []
        this.dataSource.data = data
    }

    // public

    select(node: NamespaceNode) {
//
console.log(this.treeControl.expansionModel.selected)
        //
        this.selection = node

        this.onSelectionChange.emit(node)
    }

    hasChild = (_: number, node: NamespaceNode) => !!node.children && node.children.length > 0;

    // implement OnInit

    ngOnInit() : void {
        this.dataSource.data = this.namespaces;
    }

    // implement OnChanges

    ngOnChanges(changes : SimpleChanges) : void {
        if (changes['namespaces'] && !changes['namespaces'].isFirstChange())
            this.dataSource.data = this.namespaces;

        this.refreshData()
    }
}
