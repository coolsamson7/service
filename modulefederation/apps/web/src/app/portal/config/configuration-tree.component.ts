/* eslint-disable @angular-eslint/no-output-on-prefix */
import { FlatTreeControl } from "@angular/cdk/tree";
import { CommonModule } from "@angular/common";
import { Component, Directive, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatTreeModule, MatTreeFlattener, MatTreeFlatDataSource } from "@angular/material/tree";
import { ConfigurationProperty } from "./configuration-model";
import { ParameterDirective } from "./parameter.directive";
import { MatInput } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";

interface FlatNode {
  expandable: boolean;
  name: string;
  property: ConfigurationProperty,
  add?: boolean
  level: number;
}

@Directive({
    standalone: true,
    selector: '[matInputAutofocus]',
  })
  export class AutofocusDirective implements OnInit {
  
    constructor(private matInput: MatInput) { }
  
    ngOnInit() {
      setTimeout(() => this.matInput.focus());
    }
  
  }

@Component({
  standalone: true,
  imports: [
    AutofocusDirective, 
    ParameterDirective,

    // material

    MatTableModule, 
    MatIconModule ,
    MatButtonModule, 
    MatTreeModule, 
    MatMenuModule,
    MatSelectModule, 
    MatFormFieldModule,
     
     // angular

     CommonModule, 
     FormsModule
    
  ],
  selector: 'configuration-tree',
  templateUrl: './configuration-tree.component.html',
  styleUrls: ['./configuration-tree.component.scss'],
})
export class ConfigurationTreeComponent implements OnInit, OnChanges {
    // input & output

    @Input() inherits! : ConfigurationProperty[]
    @Input() configuration! : ConfigurationProperty

    @Output() onAdd = new EventEmitter<ConfigurationProperty>();
    @Output() onAddFolder = new EventEmitter<ConfigurationProperty>();
    @Output() onDelete = new EventEmitter<ConfigurationProperty>();

    @Output() onChanged = new EventEmitter<boolean>();

    // instance data

    types = ["string", "number", "boolean"]

    displayedColumns: string[] = ['name', 'value'];

    transformer = (node: ConfigurationProperty, level: number) : FlatNode => {
       return {
         expandable: node.type == "object" && node.value.length > 0,
         name: node.name!,
         property: node,
         level: level,
       };
     }

    treeControl = new FlatTreeControl<FlatNode>(
         node => node.level, 
         node => node.expandable
         );

    treeFlattener = new MatTreeFlattener<ConfigurationProperty, FlatNode>(
         this.transformer,
         node => node.level,
         node => node.expandable,
         node => node.value
         );

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    hasChild = (_: number, node: FlatNode) => node.expandable;

    // constructor

    // callbacks

    changed(value: any) {
      this.onChanged.emit(true)
    }

    addFolder(node: FlatNode | undefined = undefined) {
      this.onAddFolder.emit(node? node?.property : this.configuration)
    }

    addItem(node: FlatNode | undefined = undefined) {
      this.onAdd.emit(node? node?.property : this.configuration)
    }

    editItem(node: FlatNode) {
      node.property.overwrite = true
    }

    deleteItem(node: FlatNode) { 
      if ( node.property.overwrite == true) {
        node.property.overwrite = false
        node.property.value = node.property.inherits?.value
      }
      else {
        const parent = this.getParent(node)?.property
        this.onDelete.emit(node.property)
      }
    
    }

    // private

    refreshTree() {  
        const state =  this.treeControl.expansionModel.selected.map(node => node.name)

        const nodes = this.treeControl.dataNodes

        const data = this.dataSource.data;
        this.dataSource.data = [];
        this.dataSource.data = data;

        state.forEach(path => {
            const node = nodes.find(n => n.name === path);
            if (node !== undefined)
                this.treeControl.expand(node);
            })
      }

    private getParent(node: FlatNode) : FlatNode | undefined {
        const { treeControl } = this;
        const currentLevel = treeControl.getLevel(node);
    
        if (currentLevel < 1)
          return undefined;
    
        const startIndex = treeControl.dataNodes.indexOf(node) - 1;
    
        for (let i = startIndex; i >= 0; i--) {
          const currentNode = treeControl.dataNodes[i];
    
          if (treeControl.getLevel(currentNode) < currentLevel)
            return currentNode;
        } // for

        return undefined
    }

   addInherited(data: ConfigurationProperty, ...inherited: ConfigurationProperty[]): ConfigurationProperty {
      const result : ConfigurationProperty = {
        type: "object",
        value: []
      }

      const copy = (properties: ConfigurationProperty[], result: ConfigurationProperty[], local: boolean) => {
        for ( const property of properties) {
            const newProperty = {...property}
            const match = result.find(prop => prop.name == property.name)

            if (match) {
              // replace 

              const index = result.indexOf(match)
              result[index] = newProperty
              
              // and remember parent

              newProperty.inherits = match
              // object??
              newProperty.overwrite = newProperty.value !== match.value // overwrite if different...
            } 
            else {
              // add new item, and mark as inherited

              if ( !local )
                 newProperty.inherits = property

              result.push(newProperty)
            } // else

            if ( property.type == "object") {
              newProperty.value = []

              // recursion

              copy(property.value, newProperty.value, local)
            }
          } // for
      }

      // let's move

      for ( const inheritedConfiguration of inherited)
        if (inheritedConfiguration.value)
          copy(inheritedConfiguration.value, result.value, false) // we assume, the root is an object

      // own values

      copy(data.value, result.value, true)

      // copy to initial object 

      data.value = result.value

      // done

      return result
    }


    // implement OnInit 

    ngOnInit() {
        this.addInherited(this.configuration, ...this.inherits)
        this.dataSource.data = this.configuration.value!;
    }

    // implement OnChanges

    ngOnChanges(changes : SimpleChanges) : void {
      if (changes['configuration'] && !changes['configuration'].isFirstChange()) {
          this.addInherited(this.configuration, ...this.inherits)
          
          this.dataSource.data = this.configuration.value!;
      }

      this.refreshTree()
    }
}
