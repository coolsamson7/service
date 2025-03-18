/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewContainerRef } from "@angular/core";
import { PropertyEditorRegistry } from "./property-editor-registry";
import { PropertyEditor } from "./property-editor";
import { Element, PropertyDescriptor } from "moddle";
import { Group } from "../property-panel.model";
import { Shape } from "bpmn-js/lib/model/Types";
import { PropertyPanelComponent } from "../property-panel";
import { ValidationError } from "../../validation";
import { EditorHints } from "./abstract-property-editor";
import { PropertyGroupComponent } from "../property-group";

type UserInputs = Record<string, any>;

@Directive({
  selector: "[property-editor]",
  //standalone: true
})
export class PropertyEditorDirective implements OnInit, OnChanges, OnDestroy {
  // input

  @Input('property-editor') element!: Element 
  @Input() shape!: Shape
  @Input() extension!: string
  @Input() readOnly = false 
  @Input() property?: PropertyDescriptor | undefined
  @Input() group!: PropertyGroupComponent
  @Input() inputs?: UserInputs = {};
  @Input() hints: EditorHints<any> = {}

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

    this.componentFactory = this.resolver.resolveComponentFactory<PropertyEditor>(type)
    this.component = this.container.createComponent(this.componentFactory, 0, this.injector)

    this.updateComponent((this.instance = this.component.instance))

    this.component.changeDetectorRef.markForCheck
  }

  private updateComponent(instance: PropertyEditor<any>) {
    Object.assign(instance, {
      element: this.element,
      shape: this.shape,
      extension: this.extension,
      property: this.property,
      readOnly: this.readOnly,
      hints: this.hints,
      editor: this,
      group: this.group,
      v: this.property ? this.element.get(this.property!.name) : undefined
    })
  }

  private setupValue() {
    Object.defineProperty(this, 'value', {
      get: () => this.element.get(this.property!.name),
      set: (value) => this.element.set(this.property!.name, value),
      configurable: true
    });
  }

  // implement OnInit

  ngOnInit(): void {
    this.setupValue()
    this.createComponent()

    this.group.editors.push(this)
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
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
 
     if ((this.component?.instance as OnChanges).ngOnChanges)
       this.component.instance.ngOnChanges(componentChanges);
  }

  // implement OnDestroy

  ngOnDestroy(): void {
    this.deleteComponent()
  }
}


