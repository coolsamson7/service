/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AfterViewInit, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { Element, Moddle } from "moddle"
import BpmnJS from 'bpmn-js/lib/Modeler';
import { PropertyPanel } from "./property-panel.model";
import { PropertyPanelConfig, PropertyPanelConfigurationToken } from "./property-panel.configuration";
import { Shape } from "bpmn-js/lib/model/Types";
import { MessageBus, WithLifecycle } from "@modulefederation/portal";
import { ValidationError } from "../validation";
import { PropertyGroupComponent } from "./property-group";
import { ActionHistory } from "../bpmn"
import { PropertyEditorDirective } from "./property.editor.directive";
import { EventBus } from "bpmn-js/lib/BaseViewer";
import { Process } from "../service";
import { ObjectController } from "../../home/home-component";
import { ProcessController } from "../../home/process-controller";


@Component( {
  selector: 'property-panel',
  templateUrl: "./property-panel.html",
  styleUrl: "./property-panel.scss"
})
export class PropertyPanelComponent extends WithLifecycle implements OnChanges, AfterViewInit {
  // input

  @Input() controller! : ObjectController 
  @Input() process! : Process
  @Input() shape : Shape | undefined
  @Input() element : Element| undefined;

  // instance data


  currentConfig: PropertyPanel = {
    groups: []
  }

  extensions :  Moddle.TypeDefinition[] = []

  allowedExtensions : Moddle.TypeDefinition[] = []

  groups: PropertyGroupComponent[] = []
  editors: PropertyEditorDirective[] = []


  actionHistory!: ActionHistory
  eventBus!: EventBus<any>

  // constructor

  constructor(@Inject(PropertyPanelConfigurationToken) private configuration: PropertyPanelConfig, private messageBus: MessageBus) {
    super()

    const subscription = messageBus.listenFor<ValidationError>("model-validation").subscribe(message => {
      if ( message.message == "error") {
        this.highlightErrors([message.arguments!!], false)
      }
      else if (message.message == "select-error") {
        this.highlightErrors([message.arguments!], true)
      }
    })

    this.onDestroy(() => subscription.unsubscribe())

    const subscription1 = messageBus.listenFor("diagram").subscribe(message => {
      if ( message.message == "saved")
        this.clearHistory()
    })

    this.onDestroy(() => subscription1.unsubscribe())
  }

  typeName(element: Element) : string {
    let name = element.$type
    const colon = name.indexOf(":")
    name = name.substring(colon + 1)

    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function(str){ return str.toUpperCase(); })
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
     const model =  (this.controller as ProcessController).diagram.modeler.get("moddle") as Moddle// this.modeler.get('moddle');

     // compute valid extensions

      for ( const typeName in model.registry.typeMap) {
        const type =  model.registry.typeMap[typeName]

        if ( type.meta  && /*type.superClass?.includes("Element") &&*/ type.meta["allowedIn"]) { // TODO
          this.extensions.push(model.getTypeDescriptor(typeName))
        }
      }
  }

  private computeAllowedExtensions(element: Element) : Moddle.TypeDefinition[] {
    const result : Moddle.TypeDefinition[] = []

    //  check all types with meta

    for ( const extension of this.extensions) {
        for ( const allowedIn of extension.meta!["allowedIn"]) {
            if ( element.$instanceOf(allowedIn)) {
              result.push(extension);
              //console.log("### allowed extension: " + extension.name)
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
    if ( shape )
      element = shape["bpmnElement"] || shape["businessObject"]  //  shape["bpmnObject"] // ??

    this.element = element

    if ( element ) {
      const descriptor : Moddle.Descriptor = element.$descriptor;

      // compute extensions

      this.allowedExtensions = this.computeAllowedExtensions(element)

      // collect groups

      for (const group of this.configuration.groups) {
        // extensions

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
        // element
        else if ( group.element && element.$instanceOf(group.element) && (group.applies ? group.applies(element) : true)) {
          let target = this.currentConfig.groups.find((g) => g.name == group.name)
          if ( !target )
            this.currentConfig.groups.push(target = {
              name: group.name,
              hideLabel: group.hideLabel,
              element: element.$type,
              properties: []
          })

          target.properties.push(...group.properties.map(name => descriptor.properties.find((prop) => prop.name == name)!!))
        }
      }

    } // if
  }

  // implement AfterViewInit

  override ngAfterViewInit(): void {
      super.ngAfterViewInit()

      setTimeout(() => {
        this.eventBus = (this.controller as ProcessController).diagram.eventBus!
        this.actionHistory = new ActionHistory( (this.controller as ProcessController).diagram.modeler.get("commandStack"))

        this.checkModel()

        this.setElement(this.shape)
      }, 0)
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    if ( changes["controller"] && !changes["controller"].isFirstChange() ) {
      this.eventBus = (this.controller as ProcessController).diagram.eventBus!
      this.actionHistory = new ActionHistory( (this.controller as ProcessController).diagram.modeler.get("commandStack"))
    }

    // process

    if (changes["process"] && !changes["process"].isFirstChange()) {
      this.checkModel()
    }


    // shape

    if (changes["shape"] && !changes["shape"].isFirstChange()) {
      this.setElement(changes["shape"].currentValue as Shape)
    }
  }
}
