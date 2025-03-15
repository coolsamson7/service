/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewContainerRef } from "@angular/core";
import { PropertyEditorRegistry } from "./property-editor-registry";
import { PropertyEditor } from "./property-editor";
import { Element, PropertyDescriptor } from "moddle";
import { Group } from "../property-panel.model";
import { Shape } from "bpmn-js/lib/model/Types";
import { PropertyPanelComponent } from "../property-panel";
import { ValidationError } from "../../validation";
import { EditorHints } from "./abstract-property-editor";


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
  @Input() config!: Group // TODO
  @Input() property?: PropertyDescriptor | undefined

  @Input() hints: EditorHints<any> = {}

  // instance data

  componentFactory!: ComponentFactory<any>
  component!: ComponentRef<any>
  instance!: PropertyEditor

  // constructor

  constructor(private panel: PropertyPanelComponent, private injector: Injector, private container: ViewContainerRef, private resolver: ComponentFactoryResolver, private registry: PropertyEditorRegistry) {
    panel.addEditor(this)
  }

  showError(error: ValidationError) {
    (this.instance as any).showError(error)
  }

  // private

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

    if ( !type )
      throw Error("missing type")

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
      config: this.config,
      property: this.property,
      readOnly: this.readOnly,
      hints: this.hints,
      component: this,
    })
  }

  // implement OnInit

  ngOnInit(): void {
    this.createComponent()
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["property"] && !changes["property"].firstChange) {
      this.deleteComponent()
      this.createComponent()
    }
  }

  // implement OnDestroy

  ngOnDestroy(): void {
    this.deleteComponent()
  }
}


