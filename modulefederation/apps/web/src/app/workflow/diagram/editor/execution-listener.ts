/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, NgModule } from '@angular/core';
import { RegisterPropertyEditor } from '../property-editor.decorator';
import { FormsModule } from '@angular/forms';
import { AbstractExtensionEditor } from '../abstract-extension-editor';
import { CommonModule } from '@angular/common';
import { PropertyEditorDirective } from '../property.editor.directive';
import { PropertyEditorModule } from '../property-editor.module';



@RegisterPropertyEditor("camunda:ExecutionListener")
@Component({
  selector: "execution-listener-editor",
  templateUrl: './execution-listener.html',
  styleUrl: './execution-listener.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorDirective]
})
export class ExecutionListenerEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  // override OnInit

  ngOnInit() : void {
      super.ngOnInit()

      console.log("'###### new execution listener")

      this.properties = this.config.properties//this.element.$descriptor.properties.filter((prop) => prop.name == "event" || prop.name == "class" ||prop.name == "expression" ) // TODO

      console.log()
  }
}

/*@NgModule({
  //imports: [FormsModule, CommonModule],
  declarations: [ExecutionListenerEditor],
  exports: [ExecutionListenerEditor]
})
export class ExecutionListenerEditorModule {}*/
