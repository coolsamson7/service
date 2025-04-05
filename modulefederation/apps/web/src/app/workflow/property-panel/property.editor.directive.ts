/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFactory, ComponentFactoryResolver, Output, ComponentRef, Directive, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewContainerRef } from "@angular/core";
import { PropertyEditorRegistry } from "./property-editor-registry";
import { PropertyEditor } from "./property-editor";
import { Element, PropertyDescriptor } from "moddle";
import { Shape } from "bpmn-js/lib/model/Types";
import { PropertyPanelComponent } from "./property-panel";
import { ValidationError } from "../validation";
import { EditorSettings } from "./abstract-property-editor";
import { PropertyGroupComponent } from "./property-group";
import { PropertyNameComponent } from "./property-name";

type UserInputs = Record<string, any>;

export interface Context {
  shape: Shape
  group: PropertyGroupComponent
}

@Directive({
  selector: "[property-editor]",
  //standalone: true
})
export class PropertyEditorDirective implements OnInit, OnChanges, OnDestroy {
  // input & output

  @Input('property-editor') element!: Element
  @Input() extension!: string
  @Input() property?: PropertyDescriptor | undefined
  @Input() inputs: UserInputs = {};
  @Input() settings: EditorSettings<any> = {}

  @Input() label!: PropertyNameComponent

  @Input() context!: Context

  @Output() valueChange = new EventEmitter<any>()

  // instance data

  componentFactory!: ComponentFactory<any>
  component!: ComponentRef<any>
  instance!: PropertyEditor

  initialized = false;

  // constructor

  constructor(panel: PropertyPanelComponent, private injector: Injector, private container: ViewContainerRef, private resolver: ComponentFactoryResolver, private registry: PropertyEditorRegistry) {
    panel.addEditor(this)
  }

  showError(error: ValidationError, select = false) {
    (this.instance as any).showError(error, select)
  }

  // private

 private bindInputs(userInputs: UserInputs, componentInstance: any) {
     Object.keys(userInputs).forEach(input => {
       if ( input !== 'value')
         componentInstance[input] = this.inputs[input]
     });
   }

   private makeInputChanges(inputsChange: SimpleChange): Record<string, SimpleChange>  | undefined {
    let hasChanges = false
    const prevInputs = inputsChange.previousValue ?? {}
    const currentInputs = inputsChange.currentValue ?? {}

    const changes = Object.keys(currentInputs).reduce((changes, inputName) => {
       const currentInputValue = currentInputs[inputName];
       const prevInputValue = prevInputs[inputName];

       if (currentInputValue !== prevInputValue) {
         changes[inputName] = new SimpleChange(inputsChange.firstChange ? undefined : prevInputValue, currentInputValue, inputsChange.firstChange);
         hasChanges = true
       }

       return changes;
    }, {} as Record<string, SimpleChange>);

    return hasChanges ? changes : undefined;
   }

  private deleteComponent() {
    this.component?.destroy()
    this.container.clear()
  }

  private createComponent() {
    // create

    let type = undefined

    if ( this.property) {
      type = this.registry.get(this.property.ns.name)
      if ( !type )
        type = this.registry.get(this.property.type)
    }
    else type =  this.registry.get(this.element.$type)

    if (!type)
      throw Error("unknown component for type " + this.property?.type ||this.element.$type)


    this.componentFactory = this.resolver.resolveComponentFactory<PropertyEditor>(type)
    this.component = this.container.createComponent(this.componentFactory, 0, this.injector)

    this.updateComponent((this.instance = this.component.instance))

    // inform label

    if ( this.label) {
      //console.log(this.property?.name + ".editor=" + this.instance.constructor.name)
      this.label!.editor = this.instance
    }
    else {
      console.log("?")
    }


    this.component.changeDetectorRef.markForCheck
  }

  changedValue(value: any) {
    this.valueChange.emit(value)
  }

  private updateComponent(instance: PropertyEditor<any>) {
    Object.assign(instance, {
      element: this.element,
      //shape: this.shape,

      context: this.context,

      extension: this.extension,
      property: this.property,
      settings: this.settings,
      editor: this
    })
  }

  // implement OnInit

  ngOnInit(): void {
    this.createComponent()

    this.context.group.editors.push(this)
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    // property change

    if (changes["property"] && !changes["property"].firstChange) {
      this.deleteComponent()
      this.createComponent()
    }

    if ( this.component ) {
      // update component

      this.updateComponent(this.instance)

      // try to figure out, if any of the specified input values have changed
      // and tarbnslate it into a set of changes
      // that can be passed to ngOnChanges

      const inputChanges = changes['inputs']

      if (inputChanges) {
        const delta  = this.makeInputChanges(inputChanges)

        if (delta) {
          // copy inputs

          this.bindInputs(delta, this.component.instance)

          // inform about changes

          if ((this.component.instance as OnChanges).ngOnChanges)
            this.component.instance.ngOnChanges(delta);
        } // if
      }
    }
  }

  // implement OnDestroy

  ngOnDestroy(): void {
    this.deleteComponent()
  }
}


