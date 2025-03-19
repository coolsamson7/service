/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { Element, Moddle } from "moddle"
import BpmnJS from 'bpmn-js/lib/Modeler';
import { PropertyPanel } from "./property-panel.model";
import { PropertyPanelConfig, PropertyPanelConfigurationToken } from "./property-panel.configuration";
import { Shape } from "bpmn-js/lib/model/Types";
import { PropertyEditorDirective } from "./editor";
import { MessageBus } from "@modulefederation/portal";
import { ValidationError } from "../validation";
import { PropertyGroupComponent } from "./property-group";
import CommandStack from 'diagram-js/lib/command/CommandStack';

@Component( {
  selector: 'property-panel',
  templateUrl: "./property-panel.html",
  styleUrl: "./property-panel.scss"
})
export class PropertyPanelComponent implements OnInit, OnChanges, OnDestroy {
  // input

  @Input() modeler!: BpmnJS
  @Input() shape : Shape | undefined;

  // instance data

  @Input() element : Element| undefined; 

  model!: Moddle;

  currentConfig!: PropertyPanel

  extensions :  Moddle.TypeDefinition[] = []

  allowedExtensions : Moddle.TypeDefinition[] = []

  groups: PropertyGroupComponent[] = []
  editors: PropertyEditorDirective[] = []


  commandStack! : CommandStack

  // constructor

  constructor(@Inject(PropertyPanelConfigurationToken) private configuration: PropertyPanelConfig, private messageBus: MessageBus) {
    messageBus.listenFor("model-validation").subscribe(message => {
      if ( message.message == "error") {
        this.highlightErrors(message.arguments as ValidationError[], false)
      }
      else if (message.message == "select-error") {
        this.highlightErrors([message.arguments as ValidationError], true)
      }
    })

    messageBus.listenFor("diagram").subscribe(message => {
      if ( message.message == "saved")
        this.clearHistory()
    })
  }

  clearHistory() {
    for ( const editor of this.editors)
      editor.instance.checkState()
  }

  addGroup(group: PropertyGroupComponent) {
    this.groups.push(group)
  }

  addEditor(editor: PropertyEditorDirective) {
      this.editors.push(editor)
  }

  highlightErrors(errors: ValidationError[], select: boolean) {
    for (const error of errors) {
      for ( const editor of this.editors)
        if ( error.element == editor.element && editor.property?.name == error.property)
          editor.showError(error, select)
    }
  }

  // private

  private checkModel() : void  {
     this.model = this.modeler.get('moddle');

     // compute valid extensions

      for ( const typeName in this.model.registry.typeMap) {
        const type =  this.model.registry.typeMap[typeName]

        if ( type.meta  && /*type.superClass?.includes("Element") &&*/ type.meta["allowedIn"]) { // TODO
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

  private setElement(shape: Shape | undefined) : void {
    this.editors = []
    this.currentConfig = {
      groups: []
    }

    this.allowedExtensions = []

    let element : Element | undefined = undefined
    if ( shape)
      element = shape["bpmnElement"] || shape["businessObject"] ||  //  shape["bpmnObject"] // ??

    console.log(shape)

    this.element = element

    if ( element ) {
      const descriptor : Moddle.Descriptor = element.$descriptor;

      // compute extensions

      this.allowedExtensions = this.computeAllowedExtensions(element)

      // collect groups

      for (const group of this.configuration.groups) {
        if (group.extension) {
          const extension = this.allowedExtensions.find((extension) => extension.name == group.extension)
          if (extension) {
            const properties : Moddle.PropertyDescriptor[] = <any>extension.properties?.filter(prop => group.properties.includes(prop.name))

            let target = this.currentConfig.groups.find((g) => g.name == group.name)
            if ( !target )
              this.currentConfig.groups.push(target = {
                name: group.name,
                extension: group.extension,
                multiple: group.multiple,
                properties: properties//group.properties.map(name => descriptor.properties.find((prop) => prop.name == name)!!)
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

    } // if
  }

  // implement OnInit

  ngOnInit(): void {
    this.commandStack = this.modeler.get("commandStack");

    this.checkModel()
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["shape"]) {//} && !changes["element"].firstChange) {
      this.setElement(changes["shape"].currentValue as Shape)
    }
  }

  // implement OnDestroy

  ngOnDestroy(): void {
      
  }
}
