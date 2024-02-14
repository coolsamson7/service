/* eslint-disable @angular-eslint/no-output-on-prefix */

import { HelpAdministrationService } from "@modulefederation/portal";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeModule, MatTreeNestedDataSource } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";

export interface HelpNode {
    children : HelpNode[]
    leaf: boolean
    name : string
    path : string
}

@Component({
    selector: 'help-tree',
    templateUrl: './help-tree.component.html',
    styleUrls: ['./help-tree.component.scss'],
    standalone: true,
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule, MatFormFieldModule],
})
export class HelpTreeComponent implements OnInit {
    // input

    root : HelpNode[] = []
    @Output() onSelectionChange = new EventEmitter<HelpNode>();
    @Output() onDelete = new EventEmitter<HelpNode>();

    // instance data

    treeControl = new NestedTreeControl<HelpNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<HelpNode>();
    selection?: HelpNode

    // constructor

    constructor(private helpAdministrationService : HelpAdministrationService) {
        helpAdministrationService.readEntries().subscribe(entries => this.buildTree(this.root = [], "", entries) )
    }

    // public

    refresh() {
        this.dataSource.data = []
        this.dataSource.data = this.root = [...this.root]
    }

    buildTree(folder: HelpNode[], folderPrefix: string, entries: string[], add = false) {
        const findOrCreateFolder = (entry: string, name : string, folders : HelpNode[], prefix : string) => {
            let folder = folders.find(folder => folder.name == name)
      
            if (!folder)
              folders.push(folder = {
                name: name,
                path: prefix + name,
                leaf: add ? false : prefix + name == entry,
                children: []
              })
      
            return folder
          }
    
        for (const entry of entries) {
            let parent = folder
            let prefix = folderPrefix
            for (const leg of entry.split(".")) {
                parent = findOrCreateFolder(entry, leg, parent, prefix).children
                prefix += leg + "."
            }
        }

        this.dataSource.data = this.root;
    }

    deleteNode(node: HelpNode) {
        this.onDelete.emit(node)
    }

    // state

    getState() : string[] {
        return this.treeControl.expansionModel.selected.map(node => node.path)
    }
    
    applyState(selected: string[]) {
        const nodes = this.dataSource.data //this.treeControl.dataNodes;

        selected.forEach((path: string) => {
            const node = nodes.find(n => n.path === path);
            if (node)
                this.treeControl.expand(node);
            })
    }
    

    // public

    findParent(node: HelpNode) :HelpNode | undefined {
        const notFound: HelpNode = {
            children : [],
            leaf: false,
            name : "",
            path : ""
        }

        const find = (parent: HelpNode, node: HelpNode, target: HelpNode ) : HelpNode | undefined=> {
            if ( node === target )
               return parent
            else {
                for ( const child of node.children) {
                    const result = find(node, child, target)
                    if ( result )
                       return result
                }

                return undefined
            }
        }

       for ( const root of this.root ) {
        const result = find(notFound, root, node)
        if ( result )
           return result === notFound ? undefined : result
       }

       return undefined
    }

    onSelect(node: HelpNode) {
        if ( node !== this.selection)
            this.onSelectionChange.emit(node)
    }

    select(node: HelpNode) {
        this.selection = node
    }

    hasChild = (_: number, node: HelpNode) => !!node.children && node.children.length > 0;

    // implement OnInit

    ngOnInit() : void {
        this.dataSource.data = this.root;
    }
}
