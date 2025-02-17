/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Element, Moddle } from "moddle"
import BpmnJS from 'bpmn-js/lib/Modeler';
import { PropertyPanel } from "./property-panel.model";
//import { PropertyPanelModule } from "./property-panel.module";
import { BaseElement } from "bpmn-moddle";
import { GroupConfig, PropertyPanelConfig, PropertyPanelConfigurationToken } from "./property-panel.configuration";
//import { BaseElement } from "bpmn-moddle";



@Component( {
  selector: 'property-panel',
  templateUrl: "./property-panel.html",
  styleUrl: "./property-panel.scss",
  //standalone: true,
  //imports: [CommonModule, PropertyGroupComponent]
})
export class PropertyPanelComponent implements OnInit, OnChanges {
  // input

  @Input() modeler!: BpmnJS
  @Input() element : Element | undefined;

  // instance data

  model!: Moddle;

  currentConfig!: PropertyPanel

  extensions :  Moddle.TypeDefinition[] = []

  allowedExtensions : Moddle.TypeDefinition[] = []


  // constructor

  constructor(@Inject(PropertyPanelConfigurationToken) private configuration: PropertyPanelConfig) {
  }

  // private

  private checkModel() : void  {
     this.model = this.modeler.get('moddle');

     // compute valid extensions

      for ( const typeName in this.model.registry.typeMap) {
        const type =  this.model.registry.typeMap[typeName]

        if ( type.meta  && type.superClass?.includes("Element") && type.meta["allowedIn"]) {
          this.extensions.push(this.model.getTypeDescriptor(typeName))
        }
      }
  }

  private computeAllowedExtensions(element: Element) : Moddle.TypeDefinition[] {
    const result : Moddle.TypeDefinition[] = []

    //  check all tyopes with meta


    for ( const extension of this.extensions) {
        for ( const allowedIn of extension.meta!["allowedIn"]) {
            if ( element.$instanceOf(allowedIn)) {
              result.push(extension);
              console.log("### allowed extension: " + extension.name)
            }
        }
      }

      return result;
  }

  private setElement(element: Element | undefined) : void {
    this.currentConfig = {
      groups: []
    }

    this.allowedExtensions = []

    if ( element ) {
      const descriptor : Moddle.Descriptor = element.$descriptor;

      // compute extensions

      this.allowedExtensions = this.computeAllowedExtensions(element)

      // collect groups

      for (const group of this.configuration.groups) {
        if (group.extension) {
          if (descriptor.name !== "bpmn:Process")
          if (this.allowedExtensions.find((extension) => extension.name == group.extension)) {
            let target = this.currentConfig.groups.find((g) => g.name == group.name)
            if ( !target )
              this.currentConfig.groups.push(target = {
                name: group.name,
                extension: group.extension,
                multiple: group.multiple,
                properties: group.properties.map(name => descriptor.properties.find((prop) => prop.name == name)!!)
            })
          }
        }
        else if ( group.element && element.$instanceOf(group.element)) {
          let target = this.currentConfig.groups.find((g) => g.name == group.name)
          if ( !target )
            this.currentConfig.groups.push(target = {
              name: group.name,
              element: element.$type,
              properties: []
          })

          target.properties.push(...group.properties.map(name => descriptor.properties.find((prop) => prop.name == name)!!))
        }
      }

      console.log(this.currentConfig)
    } // if
  }

  // implement OnInit

  ngOnInit(): void {
    this.checkModel()
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["element"]) {//} && !changes["element"].firstChange) {
      this.setElement(changes["element"].currentValue as Element)
    }
  }
}
