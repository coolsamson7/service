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

@Directive({
  selector: "[property-editor]",
  //standalone: true
})
export class PropertyEditorDirective implements OnInit, OnChanges, OnDestroy {
  // input & output

  @Input('property-editor') element!: Element
  @Input() shape!: Shape
  @Input() extension!: string
  @Input() property?: PropertyDescriptor | undefined
  @Input() group!: PropertyGroupComponent
  @Input() inputs?: UserInputs = {};
  @Input() settings: EditorSettings<any> = {}

  @Input() label!: PropertyNameComponent

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

  private makeComponentChanges(inputsChange: SimpleChange, firstChange: boolean): Record<string, SimpleChange> {
    const prevInputs = inputsChange?.previousValue ?? {};
    const currentInputs = inputsChange?.currentValue ?? {};

    return Object.keys(currentInputs).reduce((acc, inputName) => {
      const currentInputValue = currentInputs[inputName];
      const prevInputValue = prevInputs[inputName];

      if (currentInputValue !== prevInputValue)
        acc[inputName] = new SimpleChange(firstChange ? undefined : prevInputValue, currentInputValue, firstChange);

      return acc;
    }, {} as Record<string, SimpleChange>);
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
      shape: this.shape,
      extension: this.extension,
      property: this.property,
      settings: this.settings,
      editor: this,
      group: this.group
    })
  }

  // implement OnInit

  ngOnInit(): void {
    this.createComponent()

    this.group.editors.push(this)
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes)
    if (changes["property"] && !changes["property"].firstChange) {
      this.deleteComponent()
      this.createComponent()
    }

     // compute changes

     let componentChanges: Record<string, SimpleChange>;
     if (!this.initialized) {
       componentChanges = this.makeComponentChanges(changes['inputs'], true);

       this.initialized = true;
     }

     componentChanges ??= this.makeComponentChanges(changes['inputs'], false);

     // copy inputs

     //if (changes['inputs'] && this.componentFactory) {
     //  this.bindInputs(this.inputs ?? {}, this.component.instance);
     //}

     // inform about changes


     if ( componentChanges["value"] && !componentChanges["value"].isFirstChange())
      if (this.component?.instance.ngOnChanges)
        this.component.instance.ngOnChanges(componentChanges);
        else {
          console.log("no ngOnChanges for " + this.element.$type + " with instance " + this.instance)
        }
  }

  // implement OnDestroy

  ngOnDestroy(): void {
    this.deleteComponent()
  }
}


