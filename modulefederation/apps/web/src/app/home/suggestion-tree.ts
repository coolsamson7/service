/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/component-class-suffix */
import { FlatTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
import { NgModelSuggestionsDirective, ObjectSuggestionProvider, SuggestionProvider } from './suggestion.directive';

interface Property {
    name: string,
    value?: any,
    children?: Property[]
}

// the internal tree node structure

interface Node {
  expandable: boolean;
  name: string;
  value?: any,
  level: number;
}

@Component({
  selector: 'suggestion-tree',
  templateUrl: './suggestion-tree.html',
  styleUrls: ['./suggestion-tree.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatTreeModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, NgModelSuggestionsDirective]
})
export class SuggestionTreeComponent implements OnInit {
    // input

    @Input() object : any
    
    // instance data

    value: any

    suggestionProvider? : SuggestionProvider

    properties: Property[] = []

  private transformer = (node: Property, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
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

  // implement OnInit

    ngOnInit(): void {
        this.suggestionProvider = new ObjectSuggestionProvider(this.object)
        this.properties = this.createNodes(this.object);
        this.dataSource.data = this.properties;
    }

  // private

  createNodes(object: any) : Property[] {
    const result : Property[] = []

    for ( const property of Object.getOwnPropertyNames(object)) {
        const node: Property = {
            name: property,
            children: []
        }
        result.push(node)
 
        const value = object[property]
 
        if ( typeof value == "object")
            node.children = this.createNodes(value)
        else
            node.value = value
        } // for

    return result
 }

  // public

  hasChild(_: number, node: Node) {
   return node.expandable
  }

  // filter recursively on a text string using property object value

  filterRecursive(filterText: string, array: Property[], property: string) {
    if (!filterText) return array

    const legs = filterText.toLowerCase().split(".")

    // make a copy of the data so we don't mutate the original

    const copy = (o?: Property) => o ? Object.assign({}, o) as Property : undefined

    const filter = (properties: Property[], index: number) :  Property[] | undefined => {
        const leg = legs[index]
        const last = index == legs.length - 1

        if ( !last ) {
            const property = copy(properties.find(property => property.name == leg))

            if ( property?.children?.length)
                property.children = filter(property.children, index + 1)

            return property ? [property] : undefined
        }
        else {
            return properties.filter(property => property.name.startsWith(leg)).map(property => copy(property)!)
        }
    }

    return filter(array, 0)
  }

  // pass mat input string to recursive function and return data

  filterTree(filterText: string) {
    this.dataSource.data = this.filterRecursive(filterText, this.properties, 'name') || [];
  }

  // filter string from mat input filter

  applyFilter(event: any) {
    const filterText = event.target['value']

    this.filterTree(filterText);

    // show / hide based on state of filter string

    if (filterText) 
      this.treeControl.expandAll();
    
    else 
      this.treeControl.collapseAll();
  }
}