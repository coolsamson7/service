/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/component-class-suffix */
import { FlatTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule
} from '@angular/material/tree';

import { OverlayModule } from '@angular/cdk/overlay';
import { MessageAdministrationService, NgModelSuggestionsDirective, SuggestionProvider } from '@modulefederation/portal';
import { Observable } from 'rxjs';


interface TreeNode {
    type: "namespace" | "translation" | "folder",
    name: string,
    path: string,
    load?: () => void,
    inPath?: boolean,
    children?: TreeNode[] // hier sind translations und sub namesaces drin....!!!
}

// the internal tree node structure

interface Node {
    type: "namespace" | "translation" | "folder",
    inPath?: boolean,
    expandable: boolean,
    name: string,
    level: number
}

export class NodeSuggestionProvider implements SuggestionProvider {
    // constructor
  
    constructor(private nodes: TreeNode[]) {
    }
  
    // implement SuggestionProvider
  
    provide(input : string) : string[] {
      const colon = input.indexOf(":")
      let legs : string[]
  
      if ( colon > 0) {
        legs = input.substring(0, colon).split(".")
        legs.push(input.substring(colon + 1))
      }
      else 
        legs = input.split(".")


      const checkNode = (node: TreeNode) : TreeNode => {
        if ( node.load)
           node.load()

           return node
      }
  
      let nodes : TreeNode[] | undefined = this.nodes
      let index = 0
      const length = legs.length
      let lastNodes = this.nodes
  
      while (nodes != null && index < length) {
        lastNodes = nodes
        nodes = nodes.find(node => checkNode(node).name == legs[index])?.children // TODO more calls??
        index++
      } // while
  
      if (index == length) {
        // we reached the last leg, so good so far
        const suggestions: string[] = []
  
        if ( nodes ) {
          // and it as a match
          // add all children as possible suffixes
  
          for (const child of nodes)
            suggestions.push(input + (child.type == "translation" ? ":" : ".") + child.name)
        }
        else if ( lastNodes != undefined) {
          // check if we have a valid prefix
  
          for ( const node of lastNodes) {
            const lastLeg = legs[index-1]

            if (node.name.startsWith(lastLeg))
              suggestions.push(input + node.name.substring(lastLeg.length))
          } // for
        } // if
  
        return suggestions
      }
      else return []
    }
  }


@Component({
  selector: 'i18n-tree',
  templateUrl: './i18n-tree.html',
  styleUrls: ['./i18n-tree.scss'],
  standalone: true,
  imports: [CommonModule, OverlayModule, FormsModule, MatTreeModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, NgModelSuggestionsDirective],
  encapsulation: ViewEncapsulation.None,
})
export class I18NTreeComponent implements OnInit, OnChanges {
    // input

    @Input() namespaces: string[] = []

    // instance data

    isFocused = false
    lastFilter = ""

    
   transformer = (node: TreeNode, level: number) : Node => {
    return {
      expandable: node.load != undefined || (!!node.children && node.children.length > 0), // TODO?
      name: node.name,
      type: node.type,
      inPath: node.inPath,
      level: level
    };
  };

  treeControl = new FlatTreeControl<Node>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  nodes : TreeNode[] = []

  suggestionProvider = new NodeSuggestionProvider(this.nodes)

  // constructor

  constructor(private messageService: MessageAdministrationService) {
  }

   // private

    createTree(namespaces: string[]) {
        namespaces.sort((one, two) => (one < two ? -1 : 1))

        // local functions

        const translationsForNamespace = (namespace: string) : Observable<string[]> => {
            return this.messageService.readMessageNames(namespace)
            //return ["ok", "cancel"].sort((one, two) => (one < two ? -1 : 1))
        }

        const findOrCreateFolder = (name : string, folders : TreeNode[], prefix : string, namespace: string) => {
          let folder = folders.find(folder => folder.name == name)
    
          if (!folder) {
            folders.push(folder = {
                type: prefix + name == namespace ? "folder" : "namespace",
                name: name,
                path: prefix + name,
                children: []
                })

            if (folder.path == namespace) { // TODO: lazy, aber ich brauche leeres child!!! oder?
               folder.load = () => {
                delete folder?.load 

                translationsForNamespace(namespace).subscribe(names => {
                  // sort alphabetically

                  names.sort((one, two) => (one < two ? -1 : 1))

                  if ( folder!.children === undefined)
                    folder!.children = []

                  folder?.children.push(...names.map(name => {  
                      return {
                        type: "translation",
                        name: name,
                        path: prefix.substring(0, prefix.length - 1) + ":" + name,
                    } as TreeNode
                  }))

                  // filter again!
                  
                  this.filterTree(this.lastFilter)
                })
               }
            } // if
        }
    
          return folder
        }
    
        // go forrest
    
        for (const namespace of namespaces) {
          let parent = this.nodes
          let prefix = ""
          for (const leg of namespace.split(".")) {
            parent = findOrCreateFolder(leg, parent, prefix, namespace).children!

            prefix += leg + "."
          }
        }
    }

  // public

  selectNode(node:Node) {
    console.log(node)
  }

  focus(focus: boolean) {
    this.isFocused = focus
  }

  hasChild(_: number, node: Node) {
   return node.expandable
  }

  filterRecursive(filterText: string, array: TreeNode[]) {
    if (!filterText) return array

    console.log("filter " + filterText)

    filterText = filterText.toLowerCase()

    const colon = filterText.indexOf(":")
    let legs : string[]

    if ( colon > 0) {
      legs = filterText.substring(0, colon).split(".")
      legs.push(filterText.substring(colon + 1))
    }
    else 
      legs = filterText.split(".")


    // make a copy of the data so we don't mutate the original

    const copy = (property?: TreeNode, withChildren = true) => {
        if ( property ) {
            property = Object.assign({}, property)

            if ( !withChildren)
                property.children = undefined
            else if (property.children ) {
                property.children = property.children!.map(child => copy(child, false)) as TreeNode[]
            }

            return property
        }
        else return undefined
    }

    const filter = (nodes: TreeNode[], index: number) :  TreeNode[] | undefined => {
        const leg = legs[index]
        const last = index == legs.length - 1

        if ( !last ) {
            let node = nodes.find(property => property.name == leg)

            if ( node ) {
                if ( node.load ) node.load()

                // recursion?

                const children = node?.children?.length ?  filter(node.children, index + 1) : undefined

                node = copy(node, false)!
                node.children = children
                node.inPath = true

                return [node] 
            } // if
            else return undefined
        }
        else {
            return nodes
                .filter(node => node.name.startsWith(leg))
                .map(node => copy(node, node.name == leg)!)
        }
    }

    let result =  filter(array, 0)

    console.log(result)

    return result
  }

  // pass mat input string to recursive function and return data

  filterTree(filter: string) {
    this.dataSource.data = this.filterRecursive(this.lastFilter = filter, this.nodes) || [];
  }

  // filter string from mat input filter

  applyFilter(filter: string) {
    this.filterTree(filter);

    // show / hide based on state of filter string

    if (filter) 
      this.treeControl.expandAll();
    
    else 
      this.treeControl.collapseAll();
  }

   // implement OnInit

   ngOnInit(): void {
        this.createTree(this.namespaces)
        this.suggestionProvider = new NodeSuggestionProvider(this.nodes)
        this.dataSource.data = this.nodes;
    }

    // implement OnChanges

    ngOnChanges(changes: SimpleChanges) {
      this.createTree(this.namespaces)
  }
}